# 问卷创建API接口文档

## 创建问卷接口

### 接口信息
- **URL**: `/api/questionnaire/create`
- **方法**: `POST`
- **描述**: 创建新的问卷

### 请求头
```
Content-Type: application/json
Authorization: Bearer {token}
```

### 请求参数
```json
{
  "title": "问卷标题",
  "description": "问卷描述",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "submissionLimit": 1,
  "creatorId": 1,
  "status": 1
}
```

### 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | String | 是 | 问卷标题，最大255字符 |
| description | String | 否 | 问卷描述 |
| startDate | String | 是 | 开始日期，格式：YYYY-MM-DD |
| endDate | String | 是 | 结束日期，格式：YYYY-MM-DD |
| submissionLimit | Integer | 是 | 每人填写次数限制，1-999 |
| creatorId | Integer | 是 | 创建者用户ID |
| status | Integer | 是 | 问卷状态：0=禁用，1=启用 |

### 响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "问卷创建成功",
  "data": {
    "id": 1,
    "title": "问卷标题",
    "description": "问卷描述",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "submissionLimit": 1,
    "creatorId": 1,
    "status": 1,
    "createdTime": "2025-01-01T10:00:00",
    "updatedTime": "2025-01-01T10:00:00"
  }
}
```

#### 失败响应
```json
{
  "code": 400,
  "message": "参数错误：问卷标题不能为空",
  "data": null
}
```

### 错误码说明
| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 500 | 服务器内部错误 |

## 前端实现说明

### 1. 请求发送
```javascript
fetch('/api/questionnaire/create', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(submitData)
})
```

### 2. 响应处理
```javascript
.then(response => response.json())
.then(data => {
    if (data.code === 200) {
        // 创建成功
        console.log('问卷ID:', data.data.id);
    } else {
        // 创建失败
        console.error('错误:', data.message);
    }
})
```

### 3. 错误处理
```javascript
.catch(error => {
    console.error('网络错误:', error);
    // 显示用户友好的错误提示
})
```

## 数据库表结构

### questionnaire表
```sql
CREATE TABLE `questionnaire` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `submission_limit` int(11) DEFAULT 1,
  `status` tinyint(1) DEFAULT 1,
  `creator_id` int(11) NOT NULL,
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_creator_id` (`creator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 后端实现建议

### 1. 参数验证
- 验证必填字段
- 验证日期格式
- 验证日期逻辑（结束日期必须晚于开始日期）
- 验证提交次数限制范围

### 2. 权限验证
- 验证用户登录状态
- 验证用户权限（如果需要）

### 3. 业务逻辑
- 检查问卷标题是否重复
- 设置默认值
- 记录创建时间

### 4. 异常处理
- 数据库连接异常
- 参数验证异常
- 业务逻辑异常

## 前端功能特性

### 1. 表单验证
- 实时验证
- 提交前验证
- 用户友好的错误提示

### 2. 用户体验
- 加载状态显示
- 自动保存草稿
- 草稿恢复功能
- 成功提示和跳转

### 3. 错误处理
- 网络错误处理
- 服务器错误处理
- 用户友好的错误提示

### 4. 数据持久化
- 本地存储草稿
- 自动保存功能
- 页面刷新后恢复数据 