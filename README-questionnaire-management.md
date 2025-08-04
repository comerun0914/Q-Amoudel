# 问卷管理系统

## 概述

这是一个完整的问卷管理系统，包含前端界面和后端API，支持问卷的创建、编辑、管理、统计等功能。

## 功能特性

### 前端功能
- ✅ 现代化响应式界面设计
- ✅ 问卷列表展示和分页
- ✅ 搜索和筛选功能
- ✅ 批量操作（删除、启用、禁用）
- ✅ 单个问卷操作（编辑、预览、复制、删除）
- ✅ 统计信息展示
- ✅ 导入问卷功能
- ✅ 用户权限控制

### 后端功能
- ✅ 问卷CRUD操作
- ✅ 分页查询
- ✅ 条件筛选
- ✅ 批量操作
- ✅ 统计信息
- ✅ 数据验证

## 文件结构

```
src/main/resources/static/
├── questionnaire-management.html          # 问卷管理主页面
├── css/
│   └── questionnaire-management.css      # 问卷管理样式
├── js/
│   └── questionnaire-management.js       # 问卷管理逻辑
└── test-questionnaire-management.html    # 测试页面

src/main/java/com/shz/quick_qa_system/
├── controller/
│   └── QuestionCreateController.java     # 问卷管理控制器
├── service/
│   ├── QuestionCreateService.java        # 问卷管理服务接口
│   └── impl/
│       └── QuestionCreateServiceImpl.java # 问卷管理服务实现
├── dao/
│   └── QuestionCreateMapper.java         # 问卷数据访问层
└── entity/
    └── QuestionCreate.java               # 问卷实体类
```

## API接口

### 问卷管理接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/questionCreate/list` | 获取问卷列表 |
| POST | `/questionCreate/create` | 创建问卷 |
| DELETE | `/questionCreate/delete` | 删除问卷 |
| POST | `/questionCreate/batchDelete` | 批量删除问卷 |
| POST | `/questionCreate/toggleStatus` | 切换问卷状态 |
| POST | `/questionCreate/batchToggleStatus` | 批量切换状态 |
| POST | `/questionCreate/copy` | 复制问卷 |
| POST | `/questionCreate/import` | 导入问卷 |
| GET | `/questionCreate/statistics` | 获取统计信息 |

### 请求参数示例

#### 获取问卷列表
```
GET /questionCreate/list?page=1&size=10&keyword=测试&status=1&dateFilter=month&creatorId=1
```

#### 创建问卷
```json
{
  "title": "问卷标题",
  "description": "问卷描述",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "submissionLimit": 1,
  "status": true,
  "creatorId": 1
}
```

#### 切换状态
```json
{
  "id": 1,
  "status": true
}
```

## 使用方法

### 1. 启动应用
```bash
# 启动Spring Boot应用
mvn spring-boot:run
```

### 2. 访问管理界面
打开浏览器访问：`http://localhost:7070/questionnaire-management.html`

### 3. 测试功能
访问测试页面：`http://localhost:7070/test-questionnaire-management.html`

## 界面功能说明

### 主要功能区域

1. **页面标题区域**
   - 显示页面标题和描述
   - 创建问卷按钮
   - 导入问卷按钮

2. **搜索和筛选区域**
   - 关键词搜索（标题和描述）
   - 状态筛选（全部/已启用/已禁用）
   - 时间筛选（今天/本周/本月/今年）
   - 清除筛选按钮

3. **统计信息区域**
   - 总问卷数
   - 已启用问卷数
   - 草稿问卷数
   - 已过期问卷数

4. **问卷列表区域**
   - 全选/取消全选
   - 批量操作按钮
   - 问卷详细信息表格
   - 分页控制

5. **操作按钮**
   - 编辑：跳转到问卷编辑器
   - 预览：查看问卷预览
   - 复制：创建问卷副本
   - 启用/禁用：切换问卷状态
   - 删除：删除问卷

### 批量操作

1. **批量删除**
   - 选择要删除的问卷
   - 点击"批量删除"按钮
   - 确认删除操作

2. **批量启用/禁用**
   - 选择要操作的问卷
   - 点击"批量启用"或"批量禁用"按钮
   - 确认操作

## 数据库设计

### 问卷表 (question_create)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 问卷ID（主键） |
| title | varchar(255) | 问卷标题 |
| description | text | 问卷描述 |
| start_date | date | 开始日期 |
| end_date | date | 结束日期 |
| submission_limit | int | 每人填写次数限制 |
| status | tinyint(1) | 问卷状态（0=禁用，1=启用） |
| creator_id | int | 创建者用户ID |
| created_time | datetime | 创建时间 |
| updated_time | datetime | 更新时间 |

## 配置说明

### 前端配置 (config.js)

```javascript
// API端点配置
API_ENDPOINTS: {
    QUESTIONNAIRE_LIST: '/questionCreate/list',
    QUESTIONNAIRE_CREATE: '/questionCreate/create',
    QUESTIONNAIRE_DELETE: '/questionCreate/delete',
    // ... 其他端点
}

// 本地存储键名
STORAGE_KEYS: {
    USER_INFO: 'user_info',
    QUESTIONNAIRE_DRAFT: 'questionnaire_draft',
    CURRENT_QUESTIONNAIRE_ID: 'current_questionnaire_id'
}
```

### 后端配置 (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/q-asystem
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
  global-config:
    db-config:
      id-type: auto
```

## 开发说明

### 添加新功能

1. **前端**
   - 在HTML中添加界面元素
   - 在CSS中添加样式
   - 在JS中添加事件处理逻辑

2. **后端**
   - 在Controller中添加API接口
   - 在Service中添加业务逻辑
   - 在Mapper中添加数据访问方法

### 自定义样式

可以通过修改 `questionnaire-management.css` 文件来自定义界面样式：

```css
/* 自定义主题色 */
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #2ecc71;
    --danger-color: #e74c3c;
    --warning-color: #f39c12;
}
```

## 故障排除

### 常见问题

1. **页面无法访问**
   - 检查应用是否正常启动
   - 检查端口是否正确（默认7070）

2. **API请求失败**
   - 检查后端服务是否正常运行
   - 检查数据库连接是否正常
   - 查看浏览器控制台错误信息

3. **数据不显示**
   - 检查数据库中是否有数据
   - 检查API返回的数据格式
   - 检查前端数据绑定逻辑

### 调试方法

1. **前端调试**
   - 打开浏览器开发者工具
   - 查看Console面板的错误信息
   - 查看Network面板的请求情况

2. **后端调试**
   - 查看应用日志
   - 使用断点调试
   - 检查数据库查询结果

## 扩展功能

### 可以添加的功能

1. **数据导出**
   - 导出问卷数据为Excel
   - 导出统计报表

2. **权限管理**
   - 角色权限控制
   - 操作权限验证

3. **数据备份**
   - 自动备份功能
   - 数据恢复功能

4. **通知系统**
   - 问卷到期提醒
   - 操作结果通知

## 版本历史

- v1.0.0 (2025-01-XX)
  - 初始版本
  - 基础问卷管理功能
  - 前后端完整实现

## 联系方式

如有问题或建议，请联系开发团队。

---

**注意：** 这是一个完整的问卷管理系统实现，包含了前后端的所有必要代码。请确保在部署前进行充分的测试。 