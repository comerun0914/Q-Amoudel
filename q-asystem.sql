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

 Date: 16/08/2025 00:44:54
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
-- Records of login_history
-- ----------------------------
INSERT INTO `login_history` VALUES (1, 1, '2025-08-02 18:08:38', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 1);
INSERT INTO `login_history` VALUES (2, 2, '2025-08-02 18:08:38', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 1);

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
-- Records of matrix_answer
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 73543324 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '矩阵题列表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of matrix_column
-- ----------------------------
INSERT INTO `matrix_column` VALUES (13730005, 84639547, '不满意', 4, NULL);
INSERT INTO `matrix_column` VALUES (15561299, 16032990, '逻辑完成', 2, NULL);
INSERT INTO `matrix_column` VALUES (25612933, 41726087, '列1', 1, NULL);
INSERT INTO `matrix_column` VALUES (36703896, 16032990, '界面完成', 1, NULL);
INSERT INTO `matrix_column` VALUES (38009250, 54363793, '技术', 2, NULL);
INSERT INTO `matrix_column` VALUES (43665229, 54363793, '颜值', 1, NULL);
INSERT INTO `matrix_column` VALUES (45766358, 84639547, '非常满意', 1, NULL);
INSERT INTO `matrix_column` VALUES (46210153, 84639547, '非常不满意', 5, NULL);
INSERT INTO `matrix_column` VALUES (53974105, 84639547, '满意', 2, NULL);
INSERT INTO `matrix_column` VALUES (73543324, 41726087, '列2', 2, NULL);
INSERT INTO `matrix_column` VALUES (86486114, 84639547, '一般', 3, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 99348303 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '矩阵题主体表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of matrix_question
-- ----------------------------
INSERT INTO `matrix_question` VALUES (2, 38, 1, '');
INSERT INTO `matrix_question` VALUES (3, 43, 1, '');
INSERT INTO `matrix_question` VALUES (16032990, 91689644, 1, NULL);
INSERT INTO `matrix_question` VALUES (41726087, 57099023, 1, NULL);
INSERT INTO `matrix_question` VALUES (54363793, 43937394, 1, NULL);
INSERT INTO `matrix_question` VALUES (84639547, 33, 1, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 95940313 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '矩阵题行表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of matrix_row
-- ----------------------------
INSERT INTO `matrix_row` VALUES (5, 2, '教学质量', 1);
INSERT INTO `matrix_row` VALUES (6, 3, '教学质量', 1);
INSERT INTO `matrix_row` VALUES (22636763, 84639547, '安全保障', 3);
INSERT INTO `matrix_row` VALUES (25506887, 84639547, '教学质量', 1);
INSERT INTO `matrix_row` VALUES (30569246, 41726087, '行1', 1);
INSERT INTO `matrix_row` VALUES (30610313, 84639547, '环境卫生', 2);
INSERT INTO `matrix_row` VALUES (61934503, 41726087, '行2', 2);
INSERT INTO `matrix_row` VALUES (74568829, 84639547, '沟通服务', 4);
INSERT INTO `matrix_row` VALUES (75844797, 16032990, '用户', 2);
INSERT INTO `matrix_row` VALUES (78298657, 54363793, '软实力', 2);
INSERT INTO `matrix_row` VALUES (84317654, 54363793, '硬实力', 1);
INSERT INTO `matrix_row` VALUES (94132934, 16032990, '管理', 1);

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
-- Records of multiple_choice_answer
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 99722282 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '多选题选项表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of multiple_choice_option
-- ----------------------------
INSERT INTO `multiple_choice_option` VALUES (4, 6, '选项A', 1);
INSERT INTO `multiple_choice_option` VALUES (5, 6, '选项B', 2);
INSERT INTO `multiple_choice_option` VALUES (6, 10, '选项A', 1);
INSERT INTO `multiple_choice_option` VALUES (7, 10, '选项B', 2);
INSERT INTO `multiple_choice_option` VALUES (24, 35, '1', 1);
INSERT INTO `multiple_choice_option` VALUES (25, 35, '12', 2);
INSERT INTO `multiple_choice_option` VALUES (26, 40, '12', 1);
INSERT INTO `multiple_choice_option` VALUES (27, 40, '12', 2);
INSERT INTO `multiple_choice_option` VALUES (15893386, 19579764, '我觉得很好', 3);
INSERT INTO `multiple_choice_option` VALUES (20875090, 26336205, '迷人', 3);
INSERT INTO `multiple_choice_option` VALUES (21617681, 68965981, 'D', 4);
INSERT INTO `multiple_choice_option` VALUES (31670022, 30, '苹果', 1);
INSERT INTO `multiple_choice_option` VALUES (32067971, 68965981, 'C', 3);
INSERT INTO `multiple_choice_option` VALUES (37282866, 19579764, '简洁', 1);
INSERT INTO `multiple_choice_option` VALUES (41430398, 30, '香蕉', 2);
INSERT INTO `multiple_choice_option` VALUES (50182199, 19579764, '你猜', 4);
INSERT INTO `multiple_choice_option` VALUES (62633004, 26336205, '帅', 1);
INSERT INTO `multiple_choice_option` VALUES (73916771, 26336205, '有魅力', 4);
INSERT INTO `multiple_choice_option` VALUES (85764997, 30, '橙子', 3);
INSERT INTO `multiple_choice_option` VALUES (87711775, 68965981, 'B', 2);
INSERT INTO `multiple_choice_option` VALUES (87861293, 19579764, '实用性高', 2);
INSERT INTO `multiple_choice_option` VALUES (90273465, 30, '葡萄', 4);
INSERT INTO `multiple_choice_option` VALUES (92025506, 26336205, '好看', 2);
INSERT INTO `multiple_choice_option` VALUES (93406357, 68965981, 'A', 1);

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
) ENGINE = InnoDB AUTO_INCREMENT = 91689645 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问题基础表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of question
-- ----------------------------
INSERT INTO `question` VALUES (4, 44432901, '测试单选题', 1, 1, 1, '2025-08-03 22:20:56', '2025-08-03 22:20:56');
INSERT INTO `question` VALUES (5, 39244814, '测试单选题', 1, 1, 1, '2025-08-03 22:21:10', '2025-08-03 22:21:10');
INSERT INTO `question` VALUES (6, 39244814, '测试多选题', 2, 2, 1, '2025-08-03 22:21:10', '2025-08-03 22:21:10');
INSERT INTO `question` VALUES (7, 39244814, '测试填空题', 3, 3, 1, '2025-08-03 22:21:10', '2025-08-03 22:21:10');
INSERT INTO `question` VALUES (8, 45352041, '测试单选题', 1, 1, 1, '2025-08-03 22:25:50', '2025-08-03 22:25:50');
INSERT INTO `question` VALUES (9, 69180575, '测试单选题', 1, 1, 1, '2025-08-03 22:25:57', '2025-08-03 22:25:57');
INSERT INTO `question` VALUES (10, 69180575, '测试多选题', 2, 2, 1, '2025-08-03 22:25:57', '2025-08-03 22:25:57');
INSERT INTO `question` VALUES (11, 69180575, '测试填空题', 3, 3, 1, '2025-08-03 22:25:57', '2025-08-03 22:25:57');
INSERT INTO `question` VALUES (29, 75452256, '您的性别？', 1, 1, 1, '2025-08-05 11:11:04', '2025-08-15 06:44:55');
INSERT INTO `question` VALUES (30, 75452256, '您喜欢的水果有哪些？', 2, 2, 1, '2025-08-05 11:11:04', '2025-08-15 06:44:55');
INSERT INTO `question` VALUES (31, 75452256, '请描述您对幼儿园的建议：', 3, 3, 1, '2025-08-05 11:11:04', '2025-08-15 06:44:55');
INSERT INTO `question` VALUES (32, 75452256, '您对幼儿园的整体满意度评分：', 4, 4, 1, '2025-08-05 11:11:04', '2025-08-15 06:44:55');
INSERT INTO `question` VALUES (33, 75452256, '请评价以下各项服务：', 5, 5, 1, '2025-08-05 11:11:04', '2025-08-15 06:44:55');
INSERT INTO `question` VALUES (34, 82185434, '测试111', 1, 1, 1, '2025-08-05 11:16:34', '2025-08-05 11:16:34');
INSERT INTO `question` VALUES (35, 82185434, '测试222', 2, 2, 1, '2025-08-05 11:16:34', '2025-08-05 11:16:34');
INSERT INTO `question` VALUES (36, 82185434, '测试333', 3, 3, 1, '2025-08-05 11:16:34', '2025-08-05 11:16:34');
INSERT INTO `question` VALUES (37, 82185434, '测试444', 4, 4, 1, '2025-08-05 11:16:34', '2025-08-05 11:16:34');
INSERT INTO `question` VALUES (38, 82185434, '测试555', 5, 5, 1, '2025-08-05 11:16:34', '2025-08-05 11:16:34');
INSERT INTO `question` VALUES (39, 99784683, '123', 1, 1, 1, '2025-08-05 11:22:14', '2025-08-05 11:22:14');
INSERT INTO `question` VALUES (40, 99784683, '123', 2, 2, 1, '2025-08-05 11:22:14', '2025-08-05 11:22:14');
INSERT INTO `question` VALUES (41, 99784683, '123', 3, 3, 1, '2025-08-05 11:22:14', '2025-08-05 11:22:14');
INSERT INTO `question` VALUES (42, 99784683, '123', 4, 4, 1, '2025-08-05 11:22:14', '2025-08-05 11:22:14');
INSERT INTO `question` VALUES (43, 99784683, '123', 5, 5, 1, '2025-08-05 11:22:14', '2025-08-05 11:22:14');
INSERT INTO `question` VALUES (44, 50422017, '1231231', 1, 1, 1, '2025-08-05 11:35:00', '2025-08-05 11:35:00');
INSERT INTO `question` VALUES (19579764, 43549892, '代码的优点有哪些', 2, 2, 1, '2025-08-13 17:45:52', '2025-08-13 17:47:16');
INSERT INTO `question` VALUES (26336205, 20330156, '作者有什么优点', 2, 2, 1, '2025-08-13 18:01:58', '2025-08-13 18:03:20');
INSERT INTO `question` VALUES (29315434, 43549892, '给自己代码打个分', 4, 4, 1, '2025-08-13 17:45:43', '2025-08-13 17:47:16');
INSERT INTO `question` VALUES (42110414, 33135201, '单选题1', 1, 1, 1, '2025-08-13 17:24:42', '2025-08-13 17:26:08');
INSERT INTO `question` VALUES (43937394, 20330156, '作者有什么优点', 5, 5, 1, '2025-08-13 18:01:50', '2025-08-13 18:03:20');
INSERT INTO `question` VALUES (53236726, 20330156, '作者的业务能力', 4, 4, 1, '2025-08-13 18:02:40', '2025-08-13 18:03:20');
INSERT INTO `question` VALUES (56768078, 20330156, '作者帅不帅', 1, 1, 1, '2025-08-13 18:01:10', '2025-08-13 18:03:20');
INSERT INTO `question` VALUES (57099023, 33135201, '矩阵题去', 5, 5, 1, '2025-08-13 17:25:29', '2025-08-13 17:26:08');
INSERT INTO `question` VALUES (64990095, 33135201, '评分题1', 4, 4, 1, '2025-08-13 17:25:48', '2025-08-13 17:26:08');
INSERT INTO `question` VALUES (66335068, 43549892, '说出代码的不足', 3, 3, 1, '2025-08-13 17:45:46', '2025-08-13 17:47:16');
INSERT INTO `question` VALUES (68965981, 33135201, '多选题1', 2, 2, 1, '2025-08-13 17:25:09', '2025-08-13 17:26:08');
INSERT INTO `question` VALUES (85330090, 33135201, '问答题1', 3, 3, 1, '2025-08-13 17:25:29', '2025-08-13 17:26:08');
INSERT INTO `question` VALUES (86299955, 43549892, '代码写的快不快', 1, 1, 1, '2025-08-13 17:45:39', '2025-08-13 17:47:16');
INSERT INTO `question` VALUES (86788295, 20330156, '请简述作者的优点', 3, 3, 1, '2025-08-13 18:02:22', '2025-08-13 18:03:20');
INSERT INTO `question` VALUES (91689644, 43549892, '代码的情况', 5, 5, 1, '2025-08-13 17:45:40', '2025-08-13 17:47:16');

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
) ENGINE = InnoDB AUTO_INCREMENT = 1128911588 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问题答案详情表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of question_answer
-- ----------------------------
INSERT INTO `question_answer` VALUES (12, 5, 86299955, 1, '{\"value\": 0}', '2025-08-13 17:47:44');
INSERT INTO `question_answer` VALUES (13, 5, 19579764, 2, '{\"1\": 2}', '2025-08-13 17:47:44');
INSERT INTO `question_answer` VALUES (14, 5, 66335068, 3, '{\"text\": \"没有\"}', '2025-08-13 17:47:44');
INSERT INTO `question_answer` VALUES (15, 5, 29315434, 4, '{\"value\": 4}', '2025-08-13 17:47:44');
INSERT INTO `question_answer` VALUES (16, 5, 91689644, 5, '{\"0\": 1, \"1\": 0}', '2025-08-13 17:47:44');
INSERT INTO `question_answer` VALUES (37679214, 2058599231, 56768078, 1, '{\"value\": 2}', '2025-08-13 18:03:48');
INSERT INTO `question_answer` VALUES (289550727, 2058599231, 43937394, 5, '{\"0\": 1, \"1\": 0}', '2025-08-13 18:03:48');
INSERT INTO `question_answer` VALUES (321605074, 2058599231, 26336205, 2, '{\"1\": 3, \"2\": 2, \"3\": 1, \"4\": 0}', '2025-08-13 18:03:48');
INSERT INTO `question_answer` VALUES (1017025078, 2058599231, 86788295, 3, '{\"text\": \"没有\"}', '2025-08-13 18:03:48');
INSERT INTO `question_answer` VALUES (1128911588, 2058599231, 53236726, 4, '{\"value\": 4}', '2025-08-13 18:03:48');

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
) ENGINE = InnoDB AUTO_INCREMENT = 99784684 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '创建问卷表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of question_create
-- ----------------------------
INSERT INTO `question_create` VALUES (20330156, '测试最终版1111', '111', '2025-08-13', '2025-09-12', 1, 1, 1, '2025-08-13 18:00:26', '2025-08-13 18:03:19');
INSERT INTO `question_create` VALUES (26698693, '测试11111111', '111', '2025-08-05', '2025-09-04', 1, 1, 1, '2025-08-05 10:09:21', '2025-08-05 10:09:21');
INSERT INTO `question_create` VALUES (26906200, '测试000', '12', '2025-08-03', '2025-08-10', 1, 1, 1, '2025-08-03 22:13:37', '2025-08-03 22:13:37');
INSERT INTO `question_create` VALUES (33135201, '测试8.13', 'v1.0', '2025-08-13', '2025-09-12', 1, 1, 1, '2025-08-13 17:24:03', '2025-08-13 17:26:08');
INSERT INTO `question_create` VALUES (36959501, '测试21321', '213', '2025-08-05', '2025-09-04', 1, 1, 1, '2025-08-05 10:16:37', '2025-08-05 10:16:37');
INSERT INTO `question_create` VALUES (39244814, '测试问卷', '这是一个测试问卷', '2025-01-01', '2025-12-31', 1, 1, 1, '2025-08-03 22:21:10', '2025-08-03 22:21:10');
INSERT INTO `question_create` VALUES (40394429, 'text', '1111', '2025-08-03', '2025-08-10', 1, 1, 1, '2025-08-03 19:30:17', '2025-08-03 19:30:17');
INSERT INTO `question_create` VALUES (43549892, '测试8.13333', 'v2.0', '2025-08-13', '2025-09-12', 2, 1, 1, '2025-08-13 17:44:28', '2025-08-13 17:47:15');
INSERT INTO `question_create` VALUES (44432901, '测试问卷', '这是一个测试问卷', '2025-01-01', '2025-12-31', 100, 1, 1, '2025-08-03 22:20:56', '2025-08-03 22:20:56');
INSERT INTO `question_create` VALUES (45352041, '测试问卷', '这是一个测试问卷', '2025-01-01', '2025-12-31', 100, 1, 1, '2025-08-03 22:25:50', '2025-08-03 22:25:50');
INSERT INTO `question_create` VALUES (49759830, 'buyao', '123', '2025-08-05', '2025-09-04', 1, 1, 1, '2025-08-05 11:34:43', '2025-08-05 11:34:43');
INSERT INTO `question_create` VALUES (50422017, 'buyao', '123', '2025-01-01', '2025-12-31', 100, 1, 1, '2025-08-05 11:35:00', '2025-08-05 11:35:00');
INSERT INTO `question_create` VALUES (52648442, 'xczxc', 'sdadas', '2025-08-04', '2025-09-03', 1, 1, 1, '2025-08-04 20:32:03', '2025-08-04 20:32:03');
INSERT INTO `question_create` VALUES (58064651, '????', '????', '2025-01-01', '2025-12-31', 1, 1, 1, '2025-08-05 11:15:19', '2025-08-05 11:15:19');
INSERT INTO `question_create` VALUES (60813289, '测试000', '12', '2025-08-03', '2025-08-10', 1, 1, 1, '2025-08-03 22:12:46', '2025-08-03 22:12:46');
INSERT INTO `question_create` VALUES (62395136, 'v1.1', '111', '2025-08-05', '2025-09-04', 1, 1, 1, '2025-08-05 10:29:48', '2025-08-05 10:29:48');
INSERT INTO `question_create` VALUES (67551144, '测试000', '12', '2025-08-03', '2025-08-10', 1, 1, 1, '2025-08-03 21:39:35', '2025-08-03 21:39:35');
INSERT INTO `question_create` VALUES (69180575, '测试问卷', '这是一个测试问卷', '2025-01-01', '2025-12-31', 1, 1, 1, '2025-08-03 22:25:57', '2025-08-03 22:25:57');
INSERT INTO `question_create` VALUES (75452256, '综合题型测试问卷', '这是一个测试各种题型的问卷，包含单选题、多选题、问答题、评分题和矩阵题', '2025-01-01', '2025-12-31', 100, 1, 1, '2025-08-05 11:11:04', '2025-08-05 11:11:04');
INSERT INTO `question_create` VALUES (82185434, '吃吃吃12', '12', '2025-01-01', '2025-12-31', 100, 1, 1, '2025-08-05 11:16:34', '2025-08-05 11:16:34');
INSERT INTO `question_create` VALUES (88138012, 'qqqwww', 'qwe', '2025-08-05', '2025-09-04', 1, 1, 1, '2025-08-05 10:02:18', '2025-08-05 10:02:18');
INSERT INTO `question_create` VALUES (88591352, '吃吃吃12', '12', '2025-08-05', '2025-09-04', 1, 1, 1, '2025-08-05 11:15:54', '2025-08-05 11:15:54');
INSERT INTO `question_create` VALUES (93002209, '测试1', 'xxxxxxxxxxx', '2025-08-05', '2025-09-04', 1, 1, 1, '2025-08-05 10:08:16', '2025-08-05 10:08:16');
INSERT INTO `question_create` VALUES (95646719, '123123123', '123', '2025-08-05', '2025-09-04', 1, 1, 1, '2025-08-05 10:05:04', '2025-08-05 10:05:04');
INSERT INTO `question_create` VALUES (99438756, '用户问卷创建', '123', '2025-08-13', '2025-09-12', 1, 2, 2, '2025-08-13 16:00:35', '2025-08-13 16:00:35');
INSERT INTO `question_create` VALUES (99784683, 'bucbuc', '123', '2025-01-01', '2025-12-31', 100, 1, 1, '2025-08-05 11:22:14', '2025-08-05 11:22:14');

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
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问卷草稿表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of questionnaire_draft
-- ----------------------------
INSERT INTO `questionnaire_draft` VALUES (3, 75452256, 2, 'sess_xugzxhi9u2a1755075592951', '{\"29\": 0, \"30\": [0], \"31\": \"测试\", \"32\": 5, \"33\": {\"0\": 1, \"1\": 2, \"2\": 3, \"3\": 4}}', 100, '2025-08-13 17:44:03', '2025-08-20 17:44:03');
INSERT INTO `questionnaire_draft` VALUES (4, 82185434, 2, 'sess_n2otau24rt1755076967507', '{\"34\": 0, \"35\": [], \"36\": \"测试\", \"37\": 5}', 80, '2025-08-13 17:23:36', '2025-08-20 17:23:36');
INSERT INTO `questionnaire_draft` VALUES (5, 33135201, 1, 'sess_btayyjhgjan1755077175140', '{\"42110414\": 0, \"57099023\": {\"0\": 1, \"1\": 0}, \"64990095\": 4, \"68965981\": [], \"85330090\": \"厕所\"}', 100, '2025-08-13 17:26:31', '2025-08-20 17:26:31');

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
) ENGINE = InnoDB AUTO_INCREMENT = 2058599232 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问卷提交记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of questionnaire_submission
-- ----------------------------
INSERT INTO `questionnaire_submission` VALUES (2, 75452256, 2, NULL, NULL, NULL, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0', '2025-08-13 08:52:27', '2025-08-13 16:52:44', 17, 1, 1);
INSERT INTO `questionnaire_submission` VALUES (3, 50422017, 2, NULL, NULL, NULL, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0', '2025-08-13 08:59:58', '2025-08-13 17:00:01', 3, 1, 1);
INSERT INTO `questionnaire_submission` VALUES (4, 33135201, 2, NULL, NULL, NULL, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0', '2025-08-13 09:26:48', '2025-08-13 17:27:11', 23, 1, 1);
INSERT INTO `questionnaire_submission` VALUES (5, 43549892, 2, NULL, NULL, NULL, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0', '2025-08-13 09:47:29', '2025-08-13 17:47:44', 15, 1, 1);
INSERT INTO `questionnaire_submission` VALUES (2058599231, 20330156, 2, NULL, NULL, NULL, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0', '2025-08-13 10:03:30', '2025-08-13 18:03:48', 18, 1, 1);

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
) ENGINE = InnoDB AUTO_INCREMENT = 97352309 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '评分题配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rating_question
-- ----------------------------
INSERT INTO `rating_question` VALUES (2, 37, 1, 5, '非常不满意', '非常满意', 1);
INSERT INTO `rating_question` VALUES (3, 42, 1, 5, '非常不满意', '非常满意', 1);
INSERT INTO `rating_question` VALUES (19988211, 53236726, 1, 5, '非常不满意', '非常满意', 1);
INSERT INTO `rating_question` VALUES (67561044, 32, 1, 5, '非常不满意', '非常满意', 1);
INSERT INTO `rating_question` VALUES (72081599, 29315434, 1, 5, '非常不满意', '非常满意', 1);
INSERT INTO `rating_question` VALUES (96515902, 64990095, 1, 5, '非常不满意', '非常满意', 1);

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
-- Records of single_choice_answer
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 99637753 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '单选题选项表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of single_choice_option
-- ----------------------------
INSERT INTO `single_choice_option` VALUES (3, 4, '选项1', 1, 0);
INSERT INTO `single_choice_option` VALUES (4, 4, '选项2', 2, 0);
INSERT INTO `single_choice_option` VALUES (5, 5, '选项1', 1, 0);
INSERT INTO `single_choice_option` VALUES (6, 5, '选项2', 2, 0);
INSERT INTO `single_choice_option` VALUES (7, 8, '选项1', 1, 0);
INSERT INTO `single_choice_option` VALUES (8, 8, '选项2', 2, 0);
INSERT INTO `single_choice_option` VALUES (9, 9, '选项1', 1, 0);
INSERT INTO `single_choice_option` VALUES (10, 9, '选项2', 2, 0);
INSERT INTO `single_choice_option` VALUES (27, 34, '1', 1, 0);
INSERT INTO `single_choice_option` VALUES (28, 34, '12', 2, 0);
INSERT INTO `single_choice_option` VALUES (29, 39, '12', 1, 0);
INSERT INTO `single_choice_option` VALUES (30, 39, '12', 2, 0);
INSERT INTO `single_choice_option` VALUES (31, 44, '12123', 1, 0);
INSERT INTO `single_choice_option` VALUES (32, 44, '123123', 2, 0);
INSERT INTO `single_choice_option` VALUES (20399816, 56768078, '不帅', 2, 0);
INSERT INTO `single_choice_option` VALUES (26691101, 42110414, 'D', 4, 0);
INSERT INTO `single_choice_option` VALUES (29152533, 29, '男', 1, 0);
INSERT INTO `single_choice_option` VALUES (31784624, 86299955, '不快', 2, 0);
INSERT INTO `single_choice_option` VALUES (61942169, 56768078, '帅', 1, 0);
INSERT INTO `single_choice_option` VALUES (81206920, 42110414, 'B', 2, 0);
INSERT INTO `single_choice_option` VALUES (82045845, 56768078, '没我帅', 3, 0);
INSERT INTO `single_choice_option` VALUES (82949182, 42110414, 'A', 1, 0);
INSERT INTO `single_choice_option` VALUES (85505669, 29, '女', 2, 0);
INSERT INTO `single_choice_option` VALUES (91845451, 56768078, '一般般', 4, 0);
INSERT INTO `single_choice_option` VALUES (92284313, 42110414, 'C', 3, 0);
INSERT INTO `single_choice_option` VALUES (93733332, 86299955, '快', 1, 0);

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
) ENGINE = InnoDB AUTO_INCREMENT = 99767404 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问答题配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of text_question
-- ----------------------------
INSERT INTO `text_question` VALUES (2, 36, '', 500, 1);
INSERT INTO `text_question` VALUES (3, 41, '', 500, 1);
INSERT INTO `text_question` VALUES (23053598, 66335068, '没有', 500, 1);
INSERT INTO `text_question` VALUES (38052654, 85330090, '测试', 500, 1);
INSERT INTO `text_question` VALUES (47784513, 86788295, '你知道的', 500, 1);
INSERT INTO `text_question` VALUES (94018130, 31, '请详细描述您的建议', 500, 2);

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
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', 'admin123', '13800138000', NULL, 1, '2025-08-16 00:14:49', '2025-08-15 01:34:29');
INSERT INTO `users` VALUES (2, 'user1', 'user123', '13800138001', NULL, 0, '2025-08-15 01:34:31', '2025-08-15 02:27:58');
INSERT INTO `users` VALUES (3, 'teacher1', 'teacher123', '13800138002', NULL, 1, NULL, NULL);

-- ----------------------------
-- View structure for questionnaire_content
-- ----------------------------
DROP VIEW IF EXISTS `questionnaire_content`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `questionnaire_content` AS select `qc`.`id` AS `questionnaire_id`,`qc`.`title` AS `questionnaire_title`,`qc`.`description` AS `questionnaire_desc`,`qc`.`submission_limit` AS `fill_limit`,`qc`.`start_date` AS `create_time`,`qc`.`end_date` AS `end_time`,`q`.`id` AS `question_id`,`q`.`content` AS `question_title`,`q`.`question_type` AS `question_type`,`q`.`sort_num` AS `question_sort`,(case `q`.`question_type` when 1 then '单选题' when 2 then '多选题' when 3 then '问答题' when 4 then '评分题' when 5 then '矩阵题' else '未知题型' end) AS `question_type_name`,(case when (`q`.`question_type` = 1) then (select group_concat(`sco`.`option_content` order by `sco`.`sort_num` ASC separator ';') from `single_choice_option` `sco` where (`sco`.`question_id` = `q`.`id`)) when (`q`.`question_type` = 2) then (select group_concat(`mco`.`option_content` order by `mco`.`sort_num` ASC separator ';') from `multiple_choice_option` `mco` where (`mco`.`question_id` = `q`.`id`)) when (`q`.`question_type` = 4) then (select concat('评分范围：',`rq`.`min_score`,'-',`rq`.`max_score`,'分（',`rq`.`min_label`,'-',`rq`.`max_label`,'）') from `rating_question` `rq` where (`rq`.`question_id` = `q`.`id`)) when (`q`.`question_type` = 5) then concat('矩阵行：',(select group_concat(`mr`.`row_content` order by `mr`.`sort_num` ASC separator ';') from `matrix_row` `mr` where (`mr`.`matrix_id` = `mq`.`id`)),'；矩阵列：',(select group_concat(`mc`.`column_content` order by `mc`.`sort_num` ASC separator ';') from `matrix_column` `mc` where (`mc`.`matrix_id` = `mq`.`id`))) else '无选项' end) AS `question_options` from ((`question_create` `qc` left join `question` `q` on((`qc`.`id` = `q`.`questionnaire_id`))) left join `matrix_question` `mq` on(((`q`.`id` = `mq`.`question_id`) and (`q`.`question_type` = 5)))) order by `qc`.`id`,`q`.`sort_num`;

SET FOREIGN_KEY_CHECKS = 1;
