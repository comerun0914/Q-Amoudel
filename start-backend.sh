#!/bin/bash

echo "正在启动后端服务..."
echo

# 检查Java是否安装
if ! command -v java &> /dev/null; then
    echo "错误：未找到Java，请先安装Java 8或更高版本"
    exit 1
fi

# 检查Maven是否安装
if ! command -v mvn &> /dev/null; then
    echo "错误：未找到Maven，请先安装Maven"
    exit 1
fi

echo "Java版本："
java -version
echo
echo "Maven版本："
mvn -version
echo

echo "正在编译项目..."
mvn clean compile

if [ $? -ne 0 ]; then
    echo "编译失败，请检查错误信息"
    exit 1
fi

echo "编译成功！"
echo
echo "正在启动Spring Boot应用..."
echo "应用将在 http://localhost:7070 启动"
echo "API端点将在 http://localhost:7070/api 可用"
echo
echo "按 Ctrl+C 停止服务"
echo

mvn spring-boot:run 