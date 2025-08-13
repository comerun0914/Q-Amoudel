package com.shz.quick_qa_system.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shz.quick_qa_system.entity.QuestionAnswer;
import org.apache.ibatis.annotations.Mapper;

/**
 * 问题答案Mapper接口
 */
@Mapper
public interface QuestionAnswerMapper extends BaseMapper<QuestionAnswer> {
}
