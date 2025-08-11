package com.shz.quick_qa_system.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.dto.QuestionCreateDto;
import com.shz.quick_qa_system.dto.QuestionDto;
import com.shz.quick_qa_system.entity.QuestionCreate;
import com.shz.quick_qa_system.entity.Users;
import com.shz.quick_qa_system.service.QuestionCreateService;
import com.shz.quick_qa_system.service.impl.QuestionCreateServiceImpl;
import com.shz.quick_qa_system.service.impl.UsersServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

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
    @Resource
    private UsersServiceImpl usersServiceImpl;

    /**
     * 创建问卷（包含问题）
     */
    @PostMapping("/createWithQuestions")
    public ApiResult createQuestionnaireWithQuestions(@RequestBody Map<String, Object> request) {
        try {
            // 获取当前用户ID
            Integer creatorId = (Integer) request.get("creatorId");
            if (creatorId == null) {
                creatorId = 1; // 默认用户ID
            }
            request.put("creatorId", creatorId);

            QuestionCreate result = questionCreateServiceImpl.createQuestionnaireWithQuestions(request);
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("创建问卷失败: " + e.getMessage());
        }
    }

    /**
     * 创建问卷
     */
    @PostMapping("/create")
    public ApiResult CreateQuestion(@RequestBody QuestionCreate questionCreate){
        try {
            QuestionCreate createdQuestion = questionCreateServiceImpl.CreateQuestion(questionCreate);
            if (createdQuestion != null) {
                // 获取创建人用户名
                String creatorName = "未知用户";
                if (createdQuestion.getCreatorId() != null) {
                    Users creator = usersServiceImpl.getById(createdQuestion.getCreatorId());
                    if (creator != null) {
                        creatorName = creator.getUsername();
                    }
                }
                // 使用新的ApiResult方法
                return ApiResult.successQuestionnaire(createdQuestion, creatorName);
            } else {
                return ApiResult.error("创建问卷失败");
            }
        } catch (Exception e) {
            return ApiResult.error("创建问卷失败: " + e.getMessage());
        }
    }

    /**
     * 获取问卷列表
     */
    @GetMapping("/list")
    public ApiResult getQuestionnaireList(
            @RequestParam(value = "creatorId") String creatorId,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "10") Integer size,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) Integer status,
            @RequestParam(value = "dateFilter", required = false) String dateFilter) {
        try {
            // 添加调试日志
            System.out.println("=== 控制器接收分页请求 ===");
            System.out.println("接收到的参数：");
            System.out.println("  creatorId: " + creatorId);
            System.out.println("  page: " + page);
            System.out.println("  size: " + size);
            System.out.println("  keyword: " + keyword);
            System.out.println("  status: " + status);
            System.out.println("  dateFilter: " + dateFilter);

            Integer id = Integer.valueOf(creatorId);
            System.out.println("转换后的 creatorId: " + id);

            // 调用分页查询方法，传递所有参数
            Map<String, Object> result = questionCreateServiceImpl.getQuestionnaireListWithPagination(id, page, size, keyword, status, dateFilter);

            System.out.println("服务层返回结果：");
            System.out.println("  result: " + result);

            // result 应包含: list, currentPage, pageSize, totalCount, totalPages
            // ApiResult apiResult = ApiResult.successWithPagination(
            //         result.get("list"),
            //         (Integer) result.get("currentPage"),
            //         (Integer) result.get("pageSize"),
            //         ((Integer) result.get("totalCount")).longValue()
            // );
            // return apiResult;
            return ApiResult.success(result);

//            System.out.println("最终返回的 ApiResult：");
            // System.out.println("  currentPage: " + apiResult.getCurrentPage());
            // System.out.println("  pageSize: " + apiResult.getPageSize());
            // System.out.println("  totalCount: " + apiResult.getTotalCount());
            // System.out.println("  totalPages: " + apiResult.getTotalPages());
//            System.out.println("=== 控制器处理完成 ===");

//            return ApiResult.success(result);
        } catch (Exception e) {
            System.err.println("获取问卷列表失败: " + e.getMessage());
            e.printStackTrace();
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
            Integer status = (Integer) request.get("status");
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
            Integer status = (Integer) request.get("status");
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
    public ApiResult getQuestionnaireStatistics(HttpServletRequest request) {
        try {
//            Map<String, Object> result = questionCreateServiceImpl.getQuestionnaireStatistics();
            return ApiResult.success(null);
        } catch (Exception e) {
            return ApiResult.error("获取统计信息失败: " + e.getMessage());
        }
    }

    /**
     * 数据库连通性测试接口
     */
    @GetMapping("/testDbConnection")
    public ApiResult testDbConnection() {
        try {
            // 简单查询数据库
            questionCreateServiceImpl.count();
            return ApiResult.success("数据库连接成功");
        } catch (Exception e) {
            return ApiResult.error("数据库连接失败: " + e.getMessage());
        }
    }

    @GetMapping("getInfoById")
    public ApiResult GetQuestionInfoById(@RequestParam("id") Integer id){
        try {
            QuestionCreate questionCreate = questionCreateServiceImpl.getById(id);
            if (questionCreate != null) {
                // 获取创建人用户名
                String creatorName = "未知用户";
                if (questionCreate.getCreatorId() != null) {
                    Users creator = usersServiceImpl.getById(questionCreate.getCreatorId());
                    if (creator != null) {
                        creatorName = creator.getUsername();
                    }
                }
                // 使用新的ApiResult方法
                return ApiResult.successQuestionnaireInfo(questionCreate, creatorName);
            } else {
                return ApiResult.error("未找到指定的问卷");
            }
        } catch (Exception e) {
            return ApiResult.error("获取问卷信息失败: " + e.getMessage());
        }
    }
}

