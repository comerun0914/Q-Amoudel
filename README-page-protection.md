# 页面保护功能使用说明

## 概述

为了确保需要登录的页面安全，我们提供了一套完整的页面保护机制，包括用户登录状态校验和美观的重新登录提示弹窗。

## 功能特性

### 1. 自动登录状态校验
- 检查本地存储中的用户信息
- 如果没有有效登录信息，自动显示重新登录弹窗

### 2. 美观的重新登录弹窗
- 仿照login.html的CSS样式设计
- 渐变背景和动画效果
- 3秒后自动跳转到登录页面
- 支持手动点击立即登录

### 3. 全局用户信息管理
- 统一的用户信息显示和退出逻辑
- 可复用的页面保护函数

### 4. 自动定时校验
- 每5秒自动检查用户登录状态
- 智能排除登录页面等不需要校验的页面
- 支持自定义校验间隔和排除页面列表

## 使用方法

### 方法一：使用页面保护函数（推荐）

```javascript
// 在需要登录的页面中使用
document.addEventListener('DOMContentLoaded', function() {
    // 使用页面保护函数 - 自动校验登录状态并初始化用户信息
    if (!UTILS.protectPage()) {
        return; // 如果未登录，停止执行后续代码
    }
    
    // 启动自动校验（每5秒检查一次）
    UTILS.startAutoAuthCheck();
    
    // 这里添加页面特定的逻辑
    console.log('页面保护通过，用户已登录');
});
```

### 方法二：单独使用校验函数

```javascript
// 只校验登录状态
if (!UTILS.checkUserAuth()) {
    return;
}

// 单独初始化用户信息
UTILS.initUserInfo();
```

### 方法三：自定义自动校验

```javascript
// 自定义校验间隔和排除页面
UTILS.startAutoAuthCheck(3000, ['login.html', 'register.html']); // 每3秒检查一次

// 使用默认设置（5秒间隔，排除login.html）
UTILS.startAutoAuthCheck();

// 只排除特定页面
UTILS.startAutoAuthCheck(5000, ['login.html', 'public-page.html']);
```

## 函数说明

### UTILS.checkUserAuth()
- **功能**: 校验用户登录状态
- **返回值**: `boolean` - true表示已登录，false表示未登录
- **行为**: 如果未登录，自动显示重新登录弹窗

### UTILS.startAutoAuthCheck(interval, excludePages)
- **功能**: 启动自动校验，定时检查用户登录状态
- **参数**: 
  - `interval`: 检查间隔时间（毫秒），默认5000ms（5秒）
  - `excludePages`: 排除的页面列表，默认['login.html']
- **行为**: 
  - 立即检查一次登录状态
  - 按指定间隔定时检查
  - 自动排除登录页面等不需要校验的页面

### UTILS.protectPage()
- **功能**: 页面保护函数，包含校验和初始化
- **返回值**: `boolean` - true表示保护通过，false表示未通过
- **行为**: 
  - 校验用户登录状态
  - 如果通过，自动初始化用户信息显示
  - 如果未通过，显示重新登录弹窗

### UTILS.showReLoginModal()
- **功能**: 显示重新登录弹窗
- **行为**: 
  - 创建美观的弹窗界面
  - 3秒后自动跳转到登录页面
  - 支持手动点击立即登录

### UTILS.goToLogin()
- **功能**: 跳转到登录页面
- **行为**: 
  - 清除本地存储
  - 跳转到登录页面

## 弹窗样式特性

### 视觉效果
- 半透明背景遮罩
- 毛玻璃效果（backdrop-filter）
- 圆角卡片设计
- 渐变背景图标

### 动画效果
- 弹窗滑入动画
- 按钮悬停效果
- 平滑过渡动画

### 响应式设计
- 适配不同屏幕尺寸
- 移动端友好

## 示例页面

参考 `protected-page-example.html` 文件，展示了如何在页面中使用页面保护功能。

## 注意事项

1. **页面结构要求**: 确保页面包含以下HTML结构：
   ```html
   <div class="user-info" id="userInfo" style="display: none;">
       <img class="user-avatar" id="userAvatar">
       <span class="user-name" id="userName">用户名</span>
       <div class="user-dropdown" id="userDropdown">
           <a href="#" id="userCenter">用户中心</a>
           <a href="#" id="logoutBtn">退出登录</a>
       </div>
   </div>
   <a href="login.html" class="btn-login" id="loginBtn">登录</a>
   ```

2. **CSS依赖**: 确保引入了包含用户信息样式的CSS文件

3. **脚本依赖**: 确保在页面中引入了 `config.js` 文件

4. **本地存储**: 系统依赖localStorage存储用户信息，键名为 `user_info`

## 扩展使用

### 自定义弹窗样式
可以通过修改 `showReLoginModal()` 函数中的CSS样式来自定义弹窗外观。

### 自定义跳转逻辑
可以通过修改 `goToLogin()` 函数来自定义跳转行为。

### 添加权限校验
可以在 `checkUserAuth()` 函数中添加角色权限校验逻辑。 