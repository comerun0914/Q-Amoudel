package com.shz.quick_qa_system.service;

import com.shz.quick_qa_system.entity.MatrixQuestion;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 * 矩阵题主体表 服务类
 * </p>
 *
 * @author comerun
 * @since 2025-08-06
 */
public interface MatrixQuestionService extends IService<MatrixQuestion> {
    /**
     * 删除旧数据
     * @param questionId
     * @return
     */
    public boolean deleteByQuestionId(Integer questionId);
}
