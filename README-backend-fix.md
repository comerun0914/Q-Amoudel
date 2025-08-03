# 后端连接问题解决方案

## 问题描述
测试结果显示"Failed to fetch"错误，表明前端无法连接到后端服务。

## 解决方案

### 1. 启动后端服务

#### Windows用户：
```bash
# 双击运行
start-backend.bat
```

#### Linux/Mac用户：
```bash
# 给脚本执行权限
chmod +x start-backend.sh

# 运行脚本
./start-backend.sh
```

#### 手动启动：
```bash
# 编译项目
mvn clean compile

# 启动服务
mvn spring-boot:run
```

### 2. 验证后端服务状态

访问以下页面检查后端连接：
- http://localhost:7070/check-backend.html

### 3. 检查配置

#### 后端配置 (application.yml)
```yaml
server:
  port: 7070
  servlet:
    context-path: /api  # 注意这个配置
```

#### 前端配置 (config.js)
```javascript
BACKEND_BASE_URL: 'http://localhost:7070/api'  # 已修复
```

### 4. 测试步骤

1. **启动后端服务**
2. **访问连接检查页面**: http://localhost:7070/check-backend.html
3. **访问测试页面**: http://localhost:7070/test-create-questionnaire.html
4. **测试创建问卷功能**: http://localhost:7070/manual-create-questionnaire.html

### 5. 常见问题

#### 问题1: 端口被占用
```bash
# 检查端口占用
netstat -ano | findstr :7070  # Windows
lsof -i :7070                 # Linux/Mac

# 杀死占用进程
taskkill /PID <进程ID> /F     # Windows
kill -9 <进程ID>              # Linux/Mac
```

#### 问题2: 数据库连接失败
确保MySQL服务正在运行，并且数据库配置正确：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/q-asystem
    username: root
    password: mor112112
```

#### 问题3: Java版本不兼容
确保使用Java 8或更高版本：
```bash
java -version
```

### 6. 调试信息

如果问题仍然存在，请检查：

1. **浏览器控制台** - 查看网络请求和错误信息
2. **后端日志** - 查看Spring Boot启动日志
3. **数据库连接** - 确保MySQL服务正常运行
4. **防火墙设置** - 确保端口7070未被阻止

### 7. 成功标志

当后端服务正常启动时，您应该看到：
- Spring Boot启动日志显示"Started QuickQASystemApplication"
- 访问 http://localhost:7070/api/questionCreate/list 返回JSON数据
- 前端测试页面显示"✅ 后端连接成功"

### 8. 下一步

后端服务启动成功后，您可以：
1. 测试问卷创建功能
2. 测试问卷管理功能
3. 继续开发其他功能

## 联系支持

如果问题仍然存在，请提供：
1. 后端启动日志
2. 浏览器控制台错误信息
3. 操作系统和Java版本信息 