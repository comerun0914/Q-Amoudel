package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 矩阵题列实体类
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("matrix_column")
public class MatrixColumn {

    /**
     * 列ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 关联矩阵题ID
     */
    private Integer matrixId;

    /**
     * 列内容（选项）
     */
    private String columnContent;

    /**
     * 列排序号
     */
    private Integer sortNum;

    /**
     * 对应分值（仅评分矩阵生效）
     */
    private Integer score;
} 