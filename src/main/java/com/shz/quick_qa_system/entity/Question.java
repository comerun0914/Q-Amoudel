package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * <p>
 * 问题实体类
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("question")
public class Question {

    /**
     * 问题ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 所属问卷ID
     */
    private Integer questionnaireId;

    /**
     * 问题内容
     */
    private String content;

    /**
     * 题型：1=单选题，2=多选题，3=问答题，4=评分题，5=矩阵题
     */
    private Integer questionType;

    /**
     * 问题排序号
     */
    private Integer sortNum;

    /**
     * 是否必填：1=是，0=否
     */
    private Integer isRequired;

    /**
     * 创建时间
     */
    private LocalDateTime createdTime;

    /**
     * 更新时间
     */
    private LocalDateTime updatedTime;
} 