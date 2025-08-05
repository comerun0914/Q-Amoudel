package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 评分题配置实体类
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("rating_question")
public class RatingQuestion {

    /**
     * 配置ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 关联问题ID（题型为4）
     */
    private Integer questionId;

    /**
     * 最低分值
     */
    private Integer minScore;

    /**
     * 最高分值
     */
    private Integer maxScore;

    /**
     * 最低分标签
     */
    private String minLabel;

    /**
     * 最高分标签
     */
    private String maxLabel;

    /**
     * 评分步长
     */
    private Integer step;
} 