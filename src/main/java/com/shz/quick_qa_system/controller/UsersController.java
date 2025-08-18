package com.shz.quick_qa_system.controller;


import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.dto.UserDto;
import com.shz.quick_qa_system.entity.Users;
import com.shz.quick_qa_system.service.UsersService;
import com.shz.quick_qa_system.service.impl.UsersServiceImpl;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

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
    public ApiResult logout(String userId) {
        Users user = usersServiceImpl.getUserByuserId(Integer.valueOf(userId));
        String result = usersServiceImpl.logout(user);
        return ApiResult.successAdmin(result);
    }

    // 获取用户资料
    @GetMapping("/profile")
    public ApiResult getUserProfile(@RequestParam(required = false) Integer userId) {
        try {
            // 如果没有提供userId，使用默认值1
            if (userId == null) {
                userId = 1;
            }
            
            Users user = usersServiceImpl.getUserByuserId(userId);
            if (user != null) {
                // 不返回密码
                user.setPassword("");
                
                // 构建用户资料数据
                Map<String, Object> profile = new HashMap<>();
                profile.put("userInfo", user);
                
                // 统计数据
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalQuestionnaires", 15);
                stats.put("totalResponses", 1250);
                stats.put("totalViews", 5600);
                stats.put("avgRating", 4.6);
                profile.put("stats", stats);
                
                // 安全设置
                Map<String, Object> security = new HashMap<>();
                security.put("twoFactorAuth", false);
                security.put("loginNotification", true);
                security.put("passwordExpiry", 90);
                
                // 隐私设置
                Map<String, Object> privacy = new HashMap<>();
                privacy.put("dataSharing", false);
                privacy.put("analyticsTracking", true);
                privacy.put("marketingEmails", false);
                
                // 通知设置
                Map<String, Object> notifications = new HashMap<>();
                notifications.put("emailNotifications", true);
                notifications.put("pushNotifications", false);
                notifications.put("smsNotifications", false);
                
                // 设置信息
                Map<String, Object> settings = new HashMap<>();
                settings.put("security", security);
                settings.put("privacy", privacy);
                settings.put("notifications", notifications);
                profile.put("settings", settings);
                
                // 活动记录
                List<Map<String, Object>> activities = new ArrayList<>();
                
                Map<String, Object> activity1 = new HashMap<>();
                activity1.put("id", 1);
                activity1.put("type", "questionnaire_created");
                activity1.put("title", "创建了问卷\"客户满意度调查\"");
                activity1.put("time", "2024-01-15 10:30:00");
                activities.add(activity1);
                
                Map<String, Object> activity2 = new HashMap<>();
                activity2.put("id", 2);
                activity2.put("type", "response_received");
                activity2.put("title", "收到问卷\"产品使用反馈\"的新回复");
                activity2.put("time", "2024-01-18 16:45:00");
                activities.add(activity2);
                
                profile.put("activities", activities);
                
                return ApiResult.success(profile);
            } else {
                return ApiResult.error("用户不存在");
            }
        } catch (Exception e) {
            logger.error("获取用户资料失败", e);
            return ApiResult.error("获取用户资料失败: " + e.getMessage());
        }
    }
}

