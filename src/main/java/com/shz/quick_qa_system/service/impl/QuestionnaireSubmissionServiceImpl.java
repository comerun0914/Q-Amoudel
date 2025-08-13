package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.dao.QuestionAnswerMapper;
import com.shz.quick_qa_system.dao.QuestionnaireSubmissionMapper;
import com.shz.quick_qa_system.entity.QuestionAnswer;
import com.shz.quick_qa_system.entity.QuestionCreate;
import com.shz.quick_qa_system.entity.QuestionnaireSubmission;
import com.shz.quick_qa_system.service.QuestionCreateService;
import com.shz.quick_qa_system.service.QuestionnaireSubmissionService;
import com.shz.quick_qa_system.service.UsersService;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.shz.quick_qa_system.utils.RandomIdUtil;

/**
 * 问卷提交记录Service实现类
 */
@Service
public class QuestionnaireSubmissionServiceImpl extends ServiceImpl<QuestionnaireSubmissionMapper, QuestionnaireSubmission> implements QuestionnaireSubmissionService {
    
    @Autowired
    private QuestionAnswerMapper questionAnswerMapper;
    @Autowired
    private QuestionCreateService questionCreateService;
    @Autowired
    private QuestionnaireSubmissionMapper questionnaireSubmissionMapper;
    @Autowired
    private UsersService usersService;

    
    @Override
    @Transactional
    public Integer submitQuestionnaire(Map<String, Object> submissionData) {
        try {
            // 1. 创建提交记录
            QuestionnaireSubmission submission = new QuestionnaireSubmission();
            submission.setQuestionnaireId((Integer) submissionData.get("questionnaireId"));
            submission.setUserId((Integer) submissionData.get("userId"));
            submission.setSubmitterName((String) submissionData.get("submitterName"));
            submission.setSubmitterEmail((String) submissionData.get("submitterEmail"));
            submission.setSubmitterPhone((String) submissionData.get("submitterPhone"));
            submission.setIpAddress((String) submissionData.get("ipAddress"));
            submission.setUserAgent((String) submissionData.get("userAgent"));
            submission.setStartTime(LocalDateTime.parse((String) submissionData.get("startTime")));
            submission.setSubmitTime(LocalDateTime.now());
            submission.setDurationSeconds((Integer) submissionData.get("durationSeconds"));
            submission.setStatus(1);
            submission.setIsComplete(1);
            
            // 生成随机提交ID（基于问卷ID），并带重试避免极小概率冲突
            Integer qid = CodeGenerator.generateFormId();
            while (questionnaireSubmissionMapper.exists(new QueryWrapper<QuestionnaireSubmission>().eq("id", qid))) {
                qid = CodeGenerator.generateFormId();
            }
            submission.setId(qid);

            // 保存提交记录（使用手动ID）
            save(submission);
            
            // 2. 保存答案数据
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> answers = (List<Map<String, Object>>) submissionData.get("answers");
            if (answers != null && !answers.isEmpty()) {
                saveAnswers(submission.getId(), answers);
            }
            
            return submission.getId();
        } catch (Exception e) {
            throw new RuntimeException("提交问卷失败: " + e.getMessage());
        }
    }
    
    /**
     * 保存答案数据
     */
    private void saveAnswers(Integer submissionId, List<Map<String, Object>> answers) {
        for (int i = 0; i < answers.size(); i++) {
            Map<String, Object> answerData = answers.get(i);
            QuestionAnswer answer = new QuestionAnswer();
            // 生成答案随机ID，基于 submissionId + questionId + 下标
            answer.setSubmissionId(submissionId);
            answer.setQuestionId((Integer) answerData.get("questionId"));
            answer.setQuestionType((Integer) answerData.get("questionType"));

            // 统一将答案合并为 JSON 存储，兼容老字段
            Object explicitJson = answerData.get("answerJson");
            Object answerText = answerData.get("answerText");
            Object answerValue = answerData.get("answerValue");

            String finalJson;
            if (explicitJson != null) {
                // 已传入 JSON 字符串
                finalJson = String.valueOf(explicitJson);
            } else {
                // 组装统一 JSON
                Map<String, Object> obj = new HashMap<>();
                if (answerText != null) obj.put("text", answerText);
                if (answerValue != null) obj.put("value", answerValue);
                // 也兼容将原始对象答案透传（例如矩阵题）
                Object raw = answerData.get("answer");
                if (raw != null) obj.put("raw", raw);
                try {
                    finalJson = new ObjectMapper().writeValueAsString(obj);
                } catch (JsonProcessingException e) {
                    finalJson = "{}";
                }
            }

            answer.setAnswerJson(finalJson);
            answer.setCreatedTime(LocalDateTime.now());
            // 生成并设置答案ID
            int qid = answer.getQuestionId() != null ? answer.getQuestionId() : 0;
            int idx = i;
            int generatedId = RandomIdUtil.generateAnswerId(submissionId, qid, idx);
            answer.setId(generatedId);
            questionAnswerMapper.insert(answer);
        }
    }
    
