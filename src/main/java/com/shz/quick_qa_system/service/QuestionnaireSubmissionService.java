package com.shz.quick_qa_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shz.quick_qa_system.entity.QuestionnaireSubmission;

import java.util.Map;

/**
 * 问卷提交记录Service接口
 */
public interface QuestionnaireSubmissionService extends IService<QuestionnaireSubmission> {
    
    /**
     * 提交问卷答案
     * @param submissionData 提交数据
     * @return 提交记录ID
     */
    Integer submitQuestionnaire(Map<String, Object> submissionData);
    
    /**
     * 获取问卷提交统计
     * @param questionnaireId 问卷ID
     * @return 统计信息
     */
    Map<String, Object> getSubmissionStatistics(Integer questionnaireId);
    
    /**
     * 检查用户是否已提交过问卷
     * @param questionnaireId 问卷ID
     * @param userId 用户ID
     * @return 是否已提交
     */
    boolean hasUserSubmitted(Integer questionnaireId, Integer userId);
    
    /**
     * 检查IP是否已提交过问卷（防重复提交）
     * @param questionnaireId 问卷ID
     * @param ipAddress IP地址
     * @return 是否已提交
     */
    boolean hasIpSubmitted(Integer questionnaireId, String ipAddress);
}
