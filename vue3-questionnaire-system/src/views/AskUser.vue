<template>
  <div class="ask-user-page">
    <!-- 导航栏 -->
    <a-layout-header class="header">
      <div class="navbar">
        <div class="logo">幼儿星</div>
        <div class="nav-links">
          <a href="#" class="nav-link" @click="goToHome">首页</a>
          <a href="#" class="nav-link" @click="goToUserCenter">用户中心</a>
        </div>
        <div class="user-info">
          <a-dropdown>
            <a class="ant-dropdown-link" @click.prevent>
              <a-avatar :src="userAvatar" class="user-avatar" />
              <span class="username">{{ username }}</span>
              <span class="user-role">({{ userRoleText }})</span>
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="home" @click="goToHome">
                  <HomeOutlined />
                  返回首页
                </a-menu-item>
                <a-menu-item key="userCenter" @click="goToUserCenter">
                  <UserOutlined />
                  用户中心
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </a-layout-header>

    <!-- 主要内容 -->
    <a-layout-content class="main-content">
      <div class="welcome-section">
        <h1>欢迎填写问卷，{{ username }}！</h1>
        <p>请选择以下方式之一来参与问卷调查</p>
        <p class="role-info">当前身份：{{ userRoleText }}</p>
      </div>

      <div class="questionnaire-methods">
        <h2>问卷填写方式</h2>
        <div class="method-cards">
          <!-- 链接输入方式 -->
          <a-card class="method-card" @click="showLinkMethod">
            <template #cover>
              <div class="card-icon">🔗</div>
            </template>
            <a-card-meta title="链接输入" description="通过问卷链接直接填写" />
          </a-card>

          <!-- 问卷代码方式 -->
          <a-card class="method-card" @click="showCodeMethod">
            <template #cover>
              <div class="card-icon">🔢</div>
            </template>
            <a-card-meta title="问卷代码" description="输入6位问卷代码快速填写" />
          </a-card>

          <!-- 二维码扫描方式 -->
          <a-card class="method-card" @click="showQRMethod">
            <template #cover>
              <div class="card-icon">📱</div>
            </template>
            <a-card-meta title="二维码扫描" description="扫描二维码快速填写问卷" />
          </a-card>
        </div>
      </div>

      <!-- 最近填写的问卷 -->
      <div class="recent-section">
        <h2>最近填写的问卷</h2>
        <div class="recent-list">
          <a-empty v-if="recentQuestionnaires.length === 0" description="暂无填写记录" />
          <a-list
            v-else
            :data-source="recentQuestionnaires"
            :loading="recentLoading"
            item-layout="horizontal"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a @click="goToQuestionnaire(item.id)">{{ item.title }}</a>
                  </template>
                  <template #description>
                    <div class="questionnaire-meta">
                      <span>填写时间: {{ formatDate(item.fillTime) }}</span>
                      <a-tag :color="getStatusColor(item.status)">
                        {{ getStatusText(item.status) }}
                      </a-tag>
                    </div>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-button type="link" @click="goToQuestionnaire(item.id)">
                    继续填写
                  </a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </div>

        <!-- 历史记录按钮 -->
        <div class="history-section">
          <a-button @click="showHistory" type="default">
            查看所有历史记录
          </a-button>
        </div>
      </div>
    </a-layout-content>

    <!-- 链接输入弹窗 -->
    <a-modal
      v-model:open="linkModalVisible"
      title="通过链接填写问卷"
      width="600px"
      @ok="submitLink"
      @cancel="linkModalVisible = false"
      :confirm-loading="linkLoading"
    >
      <div class="method-content">
        <div class="input-section">
          <a-form-item label="问卷链接">
            <a-input
              v-model:value="questionnaireLink"
              placeholder="请输入问卷链接，例如：https://example.com/questionnaire/123"
              size="large"
            />
          </a-form-item>
          <p class="input-hint">请从问卷发布者处获取完整的问卷链接</p>
        </div>
      </div>
    </a-modal>

    <!-- 问卷代码弹窗 -->
    <a-modal
      v-model:open="codeModalVisible"
      title="通过代码填写问卷"
      width="600px"
      @ok="submitCode"
      @cancel="codeModalVisible = false"
      :confirm-loading="codeLoading"
    >
      <div class="method-content">
        <div class="input-section">
          <a-form-item label="问卷代码">
            <a-input
              v-model:value="questionnaireCode"
              placeholder="请输入6位问卷代码，例如：ABC123"
              size="large"
              maxlength="6"
            />
          </a-form-item>
          <p class="input-hint">问卷代码通常为6位字母数字组合</p>
        </div>
      </div>
    </a-modal>

    <!-- 二维码扫描弹窗 -->
    <a-modal
      v-model:open="qrModalVisible"
      title="扫描二维码填写问卷"
      width="600px"
      @cancel="qrModalVisible = false"
      :footer="null"
    >
      <div class="method-content">
        <div class="qr-section">
          <!-- 移动端权限提示 -->
          <a-alert
            v-if="showMobilePermissionHint"
            message="📱 移动端使用提示"
            description="在移动设备上使用二维码扫描功能时，需要授予摄像头权限。首次使用时会弹出权限请求，选择'允许'即可正常使用。如被拒绝，可在设置中手动开启。"
            type="info"
            show-icon
            closable
            @close="hideMobilePermissionHint"
            class="mobile-permission-hint"
          />

          <div class="qr-container">
            <div id="qr-reader" ref="qrReader"></div>
            <div v-if="!isScanning" class="qr-overlay" @click="startScan">
              <div class="qr-placeholder">
                <div class="qr-icon">📱</div>
                <p>点击开始扫描二维码</p>
              </div>
            </div>
          </div>

          <div class="qr-controls">
            <a-space>
              <a-button
                v-if="!isScanning"
                type="primary"
                @click="startScan"
                :loading="scanLoading"
              >
                <ScanOutlined />
                开始扫描
              </a-button>
              <a-button
                v-else
                @click="stopScan"
              >
                <StopOutlined />
                停止扫描
              </a-button>
              <a-button @click="switchCamera" v-if="isScanning">
                <ReloadOutlined />
                切换摄像头
              </a-button>
            </a-space>
            <p class="input-hint">将二维码对准摄像头进行扫描</p>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 历史记录模态框 -->
    <a-modal
      v-model:open="historyModalVisible"
      title="我的填写历史"
      width="800px"
      :footer="null"
    >
      <div class="history-filters">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-input
              v-model:value="historySearch"
              placeholder="搜索问卷标题..."
              allow-clear
            />
          </a-col>
          <a-col :span="12">
            <a-select
              v-model:value="historyStatusFilter"
              placeholder="选择状态"
              style="width: 100%"
              allow-clear
            >
              <a-select-option value="">所有状态</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
              <a-select-option value="in-progress">进行中</a-select-option>
              <a-select-option value="expired">已过期</a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </div>

      <a-list
        :data-source="filteredHistoryList"
        :loading="historyLoading"
        item-layout="horizontal"
        class="history-list"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <a @click="goToQuestionnaire(item.id)">{{ item.title }}</a>
              </template>
              <template #description>
                <div class="questionnaire-meta">
                  <span>填写时间: {{ formatDate(item.fillTime) }}</span>
                  <a-tag :color="getStatusColor(item.status)">
                    {{ getStatusText(item.status) }}
                  </a-tag>
                </div>
              </template>
            </a-list-item-meta>
            <template #actions>
              <a-button type="link" @click="goToQuestionnaire(item.id)">
                {{ item.status === 'completed' ? '查看结果' : '继续填写' }}
              </a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { message, Modal } from 'ant-design-vue'
