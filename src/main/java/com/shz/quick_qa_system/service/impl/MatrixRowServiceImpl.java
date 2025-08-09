package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.entity.MatrixRow;
import com.shz.quick_qa_system.dao.MatrixRowMapper;
import com.shz.quick_qa_system.service.MatrixRowService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 矩阵题行表 服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
@Service
public class MatrixRowServiceImpl extends ServiceImpl<MatrixRowMapper, MatrixRow> implements MatrixRowService {
    @javax.annotation.Resource
    private MatrixRowMapper matrixRowMapper;

    @Override
    public boolean save(MatrixRow entity) {
        if (entity.getId() == null) {
            int id = CodeGenerator.generateFormId();
            while (matrixRowMapper.exists(new QueryWrapper<MatrixRow>().eq("id", id))) {
                id = CodeGenerator.generateFormId();
            }
            entity.setId(id);
        }
        return super.save(entity);
    }
}
