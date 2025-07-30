package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

/**
 * <p>
 * 用户登录信息表
 * </p>
 *
 * @author comerun
 * @since 2025-07-30
 */
@Getter
@Setter
@Accessors(chain = true)
public class Users implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 用户id
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 登录用户名
     */
    private String username;

    /**
     * 加密后的用户密码
     */
    private String password;

    /**
     * 用户手机号码
     */
    private String phone;

    /**
     * 用户头像URL
     */
    private String avatarUrl;

    /**
     * 用户角色: 0=普通用户, 1=幼儿园教师
     */
    private Integer role;

    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginTime;

    /**
     * 最后退出时间
     */
    private LocalDateTime lastLogoutTime;


}
