<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo区域 -->
      <div class="logo">
        <h1>幼儿星</h1>
      </div>

      <!-- 登录表单 -->
      <a-form
        :model="formData"
        :rules="formRules"
        @finish="handleSubmit"
        class="login-form"
        layout="vertical"
      >
        <a-form-item label="用户名" name="username">
          <a-input
            v-model:value="formData.username"
            size="large"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="密码" name="password">
          <a-input-password
            v-model:value="formData.password"
            size="large"
            placeholder="请输入密码"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            class="btn-login"
            :loading="loading"
            block
          >
            登录
          </a-button>
        </a-form-item>

        <!-- 辅助链接 -->
        <div class="links">
          <a href="#" class="link">忘记密码?</a>
          <a href="#" class="link">账号申诉</a>
        </div>
      </a-form>

      <!-- 注册链接 -->
      <div class="register-link">
        <p>还没有账号? <a href="#" @click="goToRegister">立即注册</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { message } from 'ant-design-vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { CONFIG, UTILS } from '../api/config';
import { api } from '../utils/request';

// 响应式数据
const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

// 表单数据
const formData = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
};

// 方法
const handleSubmit = async (values) => {
  try {
    loading.value = true;

    // 调用后端登录接口，使用数据库表user表中的信息
    const response = await userStore.login({
      username: values.username,
      password: values.password
    });

    console.log('登录成功，完整响应数据:', response);
    console.log('响应code字段:', response.code);
    console.log('响应data字段:', response.data);
    console.log('响应returnCode字段:', response.returnCode);

    if (response.success && response.code === 200) {
      message.success(`登录成功！欢迎回来，${values.username}`);

      // 获取登录响应数据
      const loginData = response.data;
      
      // 确保store中的数据已更新
      await new Promise(resolve => setTimeout(resolve, 100));

      // 检查store中的用户信息
      console.log('Store中的用户信息:', userStore.userInfo);
      console.log('Store中的token:', userStore.token);

      // 直接使用response.returnCode获取角色
      const userRole = response.returnCode;
      console.log('用户角色:', userRole, '类型:', typeof userRole);

      let targetPage = '';

      // 根据角色确定跳转页面
      switch (userRole) {
        case 1:
          // 问卷管理员/教师 - 跳转到管理端首页
          console.log('跳转到管理端首页');
          targetPage = '/home';
          break;
        case 0:
          // 普通用户 - 跳转到用户端页面
          console.log('跳转到用户端页面');
          targetPage = '/ask-user';
          break;
        default:
          // 默认跳转到用户端页面
          console.warn('未知用户角色:', userRole, '默认跳转到用户端页面');
          targetPage = '/ask-user';
          break;
      }

      console.log('准备跳转到页面:', targetPage);

      // 使用多种跳转方式确保跳转成功
      try {
        console.log('开始路由跳转...');
        
        // 方法1：使用router.push
        await router.push(targetPage);
        console.log('路由跳转成功');
        
        // 跳转成功后显示成功提示，不刷新页面
        message.success(`跳转成功！正在前往${targetPage === '/home' ? '管理端首页' : '用户端页面'}`);
        
      } catch (routerError) {
        console.error('路由跳转失败:', routerError);
        
        // 方法2：使用window.location.href作为备选方案
        console.log('使用window.location.href跳转');
        try {
          window.location.href = targetPage;
        } catch (locationError) {
          console.error('window.location跳转也失败:', locationError);
          // 如果两种方法都失败，提供手动导航的提示
          message.warning(`自动跳转失败，请手动点击导航到${targetPage === '/home' ? '管理端首页' : '用户端页面'}`);
        }
      }

    } else {
      // 登录失败
      console.log('登录失败，响应数据:', response);
      console.log('响应code:', response.code);
      console.log('响应message:', response.message);
      console.log('响应msg:', response.msg);

      const errorMsg = response.message || response.msg || '登录失败';
      message.error(errorMsg);
    }

  } catch (error) {
    console.error('登录失败:', error);

    // 处理不同类型的错误
    if (error.response) {
      // 服务器响应了错误状态码
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        message.error('用户名或密码错误');
      } else if (status === 500) {
        message.error('服务器内部错误，请稍后重试');
      } else {
        message.error(data?.message || data?.msg || `登录失败 (${status})`);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message.error('无法连接到服务器，请检查网络连接');
    } else {
      // 其他错误
      message.error(error.message || '登录失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  // 跳转到注册页面（如果存在）
  message.info('注册功能开发中...');
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.logo h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 30px;
  margin-top: 0;
}

.login-form {
  text-align: left;
}

.btn-login {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  margin-top: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-login:active {
  transform: translateY(0);
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 30px;
}

.link {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.link:hover {
  color: #3b82f6;
}

.register-link {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  margin-top: 20px;
}

.register-link p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.register-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #1d4ed8;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 30px 20px;
    margin: 20px;
  }

  .logo h1 {
    font-size: 2rem;
    margin-bottom: 25px;
  }

  .btn-login {
    height: 44px;
    font-size: 15px;
  }
}

/* 自定义Ant Design组件样式 */
:deep(.ant-form-item-label > label) {
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

:deep(.ant-input) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

:deep(.ant-input:focus),
:deep(.ant-input:hover) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

:deep(.ant-input-password) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

:deep(.ant-input-password:focus),
:deep(.ant-input-password:hover) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
</style>
