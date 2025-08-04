package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.dao.QuestionMapper;
import com.shz.quick_qa_system.dao.SingleChoiceOptionMapper;
import com.shz.quick_qa_system.dto.QuestionDto;
import com.shz.quick_qa_system.dto.QuestionOptionDto;
import com.shz.quick_qa_system.entity.Question;
import com.shz.quick_qa_system.entity.SingleChoiceOption;
import com.shz.quick_qa_system.service.QuestionService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 * 问题服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Service
public class QuestionServiceImpl extends ServiceImpl<QuestionMapper, Question> implements QuestionService {

    @Resource
    private SingleChoiceOptionMapper singleChoiceOptionMapper;

    @Override
    public List<QuestionDto> getQuestionsByQuestionnaireId(Integer questionnaireId) {
        // 查询问题列表
        QueryWrapper<Question> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("questionnaire_id", questionnaireId);
        queryWrapper.orderByAsc("sort_num");
        List<Question> questions = list(queryWrapper);

        // 转换为DTO
        return questions.stream().map(question -> {
            QuestionDto questionDto = new QuestionDto();
            BeanUtils.copyProperties(question, questionDto);

            // 如果是单选题，获取选项
            if (question.getQuestionType() == 1) {
                QueryWrapper<SingleChoiceOption> optionWrapper = new QueryWrapper<>();
                optionWrapper.eq("question_id", question.getId());
                optionWrapper.orderByAsc("sort_num");
                List<SingleChoiceOption> options = singleChoiceOptionMapper.selectList(optionWrapper);

                List<QuestionOptionDto> optionDtos = options.stream().map(option -> {
                    QuestionOptionDto optionDto = new QuestionOptionDto();
                    BeanUtils.copyProperties(option, optionDto);
                    return optionDto;
                }).collect(Collectors.toList());

                questionDto.setOptions(optionDtos);
            }

            return questionDto;
        }).collect(Collectors.toList());
    }
} 