package com.shz.quick_qa_system.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shz.quick_qa_system.entity.Question;
import org.apache.ibatis.annotations.Mapper;

/**
 * <p>
 * 问题 Mapper 接口
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Mapper
public interface QuestionMapper extends BaseMapper<Question> {

} 