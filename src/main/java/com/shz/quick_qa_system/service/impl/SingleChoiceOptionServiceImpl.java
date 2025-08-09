package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.entity.SingleChoiceOption;
import com.shz.quick_qa_system.dao.SingleChoiceOptionMapper;
import com.shz.quick_qa_system.service.SingleChoiceOptionService;
import com.shz.quick_qa_system.dto.QuestionOptionDto;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 * 单选题选项表 服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
@Service
public class SingleChoiceOptionServiceImpl extends ServiceImpl<SingleChoiceOptionMapper, SingleChoiceOption> implements SingleChoiceOptionService {

    @Resource
    private SingleChoiceOptionMapper singleChoiceOptionMapper;

    @Override
    public boolean save(SingleChoiceOption entity) {
        if (entity.getId() == null) {
            int id = CodeGenerator.generateFormId();
            while(singleChoiceOptionMapper.exists(new QueryWrapper<SingleChoiceOption>().eq("id", id))){
                id = CodeGenerator.generateFormId();
            }
            entity.setId(id);
        }
        return super.save(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<SingleChoiceOption> batchSaveOptions(Integer questionId, List<QuestionOptionDto.OptionItem> options) {
        // 先删除该问题的所有现有选项
        deleteOptionsByQuestionId(questionId);
        
        // 批量保存新选项
        List<SingleChoiceOption> optionList = new ArrayList<>();
        for (int i = 0; i < options.size(); i++) {
            // 创建id
            int id = CodeGenerator.generateFormId();
            while(singleChoiceOptionMapper.exists(new QueryWrapper<SingleChoiceOption>().eq("id", id))){
                id = CodeGenerator.generateFormId();
            };
            QuestionOptionDto.OptionItem item = options.get(i);
            SingleChoiceOption option = new SingleChoiceOption();
            option.setId(id);
            option.setQuestionId(questionId);
            option.setOptionContent(item.getOptionContent());
            option.setSortNum(item.getSortNum() != null ? item.getSortNum() : i + 1);
            option.setIsDefault(item.getIsDefault() != null ? item.getIsDefault() : 0);
            optionList.add(option);
        }
        
        // 批量保存
        saveBatch(optionList);
        return optionList;
    }

    @Override
    public List<SingleChoiceOption> getOptionsByQuestionId(Integer questionId) {
        QueryWrapper<SingleChoiceOption> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("question_id", questionId)
                   .orderByAsc("sort_num");
        return list(queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteOptionsByQuestionId(Integer questionId) {
        QueryWrapper<SingleChoiceOption> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("question_id", questionId);
        return remove(queryWrapper);
    }
}
