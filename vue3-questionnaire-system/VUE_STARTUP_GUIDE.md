# Vue应用启动指南

## 问题说明
登录成功后跳转到 `/home` 出现404错误，这是因为Vue应用没有运行。

## 解决步骤

### 1. 启动Vue开发服务器

打开终端/命令提示符，执行以下命令：

```bash
# 进入Vue项目目录
cd vue3-questionnaire-system

# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

### 2. 等待服务器启动

启动成功后，你会看到类似这样的输出：
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3. 访问Vue应用

在浏览器中访问 `http://localhost:3000/`

### 4. 测试登录功能

1. 在Vue应用中访问登录页面
2. 使用正确的用户名密码登录
3. 登录成功后应该能正常跳转到首页

## 常见问题

### Q: 端口3000被占用怎么办？
A: 可以修改 `vite.config.js` 中的端口配置，或者使用其他可用端口。

### Q: 依赖安装失败怎么办？
A: 检查Node.js版本，确保版本兼容。可以尝试删除 `node_modules` 文件夹和 `package-lock.json`，然后重新运行 `npm install`。

### Q: 启动后页面空白怎么办？
A: 检查浏览器控制台是否有错误信息，确保所有依赖都正确安装。

## 测试建议

1. **先启动Vue应用**：确保Vue开发服务器正常运行
2. **再测试登录**：在Vue应用中进行登录测试
3. **检查控制台**：观察是否有错误信息
4. **验证路由**：确认路由配置正确

## 技术说明

- Vue应用使用Vite作为构建工具
- 路由使用Vue Router的History模式
- 状态管理使用Pinia
- UI组件库使用Ant Design Vue
