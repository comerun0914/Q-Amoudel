package com.shz.quick_qa_system.dao;

import com.shz.quick_qa_system.entity.Users;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * <p>
 * 用户登录信息表 Mapper 接口
 * </p>
 *
 * @author comerun
 * @since 2025-07-30
 */
@Mapper
public interface UsersMapper extends BaseMapper<Users> {

}
