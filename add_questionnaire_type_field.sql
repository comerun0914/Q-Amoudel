-- 添加问卷类型字段到 question_create 表
-- 执行此脚本前请备份数据库

USE `q-asystem`;

-- 添加 questionnaire_type 字段
ALTER TABLE `question_create` 
ADD COLUMN `questionnaire_type` tinyint(1) NOT NULL DEFAULT 0 
COMMENT '问卷类型：0-调查问卷、1-反馈问卷、2-评价问卷、3-其他';

-- 为现有数据设置默认值（调查问卷）
UPDATE `question_create` SET `questionnaire_type` = 0 WHERE `questionnaire_type` IS NULL;

-- 验证字段添加成功
DESCRIBE `question_create`;

-- 查看现有数据
SELECT id, title, questionnaire_type FROM `question_create` LIMIT 10;
