package com.shz.quick_qa_system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

/**
 * <p>
 * 用户登录历史记录表
 * </p>
 *
 * @author comerun
 * @since 2025-07-30
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("login_history")
public class LoginHistory implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 登录记录唯一标识
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 关联的用户ID
     */
    private Integer userId;

    /**
     * 登录时间
     */
    private LocalDateTime loginTime;

    /**
     * 退出时间，主动退出时记录
     */
    private LocalDateTime logoutTime;

    /**
     * 登录IP地址（支持IPv6）
     */
    private String ipAddress;

    /**
     * 用户代理信息（浏览器/设备）
     */
    private String userAgent;

    /**
     * 登录是否成功
     */
    private Boolean success;

    /**
     * 登录失败原因（仅当success为false时有效）
     */
    private String failureReason;

    /**
     * 登录地理位置（通过IP解析）
     */
    private String location;


}
