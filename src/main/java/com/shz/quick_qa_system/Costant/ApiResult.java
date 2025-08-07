package com.shz.quick_qa_system.Costant;

import com.shz.quick_qa_system.entity.QuestionCreate;
import lombok.Data;

import java.util.List;

@Data
public class ApiResult {
    private int code; // 状态码
    private String message; // 消息
    private Object data; // 返回数据
    private int returnCode; // 响应编号
    private String userToken; // Token
    private String userInfo; // 用户信息
    
    // 分页相关变量
    private int currentPage; // 当前页码
    private int pageSize; // 每页大小
    private int totalPages; // 总页数
    private long totalCount; // 总记录数
    private boolean hasNext; // 是否有下一页
    private boolean hasPrevious; // 是否有上一页
    private int startIndex; // 起始索引
    private int endIndex; // 结束索引


    // 成功响应静态方法
    public static ApiResult successAdmin(Object data) {
        ApiResult result = new ApiResult();
        // 创建token

        result.setReturnCode(1);
        result.setCode(200);
        result.setMessage("成功");
        result.setData(data);
        return result;
    }

    // 成功响应静态方法
    public static ApiResult successUser(Object data) {
        ApiResult result = new ApiResult();
        result.setReturnCode(0);
        result.setCode(200);
        result.setMessage("成功");
        result.setData(data);
        return result;
    }

    // 通用成功响应静态方法
    public static ApiResult success(Object data) {
        ApiResult result = new ApiResult();
        result.setCode(200);
        result.setMessage("成功");
        result.setData(data);
        return result;
    }

    // 问卷创建成功响应静态方法 - 传递问卷数据和创建人用户名
    public static ApiResult successQuestionnaire(Object questionnaire, String creatorName) {
        ApiResult result = new ApiResult();
        result.setCode(200);
        result.setMessage("成功");
        result.setData(questionnaire);
        result.setUserInfo(creatorName);
        return result;
    }

    // 问卷信息获取成功响应静态方法 - 传递问卷数据和创建人用户名
    public static ApiResult successQuestionnaireInfo(Object questionnaire, String creatorName) {
        ApiResult result = new ApiResult();
        result.setCode(200);
        result.setMessage("成功");
        result.setData(questionnaire);
        result.setUserInfo(creatorName);
        return result;
    }

    // 分页成功响应静态方法
    public static ApiResult successWithPagination(Object data, int currentPage, int pageSize, long totalCount) {
        ApiResult result = new ApiResult();
        result.setCode(200);
        result.setMessage("成功");
        result.setData(data);
        // 设置分页信息
        result.setCurrentPage(currentPage);
        result.setPageSize(pageSize);
        result.setTotalCount(totalCount);
        result.setTotalPages((int) Math.ceil((double) totalCount / pageSize));
        result.setHasNext(currentPage < result.getTotalPages());
        result.setHasPrevious(currentPage > 1);
        result.setStartIndex((currentPage - 1) * pageSize + 1);
        result.setEndIndex(Math.min(currentPage * pageSize, (int) totalCount));
        
        return result;
    }

    // 错误响应静态方法
    public static ApiResult error(String message) {
        ApiResult result = new ApiResult();
        result.setCode(500);
        result.setMessage(message);
        return result;
    }

}
