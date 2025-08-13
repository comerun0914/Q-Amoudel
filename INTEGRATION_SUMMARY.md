# 问卷填写页面集成总结

## 概述
已将 `questionnaire-fill.js` 前端与 `QuestionCreateController.java` 后端接口集成，替换了原有的模拟数据，实现了真实数据的获取和渲染。

## 主要修改

### 1. 数据加载函数更新
- **`loadQuestionnaireData`**: 从同步函数改为异步函数，支持调用后端 API
- **`fetchQuestionnaireInfo`**: 新增函数，调用 `/questionCreate/getInfoById` 接口获取问卷基本信息
- **`fetchQuestionnaireQuestions`**: 新增函数，调用 `/questionCreate/questions` 接口获取问题列表

### 2. 数据转换函数
- **`convertBackendQuestionToFrontend`**: 将后端 `QuestionDto` 格式转换为前端需要的格式
- **`getQuestionTypeFromBackend`**: 将后端问题类型 ID 映射为前端类型字符串

### 3. 问题类型支持
- **单选题/多选题**: 支持从后端获取选项列表
- **问答题**: 支持提示文本和最大长度限制
- **评分题**: 支持最小/最大分数和标签显示
- **矩阵题**: 支持行和列数据的动态渲染

### 4. 错误处理
- **`showErrorMessage`**: 新增错误提示功能，显示用户友好的错误信息
- **异步错误处理**: 在数据加载失败时显示错误提示

### 5. UI 增强
- **评分标签**: 在评分题下方显示最小和最大标签
- **文本提示**: 在问答题中显示提示文本和字数限制
- **错误样式**: 添加了错误消息的 CSS 样式和动画效果

## 后端接口使用

### 问卷信息接口
```
GET /api/questionCreate/getInfoById?id={questionnaireId}
```

### 问题列表接口
```
GET /api/questionCreate/questions?questionnaireId={questionnaireId}
```

## 数据流程

1. 页面加载时从 URL 参数获取 `questionnaireId`
2. 调用 `fetchQuestionnaireInfo` 获取问卷基本信息
3. 调用 `fetchQuestionnaireQuestions` 获取问题列表
4. 使用 `convertBackendQuestionToFrontend` 转换数据格式
5. 调用 `renderQuestionnaire` 渲染问题列表
6. 根据问题类型调用相应的输入创建函数

## 兼容性说明

- 保留了原有的模拟数据作为后备方案
- 支持通过 `link` 和 `code` 参数访问问卷（仍使用模拟数据）
- 当没有 `id` 参数时，自动回退到示例数据

## 测试建议

1. 确保后端服务正在运行（端口 7070）
2. 访问 `questionnaire-fill.html?id={真实问卷ID}` 测试真实数据加载
3. 访问 `questionnaire-fill.html` 测试模拟数据回退
4. 检查浏览器控制台是否有错误信息
5. 验证各种问题类型的正确显示

## 注意事项

- 确保 `CONFIG.BACKEND_BASE_URL` 指向正确的后端地址
- 后端返回的数据结构必须符合 `QuestionDto` 格式
- 矩阵题的行列数据必须包含 `rowContent` 和 `columnContent` 字段
- 所有 API 调用都包含错误处理，失败时会显示用户友好的错误信息
