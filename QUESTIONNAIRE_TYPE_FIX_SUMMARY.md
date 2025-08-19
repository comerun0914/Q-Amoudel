# 问卷类型字段修复总结

## 问题描述
用户反馈：在创建问卷时选择"其他"问卷类型，但在数据库以及问卷编辑界面、问卷管理界面都显示"调查问卷"或空值。

## 根本原因分析
经过代码分析发现，问题的根本原因是：

1. **数据库表结构缺失**：`question_create` 表缺少 `questionnaire_type` 字段
2. **后端实体类缺失**：`QuestionCreate` 实体类没有对应的字段
3. **后端服务未处理**：创建和更新问卷时没有处理问卷类型字段
4. **前端映射失效**：前端虽然正确发送了问卷类型，但后端无法保存和返回

## 修复方案

### 1. 数据库层面修复
**文件**: `add_questionnaire_type_field.sql`
- 为 `question_create` 表添加 `questionnaire_type` 字段
- 字段类型：`tinyint(1) NOT NULL DEFAULT 0`
- 字段注释：`问卷类型：0-调查问卷、1-反馈问卷、2-评价问卷、3-其他`
- 为现有数据设置默认值（调查问卷）

**执行步骤**：
```sql
USE `q-asystem`;

-- 添加 questionnaire_type 字段
ALTER TABLE `question_create` 
ADD COLUMN `questionnaire_type` tinyint(1) NOT NULL DEFAULT 0 
COMMENT '问卷类型：0-调查问卷、1-反馈问卷、2-评价问卷、3-其他';

-- 为现有数据设置默认值（调查问卷）
UPDATE `question_create` SET `questionnaire_type` = 0 WHERE `questionnaire_type` IS NULL;
```

### 2. 后端实体类修复
**文件**: `src/main/java/com/shz/quick_qa_system/entity/QuestionCreate.java`
- 添加 `questionnaireType` 字段
- 添加对应的 getter/setter 方法（通过 Lombok 自动生成）

### 3. 后端服务修复
**文件**: `src/main/java/com/shz/quick_qa_system/service/impl/QuestionCreateServiceImpl.java`

#### 3.1 创建问卷时处理问卷类型
- 在 `createQuestionnaireWithQuestions` 方法中添加问卷类型处理逻辑
- 支持从请求中获取 `questionnaire_type` 字段
- 处理不同类型的数据转换（Integer、String）

#### 3.2 更新问卷时处理问卷类型
- 在 `updateQuestionnaireWithQuestions` 方法中添加问卷类型更新逻辑
- 支持更新现有问卷的问卷类型

#### 3.3 查询问卷时返回问卷类型
- 在 `getQuestionnaireList` 方法中添加 `questionnaire_type` 字段到返回结果
- 确保列表查询能正确返回问卷类型信息

### 4. 前端映射工具
**文件**: `vue3-questionnaire-system/src/utils/questionnaireTypeMapping.js`
- 提供中文字符串与数据库数字值的双向转换
- 包含验证和错误处理功能

### 5. 前端组件修复
以下组件已更新为使用新的映射工具：

- `QuestionnaireCreate.vue` - 创建时转换为数字值
- `QuestionnaireEdit.vue` - 编辑时双向转换
- `QuestionnaireManagement.vue` - 列表显示时转换为中文
- `QuestionnaireSuccess.vue` - 成功页面显示时转换
- `QuestionnairePreview.vue` - 预览时转换

## 测试验证

### 测试文件
**文件**: `test-questionnaire-type-backend-fix.html`
- 提供完整的后端功能测试
- 包含创建、查询、更新、列表等操作测试
- 实时显示操作日志和结果

### 测试步骤
1. 执行数据库修复脚本
2. 重启后端服务
3. 打开测试页面进行功能验证
4. 验证问卷类型在整个流程中的正确性

## 数据流程

### 创建问卷流程
1. 前端选择中文问卷类型（如"其他"）
2. 前端调用 `convertChineseTypeToNumber()` 转换为数字（3）
3. 发送到后端 `questionnaire_type: 3`
4. 后端保存到数据库 `questionnaire_type` 字段
5. 数据库存储为 `tinyint` 值 3

### 查询问卷流程
1. 后端从数据库读取 `questionnaire_type` 字段值（如 3）
2. 返回给前端 `questionnaire_type: 3`
3. 前端调用 `convertNumberToChineseType()` 转换为中文（"其他"）
4. 在界面上显示为"其他"

## 注意事项

1. **数据库备份**：执行修复脚本前请备份数据库
2. **服务重启**：修改后端代码后需要重启服务
3. **字段默认值**：现有问卷的问卷类型将设置为默认值 0（调查问卷）
4. **数据一致性**：确保前后端的问卷类型映射表保持一致

## 预期效果

修复完成后：
- 创建问卷时选择的问卷类型能正确保存到数据库
- 问卷管理界面能正确显示问卷类型
- 编辑问卷时能正确加载和保存问卷类型
- 整个数据流程保持一致性

## 后续验证

建议在修复完成后：
1. 创建不同问卷类型的问卷进行测试
2. 验证编辑功能是否正常工作
3. 检查问卷管理界面的显示是否正确
4. 确认数据库中的字段值是否符合预期
