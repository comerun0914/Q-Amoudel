package com.shz.quick_qa_system.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shz.quick_qa_system.entity.QuestionnaireSubmission;
import org.apache.ibatis.annotations.Mapper;

/**
 * 问卷提交记录Mapper接口
 */
@Mapper
public interface QuestionnaireSubmissionMapper extends BaseMapper<QuestionnaireSubmission> {
}
