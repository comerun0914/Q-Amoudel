package com.shz.quick_qa_system.controller;

import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.service.QuestionnaireDraftService;
import com.shz.quick_qa_system.service.QuestionnaireSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * 问卷提交Controller
 */
@RestController
@RequestMapping("/submission")
@CrossOrigin(origins = {"http://localhost:3000","http://localhost:8080","http://127.0.0.1:3000","http://127.0.0.1:8080"}, allowCredentials = "true")
public class QuestionnaireSubmissionController {
    
    @Autowired
    private QuestionnaireSubmissionService submissionService;
    
    @Autowired
    private QuestionnaireDraftService draftService;
    
    /**
     * 提交问卷答案
     */
    @PostMapping("/submit")
    public ApiResult submitQuestionnaire(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        try {
            // 获取客户端IP地址
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            // 添加IP和User-Agent信息
            request.put("ipAddress", ipAddress);
            request.put("userAgent", userAgent);
            
            // 检查是否重复提交
            Integer questionnaireId = (Integer) request.get("questionnaireId");
            Integer userId = (Integer) request.get("userId");
            
            if (userId != null && submissionService.hasUserSubmitted(questionnaireId, userId)) {
                return ApiResult.error("您已经提交过此问卷");
            }
            
            if (submissionService.hasIpSubmitted(questionnaireId, ipAddress)) {
                return ApiResult.error("该IP地址已提交过此问卷");
            }
            
            // 提交问卷
            Integer submissionId = submissionService.submitQuestionnaire(request);
            
            // 删除草稿（如果存在）
            String sessionId = (String) request.get("sessionId");
            draftService.deleteDraft(questionnaireId, userId, sessionId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("submissionId", submissionId);
            result.put("message", "问卷提交成功");
            
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("提交失败: " + e.getMessage());
        }
    }
    
    /**
     * 保存草稿
     */
    @PostMapping("/saveDraft")
    public ApiResult saveDraft(@RequestBody Map<String, Object> request) {
        try {
            Integer draftId = draftService.saveDraft(request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("draftId", draftId);
            result.put("message", "草稿保存成功");
            
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("保存草稿失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取草稿
     */
    @GetMapping("/getDraft")
    public ApiResult getDraft(
            @RequestParam Integer questionnaireId,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String sessionId) {
        try {
            Map<String, Object> draft = draftService.getDraft(questionnaireId, userId, sessionId);
            
            if (draft != null) {
                return ApiResult.success(draft);
            } else {
                return ApiResult.error("未找到草稿");
            }
        } catch (Exception e) {
            return ApiResult.error("获取草稿失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除草稿
     */
    @DeleteMapping("/deleteDraft")
    public ApiResult deleteDraft(
            @RequestParam Integer questionnaireId,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String sessionId) {
        try {
            draftService.deleteDraft(questionnaireId, userId, sessionId);
            return ApiResult.success("草稿删除成功");
        } catch (Exception e) {
            return ApiResult.error("删除草稿失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取问卷提交统计
     */
    @GetMapping("/statistics/{questionnaireId}")
    public ApiResult getStatistics(@PathVariable Integer questionnaireId) {
        try {
            Map<String, Object> statistics = submissionService.getSubmissionStatistics(questionnaireId);
            return ApiResult.success(statistics);
        } catch (Exception e) {
            return ApiResult.error("获取统计信息失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查用户是否已提交
     */
    @GetMapping("/checkSubmission")
    public ApiResult checkSubmission(
            @RequestParam Integer questionnaireId,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String ipAddress) {
        try {
            Map<String, Object> result = new HashMap<>();
            
            if (userId != null) {
                boolean hasSubmitted = submissionService.hasUserSubmitted(questionnaireId, userId);
                result.put("hasUserSubmitted", hasSubmitted);
                
                // 检查用户剩余提交次数
                try {
                    Map<String, Object> limitInfo = submissionService.checkUserSubmissionLimit(questionnaireId, userId);
                    result.put("submissionLimit", limitInfo.get("submissionLimit"));
                    result.put("userSubmissionCount", limitInfo.get("userSubmissionCount"));
                    result.put("remainingTimes", limitInfo.get("remainingTimes"));
                    result.put("canSubmit", limitInfo.get("canSubmit"));
                } catch (Exception e) {
                    // 如果检查失败，设置默认值
                    result.put("submissionLimit", 1);
                    result.put("userSubmissionCount", hasSubmitted ? 1 : 0);
                    result.put("remainingTimes", hasSubmitted ? 0 : 1);
                    result.put("canSubmit", !hasSubmitted);
                }
            }
            
            if (ipAddress != null) {
                boolean hasIpSubmitted = submissionService.hasIpSubmitted(questionnaireId, ipAddress);
                result.put("hasIpSubmitted", hasIpSubmitted);
            }
            
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("检查提交状态失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取客户端IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * 获取用户已提交的问卷列表
     */
    @GetMapping("/userSubmitted")
    public ApiResult getUserSubmittedQuestionnaires(
            @RequestParam Integer userId,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "10") Integer size,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "dateFilter", required = false) String dateFilter) {
        try {
            Map<String, Object> result = submissionService.getUserSubmittedQuestionnaires(userId, page, size, keyword, dateFilter);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("获取用户已提交问卷列表失败: " + e.getMessage());
        }
    }
}
