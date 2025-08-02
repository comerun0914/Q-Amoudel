// 使用全局配置

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

  // 发送登录请求到后端
  fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.LOGIN), {
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
    
    // 登录成功，显示欢迎信息
    alert('登录成功！欢迎回来，' + username);
    console.log('登录成功，完整响应数据:', data);
    
    // 保存用户信息到localStorage（可选）
    if (data.data) {
      UTILS.setStorage(CONFIG.STORAGE_KEYS.USER_INFO, data.data);
      console.log('保存的用户信息:', data.data);
    }
    
    // 调试：检查数据结构
    console.log('data.data:', data.data);
    console.log('data.data.role:', data.data?.role);
    console.log('data.data.user:', data.data?.user);
    console.log('data.data.user?.role:', data.data?.user?.role);
    
    // 根据用户角色进行页面跳转
    // 尝试多种可能的数据结构来获取角色信息
    let userRole = null;
    
    if (data.data) {
      // 尝试直接获取角色
      if (data.data.role !== undefined) {
        userRole = data.data.role;
        console.log('从 data.data.role 获取到角色:', userRole);
      }
      // 尝试从嵌套的user对象获取角色
      else if (data.data.user && data.data.role !== undefined) {
        userRole = data.data.role;
        console.log('从 data.data.user.role 获取到角色:', userRole);
      }
      // 尝试从其他可能的路径获取角色
      // else if (data.data.userRole !== undefined) {
      //   userRole = data.data.userRole;
      //   console.log('从 data.data.userRole 获取到角色:', userRole);
      // }
    }
    
    if (userRole !== null && userRole !== undefined) {
      console.log('最终确定的用户角色:', userRole, '类型:', typeof userRole);
      
      // 确保角色是数字类型进行比较
      const roleNum = Number(userRole);
      
      switch (roleNum) {
        case 1:
          // 问卷管理员 - 跳转到管理员首页
          console.log('跳转到管理员首页');
          window.location.href = CONFIG.ROUTES.INDEX;
          break;
        case 0:
          // 普通用户 - 跳转到用户中心页面
          console.log('跳转到用户中心页面');
          window.location.href = CONFIG.ROUTES.INDEX_USER;
          break;
        default:
          // 默认跳转到用户中心页面
          console.warn('未知用户角色:', roleNum, '默认跳转到用户中心页面');
          window.location.href = CONFIG.ROUTES.INDEX_USER;
          break;
      }
    } else {
      // 如果没有角色信息，默认跳转到用户中心页面
      console.warn('未获取到用户角色信息，默认跳转到用户中心页面');
      console.log('可用的数据字段:', Object.keys(data.data || {}));
      window.location.href = CONFIG.ROUTES.INDEX_USER;
    }
    
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