package com.shz.quick_qa_system.service.impl;

import com.shz.quick_qa_system.entity.Users;
import com.shz.quick_qa_system.dao.UsersMapper;
import com.shz.quick_qa_system.service.UsersService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 用户登录信息表 服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-07-30
 */
@Service
public class UsersServiceImpl extends ServiceImpl<UsersMapper, Users> implements UsersService {

}
