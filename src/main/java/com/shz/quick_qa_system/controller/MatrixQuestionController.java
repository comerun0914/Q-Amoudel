package com.shz.quick_qa_system.controller;

import com.shz.quick_qa_system.Costant.ApiResult;
import com.shz.quick_qa_system.entity.MatrixColumn;
import com.shz.quick_qa_system.entity.MatrixQuestion;
import com.shz.quick_qa_system.entity.MatrixRow;
import com.shz.quick_qa_system.dto.MatrixQuestionDto;
import com.shz.quick_qa_system.service.MatrixQuestionService;
import com.shz.quick_qa_system.service.MatrixRowService;
import com.shz.quick_qa_system.service.MatrixColumnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.utils.CodeGenerator;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 矩阵题配置 前端控制器
 */
@RestController
@RequestMapping("/matrixQuestion")
public class MatrixQuestionController {

    @Autowired 
    private MatrixQuestionService matrixQuestionService;
    @Autowired 
    private MatrixRowService matrixRowService;
    @Autowired 
    private MatrixColumnService matrixColumnService;

    /**
     * 新增或保存矩阵题（包含行列）
     */
    @PostMapping("/saveAll")
    @Transactional(rollbackFor = Exception.class)
    public ApiResult saveAll(@RequestBody MatrixQuestionDto dto) {
        try {
            // 先清理旧的行列
            matrixQuestionService.deleteByQuestionId(dto.getQuestionId());
            MatrixQuestion mq = new MatrixQuestion();
            mq.setId(dto.getId());
            mq.setQuestionId(dto.getQuestionId());
            // 兜底：subQuestionType 缺失时默认为 1（单选矩阵）
            mq.setSubQuestionType(dto.getSubQuestionType() == null ? 1 : dto.getSubQuestionType());
            mq.setDescription(dto.getDescription());

            if (mq.getId() == null) {
                matrixQuestionService.save(mq);
            } else {
                matrixQuestionService.saveOrUpdate(mq);
            }

            Integer matrixId = mq.getId();


            // 批量保存行
            if (dto.getRows() != null && !dto.getRows().isEmpty()) {
                for (MatrixRow row : dto.getRows()) {
                    // 生成唯一ID
                    Integer rid = CodeGenerator.generateFormId();
                    while (matrixRowService.count(new QueryWrapper<MatrixRow>().eq("id", rid)) > 0) {
                        rid = CodeGenerator.generateFormId();
                    }
                    row.setId(rid);
                    row.setMatrixId(matrixId);
                }
                matrixRowService.saveBatch(dto.getRows());
            }

            // 批量保存列
            if (dto.getColumns() != null && !dto.getColumns().isEmpty()) {
                for (MatrixColumn col : dto.getColumns()) {
                    // 生成唯一ID
                    Integer cid = CodeGenerator.generateFormId();
                    while (matrixColumnService.count(new QueryWrapper<MatrixColumn>().eq("id", cid)) > 0) {
                        cid = CodeGenerator.generateFormId();
                    }
                    col.setId(cid);
                    col.setMatrixId(matrixId);
                }
                matrixColumnService.saveBatch(dto.getColumns());
            }

            return ApiResult.success(mq);
        } catch (Exception e) {
            return ApiResult.error("保存矩阵题时发生错误: " + e.getMessage());
        }
    }

    /**
     * 兼容前端配置：列表查询别名
     */
    @GetMapping("/listByQuestionId")
    public ApiResult listByQuestionId(@RequestParam Integer questionId) {
        return getDetailByQuestionId(questionId);
    }

    /**
     * 根据问题ID获取矩阵题（含行列）
     */
    @GetMapping("/getDetailByQuestionId")
    public ApiResult getDetailByQuestionId(@RequestParam Integer questionId) {
        try {
            MatrixQuestion mq = matrixQuestionService.getOne(new QueryWrapper<MatrixQuestion>().eq("question_id", questionId));
            if (mq == null) {
                return ApiResult.success(null);
            }
            Integer matrixId = mq.getId();
            List<MatrixRow> rows = matrixRowService.list(new QueryWrapper<MatrixRow>().eq("matrix_id", matrixId));
            List<MatrixColumn> columns = matrixColumnService.list(new QueryWrapper<MatrixColumn>().eq("matrix_id", matrixId));

            MatrixQuestionDto dto = new MatrixQuestionDto();
            dto.setId(mq.getId());
            dto.setQuestionId(mq.getQuestionId());
            dto.setSubQuestionType(mq.getSubQuestionType());
            dto.setDescription(mq.getDescription());
            dto.setRows(rows);
            dto.setColumns(columns);

            return ApiResult.success(dto);
        } catch (Exception e) {
            return ApiResult.error("获取矩阵题详情时发生错误: " + e.getMessage());
        }
    }

    /**
     * 更新矩阵题主表
     */
    @PutMapping("/update")
    public ApiResult update(@RequestBody MatrixQuestion matrixQuestion) {
        try {
            boolean success = matrixQuestionService.updateById(matrixQuestion);
            return success ? ApiResult.success(true) : ApiResult.error("更新失败");
        } catch (Exception e) {
            return ApiResult.error("更新矩阵题时发生错误: " + e.getMessage());
        }
    }

    /**
     * 删除矩阵题（含行列）
     */
    @DeleteMapping("/deleteByQuestionId/{questionId}")
    @Transactional(rollbackFor = Exception.class)
    public ApiResult deleteByQuestionId(@PathVariable Integer questionId) {
        try {
            MatrixQuestion mq = matrixQuestionService.getOne(new QueryWrapper<MatrixQuestion>().eq("question_id", questionId));
            if (mq == null) {
                return ApiResult.success(true);
            }
            Integer matrixId = mq.getId();
            matrixRowService.remove(new QueryWrapper<MatrixRow>().eq("matrix_id", matrixId));
            matrixColumnService.remove(new QueryWrapper<MatrixColumn>().eq("matrix_id", matrixId));
            matrixQuestionService.removeById(matrixId);
            return ApiResult.success(true);
        } catch (Exception e) {
            return ApiResult.error("删除矩阵题时发生错误: " + e.getMessage());
        }
    }
}

