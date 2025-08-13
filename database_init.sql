/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80042
 Source Host           : localhost:3306
 Source Schema         : q-asystem

 Target Server Type    : MySQL
 Target Server Version : 80042
 File Encoding         : 65001

 Date: 13/08/2025 17:56:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for login_history
-- ----------------------------
DROP TABLE IF EXISTS `login_history`;
CREATE TABLE `login_history`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '登录历史id',
  `user_id` int(0) NOT NULL COMMENT '用户id',
  `login_time` datetime(0) NOT NULL COMMENT '登录时间',
  `logout_time` datetime(0) NULL DEFAULT NULL COMMENT '退出时间',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户代理',
  `login_status` int(0) NOT NULL DEFAULT 1 COMMENT '登录状态: 1=成功, 0=失败',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_login_time`(`login_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '登录历史表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for matrix_answer
-- ----------------------------
DROP TABLE IF EXISTS `matrix_answer`;
CREATE TABLE `matrix_answer`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '答案ID',
  `answer_id` int(0) NOT NULL COMMENT '关联答案ID',
  `row_id` int(0) NOT NULL COMMENT '矩阵行ID',
  `row_content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '行内容（冗余存储）',
  `column_id` int(0) NOT NULL COMMENT '矩阵列ID',
  `column_content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '列内容（冗余存储）',
  `score` int(0) NULL DEFAULT NULL COMMENT '评分值（评分矩阵）',
  `created_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_answer_id`(`answer_id`) USING BTREE,
  INDEX `idx_row_id`(`row_id`) USING BTREE,
  INDEX `idx_column_id`(`column_id`) USING BTREE,
  CONSTRAINT `fk_matrix_answer_answer` FOREIGN KEY (`answer_id`) REFERENCES `question_answer` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_matrix_answer_column` FOREIGN KEY (`column_id`) REFERENCES `matrix_column` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_matrix_answer_row` FOREIGN KEY (`row_id`) REFERENCES `matrix_row` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '矩阵题答案表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for matrix_column
-- ----------------------------
DROP TABLE IF EXISTS `matrix_column`;
CREATE TABLE `matrix_column`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '列ID',
  `matrix_id` int(0) NOT NULL COMMENT '关联矩阵题ID',
  `column_content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '列内容（选项）',
  `sort_num` int(0) NOT NULL DEFAULT 0 COMMENT '列排序号',
  `score` int(0) NULL DEFAULT NULL COMMENT '对应分值（仅评分矩阵生效）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_matrix_id`(`matrix_id`) USING BTREE,
  CONSTRAINT `fk_matrix_column_matrix` FOREIGN KEY (`matrix_id`) REFERENCES `matrix_question` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '矩阵题列表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for matrix_question
-- ----------------------------
DROP TABLE IF EXISTS `matrix_question`;
CREATE TABLE `matrix_question`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '矩阵题ID',
  `question_id` int(0) NOT NULL COMMENT '关联问题ID（题型为5）',
  `sub_question_type` tinyint(0) NOT NULL COMMENT '子题型：1=单选矩阵，4=评分矩阵',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '矩阵题描述',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_question_id`(`question_id`) USING BTREE,
  CONSTRAINT `fk_matrix_question_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '矩阵题主体表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for matrix_row
-- ----------------------------
DROP TABLE IF EXISTS `matrix_row`;
CREATE TABLE `matrix_row`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '行ID',
  `matrix_id` int(0) NOT NULL COMMENT '关联矩阵题ID',
  `row_content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '行内容（子问题）',
  `sort_num` int(0) NOT NULL DEFAULT 0 COMMENT '行排序号',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_matrix_id`(`matrix_id`) USING BTREE,
  CONSTRAINT `fk_matrix_row_matrix` FOREIGN KEY (`matrix_id`) REFERENCES `matrix_question` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '矩阵题行表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for multiple_choice_answer
-- ----------------------------
DROP TABLE IF EXISTS `multiple_choice_answer`;
CREATE TABLE `multiple_choice_answer`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '答案ID',
  `answer_id` int(0) NOT NULL COMMENT '关联答案ID',
  `option_id` int(0) NOT NULL COMMENT '选择的选项ID',
  `option_content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '选项内容（冗余存储）',
  `created_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_answer_id`(`answer_id`) USING BTREE,
  INDEX `idx_option_id`(`option_id`) USING BTREE,
  CONSTRAINT `fk_multiple_answer_answer` FOREIGN KEY (`answer_id`) REFERENCES `question_answer` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_multiple_answer_option` FOREIGN KEY (`option_id`) REFERENCES `multiple_choice_option` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '多选题答案表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for multiple_choice_option
