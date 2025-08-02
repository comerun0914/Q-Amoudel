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

    @PostMapping("/create")
    public ApiResult CreateQuestion(@RequestBody QuestionCreate questionCreate){
        try {
            boolean saveResult = questionCreateServiceImpl.CreateQuestion(questionCreate);
            return ApiResult.success(saveResult);
        } catch (Exception e) {
            return ApiResult.error("创建问卷失败: " + e.getMessage());
        }
    }
}

