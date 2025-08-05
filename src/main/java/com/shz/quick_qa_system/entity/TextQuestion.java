package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 问答题配置实体类
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("text_question")
public class TextQuestion {

    /**
     * 配置ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 关联问题ID（题型为3）
     */
    private Integer questionId;

    /**
     * 提示文本
     */
    private String hintText;

    /**
     * 最大输入长度
     */
    private Integer maxLength;

    /**
     * 输入框类型：1=单行，2=多行
     */
    private Integer inputType;
} 