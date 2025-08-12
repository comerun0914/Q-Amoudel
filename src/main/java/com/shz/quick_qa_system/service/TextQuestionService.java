package com.shz.quick_qa_system.service;

import com.shz.quick_qa_system.entity.TextQuestion;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 * 问答题配置表 服务类
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
public interface TextQuestionService extends IService<TextQuestion> {
    /**
     * 删除旧信息
     * @param questionId
     * @return
     */
    public boolean deleteByQuestionId(Integer questionId);
}
