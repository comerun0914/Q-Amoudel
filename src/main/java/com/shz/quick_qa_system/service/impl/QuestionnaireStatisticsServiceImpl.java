package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.entity.QuestionCreate;
import com.shz.quick_qa_system.entity.QuestionnaireSubmission;
import com.shz.quick_qa_system.entity.Users;
import com.shz.quick_qa_system.service.QuestionCreateService;
import com.shz.quick_qa_system.service.QuestionnaireSubmissionService;
import com.shz.quick_qa_system.service.QuestionnaireStatisticsService;
import com.shz.quick_qa_system.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 问卷统计服务实现类
 */
@Service
public class QuestionnaireStatisticsServiceImpl implements QuestionnaireStatisticsService {
    
    @Autowired
    private QuestionCreateService questionCreateService;
    
    @Autowired
    private QuestionnaireSubmissionService questionnaireSubmissionService;
    
    @Autowired
    private UsersService usersService;
    
    @Override
    public Map<String, Object> getDashboardStatistics(Integer creatorId, Integer timeRange, String startDate, String endDate) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 总问卷数（只统计在有效期内的问卷）
            Map<String, Object> totalQuestionnaires = getTotalQuestionnaires(creatorId, timeRange, startDate, endDate);
            result.put("totalQuestionnaires", totalQuestionnaires.get("count"));
            
            // 2. 总提交数（只统计在有效期内的问卷提交）
            Map<String, Object> totalSubmissions = getTotalSubmissions(creatorId, timeRange, startDate, endDate);
            result.put("totalSubmissions", totalSubmissions.get("count"));
            
            // 3. 完成率（用户个人提交的问卷与整体人员的占比）
            Map<String, Object> completionRate = getPersonalCompletionRate(creatorId, timeRange, startDate, endDate);
            result.put("completionRate", completionRate.get("rate"));
            
            // 4. 独立用户数（只统计角色是用户的）
            Map<String, Object> uniqueUsers = getUniqueUsersCount(creatorId, timeRange, startDate, endDate);
            result.put("uniqueUsers", uniqueUsers.get("count"));
            
