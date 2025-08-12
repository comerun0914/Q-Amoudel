package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.dao.MatrixColumnMapper;
import com.shz.quick_qa_system.entity.MatrixColumn;
import com.shz.quick_qa_system.entity.MatrixQuestion;
import com.shz.quick_qa_system.dao.MatrixQuestionMapper;
import com.shz.quick_qa_system.entity.MatrixRow;
import com.shz.quick_qa_system.service.MatrixColumnService;
import com.shz.quick_qa_system.service.MatrixQuestionService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.service.MatrixRowService;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * <p>
 * 矩阵题主体表 服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
@Service
public class MatrixQuestionServiceImpl extends ServiceImpl<MatrixQuestionMapper, MatrixQuestion> implements MatrixQuestionService {
    @javax.annotation.Resource
    private MatrixQuestionMapper matrixQuestionMapper;

    @Resource
    private MatrixRowService matrixRowService;
    @Resource
    private MatrixColumnService matrixColumnService;

    @Override
    public boolean save(MatrixQuestion entity) {
        deleteByQuestionId(entity.getQuestionId());
        if (entity.getId() == null) {
            int id = CodeGenerator.generateFormId();
            while (matrixQuestionMapper.exists(new QueryWrapper<MatrixQuestion>().eq("id", id))) {
                id = CodeGenerator.generateFormId();
            }
            entity.setId(id);
        }
        return super.save(entity);
    }

    @Override
    public boolean deleteByQuestionId(Integer questionId) {
        try {
            // 删除矩阵题主表数据
            boolean mainDeleted = remove(new QueryWrapper<MatrixQuestion>()
                    .eq("question_id", questionId));

            // 删除矩阵行数据
            boolean rowsDeleted = matrixRowService.remove(new QueryWrapper<MatrixRow>()
                    .eq("question_id", questionId));

            // 删除矩阵列数据
            boolean columnsDeleted = matrixColumnService.remove(new QueryWrapper<MatrixColumn>()
                    .eq("question_id", questionId));

            return mainDeleted && rowsDeleted && columnsDeleted;
        } catch (Exception e) {
            log.error("删除矩阵题配置失败: questionId={}");
            return false;
        }
    }
}
