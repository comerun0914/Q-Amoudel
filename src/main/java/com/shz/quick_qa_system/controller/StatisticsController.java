package com.shz.quick_qa_system.controller;

import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.service.QuestionCreateService;
import com.shz.quick_qa_system.service.QuestionnaireSubmissionService;
import com.shz.quick_qa_system.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * 统计控制器 - 提供问卷管理的统计功能
 */
@RestController
@RequestMapping("/statistics")
public class StatisticsController {

    @Autowired
    private QuestionCreateService questionCreateService;

    @Autowired
    private QuestionnaireSubmissionService submissionService;

    @Autowired
    private QuestionService questionService;

    /**
     * 获取统计仪表板数据
     */
    @GetMapping("/dashboard")
    public ApiResult getDashboardStatistics(HttpServletRequest request) {
        try {
            // 从请求中获取用户ID，如果没有则使用默认值1
            Integer userId = getUserIdFromRequest(request);
            
            Map<String, Object> statistics = new HashMap<>();
            
            // 获取问卷统计
            Map<String, Object> questionnaireStats = questionCreateService.getQuestionnaireStatistics(userId);
            statistics.put("totalQuestionnaires", questionnaireStats.get("total"));
            statistics.put("publishedQuestionnaires", questionnaireStats.get("published"));
            statistics.put("draftQuestionnaires", questionnaireStats.get("draft"));
            statistics.put("disabledQuestionnaires", questionnaireStats.get("disabled"));
            statistics.put("expiredQuestionnaires", questionnaireStats.get("expired"));
            
            // 获取参与统计
            Map<String, Object> participationStats = submissionService.getParticipationStatistics(userId);
            statistics.put("totalParticipants", participationStats.get("totalParticipants"));
            statistics.put("totalSubmissions", participationStats.get("totalSubmissions"));
            statistics.put("completedSubmissions", participationStats.get("completedSubmissions"));
            
            // 获取问题统计
            Map<String, Object> questionStats = questionService.getQuestionStatistics(userId);
            statistics.put("totalQuestions", questionStats.get("totalQuestions"));
            statistics.put("answeredQuestions", questionStats.get("answeredQuestions"));
            
            // 计算完成率和平均用时
            double completionRate = 0.0;
            double avgDuration = 0.0;
            
            if (participationStats.get("totalSubmissions") != null && 
                (Long) participationStats.get("totalSubmissions") > 0) {
                Long total = (Long) participationStats.get("totalSubmissions");
                Long completed = (Long) participationStats.get("completedSubmissions");
                completionRate = (double) completed / total * 100;
            }
            
            if (participationStats.get("avgDuration") != null) {
                avgDuration = (Double) participationStats.get("avgDuration");
            }
            
            statistics.put("avgCompletionRate", Math.round(completionRate * 100.0) / 100.0);
            statistics.put("avgDuration", Math.round(avgDuration * 100.0) / 100.0);
            
            return ApiResult.success(statistics);
            
        } catch (Exception e) {
            return ApiResult.error("获取统计信息失败: " + e.getMessage());
        }
    }

    /**
     * 获取完成率统计
     */
    @GetMapping("/completion-rate")
    public ApiResult getCompletionRateStatistics(HttpServletRequest request) {
        try {
            Integer userId = getUserIdFromRequest(request);
            Map<String, Object> stats = submissionService.getCompletionRateStatistics(userId);
            return ApiResult.success(stats);
        } catch (Exception e) {
            return ApiResult.error("获取完成率统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取唯一用户统计
     */
    @GetMapping("/unique-users")
    public ApiResult getUniqueUsersStatistics(HttpServletRequest request) {
        try {
            Integer userId = getUserIdFromRequest(request);
            Map<String, Object> stats = submissionService.getUniqueUsersStatistics(userId);
            return ApiResult.success(stats);
        } catch (Exception e) {
            return ApiResult.error("获取唯一用户统计失败: " + e.getMessage());
        }
    }

    /**
     * 从请求中获取用户ID
     */
    private Integer getUserIdFromRequest(HttpServletRequest request) {
        // 这里可以根据实际的用户认证机制来获取用户ID
        // 暂时返回默认值1
        return 1;
    }
}
