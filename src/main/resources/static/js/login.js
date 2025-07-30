/**
 * 处理表单提交事件
 * @param {Event} e - 表单事件对象
 */
function handleSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // 简单表单验证
  if (!username || !password) {
    alert('请输入您的用户名和密码');
    return;
  }

  // 发送登录请求到后端7070端口
  fetch('http://localhost:7070/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
    credentials: 'include', // 关键：允许携带跨域凭证（如cookie）
  })
  // 第一步：解析响应为JSON
  .then(response => {
    if (!response.ok) {
      // 如果HTTP状态码不是200-299，将错误响应转为JSON并抛出
      return response.json().then(err => {
        throw new Error(err.message || '登录失败，请检查用户名和密码');
      });
    }
    // 如果成功，解析响应为JSON
    return response.json();
  })
  // 第二步：处理解析后的JSON数据
  .then(data => {
    // 检查业务状态码
    if (data.code !== 200) {
      throw new Error(data.message || '登录失败');
    }
    alert('登录成功！欢迎回来，' + username);
    return data;
  })
  // 错误处理
  .catch(error => {
    alert(error.message);
  });
}

// 添加表单事件监听器
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  } else {
    console.error('未找到ID为loginForm的表单元素');
  }
}

// 在DOM加载完成后初始化表单
document.addEventListener('DOMContentLoaded', initLoginForm);