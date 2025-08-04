package com.shz.quick_qa_system.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * <p>
 * 问题数据传输对象
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Data
public class QuestionDto {

    /**
     * 问题ID
     */
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

    /**
     * 选项列表（仅用于单选题和多选题）
     */
    private List<QuestionOptionDto> options;
} 