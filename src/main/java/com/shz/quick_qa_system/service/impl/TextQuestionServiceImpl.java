package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.entity.TextQuestion;
import com.shz.quick_qa_system.dao.TextQuestionMapper;
import com.shz.quick_qa_system.service.TextQuestionService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 问答题配置表 服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
@Service
public class TextQuestionServiceImpl extends ServiceImpl<TextQuestionMapper, TextQuestion> implements TextQuestionService {
    @javax.annotation.Resource
    private TextQuestionMapper textQuestionMapper;

    @Override
    public boolean save(TextQuestion entity) {
        deleteByQuestionId(entity.getQuestionId());
        if (entity.getId() == null) {
            int id = CodeGenerator.generateFormId();
            while (textQuestionMapper.exists(new QueryWrapper<TextQuestion>().eq("id", id))) {
                id = CodeGenerator.generateFormId();
            }
            entity.setId(id);
        }
        return super.save(entity);
    }

    @Override
    public boolean deleteByQuestionId(Integer questionId) {
        // 删除问答题配置
        return remove(new QueryWrapper<TextQuestion>()
                .eq("question_id", questionId));
    }
}
