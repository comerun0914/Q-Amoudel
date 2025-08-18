## 主要功能

### 1. 信息展示
- **问卷标题和描述**：显示创建的问卷基本信息
- **问卷ID**：突出显示生成的唯一问卷标识
- **问题数量**：显示问卷包含的问题总数
- **时间信息**：开始时间、结束时间、创建时间
- **创建者信息**：显示问卷创建者姓名

### 2. 链接管理
- **填写链接**：自动生成的问卷填写链接，支持一键复制
- **预览链接**：问卷预览链接，方便创建者检查效果

### 3. 操作功能
- **问卷管理**：跳转到问卷管理页面
- **编辑问卷**：直接编辑当前问卷
- **分享问卷**：打开分享对话框，支持多种分享方式
- **打印信息**：打印问卷信息页面
- **导出信息**：导出问卷信息为JSON文件

### 4. 分享功能
- **复制链接**：一键复制问卷链接到剪贴板
- **邮件分享**：通过邮件分享问卷
- **微信分享**：微信分享功能（开发中）

### 5. 多种操作类型支持
- **创建问卷**：`action=create` - 显示"问卷创建成功"
- **保存草稿**：`action=draft` - 显示"草稿保存成功"
- **发布问卷**：`action=publish` - 显示"问卷发布成功"
- **更新问卷**：`action=update` - 显示"问卷更新成功"
- **更新草稿**：`action=update_draft` - 显示"草稿更新成功"

## 使用方法

### 1. 路由跳转

在问卷操作完成后，使用以下方式跳转到成功页面：

```javascript
// 基础跳转
router.push('/questionnaire/success')

// 带参数跳转
router.push({
  path: '/questionnaire/success',
  query: {
    id: '123',
    title: '问卷标题',
    description: '问卷描述',
    totalQuestions: '10',
    startDate: '2025-01-15',
    endDate: '2025-01-30',
    creator: '张三',
    creationTime: '2025-01-15T10:30:00'
  }
})
```

### 2. 不同操作类型的跳转示例

#### 创建问卷成功
```javascript
router.push({
  path: '/questionnaire/success',
  query: {
    id: questionnaireData.id,
    title: questionnaireData.title,
    description: questionnaireData.description,
    totalQuestions: questionnaireData.questions.length,
    startDate: questionnaireData.startDate,
    endDate: questionnaireData.endDate,
    creator: userStore.userInfo.username,
    creationTime: new Date().toISOString(),
    action: 'create'
  }
})
```

#### 保存草稿成功
```javascript
router.push({
  path: '/questionnaire/success',
  query: {
    id: questionnaireData.id,
    title: questionnaireData.title,
    description: questionnaireData.description,
    totalQuestions: questionnaireData.questions.length,
    startDate: questionnaireData.startDate,
    endDate: questionnaireData.endDate,
    creator: userStore.userInfo.username,
    creationTime: new Date().toISOString(),
    action: 'draft'
  }
})
```

#### 发布问卷成功
```javascript
router.push({
  path: '/questionnaire/success',
  query: {
    id: questionnaireData.id,
    title: questionnaireData.title,
    description: questionnaireData.description,
    totalQuestions: questionnaireData.questions.length,
    startDate: questionnaireData.startDate,
    endDate: questionnaireData.endDate,
    creator: userStore.userInfo.username,
    creationTime: new Date().toISOString(),
    action: 'publish'
  }
})
```

#### 更新问卷成功
```javascript
router.push({
  path: '/questionnaire/success',
  query: {
    id: questionnaireData.id,
    title: questionnaireData.title,
    description: questionnaireData.description,
    totalQuestions: questionnaireData.questions.length,
    startDate: questionnaireData.startDate,
    endDate: questionnaireData.endDate,
    creator: userStore.userInfo.username,
    creationTime: new Date().toISOString(),
    action: 'update'
  }
})
```