-- ----------------------------
DROP TABLE IF EXISTS `multiple_choice_option`;
CREATE TABLE `multiple_choice_option`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '选项ID',
  `question_id` int(0) NOT NULL COMMENT '关联问题ID（题型为2）',
  `option_content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '选项内容',
  `sort_num` int(0) NOT NULL DEFAULT 0 COMMENT '选项排序号',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_question_id`(`question_id`) USING BTREE,
  CONSTRAINT `fk_multiple_option_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '多选题选项表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question
-- ----------------------------
DROP TABLE IF EXISTS `question`;
CREATE TABLE `question`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '问题ID',
  `questionnaire_id` int(0) NOT NULL COMMENT '所属问卷ID（关联问卷表）',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '问题内容',
  `question_type` tinyint(0) NOT NULL COMMENT '题型：1=单选题，2=多选题，3=问答题，4=评分题，5=矩阵题',
  `sort_num` int(0) NOT NULL DEFAULT 0 COMMENT '问题排序号',
  `is_required` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否必填：1=是，0=否',
  `created_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_questionnaire_id`(`questionnaire_id`) USING BTREE,
  INDEX `idx_question_type`(`question_type`) USING BTREE,
  CONSTRAINT `fk_question_questionnaire` FOREIGN KEY (`questionnaire_id`) REFERENCES `question_create` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 44 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问题基础表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question_answer
-- ----------------------------
DROP TABLE IF EXISTS `question_answer`;
CREATE TABLE `question_answer`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '答案ID',
  `submission_id` int(0) NOT NULL COMMENT '提交记录ID',
  `question_id` int(0) NOT NULL COMMENT '问题ID',
  `question_type` tinyint(0) NOT NULL COMMENT '题型：1=单选题，2=多选题，3=问答题，4=评分题，5=矩阵题',
  `answer_json` json NULL COMMENT 'JSON格式答案（多选题、矩阵题等复杂答案）',
  `created_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_submission_id`(`submission_id`) USING BTREE,
  INDEX `idx_question_id`(`question_id`) USING BTREE,
  INDEX `idx_question_type`(`question_type`) USING BTREE,
  CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_answer_submission` FOREIGN KEY (`submission_id`) REFERENCES `questionnaire_submission` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问题答案详情表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question_create
