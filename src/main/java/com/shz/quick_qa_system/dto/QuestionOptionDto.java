package com.shz.quick_qa_system.dto;

import lombok.Data;

/**
 * <p>
 * 问题选项数据传输对象
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Data
public class QuestionOptionDto {

    /**
     * 选项ID
     */
    private Integer id;

    /**
     * 关联问题ID
     */
    private Integer questionId;

    /**
     * 选项内容
     */
    private String optionContent;

    /**
     * 选项排序号
     */
    private Integer sortNum;

    /**
     * 是否默认选项
     */
    private Integer isDefault;
} 