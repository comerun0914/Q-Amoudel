package com.shz.quick_qa_system.dao;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.shz.quick_qa_system.entity.QuestionCreate;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * <p>
 * 问卷管理 Mapper 接口
 * </p>
 *
 * @author comerun
 * @since 2025-08-02
 */
@Mapper
public interface QuestionCreateMapper extends BaseMapper<QuestionCreate> {

    /**
     * 检查记录是否存在
     * @param wrapper 查询条件
     * @return 是否存在
     */
    boolean exists(@Param("ew") Wrapper<QuestionCreate> wrapper);
}
