package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.entity.MatrixQuestion;
import com.shz.quick_qa_system.dao.MatrixQuestionMapper;
import com.shz.quick_qa_system.service.MatrixQuestionService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.stereotype.Service;

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

    @Override
    public boolean save(MatrixQuestion entity) {
        if (entity.getId() == null) {
            int id = CodeGenerator.generateFormId();
            while (matrixQuestionMapper.exists(new QueryWrapper<MatrixQuestion>().eq("id", id))) {
                id = CodeGenerator.generateFormId();
            }
            entity.setId(id);
        }
        return super.save(entity);
    }
}
