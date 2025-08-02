package com.shz.quick_qa_system.service;

import com.shz.quick_qa_system.entity.Users;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 * 用户登录信息表 服务类
 * </p>
 *
 * @author comerun
 * @since 2025-07-30
 */
public interface UsersService extends IService<Users> {
    /**
     * 获取用户信息
     * @param userName
     * @return
     */
    public Users getUserByuserName(String userName);

    /**
     * 使用Id获取信息
     * @param userId
     * @return
     */
    public Users getUserByuserId(Integer userId);

    /**
     * 退出登录
     * @param user
     * @return
     */
    public String logout(Users user);
}
