# 用户填写数据存储方案

## 概述

本方案为问卷系统的用户填写数据提供了完整的存储解决方案，包括问卷提交记录、答案详情、草稿保存等功能。

## 数据库表设计

### 1. 问卷提交记录表 (questionnaire_submission)

**功能**: 记录每次问卷提交的基本信息

**主要字段**:
- `id`: 提交记录ID（主键）
- `questionnaire_id`: 问卷ID（外键）
- `user_id`: 用户ID（可为空，支持匿名填写）
- `submitter_name`: 填写者姓名
- `submitter_email`: 填写者邮箱
- `submitter_phone`: 填写者电话
- `ip_address`: 提交IP地址
- `user_agent`: 用户代理信息
- `start_time`: 开始填写时间
- `submit_time`: 提交时间
- `duration_seconds`: 填写时长（秒）
- `status`: 状态（1=有效，0=无效）
- `is_complete`: 是否完整填写（1=是，0=否）

### 2. 问题答案表 (question_answer)

**功能**: 存储所有题型的答案数据

**主要字段**:
- `id`: 答案ID（主键）
- `submission_id`: 提交记录ID（外键）
- `question_id`: 问题ID（外键）
- `question_type`: 题型（1=单选题，2=多选题，3=问答题，4=评分题，5=矩阵题）
- `answer_text`: 文本答案
- `answer_value`: 数值答案
- `answer_json`: JSON格式答案（复杂题型）
- `created_time`: 创建时间

### 3. 问卷草稿表 (questionnaire_draft)

**功能**: 临时保存用户填写进度

**主要字段**:
- `id`: 草稿ID（主键）
- `questionnaire_id`: 问卷ID（外键）
- `user_id`: 用户ID（可为空）
- `session_id`: 会话ID（用于匿名用户）
- `draft_data`: 草稿数据（JSON格式）
- `progress`: 填写进度（0-100）
- `last_save_time`: 最后保存时间
- `expire_time`: 过期时间（默认7天）

## 答案存储策略

### 1. 单选题答案
- `answer_value`: 存储选项索引
- `answer_text`: 存储选项内容（冗余存储，便于查询）

### 2. 多选题答案
- `answer_json`: 存储选中的选项索引数组
- `answer_text`: 存储选中选项的内容（逗号分隔）

### 3. 问答题答案
- `answer_text`: 存储用户输入的文本内容

### 4. 评分题答案
- `answer_value`: 存储评分值
- `answer_text`: 存储格式化后的评分（如"5分"）

### 5. 矩阵题答案
- `answer_json`: 存储矩阵选择数据
- `answer_text`: 存储答案描述

## 后端实现

### 1. 实体类
- `QuestionnaireSubmission.java`: 问卷提交记录实体
- `QuestionAnswer.java`: 问题答案实体
- `QuestionnaireDraft.java`: 问卷草稿实体

### 2. Mapper接口
- `QuestionnaireSubmissionMapper.java`: 提交记录数据访问
- `QuestionAnswerMapper.java`: 答案数据访问
- `QuestionnaireDraftMapper.java`: 草稿数据访问

### 3. Service层
- `QuestionnaireSubmissionService.java`: 提交记录业务逻辑
- `QuestionnaireDraftService.java`: 草稿业务逻辑

### 4. Controller层
- `QuestionnaireSubmissionController.java`: 提供REST API接口

## API接口

### 1. 提交问卷
```
POST /api/submission/submit
Content-Type: application/json

{
  "questionnaireId": 1,
  "userId": 123,
  "submitterName": "张三",
  "submitterEmail": "zhangsan@example.com",
  "submitterPhone": "13800138000",
  "startTime": "2024-01-01T10:00:00",
  "durationSeconds": 1800,
  "sessionId": "session_123456",
  "answers": [
    {
      "questionId": 1,
      "questionType": 1,
      "answerValue": 0,
      "answerText": "选项A"
    }
  ]
}
```

### 2. 保存草稿
```
POST /api/submission/saveDraft
Content-Type: application/json

{
  "questionnaireId": 1,
  "userId": 123,
  "sessionId": "session_123456",
  "progress": 50,
  "answers": {
    "1": 0,
    "2": [0, 1],
    "3": "用户输入的文本"
  }
}
```

### 3. 获取草稿
```
GET /api/submission/getDraft?questionnaireId=1&userId=123
```

### 4. 获取提交统计
```
GET /api/submission/statistics/1
```

### 5. 检查提交状态
```
GET /api/submission/checkSubmission?questionnaireId=1&userId=123
```

## 前端实现

### 1. 答案收集
- 实时收集用户答案
- 支持多种题型的答案格式转换
- 自动保存到localStorage和服务器

### 2. 草稿功能
- 自动保存填写进度
- 支持从服务器恢复草稿
- 页面刷新后自动加载

### 3. 提交功能
- 答案验证和必答题检查
- 防重复提交检查
- 提交成功后清理草稿

## 安全特性

### 1. 防重复提交
- 用户ID检查
- IP地址检查
- 会话ID检查

### 2. 数据完整性
- 事务处理
- 外键约束
- 数据验证

### 3. 隐私保护
- 支持匿名填写
- IP地址记录
- 用户代理记录

## 性能优化

### 1. 索引设计
- 问卷ID索引
- 用户ID索引
- 提交时间索引
- IP地址索引

### 2. 数据清理
- 草稿自动过期
- 定期清理无效数据
- 分表策略（可选）

### 3. 缓存策略
- 草稿数据缓存
- 统计信息缓存
- 用户会话缓存

## 扩展功能

### 1. 数据分析
- 答案统计分析
- 填写时长分析
- 用户行为分析

### 2. 导出功能
- Excel导出
- CSV导出
- PDF报告

### 3. 实时监控
- 实时提交统计
- 在线用户监控
- 异常提交检测

## 使用示例

### 1. 创建问卷并收集答案
```javascript
// 前端收集答案
const answers = {
    "1": 0,           // 单选题选择第一个选项
    "2": [0, 1],      // 多选题选择前两个选项
    "3": "用户回答",   // 问答题文本
    "4": 5,           // 评分题5分
    "5": {            // 矩阵题
        "0": 1,
        "1": 2
    }
};

// 提交到后端
fetch('/api/submission/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        questionnaireId: 1,
        answers: answers
    })
});
```

### 2. 获取统计信息
```javascript
// 获取问卷提交统计
fetch('/api/submission/statistics/1')
.then(response => response.json())
.then(data => {
    console.log('总提交数:', data.totalSubmissions);
    console.log('完整填写数:', data.completeSubmissions);
    console.log('平均时长:', data.avgDuration);
});
```

## 总结

本存储方案提供了完整的用户填写数据管理功能，包括：

1. **完整的答案存储**: 支持所有题型的答案存储
2. **草稿功能**: 支持填写进度保存和恢复
3. **防重复提交**: 多种方式防止重复提交
4. **数据安全**: 事务处理和约束保证数据完整性
5. **性能优化**: 合理的索引和缓存策略
6. **扩展性**: 支持后续功能扩展

该方案可以满足问卷系统的基本需求，并为后续的数据分析和功能扩展提供了良好的基础。
