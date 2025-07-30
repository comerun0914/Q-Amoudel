package com.shz.quick_qa_system.controller;


import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.dto.UserDto;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

/**
 * <p>
 * 用户登录信息表 前端控制器
 * </p>
 *
 * @author comerun
 * @since 2025-07-30
 */
@RestController
@RequestMapping("/users")
public class UsersController {
    @PostMapping("/login")
    public ApiResult login(@RequestBody UserDto request) {
        // 验证用户名和密码（示例代码，实际应调用Service层）
        if ("admin".equals(request.getUsername()) && "password".equals(request.getPassword())) {
            return ApiResult.success("登录成功");
        } else {
            return ApiResult.error("用户名或密码错误");
        }
    }
}

