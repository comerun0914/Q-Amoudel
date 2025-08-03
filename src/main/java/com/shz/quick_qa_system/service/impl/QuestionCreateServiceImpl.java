package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shz.quick_qa_system.entity.QuestionCreate;
import com.shz.quick_qa_system.dao.QuestionCreateMapper;
import com.shz.quick_qa_system.service.QuestionCreateService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;

/**
 * <p>
 * 创建问卷表 服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-08-02
 */
@Service
public class QuestionCreateServiceImpl extends ServiceImpl<QuestionCreateMapper, QuestionCreate> implements QuestionCreateService {
    @Resource
    private QuestionCreateMapper questionCreateMapper;


    @Override
    public QuestionCreate CreateQuestion(QuestionCreate questionCreate) {
        // 设置表单ID
        Integer formId = CodeGenerator.generateFormId();
        while (questionCreateMapper.exists(new QueryWrapper<QuestionCreate>().eq("id", formId))){
            formId = CodeGenerator.generateFormId();
        }
        questionCreate.setId(formId);
        // 创建时间
        // 更新时间
        questionCreate.setCreatedTime(LocalDateTime.now());
        questionCreate.setUpdatedTime(LocalDateTime.now());
        boolean result = save(questionCreate);
        
        if (result) {
            // 返回创建的问卷信息
            return questionCreate;
        }
        return null;
    }
}
