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

-- ==================== 用户填写数据相关表 ====================

-- 问卷提交记录表（主表）
CREATE TABLE IF NOT EXISTS `questionnaire_submission` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '提交记录ID',
    `questionnaire_id` int(11) NOT NULL COMMENT '问卷ID',
    `user_id` int(11) DEFAULT NULL COMMENT '用户ID（可为空，支持匿名填写）',
    `submitter_name` varchar(100) DEFAULT NULL COMMENT '填写者姓名',
    `submitter_email` varchar(100) DEFAULT NULL COMMENT '填写者邮箱',
    `submitter_phone` varchar(20) DEFAULT NULL COMMENT '填写者电话',
    `ip_address` varchar(45) DEFAULT NULL COMMENT '提交IP地址',
    `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理信息',
    `start_time` datetime DEFAULT NULL COMMENT '开始填写时间',
    `submit_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    `duration_seconds` int(11) DEFAULT NULL COMMENT '填写时长（秒）',
    `status` tinyint(1) DEFAULT 1 COMMENT '状态：1=有效，0=无效',
    `is_complete` tinyint(1) DEFAULT 1 COMMENT '是否完整填写：1=是，0=否',
    PRIMARY KEY (`id`),
    KEY `idx_questionnaire_id` (`questionnaire_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_submit_time` (`submit_time`),
    KEY `idx_ip_address` (`ip_address`),
    CONSTRAINT `fk_submission_questionnaire` FOREIGN KEY (`questionnaire_id`) REFERENCES `question_create` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_submission_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问卷提交记录表';

-- 答案详情表（存储所有题型的答案）
CREATE TABLE IF NOT EXISTS `question_answer` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '答案ID',
    `submission_id` int(11) NOT NULL COMMENT '提交记录ID',
    `question_id` int(11) NOT NULL COMMENT '问题ID',
    `question_type` tinyint(2) NOT NULL COMMENT '题型：1=单选题，2=多选题，3=问答题，4=评分题，5=矩阵题',
    `answer_text` text DEFAULT NULL COMMENT '文本答案（问答题、其他题型的文本描述）',
    `answer_value` int(11) DEFAULT NULL COMMENT '数值答案（评分题、单选题选项索引等）',
    `answer_json` json DEFAULT NULL COMMENT 'JSON格式答案（多选题、矩阵题等复杂答案）',
    `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_submission_id` (`submission_id`),
    KEY `idx_question_id` (`question_id`),
    KEY `idx_question_type` (`question_type`),
    CONSTRAINT `fk_answer_submission` FOREIGN KEY (`submission_id`) REFERENCES `questionnaire_submission` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问题答案详情表';

-- 单选题答案表（详细记录单选题选择）
CREATE TABLE IF NOT EXISTS `single_choice_answer` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '答案ID',
    `answer_id` int(11) NOT NULL COMMENT '关联答案ID',
    `option_id` int(11) NOT NULL COMMENT '选择的选项ID',
    `option_content` varchar(255) NOT NULL COMMENT '选项内容（冗余存储）',
    `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_answer_id` (`answer_id`),
    KEY `idx_option_id` (`option_id`),
    CONSTRAINT `fk_single_answer_answer` FOREIGN KEY (`answer_id`) REFERENCES `question_answer` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_single_answer_option` FOREIGN KEY (`option_id`) REFERENCES `single_choice_option` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='单选题答案表';

-- 多选题答案表（详细记录多选题选择）
CREATE TABLE IF NOT EXISTS `multiple_choice_answer` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '答案ID',
    `answer_id` int(11) NOT NULL COMMENT '关联答案ID',
    `option_id` int(11) NOT NULL COMMENT '选择的选项ID',
    `option_content` varchar(255) NOT NULL COMMENT '选项内容（冗余存储）',
    `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_answer_id` (`answer_id`),
    KEY `idx_option_id` (`option_id`),
    CONSTRAINT `fk_multiple_answer_answer` FOREIGN KEY (`answer_id`) REFERENCES `question_answer` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_multiple_answer_option` FOREIGN KEY (`option_id`) REFERENCES `multiple_choice_option` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='多选题答案表';

-- 矩阵题答案表（详细记录矩阵题选择）
CREATE TABLE IF NOT EXISTS `matrix_answer` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '答案ID',
    `answer_id` int(11) NOT NULL COMMENT '关联答案ID',
    `row_id` int(11) NOT NULL COMMENT '矩阵行ID',
    `row_content` varchar(255) NOT NULL COMMENT '行内容（冗余存储）',
    `column_id` int(11) NOT NULL COMMENT '矩阵列ID',
    `column_content` varchar(255) NOT NULL COMMENT '列内容（冗余存储）',
    `score` int(11) DEFAULT NULL COMMENT '评分值（评分矩阵）',
    `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_answer_id` (`answer_id`),
    KEY `idx_row_id` (`row_id`),
    KEY `idx_column_id` (`column_id`),
    CONSTRAINT `fk_matrix_answer_answer` FOREIGN KEY (`answer_id`) REFERENCES `question_answer` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_matrix_answer_row` FOREIGN KEY (`row_id`) REFERENCES `matrix_row` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_matrix_answer_column` FOREIGN KEY (`column_id`) REFERENCES `matrix_column` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='矩阵题答案表';

-- 草稿保存表（临时保存用户填写进度）
CREATE TABLE IF NOT EXISTS `questionnaire_draft` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '草稿ID',
    `questionnaire_id` int(11) NOT NULL COMMENT '问卷ID',
    `user_id` int(11) DEFAULT NULL COMMENT '用户ID（可为空，支持匿名草稿）',
    `session_id` varchar(100) DEFAULT NULL COMMENT '会话ID（用于匿名用户）',
    `draft_data` json NOT NULL COMMENT '草稿数据（JSON格式）',
    `progress` int(11) DEFAULT 0 COMMENT '填写进度（0-100）',
    `last_save_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '最后保存时间',
    `expire_time` datetime DEFAULT NULL COMMENT '过期时间（默认7天）',
    PRIMARY KEY (`id`),
    KEY `idx_questionnaire_id` (`questionnaire_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_expire_time` (`expire_time`),
    CONSTRAINT `fk_draft_questionnaire` FOREIGN KEY (`questionnaire_id`) REFERENCES `question_create` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_draft_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问卷草稿表';

-- 插入测试数据
INSERT INTO `questionnaire_submission` (`questionnaire_id`, `user_id`, `submitter_name`, `submitter_email`, `ip_address`, `start_time`, `duration_seconds`, `status`, `is_complete`) VALUES
(1, 2, '张三', 'zhangsan@example.com', '127.0.0.1', NOW() - INTERVAL 30 MINUTE, 1800, 1, 1),
(1, 3, '李四', 'lisi@example.com', '127.0.0.1', NOW() - INTERVAL 15 MINUTE, 900, 1, 1);
