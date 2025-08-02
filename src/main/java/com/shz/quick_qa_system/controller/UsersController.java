package com.shz.quick_qa_system.controller;


import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.dto.UserDto;
import com.shz.quick_qa_system.entity.Users;
import com.shz.quick_qa_system.service.UsersService;
import com.shz.quick_qa_system.service.impl.UsersServiceImpl;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
    private static final Logger logger = LoggerFactory.getLogger(UsersController.class);
    
    @Resource
    private UsersServiceImpl usersServiceImpl;

    // 登录
    @PostMapping("/login")
    public ApiResult login(@RequestBody UserDto request) {
        logger.info("收到登录请求，用户名: {}", request.getUsername());
        
        // 获取数据库数据
        Users user = usersServiceImpl.getUserByuserName(request.getUsername());
        
        if(user != null){
            logger.info("找到用户: {}, 角色: {}", user.getUsername(), user.getRole());
            if(user.getPassword().equals(request.getPassword())) {
                logger.info("密码验证成功");
                // 进行身份验证
                if(user.getRole() == 1) {
                    user.setPassword("");
                    return ApiResult.successAdmin(user);
                } else if (user.getRole() == 0) {
                    user.setPassword("");
                    return ApiResult.successUser(user);
                }
            } else {
                logger.warn("密码验证失败，输入密码: {}, 数据库密码: {}", request.getPassword(), user.getPassword());
            }
        } else {
            logger.warn("未找到用户: {}", request.getUsername());
        }

        return ApiResult.error("用户名或密码错误");
    }


    // 退出登录
    @PostMapping("/logout")
    public ApiResult logout(@RequestParam("userId") String userId) {
        logger.info("收到退出登录请求，用户ID: {}", userId);
        
        try {
            if (userId == null || userId.trim().isEmpty()) {
                logger.warn("用户ID为空");
                return ApiResult.error("用户ID不能为空");
            }

            Users user = usersServiceImpl.getUserByuserId(Integer.valueOf(userId));
            
            if (user == null) {
                logger.warn("未找到用户，用户ID: {}", userId);
                return ApiResult.error("用户不存在");
            }
            
            String result = usersServiceImpl.logout(user);
            logger.info("用户 {} 退出登录成功", user.getUsername());
            return ApiResult.success(result);
            
        } catch (NumberFormatException e) {
            logger.error("用户ID格式错误: {}", userId, e);
            return ApiResult.error("用户ID格式错误");
        } catch (Exception e) {
            logger.error("退出登录时发生错误，用户ID: {}", userId, e);
            return ApiResult.error("退出登录失败");
        }
    }
}

