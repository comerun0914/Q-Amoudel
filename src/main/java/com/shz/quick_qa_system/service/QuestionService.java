package com.shz.quick_qa_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shz.quick_qa_system.dto.QuestionDto;
import com.shz.quick_qa_system.entity.Question;

import java.util.List;

/**
 * <p>
 * 问题服务接口
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
public interface QuestionService extends IService<Question> {

    /**
     * 根据问卷ID获取问题列表（包含选项）
     * @param questionnaireId 问卷ID
     * @return 问题列表
     */
    List<QuestionDto> getQuestionsByQuestionnaireId(Integer questionnaireId);

    /**
     * 返回处理好的问题存储
     * @param questionDto
     * @return 返回处理结果
     */
    Integer saveQuestion(QuestionDto questionDto);

    /**
     * 更新问题
     * @param questionDto 问题数据
     * @return 更新结果
     */
    Integer updateQuestion(QuestionDto questionDto);

    /**
     * 删除问题
     * @param id 问题ID
     * @return 删除结果
     */
    Integer deleteQuestion(Integer id);
}