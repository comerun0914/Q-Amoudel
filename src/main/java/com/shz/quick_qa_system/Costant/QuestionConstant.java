package com.shz.quick_qa_system.Costant;

/**
 * ClassName: QuestionConstant
 * Package: com.shz.quick_qa_system.Costant
 * Description: 题目类型常量定义
 *
 * @Author comerun
 * @Create 2025/8/8 21:07
 */
public class QuestionConstant {
    
    /**
     * 题目类型常量
     */
    public static final class QuestionType {
        /** 单选题 */
        public static final int SINGLE_CHOICE = 1;
        
        /** 多选题 */
        public static final int MULTIPLE_CHOICE = 2;
        
        /** 问答题 */
        public static final int TEXT_QUESTION = 3;
        
        /** 评分题 */
        public static final int RATING_QUESTION = 4;
        
        /** 矩阵题 */
        public static final int MATRIX_QUESTION = 5;
        
        /** 默认题目类型 */
        public static final int DEFAULT = SINGLE_CHOICE;
    }
    
    /**
     * 题目类型名称映射
     */
    public static final class QuestionTypeName {
        /** 单选题名称 */
        public static final String SINGLE_CHOICE_NAME = "单选题";
        
        /** 多选题名称 */
        public static final String MULTIPLE_CHOICE_NAME = "多选题";
        
        /** 问答题名称 */
        public static final String TEXT_QUESTION_NAME = "问答题";
        
        /** 评分题名称 */
        public static final String RATING_QUESTION_NAME = "评分题";
        
        /** 矩阵题名称 */
        public static final String MATRIX_QUESTION_NAME = "矩阵题";
        
        /** 未知类型名称 */
        public static final String UNKNOWN_NAME = "未知类型";
    }
    
    /**
     * 题目类型前端标识映射
     */
    public static final class QuestionTypeCode {
        /** 单选题前端标识 */
        public static final String SINGLE_CHOICE_CODE = "single";
        
        /** 多选题前端标识 */
        public static final String MULTIPLE_CHOICE_CODE = "multiple";
        
        /** 问答题前端标识 */
        public static final String TEXT_QUESTION_CODE = "text";
        
        /** 评分题前端标识 */
        public static final String RATING_QUESTION_CODE = "rating";
        
        /** 矩阵题前端标识 */
        public static final String MATRIX_QUESTION_CODE = "matrix";
    }
    
    /**
     * 题目状态常量
     */
    public static final class QuestionStatus {
        /** 启用状态 */
        public static final int ENABLED = 1;
        
        /** 禁用状态 */
        public static final int DISABLED = 0;
    }
    
    /**
     * 题目必填状态
     */
    public static final class QuestionRequired {
        /** 必填 */
        public static final int REQUIRED = 1;
        
        /** 非必填 */
        public static final int NOT_REQUIRED = 0;
    }
    
    /**
     * 选项默认状态
     */
    public static final class OptionDefault {
        /** 默认选项 */
        public static final int IS_DEFAULT = 1;
        
        /** 非默认选项 */
        public static final int NOT_DEFAULT = 0;
    }
    
    /**
     * 问答题输入类型
     */
    public static final class TextInputType {
        /** 单行输入 */
        public static final int SINGLE_LINE = 1;
        
        /** 多行输入 */
        public static final int MULTI_LINE = 2;
        
        /** 默认输入类型 */
        public static final int DEFAULT = SINGLE_LINE;
    }
    
    /**
     * 问答题默认配置
     */
    public static final class TextQuestionDefault {
        /** 默认最大长度 */
        public static final int DEFAULT_MAX_LENGTH = 500;
        
        /** 默认提示文本 */
        public static final String DEFAULT_HINT_TEXT = "请输入您的答案";
    }
    
    /**
     * 评分题默认配置
     */
    public static final class RatingQuestionDefault {
        /** 默认最低分 */
        public static final int DEFAULT_MIN_SCORE = 1;
        
