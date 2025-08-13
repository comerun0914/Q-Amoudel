package com.shz.quick_qa_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shz.quick_qa_system.entity.QuestionnaireDraft;

import java.util.Map;

/**
 * 问卷草稿Service接口
 */
public interface QuestionnaireDraftService extends IService<QuestionnaireDraft> {
    
    /**
     * 保存草稿
     * @param draftData 草稿数据
     * @return 草稿ID
     */
    Integer saveDraft(Map<String, Object> draftData);
    
    /**
     * 获取草稿
     * @param questionnaireId 问卷ID
     * @param userId 用户ID（可为空）
     * @param sessionId 会话ID（用于匿名用户）
     * @return 草稿数据
     */
    Map<String, Object> getDraft(Integer questionnaireId, Integer userId, String sessionId);
    
    /**
     * 删除草稿
     * @param questionnaireId 问卷ID
     * @param userId 用户ID（可为空）
     * @param sessionId 会话ID（用于匿名用户）
     */
    void deleteDraft(Integer questionnaireId, Integer userId, String sessionId);
    
    /**
     * 清理过期草稿
     */
    void cleanExpiredDrafts();
}
