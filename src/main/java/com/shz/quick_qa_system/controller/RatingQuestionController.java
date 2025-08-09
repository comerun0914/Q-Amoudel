package com.shz.quick_qa_system.controller;

import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.entity.RatingQuestion;
import com.shz.quick_qa_system.service.RatingQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

/**
 * 评分题配置 前端控制器
 */
@RestController
@RequestMapping("/ratingQuestion")
public class RatingQuestionController {

    @Autowired
    private RatingQuestionService ratingQuestionService;

    /**
     * 保存评分题配置
     */
    @PostMapping("/save")
    public ApiResult save(@RequestBody RatingQuestion ratingQuestion) {
        try {
            boolean success = ratingQuestionService.save(ratingQuestion);
            return success ? ApiResult.success(ratingQuestion) : ApiResult.error("保存失败");
        } catch (Exception e) {
            return ApiResult.error("保存评分题配置时发生错误: " + e.getMessage());
        }
    }

    /**
     * 根据问题ID获取评分题配置
     */
    @GetMapping("/getByQuestionId")
    public ApiResult getByQuestionId(@RequestParam Integer questionId) {
        try {
            RatingQuestion config = ratingQuestionService.getOne(
                new QueryWrapper<RatingQuestion>().eq("question_id", questionId)
            );
            return ApiResult.success(config);
        } catch (Exception e) {
            return ApiResult.error("获取评分题配置时发生错误: " + e.getMessage());
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
     * 更新评分题配置
     */
    @PutMapping("/update")
    public ApiResult update(@RequestBody RatingQuestion ratingQuestion) {
        try {
            boolean success = ratingQuestionService.updateById(ratingQuestion);
            return success ? ApiResult.success(true) : ApiResult.error("更新失败");
        } catch (Exception e) {
            return ApiResult.error("更新评分题配置时发生错误: " + e.getMessage());
        }
    }

    /**
     * 根据主键ID删除
     */
    @DeleteMapping("/delete")
    public ApiResult delete(@RequestParam Integer id) {
        try {
            boolean success = ratingQuestionService.removeById(id);
            return success ? ApiResult.success(true) : ApiResult.error("删除失败");
        } catch (Exception e) {
            return ApiResult.error("删除评分题配置时发生错误: " + e.getMessage());
        }
    }

    /**
     * 根据问题ID删除配置
     */
    @DeleteMapping("/deleteByQuestionId/{questionId}")
    public ApiResult deleteByQuestionId(@PathVariable Integer questionId) {
        try {
            boolean success = ratingQuestionService.remove(
                new QueryWrapper<RatingQuestion>().eq("question_id", questionId)
            );
            return success ? ApiResult.success(true) : ApiResult.error("删除失败");
        } catch (Exception e) {
            return ApiResult.error("按问题ID删除评分题配置时发生错误: " + e.getMessage());
        }
    }
}

