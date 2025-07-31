package com.shz.quick_qa_system.service.impl;

import com.shz.quick_qa_system.entity.Users;
import com.shz.quick_qa_system.dao.UsersMapper;
import com.shz.quick_qa_system.service.UsersService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Resource;

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
    private static final Logger logger = LoggerFactory.getLogger(UsersServiceImpl.class);
    
    @Resource
    private UsersMapper usersMapper;

    @Override
    public Users getUserByuserName(String userName) {
        logger.info("开始查询用户，用户名: {}", userName);
        Users user = usersMapper.getUserByuserName(userName);
        if (user != null) {
            logger.info("查询到用户: ID={}, 用户名={}, 角色={}", user.getId(), user.getUsername(), user.getRole());
        } else {
            logger.warn("未查询到用户: {}", userName);
        }
        return user;
    }
}
