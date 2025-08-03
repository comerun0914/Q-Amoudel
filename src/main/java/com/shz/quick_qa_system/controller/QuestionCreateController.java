package com.shz.quick_qa_system.controller;


import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.dto.QuestionCreateDto;
import com.shz.quick_qa_system.entity.QuestionCreate;
import com.shz.quick_qa_system.entity.Users;
import com.shz.quick_qa_system.service.QuestionCreateService;
import com.shz.quick_qa_system.service.impl.QuestionCreateServiceImpl;
import com.shz.quick_qa_system.service.impl.UsersServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * <p>
 * 创建问卷表 前端控制器
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

