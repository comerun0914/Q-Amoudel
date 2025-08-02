# 认证机制更新总结

## 更新概述

根据用户要求，我们已经成功实现了新的认证机制：**不使用body请求，使用请求头请求，只需要在网址上添加?userid的用法**。

## 主要更改

### 1. 修改了 `UTILS.getApiUrl` 函数

**文件**: `src/main/resources/static/js/config.js`

**更改内容**:
- 自动从localStorage获取用户信息
- 如果用户已登录且存在用户ID，自动在URL中添加`?userid=用户ID`参数
- 支持已存在查询参数的情况，使用`&`连接符

**代码示例**:
```javascript
getApiUrl: function(endpoint) {
    const userInfo = this.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
    let url = CONFIG.BACKEND_BASE_URL + endpoint;
    
    // 如果用户已登录，在URL中添加userid参数
    if (userInfo && userInfo.id) {
        const separator = endpoint.includes('?') ? '&' : '?';
        url += separator + 'userid=' + userInfo.id;
    }
    
    return url;
}
```

### 2. 更新了所有API调用

所有使用`fetch`的JavaScript文件现在都通过`UTILS.getApiUrl()`生成URL，自动包含用户ID参数：

**已更新的文件**:
- `login.js` - 登录API调用
- `config.js` - 退出登录API调用
- `questionnaire-result.js` - 问卷结果API调用

**URL示例**:
- 原始: `http://localhost:7070/api/users/logout`
- 更新后: `http://localhost:7070/api/users/logout?userid=123`

### 3. 修复了硬编码路径

将所有JavaScript文件中的硬编码页面路径替换为全局配置：

**已修复的文件**:
- `questionnaire-fill.js` - 修复了ask-user.html和questionnaire-result.html路径
- `login.js` - 修复了index-user.html路径
- `ask-user.js` - 修复了所有页面跳转路径
- `questionnaire-editor.js` - 修复了questionnaire-preview.html路径

**修复示例**:
```javascript
// 修复前
window.location.href = 'ask-user.html';

// 修复后
window.location.href = CONFIG.ROUTES.ASK_USER;
```

### 4. 优化了退出登录功能

**文件**: `src/main/resources/static/js/config.js`

**更改内容**:
- 使用`UTILS.getApiUrl()`生成退出登录URL
- 修复了JSON解析错误
- 成功后清除所有本地存储

## 测试页面

创建了 `test-auth.html` 测试页面，包含以下功能：

1. **用户信息测试** - 检查localStorage中的用户信息
2. **API URL生成测试** - 验证URL自动添加userid参数
3. **身份验证测试** - 测试身份验证功能
4. **模拟登录** - 模拟用户登录过程
5. **工具函数测试** - 测试各种工具函数

## 使用方式

### 前端使用

所有API调用现在都会自动包含用户ID：

```javascript
// 自动生成包含userid的URL
fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.LOGOUT), {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
})
```

### 后端处理

后端需要从URL查询参数中获取userid：

```java
// Spring Boot示例
@GetMapping("/api/test")
public ResponseEntity<?> test(@RequestParam("userid") String userId) {
    // 使用userId进行身份验证和授权
    return ResponseEntity.ok("User ID: " + userId);
}
```

## 优势

1. **简化认证** - 不需要在请求体中传递用户信息
2. **统一管理** - 所有API调用自动包含用户ID
3. **易于调试** - URL中的userid参数便于调试和日志记录
4. **向后兼容** - 不影响现有的API结构
5. **安全性** - 用户ID通过URL参数传递，便于服务器端验证

## 注意事项

1. **URL长度限制** - 大量查询参数可能影响URL长度
2. **安全性考虑** - userid参数在URL中可见，建议配合其他安全措施
3. **缓存影响** - 包含userid的URL可能影响浏览器缓存
4. **日志记录** - 确保服务器日志不记录敏感的用户ID信息

## 验证方法

1. 打开 `test-auth.html` 页面
2. 使用"模拟登录"功能设置用户信息
3. 测试"API URL生成测试"查看生成的URL
4. 验证URL中包含正确的userid参数

## 文件清单

**修改的文件**:
- `src/main/resources/static/js/config.js` - 核心配置和工具函数
- `src/main/resources/static/js/login.js` - 登录功能
- `src/main/resources/static/js/questionnaire-fill.js` - 问卷填写
- `src/main/resources/static/js/ask-user.js` - 用户中心
- `src/main/resources/static/js/questionnaire-editor.js` - 问卷编辑器
- `src/main/resources/static/js/questionnaire-result.js` - 问卷结果

**新增的文件**:
- `src/main/resources/static/test-auth.html` - 认证机制测试页面
- `README-auth-update.md` - 本说明文档

## 下一步

1. 测试所有页面的功能是否正常
2. 验证后端API是否正确处理userid参数
3. 根据实际使用情况调整配置
4. 考虑添加更多的安全措施 