-- ----------------------------
DROP TABLE IF EXISTS `question_create`;
CREATE TABLE `question_create`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '问卷ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '问卷标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '问卷描述',
  `start_date` date NOT NULL COMMENT '开始日期',
  `end_date` date NOT NULL COMMENT '结束日期',
  `submission_limit` int(0) NULL DEFAULT 1 COMMENT '每人填写次数限制',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '问卷状态：0=禁用，1=启用',
  `creator_id` int(0) NOT NULL COMMENT '创建者用户ID',
  `created_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_creator_id`(`creator_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_date_range`(`start_date`, `end_date`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 99784683 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '创建问卷表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for questionnaire_draft
-- ----------------------------
DROP TABLE IF EXISTS `questionnaire_draft`;
CREATE TABLE `questionnaire_draft`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '草稿ID',
  `questionnaire_id` int(0) NOT NULL COMMENT '问卷ID',
  `user_id` int(0) NULL DEFAULT NULL COMMENT '用户ID（可为空，支持匿名草稿）',
  `session_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '会话ID（用于匿名用户）',
  `draft_data` json NOT NULL COMMENT '草稿数据（JSON格式）',
  `progress` int(0) NULL DEFAULT 0 COMMENT '填写进度（0-100）',
  `last_save_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '最后保存时间',
  `expire_time` datetime(0) NULL DEFAULT NULL COMMENT '过期时间（默认7天）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_questionnaire_id`(`questionnaire_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_session_id`(`session_id`) USING BTREE,
  INDEX `idx_expire_time`(`expire_time`) USING BTREE,
  CONSTRAINT `fk_draft_questionnaire` FOREIGN KEY (`questionnaire_id`) REFERENCES `question_create` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_draft_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问卷草稿表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for questionnaire_submission
-- ----------------------------
DROP TABLE IF EXISTS `questionnaire_submission`;
CREATE TABLE `questionnaire_submission`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '提交记录ID',
  `questionnaire_id` int(0) NOT NULL COMMENT '问卷ID',
  `user_id` int(0) NULL DEFAULT NULL COMMENT '用户ID（可为空，支持匿名填写）',
  `submitter_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '填写者姓名',
  `submitter_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '填写者邮箱',
  `submitter_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '填写者电话',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '提交IP地址',
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户代理信息',
  `start_time` datetime(0) NULL DEFAULT NULL COMMENT '开始填写时间',
  `submit_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '提交时间',
  `duration_seconds` int(0) NULL DEFAULT NULL COMMENT '填写时长（秒）',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态：1=有效，0=无效',
  `is_complete` tinyint(1) NULL DEFAULT 1 COMMENT '是否完整填写：1=是，0=否',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_questionnaire_id`(`questionnaire_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_submit_time`(`submit_time`) USING BTREE,
  INDEX `idx_ip_address`(`ip_address`) USING BTREE,
  CONSTRAINT `fk_submission_questionnaire` FOREIGN KEY (`questionnaire_id`) REFERENCES `question_create` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_submission_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问卷提交记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for rating_question
-- ----------------------------
DROP TABLE IF EXISTS `rating_question`;
CREATE TABLE `rating_question`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `question_id` int(0) NOT NULL COMMENT '关联问题ID（题型为4）',
  `min_score` int(0) NOT NULL DEFAULT 1 COMMENT '最低分值',
  `max_score` int(0) NOT NULL DEFAULT 5 COMMENT '最高分值',
  `min_label` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '非常不满意' COMMENT '最低分标签',
  `max_label` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '非常满意' COMMENT '最高分标签',
  `step` int(0) NULL DEFAULT 1 COMMENT '评分步长',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_question_id`(`question_id`) USING BTREE,
  CONSTRAINT `fk_rating_question_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '评分题配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for single_choice_answer
-- ----------------------------
DROP TABLE IF EXISTS `single_choice_answer`;
CREATE TABLE `single_choice_answer`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '答案ID',
  `answer_id` int(0) NOT NULL COMMENT '关联答案ID',
  `option_id` int(0) NOT NULL COMMENT '选择的选项ID',
  `option_content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '选项内容（冗余存储）',
  `created_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_answer_id`(`answer_id`) USING BTREE,
  INDEX `idx_option_id`(`option_id`) USING BTREE,
  CONSTRAINT `fk_single_answer_answer` FOREIGN KEY (`answer_id`) REFERENCES `question_answer` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_single_answer_option` FOREIGN KEY (`option_id`) REFERENCES `single_choice_option` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '单选题答案表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for single_choice_option
-- ----------------------------
DROP TABLE IF EXISTS `single_choice_option`;
CREATE TABLE `single_choice_option`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '选项ID',
  `question_id` int(0) NOT NULL COMMENT '关联问题ID（题型为1）',
  `option_content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '选项内容',
  `sort_num` int(0) NOT NULL DEFAULT 0 COMMENT '选项排序号',
  `is_default` tinyint(1) NULL DEFAULT 0 COMMENT '是否默认选项',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_question_id`(`question_id`) USING BTREE,
  CONSTRAINT `fk_single_option_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 32 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '单选题选项表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for text_question
-- ----------------------------
DROP TABLE IF EXISTS `text_question`;
CREATE TABLE `text_question`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `question_id` int(0) NOT NULL COMMENT '关联问题ID（题型为3）',
  `hint_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '提示文本',
  `max_length` int(0) NULL DEFAULT 500 COMMENT '最大输入长度',
  `input_type` tinyint(1) NULL DEFAULT 1 COMMENT '输入框类型：1=单行，2=多行',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_question_id`(`question_id`) USING BTREE,
  CONSTRAINT `fk_text_question_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问答题配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '登录用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '加密后的用户密码',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户手机号码',
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户头像URL',
  `role` int(0) NOT NULL DEFAULT 0 COMMENT '用户角色: 0=普通用户, 1=幼儿园教师',
  `last_login_time` datetime(0) NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_logout_time` datetime(0) NULL DEFAULT NULL COMMENT '最后退出时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户登录信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- View structure for questionnaire_content
-- ----------------------------
DROP VIEW IF EXISTS `questionnaire_content`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `questionnaire_content` AS select `qc`.`id` AS `questionnaire_id`,`qc`.`title` AS `questionnaire_title`,`qc`.`description` AS `questionnaire_desc`,`qc`.`submission_limit` AS `fill_limit`,`qc`.`start_date` AS `create_time`,`qc`.`end_date` AS `end_time`,`q`.`id` AS `question_id`,`q`.`content` AS `question_title`,`q`.`question_type` AS `question_type`,`q`.`sort_num` AS `question_sort`,(case `q`.`question_type` when 1 then '单选题' when 2 then '多选题' when 3 then '问答题' when 4 then '评分题' when 5 then '矩阵题' else '未知题型' end) AS `question_type_name`,(case when (`q`.`question_type` = 1) then (select group_concat(`sco`.`option_content` order by `sco`.`sort_num` ASC separator ';') from `single_choice_option` `sco` where (`sco`.`question_id` = `q`.`id`)) when (`q`.`question_type` = 2) then (select group_concat(`mco`.`option_content` order by `mco`.`sort_num` ASC separator ';') from `multiple_choice_option` `mco` where (`mco`.`question_id` = `q`.`id`)) when (`q`.`question_type` = 4) then (select concat('评分范围：',`rq`.`min_score`,'-',`rq`.`max_score`,'分（',`rq`.`min_label`,'-',`rq`.`max_label`,'）') from `rating_question` `rq` where (`rq`.`question_id` = `q`.`id`)) when (`q`.`question_type` = 5) then concat('矩阵行：',(select group_concat(`mr`.`row_content` order by `mr`.`sort_num` ASC separator ';') from `matrix_row` `mr` where (`mr`.`matrix_id` = `mq`.`id`)),'；矩阵列：',(select group_concat(`mc`.`column_content` order by `mc`.`sort_num` ASC separator ';') from `matrix_column` `mc` where (`mc`.`matrix_id` = `mq`.`id`))) else '无选项' end) AS `question_options` from ((`question_create` `qc` left join `question` `q` on((`qc`.`id` = `q`.`questionnaire_id`))) left join `matrix_question` `mq` on(((`q`.`id` = `mq`.`question_id`) and (`q`.`question_type` = 5)))) order by `qc`.`id`,`q`.`sort_num`;

SET FOREIGN_KEY_CHECKS = 1;
