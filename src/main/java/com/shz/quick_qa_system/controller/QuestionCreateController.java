package com.shz.quick_qa_system.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.dao.*;
import com.shz.quick_qa_system.dto.QuestionCreateDto;
import com.shz.quick_qa_system.dto.QuestionDto;
import com.shz.quick_qa_system.entity.*;
import com.shz.quick_qa_system.service.QuestionCreateService;
import com.shz.quick_qa_system.dto.QuestionOrderUpdateDto;
import com.shz.quick_qa_system.service.impl.QuestionServiceImpl;
import com.shz.quick_qa_system.service.SingleChoiceOptionService;
import com.shz.quick_qa_system.service.impl.QuestionCreateServiceImpl;
import com.shz.quick_qa_system.service.impl.UsersServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;

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

    @Resource
    private SingleChoiceOptionMapper singleChoiceOptionMapper;
    @Resource
    private MultipleChoiceOptionMapper multipleChoiceOptionMapper;
    @Resource
    private TextQuestionMapper  textQuestionMapper;
    @Resource
    private MatrixQuestionMapper matrixQuestionMapper;
    @Resource
    private RatingQuestionMapper ratingQuestionMapper;
    @Resource
    private QuestionMapper questionMapper;

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
            Map<String, Object> result = questionCreateServiceImpl.getQuestionnaireList(page, size, keyword, status, dateFilter, Integer.valueOf(creatorId));
            return ApiResult.success(result);
        } catch (Exception e) {
            return ApiResult.error("获取问卷列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有问卷列表（不按创建者筛选）
     */
    @GetMapping("/all")
    public ApiResult getAllQuestionnaires(
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "50") Integer size,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) Integer status,
            @RequestParam(value = "dateFilter", required = false) String dateFilter) {
        try {
            // 调用服务层方法，不传入creatorId，获取所有问卷
            Map<String, Object> result = questionCreateServiceImpl.getQuestionnaireList(page, size, keyword, status, dateFilter, null);
            return ApiResult.success(result);
        } catch (Exception e) {
            System.err.println("获取所有问卷列表失败: " + e.getMessage());
            e.printStackTrace();
            return ApiResult.error("获取所有问卷列表失败: " + e.getMessage());
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

    /**
     * 获取问卷的问题ID与排序号对照
     * 注意：路径避免与 getQuestionnaireQuestions 冲突
     */
    @GetMapping("/questionOrder")
    public ApiResult getQuestions(@RequestParam(value = "questionnaireId") Integer questionnaireId) {
//        List<String[]> list = new ArrayList<>();
//
//        List<SingleChoiceOption> singleChoiceList = singleChoiceOptionMapper.selectList(new QueryWrapper<SingleChoiceOption>().eq("question_id", questionnaireId));
//        List<MultipleChoiceOption> multipleChoiceList = multipleChoiceOptionMapper.selectList(new QueryWrapper<MultipleChoiceOption>().eq("question_id", questionnaireId));
//        List<TextQuestion> textQuestionList = textQuestionMapper.selectList(new QueryWrapper<TextQuestion>().eq("question_id", questionnaireId));
//        List<MatrixQuestion> matrixQuestionList = matrixQuestionMapper.selectList(new QueryWrapper<MatrixQuestion>().eq("question_id", questionnaireId));
//        List<RatingQuestion> ratingQuestionList = ratingQuestionMapper.selectList(new QueryWrapper<RatingQuestion>().eq("question_id", questionnaireId));
        // 获取问题id
        List<Question> questionList = questionMapper.selectList(new QueryWrapper<Question>().eq("questionnaire_id", questionnaireId));
        List<String[]> questionListId = new ArrayList<>();
        questionList.forEach(question -> {
            questionListId.add(new String[]{question.getId().toString(),question.getContent(),question.getQuestionType().toString(),question.getSortNum().toString()});
        });
        return ApiResult.success(questionListId);
    }

    /**
     * 发布问卷
     */
    @PostMapping("/publish/{id}")
    public ApiResult publishQuestionnaire(@PathVariable Integer id) {
        try {
            // 更新问卷状态为已发布
            QuestionCreate questionnaire = questionCreateServiceImpl.getById(id);
            if (questionnaire == null) {
                return ApiResult.error("问卷不存在");
            }
            
            // 检查问卷是否完整（至少有一个问题）
            List<QuestionDto> questions = questionCreateServiceImpl.getQuestionnaireQuestions(id);
            if (questions.isEmpty()) {
                return ApiResult.error("问卷至少需要包含一个问题");
            }
            
            // 更新状态为已发布
            questionnaire.setStatus(1); // 1=已发布
            questionnaire.setUpdatedTime(LocalDateTime.now());
            questionCreateServiceImpl.updateById(questionnaire);
            
            // 生成访问链接
            String accessUrl = generateAccessUrl(id);
            
            return ApiResult.success(accessUrl);
        } catch (Exception e) {
            return ApiResult.error("发布失败：" + e.getMessage());
        }
    }

    /**
     * 取消发布问卷
     */
    @PostMapping("/unpublish/{id}")
    public ApiResult unpublishQuestionnaire(@PathVariable Integer id) {
        try {
            QuestionCreate questionnaire = questionCreateServiceImpl.getById(id);
            if (questionnaire == null) {
                return ApiResult.error("问卷不存在");
            }
            
            // 更新状态为草稿
            questionnaire.setStatus(2); // 2=草稿
            questionnaire.setUpdatedTime(LocalDateTime.now());
            questionCreateServiceImpl.updateById(questionnaire);
            
            return ApiResult.success("问卷已取消发布");
        } catch (Exception e) {
            return ApiResult.error("操作失败：" + e.getMessage());
        }
    }

    /**
     * 获取问卷分享信息
     */
    @GetMapping("/share/{id}")
    public ApiResult getQuestionnaireShareInfo(@PathVariable Integer id) {
        try {
            QuestionCreate questionnaire = questionCreateServiceImpl.getById(id);
            if (questionnaire == null) {
                return ApiResult.error("问卷不存在");
            }
            
            Map<String, Object> shareInfo = new HashMap<>();
            shareInfo.put("id", questionnaire.getId());
            shareInfo.put("title", questionnaire.getTitle());
            shareInfo.put("status", questionnaire.getStatus());
            shareInfo.put("accessUrl", generateAccessUrl(id));
            shareInfo.put("createdTime", questionnaire.getCreatedTime());
            
            return ApiResult.success(shareInfo);
        } catch (Exception e) {
            return ApiResult.error("获取失败：" + e.getMessage());
        }
    }

    /**
     * 生成访问链接
     */
    private String generateAccessUrl(Integer questionnaireId) {
        // 生成访问链接，可以是相对路径或绝对路径
        return "/questionnaire-fill.html?id=" + questionnaireId;
    }
}

