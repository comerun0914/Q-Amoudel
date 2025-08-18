@echo off
echo 正在启动Vue问卷管理系统...
echo.

echo 检查Node.js是否安装...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未找到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js版本：
node --version

echo.
echo 检查npm是否可用...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：npm不可用
    pause
    exit /b 1
)

echo npm版本：
npm --version

echo.
echo 检查项目依赖...
if not exist "node_modules" (
    echo 依赖未安装，正在安装...
    npm install
    if %errorlevel% neq 0 (
        echo 错误：依赖安装失败
        pause
        exit /b 1
    )
    echo 依赖安装完成
) else (
    echo 依赖已安装
)

echo.
echo 启动Vue开发服务器...
echo 服务器启动后，请在浏览器中访问：http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器
echo.

npm run dev

pause
