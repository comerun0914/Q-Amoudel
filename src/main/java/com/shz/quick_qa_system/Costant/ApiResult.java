package com.shz.quick_qa_system.Costant;

import lombok.Data;

@Data
public class ApiResult {
    private int code; // 状态码
    private String message; // 消息
    private Object data; // 返回数据
    private int returnCode; // 响应编号
    private String userToken; // Token
    private String userInfo; // 用户信息



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

    // 错误响应静态方法
    public static ApiResult error(String message) {
        ApiResult result = new ApiResult();
        result.setCode(500);
        result.setMessage(message);
        return result;
    }

}