        /** 默认最高分 */
        public static final int DEFAULT_MAX_SCORE = 5;
        
        /** 默认步长 */
        public static final int DEFAULT_STEP_VALUE = 1;
    }
    
    /**
     * 工具方法：根据题目类型ID获取类型名称
     * @param questionTypeId 题目类型ID
     * @return 题目类型名称
     */
    public static String getQuestionTypeName(int questionTypeId) {
        switch (questionTypeId) {
            case QuestionType.SINGLE_CHOICE:
                return QuestionTypeName.SINGLE_CHOICE_NAME;
            case QuestionType.MULTIPLE_CHOICE:
                return QuestionTypeName.MULTIPLE_CHOICE_NAME;
            case QuestionType.TEXT_QUESTION:
                return QuestionTypeName.TEXT_QUESTION_NAME;
            case QuestionType.RATING_QUESTION:
                return QuestionTypeName.RATING_QUESTION_NAME;
            case QuestionType.MATRIX_QUESTION:
                return QuestionTypeName.MATRIX_QUESTION_NAME;
            default:
                return QuestionTypeName.UNKNOWN_NAME;
        }
    }
    
    /**
     * 工具方法：根据题目类型ID获取前端标识
     * @param questionTypeId 题目类型ID
     * @return 前端标识
     */
    public static String getQuestionTypeCode(int questionTypeId) {
        switch (questionTypeId) {
            case QuestionType.SINGLE_CHOICE:
                return QuestionTypeCode.SINGLE_CHOICE_CODE;
            case QuestionType.MULTIPLE_CHOICE:
                return QuestionTypeCode.MULTIPLE_CHOICE_CODE;
            case QuestionType.TEXT_QUESTION:
                return QuestionTypeCode.TEXT_QUESTION_CODE;
            case QuestionType.RATING_QUESTION:
                return QuestionTypeCode.RATING_QUESTION_CODE;
            case QuestionType.MATRIX_QUESTION:
                return QuestionTypeCode.MATRIX_QUESTION_CODE;
            default:
                return QuestionTypeCode.SINGLE_CHOICE_CODE;
        }
    }
    
    /**
     * 工具方法：根据前端标识获取题目类型ID
     * @param questionTypeCode 前端标识
     * @return 题目类型ID
     */
    public static int getQuestionTypeId(String questionTypeCode) {
        switch (questionTypeCode) {
            case QuestionTypeCode.SINGLE_CHOICE_CODE:
                return QuestionType.SINGLE_CHOICE;
            case QuestionTypeCode.MULTIPLE_CHOICE_CODE:
                return QuestionType.MULTIPLE_CHOICE;
            case QuestionTypeCode.TEXT_QUESTION_CODE:
                return QuestionType.TEXT_QUESTION;
            case QuestionTypeCode.RATING_QUESTION_CODE:
                return QuestionType.RATING_QUESTION;
            case QuestionTypeCode.MATRIX_QUESTION_CODE:
                return QuestionType.MATRIX_QUESTION;
            default:
                return QuestionType.DEFAULT;
        }
    }
    
    /**
     * 工具方法：验证题目类型ID是否有效
     * @param questionTypeId 题目类型ID
     * @return 是否有效
     */
    public static boolean isValidQuestionType(int questionTypeId) {
        return questionTypeId >= QuestionType.SINGLE_CHOICE && 
               questionTypeId <= QuestionType.MATRIX_QUESTION;
    }
    
    /**
     * 工具方法：获取所有题目类型ID数组
     * @return 题目类型ID数组
     */
    public static int[] getAllQuestionTypes() {
        return new int[]{
            QuestionType.SINGLE_CHOICE,
            QuestionType.MULTIPLE_CHOICE,
            QuestionType.TEXT_QUESTION,
            QuestionType.RATING_QUESTION,
            QuestionType.MATRIX_QUESTION
        };
    }
}
