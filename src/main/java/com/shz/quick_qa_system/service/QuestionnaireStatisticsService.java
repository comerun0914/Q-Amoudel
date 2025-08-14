package com.shz.quick_qa_system.service;

import java.util.Map;

/**
 * 问卷统计服务接口
 */
public interface QuestionnaireStatisticsService {
    
    /**
     * 获取仪表板核心统计数据
     * @param creatorId 创建者ID（可选）
     * @param timeRange 时间范围（天）
     * @param startDate 开始日期（可选）
     * @param endDate 结束日期（可选）
     * @return 核心统计数据
     */
    Map<String, Object> getDashboardStatistics(Integer creatorId, Integer timeRange, String startDate, String endDate);
    
    /**
     * 获取用户个人提交的问卷与整体人员的占比（完成率）
     * @param creatorId 创建者ID
     * @param timeRange 时间范围（天）
     * @param startDate 开始日期（可选）
     * @param endDate 结束日期（可选）
     * @return 完成率数据
     */
    Map<String, Object> getPersonalCompletionRate(Integer creatorId, Integer timeRange, String startDate, String endDate);
    
    /**
     * 获取独立用户数（只统计角色是用户的）
     * @param creatorId 创建者ID（可选）
     * @param timeRange 时间范围（天）
     * @param startDate 开始日期（可选）
     * @param endDate 结束日期（可选）
     * @return 独立用户数据
     */
    Map<String, Object> getUniqueUsersCount(Integer creatorId, Integer timeRange, String startDate, String endDate);
} 