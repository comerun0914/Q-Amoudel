<template>
  <div class="user-center-page">
    <div class="page-header">
      <div class="header-left">
        <h1>用户中心</h1>
        <p>管理您的个人信息和账户设置</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="saveUserInfo" :loading="saving">
          <save-outlined />
          保存设置
        </a-button>
      </div>
    </div>

    <div class="user-content">
      <a-row :gutter="24">
        <!-- 左侧用户信息 -->
        <a-col :span="8">
          <a-card title="个人信息" class="user-info-card">
            <div class="user-avatar-section">
              <a-avatar :size="120" :src="userInfo.avatar">
                <template #icon>
                  <user-outlined />
                </template>
              </a-avatar>
              <div class="avatar-actions">
                <a-upload
                  v-model:file-list="avatarFileList"
                  :before-upload="beforeAvatarUpload"
                  :show-upload-list="false"
                  accept="image/*"
                >
                  <a-button size="small">
                    <camera-outlined />
                    更换头像
                  </a-button>
                </a-upload>
              </div>
            </div>

            <a-form
              :model="userInfo"
              :rules="userInfoRules"
              layout="vertical"
              ref="userInfoFormRef"
            >
              <a-form-item label="用户名" name="username">
                <a-input
                  v-model:value="userInfo.username"
                  placeholder="请输入用户名"
                  :disabled="true"
                />
              </a-form-item>

              <a-form-item label="昵称" name="nickname">
                <a-input
                  v-model:value="userInfo.nickname"
                  placeholder="请输入昵称"
                />
              </a-form-item>

              <a-form-item label="邮箱" name="email">
                <a-input
                  v-model:value="userInfo.email"
                  placeholder="请输入邮箱"
                  type="email"
                />
              </a-form-item>

              <a-form-item label="手机号" name="phone">
                <a-input
                  v-model:value="userInfo.phone"
                  placeholder="请输入手机号"
                />
              </a-form-item>

              <a-form-item label="个人简介" name="bio">
                <a-textarea
                  v-model:value="userInfo.bio"
                  placeholder="请输入个人简介"
                  :rows="3"
                  :maxlength="200"
                  show-count
                />
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>

        <!-- 右侧内容区域 -->
        <a-col :span="16">
          <!-- 用户统计 -->
          <a-card title="账户统计" class="stats-card">
            <a-row :gutter="16">
              <a-col :span="6">
                <div class="stat-item">
                  <div class="stat-icon">
                    <file-text-outlined />
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ userStats.totalQuestionnaires }}</div>
                    <div class="stat-label">创建问卷</div>
                  </div>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="stat-item">
                  <div class="stat-icon">
                    <team-outlined />
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ userStats.totalResponses }}</div>
                    <div class="stat-label">总回复数</div>
                  </div>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="stat-item">
                  <div class="stat-icon">
                    <eye-outlined />
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ userStats.totalViews }}</div>
                    <div class="stat-label">总浏览量</div>
                  </div>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="stat-item">
                  <div class="stat-icon">
                    <star-outlined />
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ userStats.avgRating }}</div>
                    <div class="stat-label">平均评分</div>
                  </div>
                </div>
              </a-col>
            </a-row>
          </a-card>

          <!-- 账户设置 -->
          <a-card title="账户设置" class="settings-card">
            <a-tabs v-model:activeKey="activeTab">
              <!-- 安全设置 -->
              <a-tab-pane key="security" tab="安全设置">
                <div class="security-settings">
                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>修改密码</h4>
                      <p>定期更换密码可以提高账户安全性</p>
                    </div>
                    <a-button @click="showChangePasswordModal = true">
                      修改密码
                    </a-button>
                  </div>

                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>两步验证</h4>
                      <p>启用两步验证，为账户提供额外保护</p>
                    </div>
                    <a-switch
                      v-model:checked="securitySettings.twoFactorAuth"
                      @change="handleTwoFactorChange"
                    />
                  </div>

                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>登录通知</h4>
                      <p>在新设备登录时发送邮件通知</p>
                    </div>
                    <a-switch
                      v-model:checked="securitySettings.loginNotification"
                      @change="handleLoginNotificationChange"
                    />
                  </div>
                </div>
              </a-tab-pane>

              <!-- 隐私设置 -->
              <a-tab-pane key="privacy" tab="隐私设置">
                <div class="privacy-settings">
                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>数据收集</h4>
                      <p>允许系统收集使用数据以改善服务</p>
                    </div>
                    <a-switch
                      v-model:checked="privacySettings.dataCollection"
                      @change="handleDataCollectionChange"
                    />
                  </div>

                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>个性化推荐</h4>
                      <p>基于使用习惯提供个性化功能推荐</p>
                    </div>
                    <a-switch
                      v-model:checked="privacySettings.personalization"
                      @change="handlePersonalizationChange"
                    />
                  </div>

                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>公开资料</h4>
                      <p>允许其他用户查看您的基本资料</p>
                    </div>
                    <a-switch
                      v-model:checked="privacySettings.publicProfile"
                      @change="handlePublicProfileChange"
                    />
                  </div>
                </div>
              </a-tab-pane>

              <!-- 通知设置 -->
              <a-tab-pane key="notifications" tab="通知设置">
                <div class="notification-settings">
                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>邮件通知</h4>
                      <p>接收重要的系统通知和更新信息</p>
                    </div>
                    <a-switch
                      v-model:checked="notificationSettings.email"
                      @change="handleEmailNotificationChange"
                    />
                  </div>

                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>问卷回复通知</h4>
                      <p>当有人回复您的问卷时发送通知</p>
                    </div>
                    <a-switch
                      v-model:checked="notificationSettings.questionnaireResponse"
                      @change="handleQuestionnaireResponseChange"
                    />
                  </div>

                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>系统更新通知</h4>
                      <p>接收系统功能更新和维护通知</p>
                    </div>
                    <a-switch
                      v-model:checked="notificationSettings.systemUpdate"
                      @change="handleSystemUpdateChange"
                    />
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </a-card>

          <!-- 最近活动 -->
          <a-card title="最近活动" class="activity-card">
            <div class="activity-list">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon">
                  <component :is="getActivityIcon(activity.type)" />
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-time">{{ formatTime(activity.time) }}</div>
                </div>
                <div class="activity-action">
                  <a-button type="link" size="small" @click="handleActivityAction(activity)">
                    {{ getActivityActionText(activity.type) }}
                  </a-button>
        </div>
      </div>

              <div v-if="recentActivities.length === 0" class="empty-activities">
                <a-empty description="暂无活动记录" />
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
      </div>

    <!-- 修改密码弹窗 -->
    <a-modal
      :open="showChangePasswordModal"
      title="修改密码"
      width="500px"
      @ok="handleChangePassword"
      @cancel="showChangePasswordModal = false"
      @update:open="showChangePasswordModal = $event"
      :confirm-loading="changingPassword"
    >
      <a-form
        :model="passwordForm"
        :rules="passwordRules"
        layout="vertical"
        ref="passwordFormRef"
      >
        <a-form-item label="当前密码" name="currentPassword">
          <a-input-password
            v-model:value="passwordForm.currentPassword"
            placeholder="请输入当前密码"
          />
        </a-form-item>

        <a-form-item label="新密码" name="newPassword">
          <a-input-password
            v-model:value="passwordForm.newPassword"
            placeholder="请输入新密码"
          />
        </a-form-item>

        <a-form-item label="确认新密码" name="confirmPassword">
          <a-input-password
            v-model:value="passwordForm.confirmPassword"
            placeholder="请再次输入新密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SaveOutlined,
  UserOutlined,
  CameraOutlined,
  FileTextOutlined,
  TeamOutlined,
  EyeOutlined,
  StarOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  BellOutlined,
  LockOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/utils/request'
