package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 问卷提交记录实体类
 */
@Data
@TableName("questionnaire_submission")
public class QuestionnaireSubmission {
    
    @TableId(type = IdType.INPUT)
    private Integer id;
    
    /**
     * 问卷ID
     */
    private Integer questionnaireId;
    
    /**
     * 用户ID（可为空，支持匿名填写）
     */
    private Integer userId;
    
    /**
     * 填写者姓名
     */
    private String submitterName;
    
    /**
     * 填写者邮箱
     */
    private String submitterEmail;
    
    /**
     * 填写者电话
     */
    private String submitterPhone;
    
    /**
     * 提交IP地址
     */
    private String ipAddress;
    
    /**
     * 用户代理信息
     */
    private String userAgent;
    
    /**
     * 开始填写时间
     */
    private LocalDateTime startTime;
    
    /**
     * 提交时间
     */
    private LocalDateTime submitTime;
    
    /**
     * 填写时长（秒）
     */
    private Integer durationSeconds;
    
    /**
     * 状态：1=有效，0=无效
     */
    private Integer status;
    
    /**
     * 是否完整填写：1=是，0=否
     */
    private Integer isComplete;
}