    @Override
    public Map<String, Object> getSubmissionStatistics(Integer questionnaireId) {
        // 统计提交数量
        QueryWrapper<QuestionnaireSubmission> wrapper = new QueryWrapper<>();
        wrapper.eq("questionnaire_id", questionnaireId)
               .eq("status", 1);
        
        long totalSubmissions = count(wrapper);
        
        // 统计完整填写数量
        wrapper.eq("is_complete", 1);
        long completeSubmissions = count(wrapper);
        
        // 统计平均填写时长
        List<QuestionnaireSubmission> submissions = list(new QueryWrapper<QuestionnaireSubmission>()
                .eq("questionnaire_id", questionnaireId)
                .eq("status", 1)
                .isNotNull("duration_seconds"));
        
        double avgDuration = submissions.stream()
                .mapToInt(s -> s.getDurationSeconds() != null ? s.getDurationSeconds() : 0)
                .average()
                .orElse(0.0);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalSubmissions", totalSubmissions);
        statistics.put("completeSubmissions", completeSubmissions);
        statistics.put("incompleteSubmissions", totalSubmissions - completeSubmissions);
        statistics.put("avgDuration", Math.round(avgDuration));
        return statistics;
    }
    
    @Override
    public boolean hasUserSubmitted(Integer questionnaireId, Integer userId) {
        if (userId == null) {
            return false;
        }
        
        QueryWrapper<QuestionnaireSubmission> wrapper = new QueryWrapper<>();
        wrapper.eq("questionnaire_id", questionnaireId)
               .eq("user_id", userId)
               .eq("status", 1);
        
        return count(wrapper) > 0;
    }
    
    @Override
    public boolean hasIpSubmitted(Integer questionnaireId, String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            return false;
        }
        
        QueryWrapper<QuestionnaireSubmission> wrapper = new QueryWrapper<>();
        wrapper.eq("questionnaire_id", questionnaireId)
               .eq("ip_address", ipAddress)
               .eq("status", 1);
        
