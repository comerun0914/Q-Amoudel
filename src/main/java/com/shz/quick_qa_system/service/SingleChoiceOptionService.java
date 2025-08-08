package com.shz.quick_qa_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shz.quick_qa_system.entity.SingleChoiceOption;
import com.shz.quick_qa_system.dto.QuestionOptionDto;

import java.util.List;

/**
 * <p>
 * 单选题选项表 服务类
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
public interface SingleChoiceOptionService extends IService<SingleChoiceOption> {

    /**
     * 批量保存选项
     * @param questionId 问题ID
     * @param options 选项列表
     * @return 保存后的选项列表
     */
    List<SingleChoiceOption> batchSaveOptions(Integer questionId, List<QuestionOptionDto.OptionItem> options);

    /**
     * 根据问题ID查询选项列表
     * @param questionId 问题ID
     * @return 选项列表
     */
    List<SingleChoiceOption> getOptionsByQuestionId(Integer questionId);

    /**
     * 根据问题ID删除所有选项
     * @param questionId 问题ID
     * @return 是否删除成功
     */
    boolean deleteOptionsByQuestionId(Integer questionId);
}
