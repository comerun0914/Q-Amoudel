package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 矩阵题行实体类
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("matrix_row")
public class MatrixRow {

    /**
     * 行ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 关联矩阵题ID
     */
    private Integer matrixId;

    /**
     * 行内容（子问题）
     */
    private String rowContent;

    /**
     * 行排序号
     */
    private Integer sortNum;
} 