# 问卷类型映射问题修复总结

## 问题描述

用户反馈：当选择"其他"问卷类型时，在创建成功界面显示正确，但在数据库和问卷管理界面查询时仍然显示"调查问卷"或空值，编辑问卷界面也显示空值。

## 问题分析

经过分析发现，问题的根本原因是：

1. **前端发送数据时**：直接发送中文字符串（如"其他"）到后端的 `questionnaire_type` 字段
2. **后端期望数据**：`questionnaire_type` 字段定义为 `tinyint(1)`，期望接收数字值（0-3）
3. **数据不一致**：前端发送中文，后端存储数字，导致数据映射错误
4. **显示问题**：从后端获取数据时，前端收到数字值但没有转换为中文显示

## 修复方案

### 1. 创建问卷类型映射工具

创建了 `src/utils/questionnaireTypeMapping.js` 文件，提供以下功能：

```javascript
// 问卷类型映射表
export const QUESTIONNAIRE_TYPE_MAP = {
  '调查问卷': 0,
  '反馈问卷': 1,
  '评价问卷': 2,
  '其他': 3
}

// 反向映射表
export const QUESTIONNAIRE_TYPE_REVERSE_MAP = {
  0: '调查问卷',
  1: '反馈问卷',
  2: '评价问卷',
  3: '其他'
}

// 核心转换函数
export function convertChineseTypeToNumber(chineseType) // 中文 -> 数字
export function convertNumberToChineseType(numberType) // 数字 -> 中文
```

### 2. 修复前端数据发送逻辑

#### QuestionnaireCreate.vue
- 在 `saveAsDraft` 和 `publishQuestionnaire` 函数中
- 将 `questionnaire_type: questionnaireInfo.type` 改为 `questionnaire_type: convertChineseTypeToNumber(questionnaireInfo.type)`
- 确保发送到后端的是数字值

#### QuestionnaireEdit.vue
- 在 `saveAsDraft` 和 `updateQuestionnaire` 函数中
- 同样使用 `convertChineseTypeToNumber` 转换
- 在 `fetchQuestionnaire` 函数中使用 `convertNumberToChineseType` 转换后端返回的数字值

### 3. 修复前端数据显示逻辑

#### QuestionnaireManagement.vue
- 在表格列定义中添加 `customRender` 函数
- 使用 `convertNumberToChineseType` 将数字值转换为中文显示

#### QuestionnaireSuccess.vue
- 在 `onMounted` 中检测类型值的格式
- 如果是数字，使用 `convertNumberToChineseType` 转换

#### QuestionnairePreview.vue
- 更新 `getQuestionnaireTypeName` 函数
- 支持数字和中文两种输入格式

## 修复后的数据流程

### 创建/编辑问卷时：
1. 用户选择中文问卷类型（如"其他"）
2. 前端使用 `convertChineseTypeToNumber("其他")` 转换为数字 3
3. 发送到后端：`questionnaire_type: 3`
4. 后端存储数字值 3

### 显示问卷信息时：
1. 后端返回：`questionnaire_type: 3`
2. 前端使用 `convertNumberToChineseType(3)` 转换为中文"其他"
3. 用户看到正确的"其他"类型

## 修复的文件列表

1. **新增文件**：
   - `src/utils/questionnaireTypeMapping.js` - 问卷类型映射工具

2. **修改文件**：
   - `src/views/QuestionnaireCreate.vue` - 创建问卷页面
   - `src/views/QuestionnaireEdit.vue` - 编辑问卷页面
   - `src/views/QuestionnaireManagement.vue` - 问卷管理页面
   - `src/views/QuestionnaireSuccess.vue` - 问卷成功页面
   - `src/views/QuestionnairePreview.vue` - 问卷预览页面

3. **测试文件**：
   - `test-questionnaire-type-mapping-fix.html` - 映射功能测试页面

## 测试验证

创建了测试页面 `test-questionnaire-type-mapping-fix.html`，包含以下测试：

1. **映射函数测试** - 验证转换函数是否正常工作
2. **创建表单测试** - 模拟创建问卷的数据转换
3. **编辑表单测试** - 模拟编辑问卷的数据转换
4. **表格显示测试** - 验证管理页面的类型显示
5. **完整流程测试** - 测试从创建到显示的完整数据流
6. **错误处理测试** - 验证边界情况的处理

## 预期效果

修复后，问卷类型的选择和显示应该：

1. ✅ 在创建问卷时，选择"其他"类型能正确保存为数字 3
2. ✅ 在问卷管理界面，显示正确的"其他"类型
3. ✅ 在编辑问卷时，正确加载和显示"其他"类型
4. ✅ 在问卷成功页面，正确显示"其他"类型
5. ✅ 数据在前后端之间正确转换，保持一致性

## 注意事项

1. **数据库字段**：确保 `questionnaire_type` 字段定义为 `tinyint(1)`
2. **默认值**：未选择类型时默认为 0（调查问卷）
3. **错误处理**：无效类型会回退到默认值
4. **向后兼容**：支持现有的数字类型数据

## 总结

通过创建统一的问卷类型映射工具，修复了前端中文显示值和后端数字存储值之间的转换问题。现在问卷类型在整个系统中应该能够正确保存、检索和显示，解决了用户反馈的数据不一致问题。
