# 问卷管理系统 - 问卷创建问题修复说明

## 问题描述

在创建问卷时，能够正常创建问卷基本信息，但是**题目和选项没有上传到数据库**，导致预览时看不到题目信息。

## 问题分析

### 1. 根本原因

**接口调用不匹配**：
- 前端调用的是 `/questionCreate/create` 接口
- 但后端的 `create` 方法只保存问卷基本信息，不处理问题数据
- 后端有 `createWithQuestions` 方法可以保存问卷+问题，但前端没有调用

### 2. 技术细节

**后端接口对比**：

**`/create` 接口**：
```java
@PostMapping("/create")
public ApiResult CreateQuestion(@RequestBody QuestionCreate questionCreate) {
    // 只保存问卷基本信息，不处理问题数据
    QuestionCreate createdQuestion = questionCreateServiceImpl.CreateQuestion(questionCreate);
    return ApiResult.successQuestionnaire(createdQuestion, creatorName);
}
```

**`/createWithQuestions` 接口**：
```java
@PostMapping("/createWithQuestions")
public ApiResult createQuestionnaireWithQuestions(@RequestBody Map<String, Object> request) {
    // 保存问卷基本信息 + 问题数据 + 选项数据
    QuestionCreate result = questionCreateServiceImpl.createQuestionnaireWithQuestions(request);
    return ApiResult.success(result);
}
```

## 修复方案

### 方案1：修改前端配置（已实施）

**修改前**：
```javascript
QUESTIONNAIRE_CREATE: '/questionCreate/create'
```

**修改后**：
```javascript
QUESTIONNAIRE_CREATE: '/questionCreate/createWithQuestions'
```

**修改文件**：`vue3-questionnaire-system/src/api/config.js`

### 方案2：修改后端create方法（备选方案）

如果不想修改前端配置，可以修改后端的 `create` 方法，让它也能处理问题数据。

## 修复步骤

### 1. 前端修复

1. **修改API配置**
   - 文件：`vue3-questionnaire-system/src/api/config.js`
   - 操作：将 `QUESTIONNAIRE_CREATE` 从 `/questionCreate/create` 改为 `/questionCreate/createWithQuestions`

2. **验证修复**
   - 重启前端服务
   - 创建新问卷，包含多个问题
   - 检查预览时是否能看到题目信息

### 2. 后端验证

1. **确认接口可用**
   - 检查 `StatisticsController` 的 CORS 问题是否已修复
   - 确认 `/questionCreate/createWithQuestions` 接口正常工作

2. **检查数据库**
   - 确认 `question` 表有数据
   - 确认 `single_choice_option`、`multiple_choice_option` 等表有数据

## 测试验证

### 1. 创建测试页面

创建了 `test-questionnaire-create-fix.html` 用于验证修复效果：

- **问卷创建测试**：创建包含多种题型的测试问卷
- **问题数据验证**：验证问题是否正确保存到数据库
- **实时日志**：显示测试过程和结果

### 2. 测试步骤

1. **访问测试页面**：`http://localhost:7070/test-questionnaire-create-fix.html`
2. **填写问卷信息**：标题、描述、时间等
3. **添加测试问题**：单选题、多选题、问答题等
4. **创建问卷**：点击"创建问卷"按钮
5. **验证问题数据**：点击"验证问题数据"按钮

### 3. 预期结果

修复成功后应该看到：

- ✅ 问卷创建成功，返回问卷ID
- ✅ 问题数据验证成功，显示问题数量
- ✅ 预览时能看到所有题目和选项
- ✅ 数据库中 `question` 表有对应记录
- ✅ 数据库中选项表有对应记录

## 数据结构说明

### 1. 问题数据结构

```javascript
{
  content: "问题标题",
  questionType: 1, // 1:单选题 2:多选题 3:问答题 4:评分题 5:矩阵题
  sortNum: 1,      // 排序号
  isRequired: 1,   // 是否必填 1:是 0:否
  options: [       // 选项数据（单选题和多选题）
    {
      optionContent: "选项内容",
      sortNum: 1,
      isDefault: 0
    }
  ]
}
```

### 2. 数据库表关系

```
question_create (问卷表)
    ↓
question (问题表) - questionnaire_id 关联
    ↓
single_choice_option (单选题选项表) - question_id 关联
multiple_choice_option (多选题选项表) - question_id 关联
text_question (问答题配置表) - question_id 关联
rating_question (评分题配置表) - question_id 关联
matrix_question (矩阵题配置表) - question_id 关联
```

## 注意事项

### 1. 接口兼容性

**修改后影响**：
- 前端所有调用 `QUESTIONNAIRE_CREATE` 的地方都会使用新接口
- 需要确保后端 `createWithQuestions` 接口稳定可用

**回滚方案**：
- 如果新接口有问题，可以临时改回原来的 `/create` 接口
- 或者修改后端 `create` 方法支持问题数据

### 2. 数据验证

**前端验证**：
- 确保问题数据格式正确
- 单选题和多选题必须有选项
- 矩阵题必须有行列数据

**后端验证**：
- 验证问题数据完整性
- 处理选项数据的保存
- 事务回滚机制

### 3. 性能考虑

**批量操作**：
- 问题数量较多时，考虑批量插入
- 使用数据库事务确保数据一致性

## 调试建议

### 1. 问题排查步骤

1. **检查前端请求**：确认调用的是 `createWithQuestions` 接口
2. **检查后端日志**：查看问题数据是否正确接收
3. **检查数据库**：确认相关表是否有数据
4. **检查预览接口**：确认问题数据是否正确返回

### 2. 常见问题

**问题1：接口404错误**
- 检查后端是否有 `createWithQuestions` 接口
- 检查URL路径是否正确

**问题2：问题数据为空**
- 检查前端数据格式是否正确
- 检查后端数据解析逻辑

**问题3：选项数据丢失**
- 检查选项数据格式
- 检查选项保存逻辑

## 总结

通过修改前端API配置，将问卷创建接口从 `/create` 改为 `/createWithQuestions`，解决了题目和选项数据不保存的问题：

- ✅ 修复了接口调用不匹配的问题
- ✅ 现在可以正确保存问卷+问题+选项数据
- ✅ 预览时能看到完整的题目信息
- ✅ 保持了代码的简洁性和一致性

**建议**：在后续开发中，统一使用 `createWithQuestions` 接口来创建问卷，确保问题数据的完整性。
