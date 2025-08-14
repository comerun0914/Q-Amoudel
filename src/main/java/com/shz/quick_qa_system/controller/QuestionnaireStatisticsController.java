package com.shz.quick_qa_system.controller;

import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.service.QuestionnaireStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * 问卷统计控制器
 */
@RestController
@RequestMapping("/statistics")
@CrossOrigin(origins = {"http://localhost:3000","http://localhost:8080","http://127.0.0.1:3000","http://127.0.0.1:8080","http://localhost:3000,http://93d7k45123.goho.co:44966"}, allowCredentials = "true")
public class QuestionnaireStatisticsController {
    
    @Autowired
    private QuestionnaireStatisticsService statisticsService;
    
    /**
     * 获取仪表板核心统计数据
     */
    @GetMapping("/dashboard")
    public ApiResult getDashboardStatistics(
            @RequestParam(required = false) Integer creatorId,
            @RequestParam(defaultValue = "30") Integer timeRange) {
        try {
            String endDate = String.valueOf(LocalDate.now());
            String startDate = String.valueOf(LocalDate.now().minusDays(timeRange));
            Map<String, Object> result = statisticsService.getDashboardStatistics(creatorId, timeRange, startDate, endDate);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("获取仪表板统计数据失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户个人完成率
     */
    @GetMapping("/completion-rate")
    public ApiResult getPersonalCompletionRate(
            @RequestParam Integer creatorId,
            @RequestParam(defaultValue = "30") Integer timeRange,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Map<String, Object> result = statisticsService.getPersonalCompletionRate(creatorId, timeRange, startDate, endDate);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("获取个人完成率失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取独立用户数
     */
    @GetMapping("/unique-users")
    public ApiResult getUniqueUsersCount(
            @RequestParam(required = false) Integer creatorId,
            @RequestParam(defaultValue = "30") Integer timeRange,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Map<String, Object> result = statisticsService.getUniqueUsersCount(creatorId, timeRange, startDate, endDate);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("获取独立用户数失败: " + e.getMessage());
        }
    }
} 