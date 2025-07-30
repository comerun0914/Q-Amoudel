package com.shz.quick_qa_system.Costant;

import lombok.Data;

@Data
public class ApiResult {
    private int code; // 状态码
    private String message; // 消息
    private Object data; // 返回数据



    // 成功响应静态方法
    public static ApiResult success(Object data) {
        ApiResult result = new ApiResult();
        result.setCode(200);
        result.setMessage("成功");
        result.setData(data);
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