            // 5. 变化率统计（基于timeRange参数计算）
            Map<String, Object> changeRates = getChangeRates(creatorId, timeRange);
            result.put("changes", changeRates);
            
        } catch (Exception e) {
            // 如果计算失败，返回默认值
            result.put("totalQuestionnaires", 0);
            result.put("totalSubmissions", 0);
            result.put("completionRate", 0.0);
            result.put("uniqueUsers", 0);
            result.put("changes", getDefaultChangeRates());
        }
        
        return result;
    }
    
    @Override
    public Map<String, Object> getPersonalCompletionRate(Integer creatorId, Integer timeRange, String startDate, String endDate) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 获取时间范围
            LocalDate start = getStartDate(timeRange, startDate);
            LocalDate end = getEndDate(endDate);
            LocalDate currentDate = LocalDate.now();
            
            // 1. 获取该用户创建的且在有效期内的问卷数量
            QueryWrapper<QuestionCreate> questionnaireWrapper = new QueryWrapper<>();
            questionnaireWrapper.eq("creator_id", creatorId)
                              .eq("status", 1) // 只统计启用的问卷
                              .between("created_time", start.atStartOfDay(), end.atTime(23, 59, 59));
            
            // 添加有效期检查：只统计当前时间在有效期内的问卷
            questionnaireWrapper.and(wrapper -> wrapper
                .isNull("start_date").or().le("start_date", currentDate) // 开始日期为空或已开始
            ).and(wrapper -> wrapper
                .isNull("end_date").or().ge("end_date", currentDate) // 结束日期为空或未结束
            );
            
            long userQuestionnaireCount = questionCreateService.count(questionnaireWrapper);

            // 查询role为0的角色id
            List<Integer> targetUserIds = usersService.list(new QueryWrapper<Users>().eq("role", 0))
                    .stream()
                    .map(Users::getId)
                    .collect(Collectors.toList());
            if (targetUserIds.isEmpty()) {
                result.put("count", 0);
                return result;
            }

            // 2. 获取该用户提交的且在有效期内的问卷数量
            List<QuestionnaireSubmission> userSubmissions = questionnaireSubmissionService.list(
                new QueryWrapper<QuestionnaireSubmission>()
                    .eq("user_id", creatorId)
                    .eq("status", 1)
                    .between("submit_time", start.atStartOfDay(), end.atTime(23, 59, 59))
            );

            // 过滤掉已过期的问卷提交
            List<QuestionnaireSubmission> validSubmissions = userSubmissions.stream()
                .filter(submission -> {
                    QuestionCreate questionnaire = questionCreateService.getById(submission.getQuestionnaireId());
                    if (questionnaire == null || questionnaire.getStatus() != 1) {
                        return false; // 问卷不存在或已禁用
                    }
                    
                    // 检查问卷是否在有效期内
                    if (questionnaire.getStartDate() != null && currentDate.isBefore(questionnaire.getStartDate())) {
                        return false; // 问卷还未开始
                    }
                    if (questionnaire.getEndDate() != null && currentDate.isAfter(questionnaire.getEndDate())) {
                        return false; // 问卷已结束
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());

            // 用于存储每个问卷ID对应的最新提交记录
            Map<Integer, QuestionnaireSubmission> latestSubmissions = new HashMap<>();

            // 遍历所有有效提交记录
            for (QuestionnaireSubmission submission : validSubmissions) {
                Integer questionnaireId = submission.getQuestionnaireId();
                // 检查当前问卷ID是否已在Map中
                if (latestSubmissions.containsKey(questionnaireId)) {
                    // 已存在，比较提交时间，保留更新的记录
                    QuestionnaireSubmission existing = latestSubmissions.get(questionnaireId);
                    if (submission.getSubmitTime().compareTo(existing.getSubmitTime()) > 0) {
                        latestSubmissions.put(questionnaireId, submission);
                    }
                } else {
                    // 不存在，直接放入Map
                    latestSubmissions.put(questionnaireId, submission);
                }
            }

            // Map的size就是去重后（每个问卷只保留最新提交）的记录数
            long userSubmissionCount = latestSubmissions.size();
            
            // 3. 获取用户人员数量
            QueryWrapper<Users> allUsersWrapper = new QueryWrapper<>();
            long usersCount = usersService.count(allUsersWrapper.eq("role", 0));
            
            // 4. 计算完成率：用户提交的问卷数 / 整体人员数 * 100
            double completionRate = 0.0;
            if (usersCount > 0) {
                completionRate = (double) userSubmissionCount / usersCount * 100;
            }
            
            result.put("userQuestionnaireCount", userQuestionnaireCount);
            result.put("userSubmissionCount", userSubmissionCount);
            result.put("usersCount", usersCount);
            result.put("rate", Math.round(completionRate * 100.0) / 100.0); // 保留两位小数
            
        } catch (Exception e) {
            result.put("rate", 0.0);
            result.put("userQuestionnaireCount", 0);
            result.put("userSubmissionCount", 0);
            result.put("totalUsersCount", 0);
        }
        
        return result;
    }
    
    @Override
    public Map<String, Object> getUniqueUsersCount(Integer creatorId, Integer timeRange, String startDate, String endDate) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 获取时间范围
            LocalDate start = getStartDate(timeRange, startDate);
            LocalDate end = getEndDate(endDate);
            
            // 只统计角色是用户的（role = 0）
            QueryWrapper<Users> usersWrapper = new QueryWrapper<>();
            usersWrapper.eq("role", 0); // 只统计普通用户
            
            // 如果指定了创建者，只统计该创建者相关的用户
            if (creatorId != null) {
                // 这里可以根据业务逻辑进一步筛选
                // 比如只统计填写了该创建者问卷的用户
            }
            
            long uniqueUsersCount = usersService.count(usersWrapper);
            
            result.put("count", uniqueUsersCount);
            result.put("role", "普通用户");
            
        } catch (Exception e) {
            result.put("count", 0);
            result.put("role", "普通用户");
        }
        
        return result;
    }
    
    /**
     * 获取总问卷数（只统计在有效期内的问卷）
     */
    private Map<String, Object> getTotalQuestionnaires(Integer creatorId, Integer timeRange, String startDate, String endDate) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            LocalDate start = getStartDate(timeRange, startDate);
            LocalDate end = getEndDate(endDate);
            LocalDate currentDate = LocalDate.now();
            
            QueryWrapper<QuestionCreate> wrapper = new QueryWrapper<>();
            if (creatorId != null) {
                wrapper.eq("creator_id", creatorId);
            }
            wrapper.eq("status", 1) // 只统计启用的问卷
                   .between("created_time", start.atStartOfDay(), end.atTime(23, 59, 59));
            
            // 添加有效期检查：只统计当前时间在有效期内的问卷
            wrapper.and(w -> w
                .isNull("start_date").or().le("start_date", currentDate) // 开始日期为空或已开始
            ).and(w -> w
                .isNull("end_date").or().ge("end_date", currentDate) // 结束日期为空或未结束
            );
            
            long count = questionCreateService.count(wrapper);
            result.put("count", count);
            
        } catch (Exception e) {
            result.put("count", 0);
        }
        
        return result;
    }
    
    /**
     * 获取总提交数（只统计在有效期内的问卷提交）
     */
    private Map<String, Object> getTotalSubmissions(Integer creatorId, Integer timeRange, String startDate, String endDate) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            LocalDate start = getStartDate(timeRange, startDate);
            LocalDate end = getEndDate(endDate);
            LocalDate currentDate = LocalDate.now();

            // 查询role为0的角色id
            List<Integer> targetUserIds = usersService.list(new QueryWrapper<Users>().eq("role", 0))
                    .stream()
                    .map(Users::getId)
                    .collect(Collectors.toList());
            if (targetUserIds.isEmpty()) {
                result.put("count", 0);
                return result;
            }

            QueryWrapper<QuestionnaireSubmission> wrapper = new QueryWrapper<>();
            wrapper.eq("status", 1)
                   .between("submit_time", start.atStartOfDay(), end.atTime(23, 59, 59))
                   .in("user_id", targetUserIds);
            
            // 普通用户问卷的提交
            if (creatorId != null) {
                // 先获取该创建者的且在有效期内的问卷ID列表
                QueryWrapper<QuestionCreate> questionnaireWrapper = new QueryWrapper<>();
                questionnaireWrapper.eq("creator_id", creatorId)
                                  .eq("status", 1);
                
                // 添加有效期检查
                questionnaireWrapper.and(w -> w
                    .isNull("start_date").or().le("start_date", currentDate)
                ).and(w -> w
                    .isNull("end_date").or().ge("end_date", currentDate)
                );
                
                List<QuestionCreate> questionnaires = questionCreateService.list(questionnaireWrapper);
                List<Integer> questionnaireIds = questionnaires.stream()
                    .map(QuestionCreate::getId)
                    .collect(Collectors.toList());
                
                if (!questionnaireIds.isEmpty()) {
                    wrapper.in("questionnaire_id", questionnaireIds);
                } else {
                    result.put("count", 0);
                    return result;
                }
            }
            
            long count = questionnaireSubmissionService.count(wrapper);
            result.put("count", count);
            
        } catch (Exception e) {
            result.put("count", 0);
        }
        
        return result;
    }
    
    /**
     * 获取开始日期
     */
    private LocalDate getStartDate(Integer timeRange, String startDate) {
        if (startDate != null && !startDate.trim().isEmpty()) {
            return LocalDate.parse(startDate);
        }
        
        if (timeRange != null) {
            return LocalDate.now().minusDays(timeRange);
        }
        
        return LocalDate.now().minusDays(30); // 默认30天
    }
    
    /**
     * 获取结束日期
     */
    private LocalDate getEndDate(String endDate) {
        if (endDate != null && !endDate.trim().isEmpty()) {
            return LocalDate.parse(endDate);
        }
        return LocalDate.now();
    }
    
    /**
     * 获取变化率统计
     */
    private Map<String, Object> getChangeRates(Integer creatorId, Integer timeRange) {
        Map<String, Object> changes = new HashMap<>();
        
        try {
            // 当前时间段的数据
            LocalDate currentEnd = LocalDate.now();
            LocalDate currentStart = currentEnd.minusDays(timeRange);
            
            // 上一个时间段的数据（相同长度）
            LocalDate previousEnd = currentStart.minusDays(1);
            LocalDate previousStart = previousEnd.minusDays(timeRange);
            
            // 计算问卷数量变化率
            long currentQuestionnaires = getQuestionnaireCountInPeriod(creatorId, currentStart, currentEnd);
            long previousQuestionnaires = getQuestionnaireCountInPeriod(creatorId, previousStart, previousEnd);
            double questionnaireChange = calculateChangeRate(previousQuestionnaires, currentQuestionnaires);
            
            // 计算提交数量变化率
            long currentSubmissions = getSubmissionCountInPeriod(creatorId, currentStart, currentEnd);
            long previousSubmissions = getSubmissionCountInPeriod(creatorId, previousStart, previousEnd);
            double submissionChange = calculateChangeRate(previousSubmissions, currentSubmissions);
            
            // 计算完成率变化
            double currentCompletionRate = getCompletionRateInPeriod(creatorId, currentStart, currentEnd);
            double previousCompletionRate = getCompletionRateInPeriod(creatorId, previousStart, previousEnd);
            double completionChange = calculateChangeRate(previousCompletionRate, currentCompletionRate);
            
            // 计算用户数量变化率
            long currentUsers = getUniqueUsersCountInPeriod(creatorId, currentStart, currentEnd);
            long previousUsers = getUniqueUsersCountInPeriod(creatorId, previousStart, previousEnd);
            double userChange = calculateChangeRate(previousUsers, currentUsers);
            
            changes.put("totalChange", formatChangeRate(questionnaireChange));
            changes.put("submissionsChange", formatChangeRate(submissionChange));
            changes.put("completionChange", formatChangeRate(completionChange));
            changes.put("usersChange", formatChangeRate(userChange));
            changes.put("timeRange", timeRange);
            changes.put("currentPeriod", currentStart.toString() + " 至 " + currentEnd.toString());
            changes.put("previousPeriod", previousStart.toString() + " 至 " + previousEnd.toString());
            
        } catch (Exception e) {
            changes.put("totalChange", "+0%");
            changes.put("submissionsChange", "+0%");
            changes.put("completionChange", "+0%");
            changes.put("usersChange", "+0%");
            changes.put("timeRange", timeRange);
            changes.put("currentPeriod", "计算失败");
            changes.put("previousPeriod", "计算失败");
        }
        
        return changes;
    }
    
    /**
     * 获取指定时间段内的问卷数量
     */
    private long getQuestionnaireCountInPeriod(Integer creatorId, LocalDate startDate, LocalDate endDate) {
        try {
            LocalDate currentDate = LocalDate.now();
            QueryWrapper<QuestionCreate> wrapper = new QueryWrapper<>();
            if (creatorId != null) {
                wrapper.eq("creator_id", creatorId);
            }
            wrapper.eq("status", 1)
                   .between("created_time", startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
            
            // 添加有效期检查：只统计当前时间在有效期内的问卷
            wrapper.and(w -> w
                .isNull("start_date").or().le("start_date", currentDate)
            ).and(w -> w
                .isNull("end_date").or().ge("end_date", currentDate)
            );
            
            return questionCreateService.count(wrapper);
        } catch (Exception e) {
            return 0;
        }
    }
    
    /**
     * 获取指定时间段内的提交数量
     */
    private long getSubmissionCountInPeriod(Integer creatorId, LocalDate startDate, LocalDate endDate) {
        try {
            LocalDate currentDate = LocalDate.now();
            
            // 查询role为0的角色id
            List<Integer> targetUserIds = usersService.list(new QueryWrapper<Users>().eq("role", 0))
                    .stream()
                    .map(Users::getId)
                    .collect(Collectors.toList());
            if (targetUserIds.isEmpty()) {
                return 0;
            }

            QueryWrapper<QuestionnaireSubmission> wrapper = new QueryWrapper<>();
            wrapper.eq("status", 1)
                   .between("submit_time", startDate.atStartOfDay(), endDate.atTime(23, 59, 59))
                   .in("user_id", targetUserIds);
            
            if (creatorId != null) {
                // 先获取该创建者的且在有效期内的问卷ID列表
                QueryWrapper<QuestionCreate> questionnaireWrapper = new QueryWrapper<>();
                questionnaireWrapper.eq("creator_id", creatorId)
                                  .eq("status", 1);
                
                // 添加有效期检查
                questionnaireWrapper.and(w -> w
                    .isNull("start_date").or().le("start_date", currentDate)
                ).and(w -> w
                    .isNull("end_date").or().ge("end_date", currentDate)
                );
                
                List<QuestionCreate> questionnaires = questionCreateService.list(questionnaireWrapper);
                List<Integer> questionnaireIds = questionnaires.stream()
                    .map(QuestionCreate::getId)
                    .collect(Collectors.toList());
                
                if (!questionnaireIds.isEmpty()) {
                    wrapper.in("questionnaire_id", questionnaireIds);
                } else {
                    return 0;
                }
            }
            
            return questionnaireSubmissionService.count(wrapper);
        } catch (Exception e) {
            return 0;
        }
    }
    
    /**
     * 获取指定时间段内的完成率
     */
    private double getCompletionRateInPeriod(Integer creatorId, LocalDate startDate, LocalDate endDate) {
        try {
            LocalDate currentDate = LocalDate.now();
            
            // 获取该用户创建的且在有效期内的问卷数量
            QueryWrapper<QuestionCreate> questionnaireWrapper = new QueryWrapper<>();
            questionnaireWrapper.eq("creator_id", creatorId)
                              .eq("status", 1)
                              .between("created_time", startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
            
            // 添加有效期检查
            questionnaireWrapper.and(wrapper -> wrapper
                .isNull("start_date").or().le("start_date", currentDate)
            ).and(wrapper -> wrapper
                .isNull("end_date").or().ge("end_date", currentDate)
            );
            
            long userQuestionnaireCount = questionCreateService.count(questionnaireWrapper);
            
            // 获取该用户提交的且在有效期内的问卷数量
            List<QuestionnaireSubmission> userSubmissions = questionnaireSubmissionService.list(
                new QueryWrapper<QuestionnaireSubmission>()
                    .eq("user_id", creatorId)
                    .eq("status", 1)
                    .between("submit_time", startDate.atStartOfDay(), endDate.atTime(23, 59, 59))
            );

            // 过滤掉已过期的问卷提交
            List<QuestionnaireSubmission> validSubmissions = userSubmissions.stream()
                .filter(submission -> {
                    QuestionCreate questionnaire = questionCreateService.getById(submission.getQuestionnaireId());
                    if (questionnaire == null || questionnaire.getStatus() != 1) {
                        return false;
                    }
                    
                    if (questionnaire.getStartDate() != null && currentDate.isBefore(questionnaire.getStartDate())) {
                        return false;
                    }
                    if (questionnaire.getEndDate() != null && currentDate.isAfter(questionnaire.getEndDate())) {
                        return false;
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());

            // 去重统计
            long userSubmissionCount = validSubmissions.stream()
                .map(QuestionnaireSubmission::getQuestionnaireId)
                .distinct()
                .count();
            
            // 获取用户人员数量
            long usersCount = usersService.count(new QueryWrapper<Users>().eq("role", 0));
            
            // 计算完成率
            if (usersCount > 0) {
                return (double) userSubmissionCount / usersCount * 100;
            }
            
            return 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }
    
    /**
     * 获取指定时间段内的独立用户数
     */
    private long getUniqueUsersCountInPeriod(Integer creatorId, LocalDate startDate, LocalDate endDate) {
        try {
            QueryWrapper<Users> usersWrapper = new QueryWrapper<>();
            usersWrapper.eq("role", 0);
            return usersService.count(usersWrapper);
        } catch (Exception e) {
            return 0;
        }
    }
    
    /**
     * 计算变化率
     */
    private double calculateChangeRate(double previousValue, double currentValue) {
        if (previousValue == 0) {
            return currentValue > 0 ? 100.0 : 0.0;
        }
        return ((currentValue - previousValue) / previousValue) * 100;
    }
    
    /**
     * 格式化变化率
     */
    private String formatChangeRate(double changeRate) {
        if (changeRate > 0) {
            return "+" + Math.round(changeRate * 100.0) / 100.0 + "%";
        } else if (changeRate < 0) {
            return Math.round(changeRate * 100.0) / 100.0 + "%";
        } else {
            return "+0%";
        }
    }
    
    /**
     * 获取默认变化率
     */
    private Map<String, Object> getDefaultChangeRates() {
        Map<String, Object> changes = new HashMap<>();
        changes.put("totalChange", "+0%");
        changes.put("submissionsChange", "+0%");
        changes.put("completionChange", "+0%");
        changes.put("usersChange", "+0%");
        changes.put("timeRange", 30);
        changes.put("currentPeriod", "无数据");
        changes.put("previousPeriod", "无数据");
        return changes;
    }
} 