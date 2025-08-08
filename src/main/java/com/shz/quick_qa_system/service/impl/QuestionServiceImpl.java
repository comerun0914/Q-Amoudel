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
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;
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

    @Resource
    private QuestionMapper questionMapper;

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

    @Override
    public Integer saveQuestion(QuestionDto questionDto) {
        try {
            // 生成唯一ID
            int id = CodeGenerator.generateFormId();
            while(questionMapper.exists(new QueryWrapper<Question>().eq("id",id))) {
                id = CodeGenerator.generateFormId();
            }
            
            // 设置ID和时间
            questionDto.setId(id);
            
            // 转换为实体
            Question question = new Question();
            BeanUtils.copyProperties(questionDto, question);
            
            // 设置创建和更新时间
            question.setCreatedTime(LocalDateTime.now());
            question.setUpdatedTime(LocalDateTime.now());
            
            // 保存到数据库
            int insertResult = questionMapper.insert(question);
            
            if (insertResult > 0) {
                return id; // 返回生成的ID
            } else {
                return 0; // 保存失败
            }
        } catch (Exception e) {
            e.printStackTrace();
            return 0; // 异常时返回0
        }
    }

    @Override
    public Integer updateQuestion(QuestionDto questionDto) {
        try {
            if (questionDto.getId() == null) {
                return 0;
            }
            
            Question question = new Question();
            BeanUtils.copyProperties(questionDto, question);
            
            // 设置更新时间
            question.setUpdatedTime(LocalDateTime.now());
            
            // 更新数据库
            int updateResult = questionMapper.updateById(question);
            
            return updateResult > 0 ? 1 : 0;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public Integer deleteQuestion(Integer id) {
        try {
            if (id == null) {
                return 0;
            }
            
            // 删除数据库记录
            int deleteResult = questionMapper.deleteById(id);
            
            return deleteResult > 0 ? 1 : 0;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

}