import { CONFIG } from '@/api/config'

// 使用用户状态管理
const userStore = useUserStore()

// 响应式数据
const saving = ref(false)
const changingPassword = ref(false)
const showChangePasswordModal = ref(false)
const activeTab = ref('security')
const userInfoFormRef = ref()
const passwordFormRef = ref()
const avatarFileList = ref([])

// 用户信息
const userInfo = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  bio: '',
  avatar: ''
})

// 用户统计
const userStats = reactive({
  totalQuestionnaires: 0,
  totalResponses: 0,
  totalViews: 0,
  avgRating: 0
})

// 安全设置
const securitySettings = reactive({
  twoFactorAuth: false,
  loginNotification: true
})

// 隐私设置
const privacySettings = reactive({
  dataCollection: true,
  personalization: true,
  publicProfile: false
})

// 通知设置
const notificationSettings = reactive({
  email: true,
  questionnaireResponse: true,
  systemUpdate: false
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 最近活动
const recentActivities = ref([])

// 表单验证规则
const userInfoRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在2-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const loadUserInfo = async () => {
  try {
    // 从用户状态获取基本信息
    const currentUser = userStore.user
    if (currentUser) {
      Object.assign(userInfo, {
        username: currentUser.username || '',
        nickname: currentUser.nickname || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || ''
      })
    }

    // 获取用户统计信息
    await fetchUserStats()

    // 获取用户设置
    await fetchUserSettings()

    // 获取最近活动
    await fetchUserActivities()

  } catch (error) {
    console.error('加载用户信息失败:', error)
    message.error('加载用户信息失败')
  }
}

// 获取用户统计数据
const fetchUserStats = async () => {
  try {
    // 根据数据库表结构，从users表获取用户统计信息
    const response = await api.get(CONFIG.API_ENDPOINTS.USER_PROFILE)

    if (response.code === 200) {
      userStats.value = response.data.stats || userStats.value
    } else {
      message.error(response.message || '获取统计数据失败')
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
  }
}

// 获取用户设置
const fetchUserSettings = async () => {
  try {
    // 根据数据库表结构，从users表获取用户设置
    const response = await api.get(CONFIG.API_ENDPOINTS.USER_PROFILE)

    if (response.code === 200) {
      userSettings.value = response.data.settings || userSettings.value
    } else {
      message.error(response.message || '获取设置失败')
    }
  } catch (error) {
    console.error('获取用户设置失败:', error)
  }
}

// 获取用户活动
const fetchUserActivities = async () => {
  try {
    // 根据数据库表结构，从login_history表获取用户活动记录
    const response = await api.get(CONFIG.API_ENDPOINTS.USER_PROFILE)

    if (response.code === 200) {
      userActivities.value = response.data.activities || userActivities.value
    } else {
      message.error(response.message || '获取活动记录失败')
    }
  } catch (error) {
    console.error('获取用户活动失败:', error)
  }
}

// 更新用户资料
const updateUserProfile = async () => {
  try {
    // 根据数据库表结构，更新users表中的用户信息
    const response = await api.put(CONFIG.API_ENDPOINTS.USER_PROFILE, userInfo.value)

    if (response.code === 200) {
      message.success('资料更新成功')
      fetchUserProfile()
    } else {
      message.error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新用户资料失败:', error)
    message.error('更新失败')
  }
}

// 修改密码
const changePassword = async () => {
  try {
    // 根据数据库表结构，更新users表中的密码
    const response = await api.put(CONFIG.API_ENDPOINTS.USER_PROFILE, {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    if (response.code === 200) {
      message.success('密码修改成功')
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      showPasswordModal.value = false
    } else {
      message.error(response.message || '修改失败')
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    message.error('修改失败')
  }
}

const beforeAvatarUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }

  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }

  // 这里应该上传图片到服务器
  // 暂时使用本地URL
  const reader = new FileReader()
  reader.onload = (e) => {
    userInfo.avatar = e.target.result
  }
  reader.readAsDataURL(file)

  return false // 阻止自动上传
}

const handleChangePassword = async () => {
  try {
    await passwordFormRef.value?.validate()

    changingPassword.value = true

    const response = await api.put(CONFIG.API_ENDPOINTS.USER_PROFILE, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    if (response.code === 200) {
      message.success('密码修改成功')
      showChangePasswordModal.value = false
      // 清空表单
      Object.assign(passwordForm, {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } else {
      message.error(response.message || '密码修改失败')
    }

  } catch (error) {
    console.error('修改密码失败:', error)
    if (error.name === 'ValidationError') {
      message.error('请检查表单信息')
    } else {
      message.error('修改失败，请稍后重试')
    }
  } finally {
    changingPassword.value = false
  }
}

// 设置变更处理
const handleTwoFactorChange = (checked) => {
  message.success(`两步验证已${checked ? '启用' : '禁用'}`)
}

const handleLoginNotificationChange = (checked) => {
  message.success(`登录通知已${checked ? '启用' : '禁用'}`)
}

const handleDataCollectionChange = (checked) => {
  message.success(`数据收集已${checked ? '启用' : '禁用'}`)
}

const handlePersonalizationChange = (checked) => {
  message.success(`个性化推荐已${checked ? '启用' : '禁用'}`)
}

const handlePublicProfileChange = (checked) => {
  message.success(`公开资料已${checked ? '启用' : '禁用'}`)
}

const handleEmailNotificationChange = (checked) => {
  message.success(`邮件通知已${checked ? '启用' : '禁用'}`)
}

const handleQuestionnaireResponseChange = (checked) => {
  message.success(`问卷回复通知已${checked ? '启用' : '禁用'}`)
}

const handleSystemUpdateChange = (checked) => {
  message.success(`系统更新通知已${checked ? '启用' : '禁用'}`)
}

// 活动相关方法
const getActivityIcon = (type) => {
  const iconMap = {
    questionnaire_created: FileTextOutlined,
    response_received: TeamOutlined,
    profile_updated: UserOutlined,
    login: LockOutlined,
    setting_changed: SettingOutlined
  }
  return iconMap[type] || BellOutlined
}

const getActivityActionText = (type) => {
  const actionMap = {
    questionnaire_created: '查看问卷',
    response_received: '查看回复',
    profile_updated: '查看资料',
    login: '查看详情',
    setting_changed: '查看设置'
  }
  return actionMap[type] || '查看详情'
}

const handleActivityAction = (activity) => {
  switch (activity.type) {
    case 'questionnaire_created':
      // 跳转到问卷管理页面
      break
    case 'response_received':
      // 跳转到数据统计页面
      break
    case 'profile_updated':
      // 刷新用户信息
      break
    default:
      message.info('功能开发中...')
  }
}

const formatTime = (time) => {
  const now = new Date()
  const activityTime = new Date(time)
  const diff = now - activityTime

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`

  return activityTime.toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.user-center-page {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  font-size: 28px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.header-left p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.user-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-info-card,
.stats-card,
.settings-card,
.activity-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar-section {
  text-align: center;
  margin-bottom: 24px;
}

.avatar-actions {
  margin-top: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.stat-icon {
  font-size: 32px;
  color: #1890ff;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  margin: 0 0 4px 0;
  color: #1a1a1a;
  font-size: 16px;
}

.setting-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 20px;
  color: #1890ff;
  width: 24px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  color: #1a1a1a;
  font-size: 14px;
  margin-bottom: 4px;
}

.activity-time {
  color: #666;
  font-size: 12px;
}

.empty-activities {
  text-align: center;
  padding: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-center-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .user-content .ant-col {
    margin-bottom: 16px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