import {
  UserOutlined,
  LogoutOutlined,
  ScanOutlined,
  StopOutlined,
  ReloadOutlined,
  HomeOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const questionnaireLink = ref('')
const questionnaireCode = ref('')
const linkLoading = ref(false)
const codeLoading = ref(false)
const scanLoading = ref(false)
const isScanning = ref(false)
const historyModalVisible = ref(false)
const historySearch = ref('')
const historyStatusFilter = ref('')
const showMobilePermissionHint = ref(true)

// 弹窗状态
const linkModalVisible = ref(false)
const codeModalVisible = ref(false)
const qrModalVisible = ref(false)

// 数据列表
const recentQuestionnaires = ref([])
const historyList = ref([])
const recentLoading = ref(false)
const historyLoading = ref(false)

// 用户信息
const username = ref('用户名')
const userAvatar = ref('')
const userRoleText = ref('')

// 计算属性
const filteredHistoryList = computed(() => {
  let filtered = historyList.value

  if (historySearch.value) {
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(historySearch.value.toLowerCase())
    )
  }

  if (historyStatusFilter.value) {
    filtered = filtered.filter(item => item.status === historyStatusFilter.value)
  }

  return filtered
})

// 获取用户信息
onMounted(() => {
  try {
    const userInfo = userStore.userInfo;
    if (userInfo && userInfo.username) {
      username.value = userInfo.username;
      userAvatar.value = userInfo.avatar_url || '';
      
      // 根据用户角色显示文本
      if (userInfo.role !== undefined) {
        switch (userInfo.role) {
          case userStore.USER_ROLES.TEACHER_ADMIN:
            userRoleText.value = '教师/管理员';
            break;
          case userStore.USER_ROLES.NORMAL_USER:
            userRoleText.value = '普通用户';
            break;
          default:
            userRoleText.value = '未知角色';
            break;
        }
      } else {
        userRoleText.value = '未设置角色';
      }
    } else if (userInfo && userInfo.name) {
      username.value = userInfo.name;
      userAvatar.value = userInfo.avatar || '';
      userRoleText.value = '用户';
    } else {
      // 如果没有用户信息，使用默认值
      username.value = '测试用户';
      userAvatar.value = '';
      userRoleText.value = '测试用户';
      console.log('使用默认用户信息进行测试');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 使用默认值
    username.value = '测试用户';
    userAvatar.value = '';
    userRoleText.value = '测试用户';
  }

  loadRecentData()

  // 检查是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  if (!isMobile) {
    showMobilePermissionHint.value = false
  }
})

