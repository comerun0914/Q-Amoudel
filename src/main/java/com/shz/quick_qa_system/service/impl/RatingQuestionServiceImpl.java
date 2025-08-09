package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.entity.RatingQuestion;
import com.shz.quick_qa_system.dao.RatingQuestionMapper;
import com.shz.quick_qa_system.service.RatingQuestionService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 评分题配置表 服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
@Service
public class RatingQuestionServiceImpl extends ServiceImpl<RatingQuestionMapper, RatingQuestion> implements RatingQuestionService {
    @javax.annotation.Resource
    private RatingQuestionMapper ratingQuestionMapper;

    @Override
    public boolean save(RatingQuestion entity) {
        if (entity.getId() == null) {
            int id = CodeGenerator.generateFormId();
            while (ratingQuestionMapper.exists(new QueryWrapper<RatingQuestion>().eq("id", id))) {
                id = CodeGenerator.generateFormId();
            }
            entity.setId(id);
        }
        return super.save(entity);
    }
}
