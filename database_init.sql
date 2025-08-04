-- 数据库初始化脚本
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `q-asystem` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

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

-- 问题基础表（所有题型的共性信息）
CREATE TABLE IF NOT EXISTS `question` (
                                          `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '问题ID',
    `questionnaire_id` int(11) NOT NULL COMMENT '所属问卷ID（关联问卷表）',
    `content` text NOT NULL COMMENT '问题内容',
    `question_type` tinyint(2) NOT NULL COMMENT '题型：1=单选题，2=多选题，3=问答题，4=评分题，5=矩阵题',
    `sort_num` int(11) NOT NULL DEFAULT 0 COMMENT '问题排序号',
    `is_required` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否必填：1=是，0=否',
    `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_questionnaire_id` (`questionnaire_id`),
    KEY `idx_question_type` (`question_type`),
    CONSTRAINT `fk_question_questionnaire` FOREIGN KEY (`questionnaire_id`) REFERENCES `question_create` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问题基础表';

-- 单选题选项表
CREATE TABLE IF NOT EXISTS `single_choice_option` (
                                                      `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '选项ID',
    `question_id` int(11) NOT NULL COMMENT '关联问题ID（题型为1）',
    `option_content` varchar(255) NOT NULL COMMENT '选项内容',
    `sort_num` int(11) NOT NULL DEFAULT 0 COMMENT '选项排序号',
    `is_default` tinyint(1) DEFAULT 0 COMMENT '是否默认选项',
    PRIMARY KEY (`id`),
    KEY `idx_question_id` (`question_id`),
    CONSTRAINT `fk_single_option_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='单选题选项表';

-- 多选题选项表
CREATE TABLE IF NOT EXISTS `multiple_choice_option` (
                                                        `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '选项ID',
    `question_id` int(11) NOT NULL COMMENT '关联问题ID（题型为2）',
    `option_content` varchar(255) NOT NULL COMMENT '选项内容',
    `sort_num` int(11) NOT NULL DEFAULT 0 COMMENT '选项排序号',
    PRIMARY KEY (`id`),
    KEY `idx_question_id` (`question_id`),
    CONSTRAINT `fk_multiple_option_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='多选题选项表';

-- 问答题配置表
CREATE TABLE IF NOT EXISTS `text_question` (
                                               `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `question_id` int(11) NOT NULL COMMENT '关联问题ID（题型为3）',
    `hint_text` varchar(255) DEFAULT NULL COMMENT '提示文本',
    `max_length` int(11) DEFAULT 500 COMMENT '最大输入长度',
    `input_type` tinyint(1) DEFAULT 1 COMMENT '输入框类型：1=单行，2=多行',
    PRIMARY KEY (`id`),
    KEY `idx_question_id` (`question_id`),
    CONSTRAINT `fk_text_question_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问答题配置表';

-- 评分题配置表
CREATE TABLE IF NOT EXISTS `rating_question` (
                                                 `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `question_id` int(11) NOT NULL COMMENT '关联问题ID（题型为4）',
    `min_score` int(11) NOT NULL DEFAULT 1 COMMENT '最低分值',
    `max_score` int(11) NOT NULL DEFAULT 5 COMMENT '最高分值',
    `min_label` varchar(50) DEFAULT '非常不满意' COMMENT '最低分标签',
    `max_label` varchar(50) DEFAULT '非常满意' COMMENT '最高分标签',
    `step` int(11) DEFAULT 1 COMMENT '评分步长',
    PRIMARY KEY (`id`),
    KEY `idx_question_id` (`question_id`),
    CONSTRAINT `fk_rating_question_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评分题配置表';

-- 矩阵题主体表
CREATE TABLE IF NOT EXISTS `matrix_question` (
                                                 `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '矩阵题ID',
    `question_id` int(11) NOT NULL COMMENT '关联问题ID（题型为5）',
    `sub_question_type` tinyint(2) NOT NULL COMMENT '子题型：1=单选矩阵，4=评分矩阵',
    `description` varchar(255) DEFAULT NULL COMMENT '矩阵题描述',
    PRIMARY KEY (`id`),
    KEY `idx_question_id` (`question_id`),
    CONSTRAINT `fk_matrix_question_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='矩阵题主体表';

-- 矩阵题行表（子问题行）
CREATE TABLE IF NOT EXISTS `matrix_row` (
                                            `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '行ID',
    `matrix_id` int(11) NOT NULL COMMENT '关联矩阵题ID',
    `row_content` varchar(255) NOT NULL COMMENT '行内容（子问题）',
    `sort_num` int(11) NOT NULL DEFAULT 0 COMMENT '行排序号',
    PRIMARY KEY (`id`),
    KEY `idx_matrix_id` (`matrix_id`),
    CONSTRAINT `fk_matrix_row_matrix` FOREIGN KEY (`matrix_id`) REFERENCES `matrix_question` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='矩阵题行表';

-- 矩阵题列表（选项列）
CREATE TABLE IF NOT EXISTS `matrix_column` (
                                               `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '列ID',
    `matrix_id` int(11) NOT NULL COMMENT '关联矩阵题ID',
    `column_content` varchar(255) NOT NULL COMMENT '列内容（选项）',
    `sort_num` int(11) NOT NULL DEFAULT 0 COMMENT '列排序号',
    `score` int(11) DEFAULT NULL COMMENT '对应分值（仅评分矩阵生效）',
    PRIMARY KEY (`id`),
    KEY `idx_matrix_id` (`matrix_id`),
    CONSTRAINT `fk_matrix_column_matrix` FOREIGN KEY (`matrix_id`) REFERENCES `matrix_question` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='矩阵题列表';

-- 插入测试数据
INSERT INTO `users` (`username`, `password`, `phone`, `role`) VALUES
                                                                  ('admin', 'admin123', '13800138000', 1),
                                                                  ('user1', 'user123', '13800138001', 0),
                                                                  ('teacher1', 'teacher123', '13800138002', 1);

-- 插入测试登录历史
INSERT INTO `login_history` (`user_id`, `login_time`, `ip_address`, `user_agent`, `login_status`) VALUES
                                                                                                      (1, NOW(), '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 1),
                                                                                                      (2, NOW(), '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 1);
