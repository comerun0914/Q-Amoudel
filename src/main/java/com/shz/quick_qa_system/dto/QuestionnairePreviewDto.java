package com.shz.quick_qa_system.dto;

import lombok.Data;
import java.util.List;

/**
 * 问卷预览DTO
 * 用于返回问卷预览所需的所有数据
 */
@Data
public class QuestionnairePreviewDto {
    
    /**
     * 问卷基本信息
     */
    private QuestionnaireInfo questionnaireInfo;
    
    /**
     * 问题列表
     */
    private List<QuestionPreviewInfo> questions;
    
    /**
     * 问卷基本信息
     */
    @Data
    public static class QuestionnaireInfo {
        /**
         * 问卷ID
         */
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
        private String startDate;
        
        /**
         * 结束日期
         */
        private String endDate;
        
        /**
         * 每人填写次数限制
         */
        private Integer submissionLimit;
        
        /**
         * 问卷状态
         */
        private Integer status;
    }
    
    /**
     * 问题预览信息
     */
    @Data
    public static class QuestionPreviewInfo {
        /**
         * 问题ID
         */
        private Integer id;
        
        /**
         * 问题内容
         */
        private String content;
        
        /**
         * 问题类型
         */
        private Integer questionType;
        
        /**
         * 问题排序号
         */
        private Integer sortNum;
        
        /**
         * 是否必填
         */
        private Integer isRequired;
        
        /**
         * 单选题选项
         */
        private List<SingleChoiceOptionInfo> singleChoiceOptions;
        
        /**
         * 多选题选项
         */
        private List<MultipleChoiceOptionInfo> multipleChoiceOptions;
        
        /**
         * 文本题配置
         */
        private TextQuestionInfo textQuestion;
        
        /**
         * 评分题配置
         */
        private RatingQuestionInfo ratingQuestion;
        
        /**
         * 矩阵题配置
         */
        private MatrixQuestionInfo matrixQuestion;
        
        /**
         * 日期题配置
         */
        private DateQuestionInfo dateQuestion;
        
        /**
         * 时间题配置
         */
        private TimeQuestionInfo timeQuestion;
        
        /**
         * 文件上传题配置
         */
        private FileUploadQuestionInfo fileUploadQuestion;
        
        /**
         * 位置题配置
         */
        private LocationQuestionInfo locationQuestion;
        
        /**
         * 签名题配置
         */
        private SignatureQuestionInfo signatureQuestion;
        
        /**
         * 用户信息题配置
         */
        private UserInfoQuestionInfo userInfoQuestion;
    }
    
    /**
     * 单选题选项信息
     */
    @Data
    public static class SingleChoiceOptionInfo {
        private Integer id;
        private String optionContent;
        private Integer isDefault;
        private Integer sortNum;
    }
    
    /**
     * 多选题选项信息
     */
    @Data
    public static class MultipleChoiceOptionInfo {
        private Integer id;
        private String optionContent;
        private Integer isDefault;
        private Integer sortNum;
    }
    
    /**
     * 文本题信息
     */
    @Data
    public static class TextQuestionInfo {
        private Integer maxLength;
        private String hintText;
        private Integer inputType;
    }
    
    /**
     * 评分题信息
     */
    @Data
    public static class RatingQuestionInfo {
        private Integer minScore;
        private Integer maxScore;
        private String minLabel;
        private String maxLabel;
        private Integer step;
        private List<String> ratingLabels;
    }
    
    /**
     * 矩阵题信息
     */
    @Data
    public static class MatrixQuestionInfo {
        private List<MatrixRowInfo> rows;
        private List<MatrixColumnInfo> columns;
    }
    
    /**
     * 矩阵行信息
     */
    @Data
    public static class MatrixRowInfo {
        private Integer id;
        private String rowContent;
        private Integer sortNum;
    }
    
    /**
     * 矩阵列信息
     */
    @Data
    public static class MatrixColumnInfo {
        private Integer id;
        private String columnContent;
        private Integer sortNum;
    }
    
    /**
     * 日期题信息
     */
    @Data
    public static class DateQuestionInfo {
        private String dateFormat;
    }
    
    /**
     * 时间题信息
     */
    @Data
    public static class TimeQuestionInfo {
        private String timeFormat;
    }
    
    /**
     * 文件上传题信息
     */
    @Data
    public static class FileUploadQuestionInfo {
        private Integer maxFileSize;
        private List<String> allowedTypes;
    }
    
    /**
     * 位置题信息
     */
    @Data
    public static class LocationQuestionInfo {
        private String locationType;
    }
    
    /**
     * 签名题信息
     */
    @Data
    public static class SignatureQuestionInfo {
        private Integer width;
        private Integer height;
    }
    
    /**
     * 用户信息题信息
     */
    @Data
    public static class UserInfoQuestionInfo {
        private List<UserInfoFieldInfo> fields;
    }
    
    /**
     * 用户信息字段信息
     */
    @Data
    public static class UserInfoFieldInfo {
        private String fieldType;
        private String label;
        private Integer isRequired;
    }
}
