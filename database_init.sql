-- 数据库初始化脚本
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `q-asystem` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `q-asystem`;

-- 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `username` varchar(50) NOT NULL COMMENT '登录用户名',
  `password` varchar(255) NOT NULL COMMENT '加密后的用户密码',
  `phone` varchar(20) DEFAULT NULL COMMENT '用户手机号码',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '用户头像URL',
  `role` int(11) NOT NULL DEFAULT '0' COMMENT '用户角色: 0=普通用户, 1=幼儿园教师',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `last_logout_time` datetime DEFAULT NULL COMMENT '最后退出时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户登录信息表';

-- 创建登录历史表
CREATE TABLE IF NOT EXISTS `login_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '登录历史id',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `login_time` datetime NOT NULL COMMENT '登录时间',
  `logout_time` datetime DEFAULT NULL COMMENT '退出时间',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',
  `login_status` int(11) NOT NULL DEFAULT '1' COMMENT '登录状态: 1=成功, 0=失败',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_login_time` (`login_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录历史表';

-- 插入测试数据
INSERT INTO `users` (`username`, `password`, `phone`, `role`) VALUES
('admin', 'admin123', '13800138000', 1),
('user1', 'user123', '13800138001', 0),
('teacher1', 'teacher123', '13800138002', 1);

-- 插入测试登录历史
INSERT INTO `login_history` (`user_id`, `login_time`, `ip_address`, `user_agent`, `login_status`) VALUES
(1, NOW(), '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 1),
(2, NOW(), '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 1);

-- 问卷表
CREATE TABLE IF NOT EXISTS `question_create` (
                                               `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '问卷ID',
    `title` varchar(255) NOT NULL COMMENT '问卷标题',
    `description` text COMMENT '问卷描述',
    `start_date` date NOT NULL COMMENT '开始日期',
    `end_date` date NOT NULL COMMENT '结束日期',
    `submission_limit` int(3) DEFAULT 1 COMMENT '每人填写次数限制',
    `status` tinyint(1) DEFAULT 1 COMMENT '问卷状态：0=禁用，1=启用',
    `creator_id` int(11) NOT NULL COMMENT '创建者用户ID',
    `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_creator_id` (`creator_id`),
    KEY `idx_status` (`status`),
    KEY `idx_date_range` (`start_date`, `end_date`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='创建问卷表';