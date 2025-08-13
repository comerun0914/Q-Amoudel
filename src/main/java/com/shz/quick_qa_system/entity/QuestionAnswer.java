package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 问题答案实体类
 */
@Data
@TableName("question_answer")
public class QuestionAnswer {
    
    @TableId(type = IdType.INPUT)
    private Integer id;
    
    /**
     * 提交记录ID
     */
    private Integer submissionId;
    
    /**
     * 问题ID
     */
    private Integer questionId;
    
    /**
     * 题型：1=单选题，2=多选题，3=问答题，4=评分题，5=矩阵题
     */
    private Integer questionType;
    
    /**
     * JSON格式答案（多选题、矩阵题等复杂答案）
     */
    private String answerJson;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdTime;
}
