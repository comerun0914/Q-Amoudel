package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.dao.QuestionAnswerMapper;
import com.shz.quick_qa_system.dao.QuestionnaireSubmissionMapper;
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

/**
 * 问卷提交记录Service实现类
 */
@Service
public class QuestionnaireSubmissionServiceImpl extends ServiceImpl<QuestionnaireSubmissionMapper, QuestionnaireSubmission> implements QuestionnaireSubmissionService {
    
    @Autowired
    private QuestionAnswerMapper questionAnswerMapper;
    
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
            
            // 保存提交记录
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
        for (Map<String, Object> answerData : answers) {
            QuestionAnswer answer = new QuestionAnswer();
            answer.setSubmissionId(submissionId);
            answer.setQuestionId((Integer) answerData.get("questionId"));
            answer.setQuestionType((Integer) answerData.get("questionType"));
            
            // 根据题型处理答案
            Integer questionType = answer.getQuestionType();
            if (questionType == 1) { // 单选题
                answer.setAnswerValue((Integer) answerData.get("answerValue"));
                answer.setAnswerText((String) answerData.get("answerText"));
            } else if (questionType == 2) { // 多选题
                answer.setAnswerJson((String) answerData.get("answerJson"));
                answer.setAnswerText((String) answerData.get("answerText"));
            } else if (questionType == 3) { // 问答题
                answer.setAnswerText((String) answerData.get("answerText"));
            } else if (questionType == 4) { // 评分题
                answer.setAnswerValue((Integer) answerData.get("answerValue"));
                answer.setAnswerText((String) answerData.get("answerText"));
            } else if (questionType == 5) { // 矩阵题
                answer.setAnswerJson((String) answerData.get("answerJson"));
                answer.setAnswerText((String) answerData.get("answerText"));
            }
            
            answer.setCreatedTime(LocalDateTime.now());
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
}
