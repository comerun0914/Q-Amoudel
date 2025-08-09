package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.entity.MultipleChoiceOption;
import com.shz.quick_qa_system.dao.MultipleChoiceOptionMapper;
import com.shz.quick_qa_system.service.MultipleChoiceOptionService;
import com.shz.quick_qa_system.dto.QuestionOptionDto;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 * 多选题选项表 服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
@Service
public class MultipleChoiceOptionServiceImpl extends ServiceImpl<MultipleChoiceOptionMapper, MultipleChoiceOption> implements MultipleChoiceOptionService {

    @javax.annotation.Resource
    private MultipleChoiceOptionMapper multipleChoiceOptionMapper;

    @Override
    public boolean save(MultipleChoiceOption entity) {
        if (entity.getId() == null) {
            int id = CodeGenerator.generateFormId();
            while (multipleChoiceOptionMapper.exists(new QueryWrapper<MultipleChoiceOption>().eq("id", id))) {
                id = CodeGenerator.generateFormId();
            }
            entity.setId(id);
        }
        return super.save(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<MultipleChoiceOption> batchSaveOptions(Integer questionId, List<QuestionOptionDto.OptionItem> options) {
        // 先删除该问题的所有现有选项
        deleteOptionsByQuestionId(questionId);
        
        // 批量保存新选项
        List<MultipleChoiceOption> optionList = new ArrayList<>();
        for (int i = 0; i < options.size(); i++) {
            QuestionOptionDto.OptionItem item = options.get(i);
            MultipleChoiceOption option = new MultipleChoiceOption();
            // 生成唯一ID
            int id = CodeGenerator.generateFormId();
            while (multipleChoiceOptionMapper.exists(new QueryWrapper<MultipleChoiceOption>().eq("id", id))) {
                id = CodeGenerator.generateFormId();
            }
            option.setId(id);
            option.setQuestionId(questionId);
            option.setOptionContent(item.getOptionContent());
            option.setSortNum(item.getSortNum() != null ? item.getSortNum() : i + 1);
            optionList.add(option);
        }
        
        // 批量保存
        saveBatch(optionList);
        return optionList;
    }

    @Override
    public List<MultipleChoiceOption> getOptionsByQuestionId(Integer questionId) {
        QueryWrapper<MultipleChoiceOption> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("question_id", questionId)
                   .orderByAsc("sort_num");
        return list(queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteOptionsByQuestionId(Integer questionId) {
        QueryWrapper<MultipleChoiceOption> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("question_id", questionId);
        return remove(queryWrapper);
    }
}
