package com.shz.quick_qa_system.dto;

import lombok.Data;

import java.util.List;

/**
 * 用于批量更新题目排序的请求体
 */
@Data
public class QuestionOrderUpdateDto {
    private Integer questionnaireId;
    private List<OrderItem> questionOrder;

    @Data
    public static class OrderItem {
        private Integer id;
        private Integer sortNum;
    }
}

