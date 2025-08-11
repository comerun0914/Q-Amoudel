# 问题预览API功能说明

## 概述

新增了一个问题预览API，允许前端根据问题ID获取完整的问题数据，包括所有选项和配置信息。这减少了前端的存储压力，提高了数据获取的效率。

## API端点

### 获取单个问题数据

**请求方式**: `GET`  
**路径**: `/question/question/{id}`  
**参数**: `id` - 问题ID（路径参数）

**响应格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "questionnaireId": 1,
    "content": "问题内容",
    "questionType": 1,
    "sortNum": 1,
    "isRequired": 1,
    "createdTime": "2025-08-06T10:00:00",
    "updatedTime": "2025-08-06T10:00:00",
    "options": [
      {
        "id": 1,
        "optionText": "选项1",
        "isDefault": 0,
        "sortNum": 1
      }
    ],
    "textQuestionConfig": null,
    "ratingQuestionConfig": null,
    "matrixQuestionConfig": null,
    "dateQuestionConfig": null,
    "timeQuestionConfig": null,
    "fileUploadQuestionConfig": null,
    "locationQuestionConfig": null,
    "signatureQuestionConfig": null,
    "userInfoQuestionConfig": null
  }
}
```

## 支持的问题类型

1. **单选题** (`questionType = 1`) - 返回 `options` 字段
2. **多选题** (`questionType = 2`) - 返回 `options` 字段  
3. **文本题** (`questionType = 3`) - 返回 `textQuestionConfig` 字段
4. **评分题** (`questionType = 4`) - 返回 `ratingQuestionConfig` 字段
5. **矩阵题** (`questionType = 5`) - 返回 `matrixQuestionConfig` 字段
6. **日期题** (`questionType = 6`) - 返回 `dateQuestionConfig` 字段
7. **时间题** (`questionType = 7`) - 返回 `timeQuestionConfig` 字段
8. **文件上传题** (`questionType = 8`) - 返回 `fileUploadQuestionConfig` 字段
9. **位置题** (`questionType = 9`) - 返回 `locationQuestionConfig` 字段
10. **签名题** (`questionType = 10`) - 返回 `signatureQuestionConfig` 字段
11. **用户信息题** (`questionType = 11`) - 返回 `userInfoQuestionConfig` 字段

## 实现细节

### 后端实现

1. **QuestionController**: 新增 `previewQuestion` 方法
2. **QuestionService**: 新增 `getQuestionById` 接口
3. **QuestionServiceImpl**: 实现 `getQuestionById` 方法，根据问题类型获取相应的配置数据
4. **QuestionDto**: 扩展了配置字段，支持所有问题类型

### 前端测试

更新了 `test-question-api.html` 测试页面，添加了测试新API的功能。

## 使用场景

1. **问卷编辑器**: 编辑特定问题时获取完整数据
2. **问卷预览**: 显示单个问题的详细信息
3. **问题管理**: 查看问题的完整配置
4. **数据同步**: 前端与后端数据同步

## 优势

1. **减少前端存储**: 不需要在前端存储所有问题数据
2. **提高性能**: 按需获取数据，减少内存占用
3. **数据一致性**: 直接从后端获取最新数据
4. **扩展性**: 支持所有问题类型的配置信息

## 测试

使用 `test-question-api.html` 页面测试新API：

1. 输入问题ID
2. 点击"获取问题数据"按钮
3. 查看返回的完整问题数据

## 注意事项

1. 确保问题ID存在且有效
2. 根据问题类型，相应的配置字段可能为null
3. 建议在前端实现缓存机制，避免重复请求相同数据
