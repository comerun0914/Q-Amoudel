package com.shz.quick_qa_system.service;

import com.shz.quick_qa_system.entity.QuestionCreate;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 * 创建问卷表 服务类
 * </p>
 *
 * @author comerun
 * @since 2025-08-02
 */
public interface QuestionCreateService extends IService<QuestionCreate> {

    /**
     * 创建问卷单据
     * @param questionCreate
     * @return 创建的问卷对象，失败返回null
     */
    public QuestionCreate CreateQuestion(QuestionCreate questionCreate);
}
