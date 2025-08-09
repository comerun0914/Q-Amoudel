package com.shz.quick_qa_system.dto;

import com.shz.quick_qa_system.entity.MatrixColumn;
import com.shz.quick_qa_system.entity.MatrixRow;
import lombok.Data;

import java.util.List;

/**
 * 矩阵题数据传输对象
 */
@Data
public class MatrixQuestionDto {
    
    private Integer id;
    private Integer questionId;
    /** 子题型：1=单选矩阵，4=评分矩阵 */
    private Integer subQuestionType;
    /** 描述 */
    private String description;

    /** 行列表（子问题） */
    private List<MatrixRow> rows;
    /** 列列表（选项） */
    private List<MatrixColumn> columns;
}

