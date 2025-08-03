package com.shz.quick_qa_system.controller;

import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.dto.QuestionCreateDto;
import com.shz.quick_qa_system.entity.QuestionCreate;
import com.shz.quick_qa_system.service.QuestionCreateService;
import com.shz.quick_qa_system.service.impl.QuestionCreateServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import com.shz.quick_qa_system.dto.QuestionDto;

/**
 * <p>
 * 问卷管理 前端控制器
 * </p>
 *
 * @author comerun
 * @since 2025-08-02
 */
@RestController
@RequestMapping("/questionCreate")
public class QuestionCreateController {
    @Resource
    private QuestionCreateServiceImpl questionCreateServiceImpl;

    /**
     * 创建问卷
     */
    @PostMapping("/create")
    public ApiResult CreateQuestion(@RequestBody Map<String, Object> request){
        try {
            // 获取当前用户ID
            Integer creatorId = (Integer) request.get("creatorId");
            if (creatorId == null) {
                // 如果没有提供creatorId，可以从session或token中获取
                // 这里暂时使用默认值1
                creatorId = 1;
            }
            request.put("creatorId", creatorId);
            
            QuestionCreate result = questionCreateServiceImpl.createQuestionnaireWithQuestions(request);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("创建问卷失败: " + e.getMessage());
        }
    }

    /**
     * 获取问卷列表
     */
    @GetMapping("/list")
    public ApiResult getQuestionnaireList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String dateFilter,
            @RequestParam(required = false) Integer creatorId) {
        try {
            Map<String, Object> result = questionCreateServiceImpl.getQuestionnaireList(page, size, keyword, status, dateFilter, creatorId);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("获取问卷列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取问卷详情
     */
    @GetMapping("/detail")
    public ApiResult getQuestionnaireDetail(@RequestParam Integer id) {
        try {
            Map<String, Object> result = questionCreateServiceImpl.getQuestionnaireDetailWithCreator(id);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("获取问卷详情失败: " + e.getMessage());
        }
    }

    /**
     * 更新问卷
     */
    @PostMapping("/update")
    public ApiResult updateQuestionnaire(@RequestBody Map<String, Object> request) {
        try {
            // 获取当前用户ID
            Integer creatorId = (Integer) request.get("creatorId");
            if (creatorId == null) {
                creatorId = 1;
            }
            request.put("creatorId", creatorId);
            
            QuestionCreate result = questionCreateServiceImpl.updateQuestionnaireWithQuestions(request);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("更新问卷失败: " + e.getMessage());
        }
    }

    /**
     * 获取问卷问题列表
     */
    @GetMapping("/questions")
    public ApiResult getQuestionnaireQuestions(@RequestParam Integer questionnaireId) {
        try {
            List<QuestionDto> result = questionCreateServiceImpl.getQuestionnaireQuestions(questionnaireId);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("获取问卷问题失败: " + e.getMessage());
        }
    }

    /**
     * 删除问卷
     */
    @DeleteMapping("/delete")
    public ApiResult deleteQuestionnaire(@RequestBody Map<String, Object> request) {
        try {
            Integer id = (Integer) request.get("id");
            boolean result = questionCreateServiceImpl.deleteQuestionnaire(id);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("删除问卷失败: " + e.getMessage());
        }
    }

    /**
     * 批量删除问卷
     */
    @PostMapping("/batchDelete")
    public ApiResult batchDeleteQuestionnaire(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> ids = (List<Integer>) request.get("ids");
            boolean result = questionCreateServiceImpl.batchDeleteQuestionnaire(ids);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("批量删除问卷失败: " + e.getMessage());
        }
    }

    /**
     * 切换问卷状态
     */
    @PostMapping("/toggleStatus")
    public ApiResult toggleQuestionnaireStatus(@RequestBody Map<String, Object> request) {
        try {
            Integer id = (Integer) request.get("id");
            Boolean status = (Boolean) request.get("status");
            boolean result = questionCreateServiceImpl.toggleQuestionnaireStatus(id, status);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("切换问卷状态失败: " + e.getMessage());
        }
    }

    /**
     * 批量切换问卷状态
     */
    @PostMapping("/batchToggleStatus")
    public ApiResult batchToggleQuestionnaireStatus(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> ids = (List<Integer>) request.get("ids");
            Boolean status = (Boolean) request.get("status");
            boolean result = questionCreateServiceImpl.batchToggleQuestionnaireStatus(ids, status);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("批量切换问卷状态失败: " + e.getMessage());
        }
    }

    /**
     * 复制问卷
     */
    @PostMapping("/copy")
    public ApiResult copyQuestionnaire(@RequestBody Map<String, Object> request) {
        try {
            Integer id = (Integer) request.get("id");
            QuestionCreate result = questionCreateServiceImpl.copyQuestionnaire(id);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("复制问卷失败: " + e.getMessage());
        }
    }

    /**
     * 导入问卷
     */
    @PostMapping("/import")
    public ApiResult importQuestionnaire(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> questionnaireData = (Map<String, Object>) request.get("questionnaireData");
            QuestionCreate result = questionCreateServiceImpl.importQuestionnaire(questionnaireData);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("导入问卷失败: " + e.getMessage());
        }
    }

    /**
     * 获取问卷统计信息
     */
    @GetMapping("/statistics")
    public ApiResult getQuestionnaireStatistics(@RequestParam(required = false) Integer creatorId) {
        try {
            Map<String, Object> result = questionCreateServiceImpl.getQuestionnaireStatistics(creatorId);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("获取统计信息失败: " + e.getMessage());
        }
    }
}

