package com.shz.quick_qa_system.dto;

import com.shz.quick_qa_system.entity.QuestionCreate;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ClassName: QuestionCreate
 * Package: com.shz.quick_qa_system.dto
 * Description:
 *
 * @Author comerun
 * @Create 2025/8/2 14:51
 */

@Setter
@Getter
public class QuestionCreateDto {
    private Integer id;

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

    /**
     * 问卷状态：0=禁用，1=启用
     */
    private Boolean status;

    /**
     * 创建者用户ID
     */
    private Integer creatorId;

    /**
     * 创建时间
     */
    private LocalDateTime createdTime;

    /**
     * 更新时间
     */
    private LocalDateTime updatedTime;
}
