package com.shz.quick_qa_system.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * ClassName: QuestionCreate
 * Package: com.shz.quick_qa_system.dto
 * Description:
 *
 * @Author comerun
 * @Create 2025/8/2 14:51
 */

@Data
public class QuestionCreateDto {
    /**
     * 问卷标题
     */
    private String title;

    /**
     * 问卷描述
     */
    private String description;

    /**
     * 开始日期
     */
    private LocalDate startDate;

    /**
     * 结束日期
     */
    private LocalDate endDate;

    /**
     * 每人填写次数限制
     */
    private Integer submissionLimit;
}
