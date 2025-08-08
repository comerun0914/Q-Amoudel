package com.shz.quick_qa_system.controller;

import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.dto.QuestionOptionDto;
import com.shz.quick_qa_system.entity.SingleChoiceOption;
import com.shz.quick_qa_system.service.SingleChoiceOptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * <p>
 * 单选题选项表 前端控制器
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
@RestController
@RequestMapping("/singleChoiceOption")
@CrossOrigin(origins = "*")
public class SingleChoiceOptionController {

    @Autowired
    private SingleChoiceOptionService singleChoiceOptionService;

    /**
     * 保存单个选项
     */
    @PostMapping("/save")
    public ApiResult saveOption(@RequestBody SingleChoiceOption option) {
        try {
            boolean success = singleChoiceOptionService.save(option);
            if (success) {
                return ApiResult.success(option);
            } else {
                return ApiResult.error("选项保存失败");
            }
        } catch (Exception e) {
            return ApiResult.error("保存选项时发生错误: " + e.getMessage());
        }
    }

    /**
     * 批量保存选项
     */
    @PostMapping("/batchSave")
    public ApiResult batchSaveOptions(@RequestBody QuestionOptionDto request) {
        try {
            List<SingleChoiceOption> savedOptions = singleChoiceOptionService.batchSaveOptions(
                request.getQuestionId(), 
                request.getOptions()
            );
            return ApiResult.success(savedOptions);
        } catch (Exception e) {
            return ApiResult.error("批量保存选项时发生错误: " + e.getMessage());
        }
    }

    /**
     * 根据问题ID查询选项列表
     */
    @GetMapping("/listByQuestionId")
    public ApiResult getOptionsByQuestionId(@RequestParam Integer questionId) {
        try {
            List<SingleChoiceOption> options = singleChoiceOptionService.getOptionsByQuestionId(questionId);
            return ApiResult.success(options);
        } catch (Exception e) {
            return ApiResult.error("获取选项列表时发生错误: " + e.getMessage());
        }
    }

    /**
     * 更新选项
     */
    @PutMapping("/update")
    public ApiResult updateOption(@RequestBody SingleChoiceOption option) {
        try {
            boolean success = singleChoiceOptionService.updateById(option);
            if (success) {
                return ApiResult.success(true);
            } else {
                return ApiResult.error("选项更新失败");
            }
        } catch (Exception e) {
            return ApiResult.error("更新选项时发生错误: " + e.getMessage());
        }
    }

    /**
     * 删除选项
     */
    @DeleteMapping("/delete/{id}")
    public ApiResult deleteOption(@PathVariable Integer id) {
        try {
            boolean success = singleChoiceOptionService.removeById(id);
            if (success) {
                return ApiResult.success(true);
            } else {
                return ApiResult.error("选项删除失败");
            }
        } catch (Exception e) {
            return ApiResult.error("删除选项时发生错误: " + e.getMessage());
        }
    }

    /**
     * 根据问题ID删除所有选项
     */
    @DeleteMapping("/deleteByQuestionId/{questionId}")
    public ApiResult deleteOptionsByQuestionId(@PathVariable Integer questionId) {
        try {
            boolean success = singleChoiceOptionService.deleteOptionsByQuestionId(questionId);
            if (success) {
                return ApiResult.success(true);
            } else {
                return ApiResult.error("选项删除失败");
            }
        } catch (Exception e) {
            return ApiResult.error("删除选项时发生错误: " + e.getMessage());
        }
    }
}

