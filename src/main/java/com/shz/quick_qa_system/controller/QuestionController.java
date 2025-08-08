package com.shz.quick_qa_system.controller;

import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.Costant.QuestionConstant;
import com.shz.quick_qa_system.dto.QuestionDto;
import com.shz.quick_qa_system.entity.SingleChoiceOption;
import com.shz.quick_qa_system.service.QuestionService;
import com.shz.quick_qa_system.service.impl.QuestionServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * <p>
 * 问题基础表 前端控制器
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
@RestController
@RequestMapping("/question")
@CrossOrigin(origins = "*")
public class QuestionController {
    
    private static final Logger logger = LoggerFactory.getLogger(QuestionController.class);
    
    @Resource
    private QuestionServiceImpl questionServiceImpl;

    /**
     * 保存题目
     * @param questionDto 题目数据
     * @return 保存结果
     */
    @PostMapping("/save")
    public ApiResult saveQuestion(@RequestBody QuestionDto questionDto) {
        try {
            logger.info("收到保存题目请求: {}", questionDto);
            
            // 验证题目类型
            if (!QuestionConstant.isValidQuestionType(questionDto.getQuestionType())) {
                logger.warn("无效的题目类型: {}", questionDto.getQuestionType());
                return ApiResult.error("无效的题目类型");
            }
            
            // 验证必填字段
            if (questionDto.getQuestionnaireId() == null) {
                return ApiResult.error("问卷ID不能为空");
            }
            if (questionDto.getContent() == null || questionDto.getContent().trim().isEmpty()) {
                return ApiResult.error("题目内容不能为空");
            }
            
            Integer saveResult = questionServiceImpl.saveQuestion(questionDto);
            if (saveResult == 0) {
                logger.error("题目保存失败");
                return ApiResult.error("保存失败");
            } else {
                logger.info("题目保存成功，ID: {}", saveResult);
                return ApiResult.success(saveResult);
            }
        } catch (Exception e) {
            logger.error("保存题目时发生异常", e);
            return ApiResult.error("保存失败: " + e.getMessage());
        }
    }

    /**
     * 更新题目
     * @param questionDto 题目数据
     * @return 更新结果
     */
    @PutMapping("/update")
    public ApiResult updateQuestion(@RequestBody QuestionDto questionDto) {
        try {
            logger.info("收到更新题目请求: {}", questionDto);
            
            if (questionDto.getId() == null) {
                return ApiResult.error("题目ID不能为空");
            }
            
            Integer updateResult = questionServiceImpl.updateQuestion(questionDto);
            if (updateResult == 0) {
                logger.error("题目更新失败");
                return ApiResult.error("更新失败");
            } else {
                logger.info("题目更新成功");
                return ApiResult.success("更新成功");
            }
        } catch (Exception e) {
            logger.error("更新题目时发生异常", e);
            return ApiResult.error("更新失败: " + e.getMessage());
        }
    }

    /**
     * 删除题目
     * @param id 题目ID
     * @return 删除结果
     */
    @DeleteMapping("/delete/{id}")
    public ApiResult deleteQuestion(@PathVariable Integer id) {
        try {
            logger.info("收到删除题目请求，ID: {}", id);
            
            if (id == null) {
                return ApiResult.error("题目ID不能为空");
            }
            
            Integer deleteResult = questionServiceImpl.deleteQuestion(id);
            if (deleteResult == 0) {
                logger.error("题目删除失败");
                return ApiResult.error("删除失败");
            } else {
                logger.info("题目删除成功");
                return ApiResult.success("删除成功");
            }
        } catch (Exception e) {
            logger.error("删除题目时发生异常", e);
            return ApiResult.error("删除失败: " + e.getMessage());
        }
    }

    /**
     * 获取题目类型列表
     * @return 题目类型列表
     */
    @GetMapping("/types")
    public ApiResult getQuestionTypes() {
        try {
            logger.info("收到获取题目类型列表请求");
            
            // 返回所有题目类型信息
            java.util.List<java.util.Map<String, Object>> types = new java.util.ArrayList<>();
            int[] allTypes = QuestionConstant.getAllQuestionTypes();
            
            for (int typeId : allTypes) {
                java.util.Map<String, Object> typeInfo = new java.util.HashMap<>();
                typeInfo.put("id", typeId);
                typeInfo.put("name", QuestionConstant.getQuestionTypeName(typeId));
                typeInfo.put("code", QuestionConstant.getQuestionTypeCode(typeId));
                types.add(typeInfo);
            }
            
            logger.info("返回题目类型列表，共{}种类型", types.size());
            return ApiResult.success(types);
        } catch (Exception e) {
            logger.error("获取题目类型列表时发生异常", e);
            return ApiResult.error("获取题目类型列表失败: " + e.getMessage());
        }
    }
}

