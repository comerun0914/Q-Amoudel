<template>
  <div class="register-form">
    <a-form
      :model="formData"
      :rules="formRules"
      @finish="handleRegister"
      layout="vertical"
      ref="formRef"
    >
      <a-form-item label="用户名" name="username">
        <a-input
          v-model:value="formData.username"
          size="large"
          placeholder="请输入用户名"
          prefix="<user-outlined />"
        />
      </a-form-item>

      <a-form-item label="邮箱" name="email">
        <a-input
          v-model:value="formData.email"
          size="large"
          placeholder="请输入邮箱地址"
          prefix="<mail-outlined />"
        />
      </a-form-item>

      <a-form-item label="密码" name="password">
        <a-input-password
          v-model:value="formData.password"
          size="large"
          placeholder="请输入密码"
          prefix="<lock-outlined />"
        />
      </a-form-item>

      <a-form-item label="确认密码" name="confirmPassword">
        <a-input-password
          v-model:value="formData.confirmPassword"
          size="large"
          placeholder="请再次输入密码"
          prefix="<lock-outlined />"
        />
      </a-form-item>

      <a-form-item label="真实姓名" name="realName">
        <a-input
          v-model:value="formData.realName"
          size="large"
          placeholder="请输入真实姓名"
          prefix="<idcard-outlined />"
        />
      </a-form-item>

      <a-form-item label="手机号码" name="phone">
        <a-input
          v-model:value="formData.phone"
          size="large"
          placeholder="请输入手机号码"
          prefix="<phone-outlined />"
        />
      </a-form-item>

      <a-form-item label="用户类型" name="userType">
        <a-select
          v-model:value="formData.userType"
          size="large"
          placeholder="请选择用户类型"
        >
          <a-select-option value="teacher">教师</a-select-option>
          <a-select-option value="parent">家长</a-select-option>
          <a-select-option value="student">学生</a-select-option>
          <a-select-option value="other">其他</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item name="agreement">
        <a-checkbox v-model:checked="formData.agreement">
          我已阅读并同意
          <a @click="showAgreement = true">《用户协议》</a>
          和
          <a @click="showPrivacy = true">《隐私政策》</a>
        </a-checkbox>
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          size="large"
          :loading="loading"
          class="register-btn"
          block
        >
          {{ loading ? '注册中...' : '立即注册' }}
        </a-button>
      </a-form-item>
    </a-form>

    <!-- 用户协议弹窗 -->
    <a-modal
      :open="showAgreement"
      title="用户协议"
      width="600px"
      :footer="null"
      @update:open="showAgreement = $event"
    >
      <div class="agreement-content">
        <h3>用户协议</h3>
        <p>欢迎使用幼儿星问卷管理系统！</p>
        <p>在使用本系统前，请您仔细阅读以下条款：</p>
        <ul>
          <li>您需要提供真实、准确的个人信息</li>
          <li>不得利用本系统进行任何违法活动</li>
          <li>保护您的隐私是我们的责任</li>
          <li>我们有权在必要时更新本协议</li>
        </ul>
      </div>
    </a-modal>

    <!-- 隐私政策弹窗 -->
    <a-modal
      :open="showPrivacy"
      title="隐私政策"
      width="600px"
      :footer="null"
      @update:open="showPrivacy = $event"
    >
      <div class="agreement-content">
        <h3>隐私政策</h3>
        <p>我们非常重视您的隐私保护：</p>
        <ul>
          <li>我们只收集必要的个人信息</li>
          <li>您的数据不会被泄露给第三方</li>
          <li>我们采用安全措施保护您的信息</li>
          <li>您有权随时查看和修改个人信息</li>
        </ul>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  IdcardOutlined,
  PhoneOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

// 定义事件
const emit = defineEmits(['success'])

// 使用组合式API
const userStore = useUserStore()
const formRef = ref()

// 响应式数据
const loading = ref(false)
const showAgreement = ref(false)
const showPrivacy = ref(false)

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  realName: '',
  phone: '',
  userType: '',
  agreement: false
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== formData.password) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在2-10个字符之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码格式', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  agreement: [
    {
      validator: (rule, value) => {
        if (!value) {
          return Promise.reject('请阅读并同意用户协议和隐私政策')
        }
        return Promise.resolve()
      },
      trigger: 'change'
    }
  ]
}

// 注册处理
const handleRegister = async (values) => {
  try {
    loading.value = true

    // 调用注册接口
    await userStore.register(values)

    message.success('注册成功！')

    // 触发成功事件
    emit('success')

    // 重置表单
    formRef.value?.resetFields()

  } catch (error) {
    console.error('注册失败:', error)
    message.error(error.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-form {
  padding: 20px 0;
}

.register-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 16px;
}

.agreement-content {
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.6;
}

.agreement-content h3 {
  color: #1a1a1a;
  margin-bottom: 16px;
}

.agreement-content p {
  margin-bottom: 12px;
  color: #333;
}

.agreement-content ul {
  padding-left: 20px;
  margin-bottom: 16px;
}

.agreement-content li {
  margin-bottom: 8px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-form {
    padding: 16px 0;
  }
}
</style>