        return count(wrapper) > 0;
    }

    @Override
    public Map<String, Object> getUserSubmittedQuestionnaires(Integer userId, Integer page, Integer size, String keyword, String dateFilter) {
        // 构建查询条件 - 查询用户已提交的问卷
        QueryWrapper<QuestionnaireSubmission> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId)
               .eq("status", 1)
               .orderByDesc("submit_time");
        
        // 关键词搜索（在问卷标题中搜索）
        if (keyword != null && !keyword.trim().isEmpty()) {
            // 这里需要通过关联查询来搜索问卷标题
            // 暂时先按提交时间排序，后续可以优化为关联查询
        }
        
        // 日期筛选
        if (dateFilter != null && !dateFilter.trim().isEmpty()) {
            // 根据提交时间筛选
            // 这里可以添加日期范围筛选逻辑
        }
        
        // 执行分页查询
        long total = count(wrapper);
        List<QuestionnaireSubmission> submissions = list(wrapper);
        
        // 通过关联查询获取问卷的标题和描述
        List<Map<String, Object>> enrichedSubmissions = new ArrayList<>();
        for (QuestionnaireSubmission submission : submissions) {
            Map<String, Object> enrichedSubmission = new HashMap<>();
            
            // 复制原始提交记录的所有字段
            enrichedSubmission.put("id", submission.getId());
            enrichedSubmission.put("questionnaireId", submission.getQuestionnaireId());

            // 获取问卷信息
            QuestionCreate questionInfo = questionCreateService.getById(submission.getQuestionnaireId());

            enrichedSubmission.put("creatorName",usersService.getUserByuserId(questionInfo.getCreatorId()).getUsername());
            enrichedSubmission.put("submitterName", submission.getSubmitterName());
            enrichedSubmission.put("submitterEmail", submission.getSubmitterEmail());
            enrichedSubmission.put("submitterPhone", submission.getSubmitterPhone());
            enrichedSubmission.put("ipAddress", submission.getIpAddress());
            enrichedSubmission.put("userAgent", submission.getUserAgent());
            enrichedSubmission.put("startTime", questionInfo.getStartDate());
            enrichedSubmission.put("endTime", questionInfo.getEndDate());
            enrichedSubmission.put("submitTime", submission.getSubmitTime());
            enrichedSubmission.put("durationSeconds", submission.getDurationSeconds());
            enrichedSubmission.put("status", submission.getStatus());
            enrichedSubmission.put("isComplete", submission.getIsComplete());
            
            // 通过问卷ID查询问卷信息
            try {
                if (questionInfo != null) {
                    enrichedSubmission.put("questionnaireTitle", questionInfo.getTitle() != null ? questionInfo.getTitle() : "问卷#" + submission.getQuestionnaireId());
                    enrichedSubmission.put("questionnaireDescription", questionInfo.getDescription() != null ? questionInfo.getDescription() : "暂无描述");
                    
                    // 计算剩余提交次数
                    Integer submissionLimit = questionInfo.getSubmissionLimit();
                    if (submissionLimit != null) {
                        // 查询该用户对该问卷的提交次数
                        QueryWrapper<QuestionnaireSubmission> userSubmissionWrapper = new QueryWrapper<>();
                        userSubmissionWrapper.eq("questionnaire_id", submission.getQuestionnaireId())
                                           .eq("user_id", userId)
                                           .eq("status", 1);
                        long userSubmissionCount = count(userSubmissionWrapper);
                        
                        int remainingTimes = Math.max(0, submissionLimit - (int)userSubmissionCount);
                        enrichedSubmission.put("remainingTimes", remainingTimes);
                    } else {
                        enrichedSubmission.put("remainingTimes", -1); // 无限制
                    }
                } else {
                    enrichedSubmission.put("questionnaireTitle", "问卷#" + submission.getQuestionnaireId());
                    enrichedSubmission.put("questionnaireDescription", "暂无描述");
                    enrichedSubmission.put("remainingTimes", -1);
                }
            } catch (Exception e) {
                // 如果查询失败，设置默认值
                enrichedSubmission.put("questionnaireTitle", "问卷#" + submission.getQuestionnaireId());
                enrichedSubmission.put("questionnaireDescription", "暂无描述");
                enrichedSubmission.put("remainingTimes", -1);
            }
            
            enrichedSubmissions.add(enrichedSubmission);
        }
        
        // 构建返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("list", enrichedSubmissions);
        result.put("page", page);
        result.put("size", size);
        result.put("pages", (total + size - 1) / size);
        
        return result;
    }
    
    @Override
    public Map<String, Object> checkUserSubmissionLimit(Integer questionnaireId, Integer userId) {
        try {
            // 获取问卷信息
            QuestionCreate questionInfo = questionCreateService.getById(questionnaireId);
            if (questionInfo == null) {
                throw new RuntimeException("问卷不存在");
            }
            
            // 获取问卷的提交次数限制
            Integer submissionLimit = questionInfo.getSubmissionLimit();
            if (submissionLimit == null) {
                submissionLimit = 1; // 默认限制为1次
            }
            
            // 查询该用户对该问卷的已提交次数
            QueryWrapper<QuestionnaireSubmission> userSubmissionWrapper = new QueryWrapper<>();
            userSubmissionWrapper.eq("questionnaire_id", questionnaireId)
                               .eq("user_id", userId)
                               .eq("status", 1);
            long userSubmissionCount = count(userSubmissionWrapper);
            
            // 计算剩余提交次数
            int remainingTimes = Math.max(0, submissionLimit - (int)userSubmissionCount);
            
            // 构建返回结果
            Map<String, Object> result = new HashMap<>();
            result.put("submissionLimit", submissionLimit);
            result.put("userSubmissionCount", userSubmissionCount);
            result.put("remainingTimes", remainingTimes);
            result.put("canSubmit", remainingTimes > 0);
            
            return result;
        } catch (Exception e) {
            throw new RuntimeException("检查用户提交次数限制失败: " + e.getMessage());
        }
    }
}