// 方法
const showLinkMethod = () => {
  linkModalVisible.value = true
}

const showCodeMethod = () => {
  codeModalVisible.value = true
}

const showQRMethod = () => {
  qrModalVisible.value = true
}

const submitLink = async () => {
  if (!questionnaireLink.value) {
    message.warning('请输入问卷链接')
    return
  }

  linkLoading.value = true
  try {
    // 这里应该调用后端API验证链接
    message.success('链接验证成功，正在跳转...')
    // 跳转到问卷填写页面
    router.push(`/questionnaire/fill?url=${encodeURIComponent(questionnaireLink.value)}`)
  } catch (error) {
    message.error('链接验证失败，请检查链接是否正确')
  } finally {
    linkLoading.value = false
    linkModalVisible.value = false
  }
}

const submitCode = async () => {
  if (!questionnaireCode.value) {
    message.warning('请输入问卷代码')
    return
  }

  if (questionnaireCode.value.length !== 6) {
    message.warning('问卷代码应为6位字符')
    return
  }

  codeLoading.value = true
  try {
    // 这里应该调用后端API验证代码
    message.success('代码验证成功，正在跳转...')
    // 跳转到问卷填写页面
    router.push(`/questionnaire/fill?code=${questionnaireCode.value}`)
  } catch (error) {
    message.error('代码验证失败，请检查代码是否正确')
  } finally {
    codeLoading.value = false
    codeModalVisible.value = false
  }
}

const startScan = () => {
  if (typeof Html5Qrcode === 'undefined') {
    message.error('二维码扫描功能不可用，请检查网络连接')
    return
  }

  scanLoading.value = true
  isScanning.value = true

  // 这里应该实现二维码扫描逻辑
  setTimeout(() => {
    scanLoading.value = false
    message.success('扫描功能已启动')
  }, 1000)
}

const stopScan = () => {
  isScanning.value = false
  message.info('扫描已停止')
}

const switchCamera = () => {
  message.info('正在切换摄像头...')
}

const hideMobilePermissionHint = () => {
  showMobilePermissionHint.value = false
}

