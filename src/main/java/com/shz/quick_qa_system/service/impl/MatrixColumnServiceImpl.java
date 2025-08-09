package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.entity.MatrixColumn;
import com.shz.quick_qa_system.dao.MatrixColumnMapper;
import com.shz.quick_qa_system.service.MatrixColumnService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 矩阵题列表 服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
@Service
public class MatrixColumnServiceImpl extends ServiceImpl<MatrixColumnMapper, MatrixColumn> implements MatrixColumnService {
    @javax.annotation.Resource
    private MatrixColumnMapper matrixColumnMapper;

    @Override
    public boolean save(MatrixColumn entity) {
        if (entity.getId() == null) {
            int id = CodeGenerator.generateFormId();
            while (matrixColumnMapper.exists(new QueryWrapper<MatrixColumn>().eq("id", id))) {
                id = CodeGenerator.generateFormId();
            }
            entity.setId(id);
        }
        return super.save(entity);
    }
}
