package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 矩阵题主体实体类
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("matrix_question")
public class MatrixQuestion {

    /**
     * 矩阵题ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 关联问题ID（题型为5）
     */
    private Integer questionId;

    /**
     * 子题型：1=单选矩阵，4=评分矩阵
     */
    private Integer subQuestionType;

    /**
     * 矩阵题描述
     */
    private String description;
} 