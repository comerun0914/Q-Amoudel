package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 问卷草稿实体类
 */
@Data
@TableName("questionnaire_draft")
public class QuestionnaireDraft {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    /**
     * 问卷ID
     */
    private Integer questionnaireId;
    
    /**
     * 用户ID（可为空，支持匿名草稿）
     */
    private Integer userId;
    
    /**
     * 会话ID（用于匿名用户）
     */
    private String sessionId;
    
    /**
     * 草稿数据（JSON格式）
     */
    private String draftData;
    
    /**
     * 填写进度（0-100）
     */
    private Integer progress;
    
    /**
     * 最后保存时间
     */
    private LocalDateTime lastSaveTime;
    
    /**
     * 过期时间（默认7天）
     */
    private LocalDateTime expireTime;
}
