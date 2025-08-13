package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shz.quick_qa_system.dao.QuestionnaireDraftMapper;
import com.shz.quick_qa_system.entity.QuestionnaireDraft;
import com.shz.quick_qa_system.service.QuestionnaireDraftService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 问卷草稿Service实现类
 */
@Service
public class QuestionnaireDraftServiceImpl extends ServiceImpl<QuestionnaireDraftMapper, QuestionnaireDraft> implements QuestionnaireDraftService {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public Integer saveDraft(Map<String, Object> draftData) {
        try {
            Integer questionnaireId = (Integer) draftData.get("questionnaireId");
            Integer userId = (Integer) draftData.get("userId");
            String sessionId = (String) draftData.get("sessionId");
            Integer progress = (Integer) draftData.get("progress");
            
            // 检查是否已存在草稿
            QueryWrapper<QuestionnaireDraft> wrapper = new QueryWrapper<>();
            wrapper.eq("questionnaire_id", questionnaireId);
            if (userId != null) {
                wrapper.eq("user_id", userId);
            } else if (sessionId != null) {
                wrapper.eq("session_id", sessionId);
            }
            
            QuestionnaireDraft existingDraft = getOne(wrapper);
            
            if (existingDraft != null) {
                // 更新现有草稿
                existingDraft.setDraftData(objectMapper.writeValueAsString(draftData.get("answers")));
                existingDraft.setProgress(progress);
                existingDraft.setLastSaveTime(LocalDateTime.now());
                existingDraft.setExpireTime(LocalDateTime.now().plusDays(7));
                updateById(existingDraft);
                return existingDraft.getId();
            } else {
                // 创建新草稿
                QuestionnaireDraft draft = new QuestionnaireDraft();
                draft.setQuestionnaireId(questionnaireId);
                draft.setUserId(userId);
                draft.setSessionId(sessionId);
                draft.setDraftData(objectMapper.writeValueAsString(draftData.get("answers")));
                draft.setProgress(progress);
                draft.setLastSaveTime(LocalDateTime.now());
                draft.setExpireTime(LocalDateTime.now().plusDays(7));
                save(draft);
                return draft.getId();
            }
        } catch (Exception e) {
            throw new RuntimeException("保存草稿失败: " + e.getMessage());
        }
    }
    
    @Override
    public Map<String, Object> getDraft(Integer questionnaireId, Integer userId, String sessionId) {
        try {
            QueryWrapper<QuestionnaireDraft> wrapper = new QueryWrapper<>();
            wrapper.eq("questionnaire_id", questionnaireId);
            if (userId != null) {
                wrapper.eq("user_id", userId);
            } else if (sessionId != null) {
                wrapper.eq("session_id", sessionId);
            }
            wrapper.gt("expire_time", LocalDateTime.now()); // 只获取未过期的草稿
            
            QuestionnaireDraft draft = getOne(wrapper);
            
            if (draft != null) {
                Map<String, Object> result = new HashMap<>();
                result.put("draftId", draft.getId());
                result.put("progress", draft.getProgress());
                result.put("lastSaveTime", draft.getLastSaveTime());
                result.put("answers", objectMapper.readValue(draft.getDraftData(), Map.class));
                return result;
            }
            
            return null;
        } catch (Exception e) {
            throw new RuntimeException("获取草稿失败: " + e.getMessage());
        }
    }
    
    @Override
    public void deleteDraft(Integer questionnaireId, Integer userId, String sessionId) {
        QueryWrapper<QuestionnaireDraft> wrapper = new QueryWrapper<>();
        wrapper.eq("questionnaire_id", questionnaireId);
        if (userId != null) {
            wrapper.eq("user_id", userId);
        } else if (sessionId != null) {
            wrapper.eq("session_id", sessionId);
        }
        
        remove(wrapper);
    }
    
    @Override
    public void cleanExpiredDrafts() {
        QueryWrapper<QuestionnaireDraft> wrapper = new QueryWrapper<>();
        wrapper.lt("expire_time", LocalDateTime.now());
        remove(wrapper);
    }
}
