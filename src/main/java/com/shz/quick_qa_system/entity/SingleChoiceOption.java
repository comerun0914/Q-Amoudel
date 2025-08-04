package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 单选题选项实体类
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("single_choice_option")
public class SingleChoiceOption {

    /**
     * 选项ID
     */
    @TableId(value = "id", type = IdType.AUTO)
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