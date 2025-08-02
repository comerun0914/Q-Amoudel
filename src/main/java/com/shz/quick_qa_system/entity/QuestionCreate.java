package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

/**
 * <p>
 * 创建问卷表
 * </p>
 *
 * @author comerun
 * @since 2025-08-02
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("question_create")
public class QuestionCreate implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 问卷ID
     */
    @TableId(value = "id", type = IdType.AUTO)
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
