package com.shz.quick_qa_system.controller;

import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.entity.TextQuestion;
import com.shz.quick_qa_system.service.TextQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

/**
 * 问答题配置 前端控制器
 */
@RestController
@RequestMapping("/textQuestion")
public class TextQuestionController {

    @Autowired
    private TextQuestionService textQuestionService;

    /**
     * 保存问答题配置
     */
    @PostMapping("/save")
    public ApiResult save(@RequestBody TextQuestion textQuestion) {
        try {
            boolean success = textQuestionService.save(textQuestion);
            return success ? ApiResult.success(textQuestion) : ApiResult.error("保存失败");
        } catch (Exception e) {
            return ApiResult.error("保存问答题配置时发生错误: " + e.getMessage());
        }
    }

    /**
     * 根据问题ID获取问答题配置
     */
    @GetMapping("/getByQuestionId")
    public ApiResult getByQuestionId(@RequestParam Integer questionId) {
        try {
            TextQuestion config = textQuestionService.getOne(
                new QueryWrapper<TextQuestion>().eq("question_id", questionId)
            );
            return ApiResult.success(config);
        } catch (Exception e) {
            return ApiResult.error("获取问答题配置时发生错误: " + e.getMessage());
        }
    }

    /**
     * 兼容前端配置：listByQuestionId
     */
    @GetMapping("/listByQuestionId")
    public ApiResult listByQuestionId(@RequestParam Integer questionId) {
        return getByQuestionId(questionId);
    }

    /**
     * 更新问答题配置
     */
    @PutMapping("/update")
    public ApiResult update(@RequestBody TextQuestion textQuestion) {
        try {
            boolean success = textQuestionService.updateById(textQuestion);
            return success ? ApiResult.success(true) : ApiResult.error("更新失败");
        } catch (Exception e) {
            return ApiResult.error("更新问答题配置时发生错误: " + e.getMessage());
        }
    }

    /**
     * 根据主键ID删除
     */
    @DeleteMapping("/delete")
    public ApiResult delete(@RequestParam Integer id) {
        try {
            boolean success = textQuestionService.removeById(id);
            return success ? ApiResult.success(true) : ApiResult.error("删除失败");
        } catch (Exception e) {
            return ApiResult.error("删除问答题配置时发生错误: " + e.getMessage());
        }
    }

    /**
     * 根据问题ID删除配置
     */
    @DeleteMapping("/deleteByQuestionId/{questionId}")
    public ApiResult deleteByQuestionId(@PathVariable Integer questionId) {
        try {
            boolean success = textQuestionService.remove(
                new QueryWrapper<TextQuestion>().eq("question_id", questionId)
            );
            return success ? ApiResult.success(true) : ApiResult.error("删除失败");
        } catch (Exception e) {
            return ApiResult.error("按问题ID删除问答题配置时发生错误: " + e.getMessage());
        }
    }
}