const showHistory = () => {
  historyModalVisible.value = true
  loadHistoryData()
}

const loadHistoryData = async () => {
  historyLoading.value = true
  try {
    // 模拟加载历史数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    historyList.value = [
      {
        id: 1,
        title: '用户满意度调查',
        fillTime: new Date('2025-01-15'),
        status: 'completed'
      },
      {
        id: 2,
        title: '产品使用体验问卷',
        fillTime: new Date('2025-01-10'),
        status: 'in-progress'
      }
    ]
  } catch (error) {
    message.error('加载历史数据失败')
  } finally {
    historyLoading.value = false
  }
}

const loadRecentData = async () => {
  recentLoading.value = true
  try {
    // 模拟加载最近数据
    await new Promise(resolve => setTimeout(resolve, 800))
    recentQuestionnaires.value = [
      {
        id: 1,
        title: '用户满意度调查',
        fillTime: new Date('2025-01-15'),
        status: 'completed'
      }
    ]
  } catch (error) {
    message.error('加载最近数据失败')
  } finally {
    recentLoading.value = false
  }
}

const goToQuestionnaire = (id) => {
  router.push(`/questionnaire/fill/${id}`)
}

const goToUserCenter = () => {
  router.push('/user')
}

const goToHome = () => {
  router.push('/')
}

// 退出登录
const handleLogout = async () => {
  try {
    await userStore.logout();
    message.success('退出登录成功');
    router.push('/login');
  } catch (error) {
    console.error('退出登录失败:', error);
    message.error('退出登录失败');
    // 即使退出失败，也跳转到登录页
    router.push('/login');
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const getStatusColor = (status) => {
  const colors = {
    completed: 'success',
    'in-progress': 'processing',
    expired: 'error'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    completed: '已完成',
    'in-progress': '进行中',
    expired: '已过期'
  }
  return texts[status] || '未知'
}

onUnmounted(() => {
  // 清理二维码扫描器
  if (isScanning.value) {
    stopScan()
  }
})
</script>

<style scoped>
.ask-user-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 70px;
  line-height: 70px;
}

.navbar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #3b82f6;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  background-color: #3b82f6;
}

.username {
  color: #374151;
  font-weight: 500;
  margin: 0 8px;
}

.user-role {
  font-size: 0.875rem;
  color: #6b7280;
  margin-left: 8px;
}

.main-content {
  flex: 1;
  background-color: #f9fafb;
  padding: 40px 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 60px;
}

.welcome-section h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.welcome-section p {
  font-size: 1.125rem;
  color: #6b7280;
}

.role-info {
  font-size: 0.9375rem;
  color: #4b5563;
  margin-top: 10px;
}

.questionnaire-methods {
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 60px;
}

.questionnaire-methods h2 {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 40px;
}

.method-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.method-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.method-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 3rem;
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.ant-card-meta-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.ant-card-meta-description {
  color: #6b7280;
  font-size: 0.875rem;
}

.recent-section {
  max-width: 1200px;
  margin: 0 auto;
}

.recent-section h2 {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 40px;
}

.recent-list {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.questionnaire-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.history-section {
  text-align: center;
}

.method-content {
  padding: 20px 0;
}

.input-section {
  max-width: 100%;
}

.input-hint {
  color: #999;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
}

.qr-section {
  text-align: center;
}

.mobile-permission-hint {
  margin-bottom: 24px;
  text-align: left;
}

.qr-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto 24px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#qr-reader {
  width: 100%;
  height: 100%;
}

.qr-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.qr-overlay:hover {
  background: rgba(255, 255, 255, 0.95);
}

.qr-placeholder {
  text-align: center;
}

.qr-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.qr-controls {
  margin-bottom: 24px;
}

.qr-controls .input-hint {
  margin-top: 16px;
}

.history-filters {
  margin-bottom: 24px;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    padding: 0 15px;
  }
  
  .nav-links {
    gap: 20px;
  }
  
  .welcome-section h1 {
    font-size: 2rem;
  }
  
  .method-cards {
    grid-template-columns: 1fr;
  }
  
  .qr-container {
    width: 250px;
    height: 250px;
  }
}
</style>
