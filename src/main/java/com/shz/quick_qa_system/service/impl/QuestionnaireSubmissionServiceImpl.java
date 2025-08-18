package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.dao.QuestionAnswerMapper;
import com.shz.quick_qa_system.dao.QuestionnaireSubmissionMapper;
import com.shz.quick_qa_system.dao.QuestionCreateMapper;
import com.shz.quick_qa_system.entity.QuestionAnswer;
import com.shz.quick_qa_system.entity.QuestionnaireSubmission;
import com.shz.quick_qa_system.service.QuestionnaireSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.shz.quick_qa_system.utils.RandomIdUtil;

import java.util.ArrayList;
import com.shz.quick_qa_system.entity.QuestionCreate;
import java.util.stream.Collectors;

/**
 * 问卷提交记录Service实现类
 */
@Service
public class QuestionnaireSubmissionServiceImpl extends ServiceImpl<QuestionnaireSubmissionMapper, QuestionnaireSubmission> implements QuestionnaireSubmissionService {
    
    @Autowired
    private QuestionAnswerMapper questionAnswerMapper;
    
    @Autowired
    private QuestionCreateMapper questionCreateMapper;
    
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
            Integer qid = submission.getQuestionnaireId();
            int tryCount = 0;
            Integer genId = null;
            do {
                genId = RandomIdUtil.generateSubmissionId(qid != null ? qid : 0);
                // 如果已存在，则重试
                if (getById(genId) == null) {
                    break;
                }
                tryCount++;
            } while (tryCount < 5);
            submission.setId(genId);

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
    public Map<String, Object> getParticipationStatistics(Integer creatorId) {
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            // 获取总参与人数（通过问卷ID关联）
            QueryWrapper<QuestionnaireSubmission> wrapper = new QueryWrapper<>();
            wrapper.eq("status", 1);
            
            // 如果指定了创建者ID，需要先获取该创建者的问卷ID列表
            if (creatorId != null) {
                // 获取该创建者的所有问卷ID
                List<Integer> questionnaireIds = getQuestionnaireIdsByCreator(creatorId);
                if (!questionnaireIds.isEmpty()) {
                    wrapper.in("questionnaire_id", questionnaireIds);
                } else {
                    // 如果没有问卷，返回0
                    statistics.put("totalParticipants", 0L);
                    statistics.put("totalSubmissions", 0L);
                    statistics.put("completedSubmissions", 0L);
                    statistics.put("avgDuration", 0.0);
                    return statistics;
                }
            }
            
            // 统计总提交数
            long totalSubmissions = count(wrapper);
            
            // 统计完整提交数
            long completedSubmissions = count(new QueryWrapper<QuestionnaireSubmission>()
                    .eq("status", 1)
                    .eq("is_complete", 1)
                    .in(creatorId != null ? "questionnaire_id" : null, 
                        creatorId != null ? getQuestionnaireIdsByCreator(creatorId) : null));
            
            // 统计唯一参与人数（去重user_id）
            long uniqueParticipants = 0;
            if (totalSubmissions > 0) {
                QueryWrapper<QuestionnaireSubmission> uniqueWrapper = new QueryWrapper<>();
                uniqueWrapper.eq("status", 1)
                           .select("DISTINCT user_id");
                if (creatorId != null) {
                    uniqueWrapper.in("questionnaire_id", getQuestionnaireIdsByCreator(creatorId));
                }
                uniqueParticipants = count(uniqueWrapper);
            }
            
            // 计算平均用时
            List<QuestionnaireSubmission> submissions = list(new QueryWrapper<QuestionnaireSubmission>()
                    .eq("status", 1)
                    .isNotNull("duration_seconds")
                    .in(creatorId != null ? "questionnaire_id" : null, 
                        creatorId != null ? getQuestionnaireIdsByCreator(creatorId) : null));
            
            double avgDuration = submissions.stream()
                    .mapToInt(s -> s.getDurationSeconds() != null ? s.getDurationSeconds() : 0)
                    .average()
                    .orElse(0.0);
            
            statistics.put("totalParticipants", uniqueParticipants);
            statistics.put("totalSubmissions", totalSubmissions);
            statistics.put("completedSubmissions", completedSubmissions);
            statistics.put("avgDuration", Math.round(avgDuration * 100.0) / 100.0);
            
        } catch (Exception e) {
            // 如果出错，返回默认值
            statistics.put("totalParticipants", 0L);
            statistics.put("totalSubmissions", 0L);
            statistics.put("completedSubmissions", 0L);
            statistics.put("avgDuration", 0.0);
        }
        
        return statistics;
    }

    /**
     * 根据创建者ID获取问卷ID列表
     */
    private List<Integer> getQuestionnaireIdsByCreator(Integer creatorId) {
        try {
            QueryWrapper<QuestionCreate> wrapper = new QueryWrapper<>();
            wrapper.eq("creator_id", creatorId)
                   .select("id");
            
            List<QuestionCreate> questionnaires = questionCreateMapper.selectList(wrapper);
            return questionnaires.stream()
                    .map(QuestionCreate::getId)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Override
    public Map<String, Object> getCompletionRateStatistics(Integer creatorId) {
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            QueryWrapper<QuestionnaireSubmission> wrapper = new QueryWrapper<>();
            wrapper.eq("status", 1);
            
            long totalSubmissions = count(wrapper);
            long completedSubmissions = count(new QueryWrapper<QuestionnaireSubmission>()
                    .eq("status", 1)
                    .eq("is_complete", 1));
            
            double completionRate = totalSubmissions > 0 ? (double) completedSubmissions / totalSubmissions * 100 : 0.0;
            
            statistics.put("totalSubmissions", totalSubmissions);
            statistics.put("completedSubmissions", completedSubmissions);
            statistics.put("completionRate", Math.round(completionRate * 100.0) / 100.0);
        } catch (Exception e) {
            statistics.put("totalSubmissions", 0L);
            statistics.put("completedSubmissions", 0L);
            statistics.put("completionRate", 0.0);
        }
        
        return statistics;
    }

    @Override
    public Map<String, Object> getUniqueUsersStatistics(Integer creatorId) {
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            QueryWrapper<QuestionnaireSubmission> wrapper = new QueryWrapper<>();
            wrapper.eq("status", 1)
                   .select("DISTINCT user_id");
            
            long uniqueUsers = count(wrapper);
            
            statistics.put("uniqueUsers", uniqueUsers);
        } catch (Exception e) {
            statistics.put("uniqueUsers", 0L);
        }
        
        return statistics;
    }
}
