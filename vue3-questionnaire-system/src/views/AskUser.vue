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

          <!-- 问卷ID方式 -->
          <a-card class="method-card" @click="showCodeMethod">
            <template #cover>
              <div class="card-icon">🔢</div>
            </template>
            <a-card-meta title="问卷ID" description="输入问卷ID快速填写" />
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

      <!-- 可用问卷列表 -->
      <div class="recent-section">
        <h2>可用问卷列表</h2>
        <div class="recent-list">
          <a-empty v-if="availableQuestionnaires.length === 0" description="暂无可用问卷" />
          <a-list
            v-else
            :data-source="availableQuestionnaires"
            :loading="recentLoading"
            item-layout="horizontal"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <span class="questionnaire-title">{{ item.title }}</span>
                  </template>
                  <template #description>
                    <div class="questionnaire-meta">
                      <span>问卷ID: {{ item.id }}</span>
                      <span>描述: {{ item.description || '暂无描述' }}</span>
                      <a-tag :color="getQuestionnaireStatusColor(item.status)">
                        {{ getQuestionnaireStatusText(item.status) }}
                      </a-tag>
                    </div>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-button 
                    type="primary" 
                    @click="() => { console.log('按钮被点击了！'); goToQuestionnaire(item.id); }"
                    :disabled="item.status !== 1"
                  >
                    {{ item.status === 1 ? '填写问卷' : '未发布' }}
                  </a-button>
                  <!-- 测试按钮 -->
                  <a-button 
                    type="dashed" 
                    @click="testClick(item.id)"
                    style="margin-left: 8px;"
                  >
                    测试点击
                  </a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </div>

        <!-- 刷新按钮 -->
        <div class="history-section">
          <a-button @click="loadAvailableQuestionnaires" type="default">
            刷新问卷列表
          </a-button>
          <a-button @click="showHistory" type="default" style="margin-left: 10px;">
            查看填写历史
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

    <!-- 问卷ID弹窗 -->
    <a-modal
      v-model:open="codeModalVisible"
      title="通过问卷ID填写问卷"
      width="600px"
      @ok="submitCode"
      @cancel="codeModalVisible = false"
      :confirm-loading="codeLoading"
    >
      <div class="method-content">
        <div class="input-section">
          <a-form-item label="问卷ID">
            <a-input
              v-model:value="questionnaireCode"
              placeholder="请输入问卷ID，例如：12345"
              size="large"
            />
          </a-form-item>
          <p class="input-hint">问卷ID是创建问卷时系统自动生成的唯一标识</p>
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
const availableQuestionnaires = ref([])
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

  loadAvailableQuestionnaires()

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
    // 从链接中提取问卷ID
    const url = new URL(questionnaireLink.value)
    const pathParts = url.pathname.split('/')
    const questionnaireId = pathParts[pathParts.length - 1]
    
    if (!questionnaireId || !/^\d+$/.test(questionnaireId)) {
      message.error('无效的问卷链接，无法提取问卷ID')
      return
    }

    // 验证问卷ID是否存在
    const response = await fetch(`/api/questionCreate/getInfoById?id=${questionnaireId}`)
    if (response.ok) {
      const data = await response.json()
      if (data.code === 200 && data.data) {
        message.success('链接验证成功，正在跳转...')
        // 跳转到问卷填写页面
        router.push(`/questionnaire/fill/${questionnaireId}`)
      } else {
        message.error('问卷不存在或已被删除')
      }
    } else {
      message.error('链接验证失败，请检查链接是否正确')
    }
  } catch (error) {
    console.error('验证失败:', error)
    message.error('链接验证失败，请检查链接格式是否正确')
  } finally {
    linkLoading.value = false
    linkModalVisible.value = false
  }
}

const submitCode = async () => {
  if (!questionnaireCode.value) {
    message.warning('请输入问卷ID')
    return
  }

  if (!/^\d+$/.test(questionnaireCode.value)) {
    message.warning('问卷ID应为数字')
    return
  }

  codeLoading.value = true
  try {
    // 验证问卷ID是否存在
    const response = await fetch(`/api/questionCreate/getInfoById?id=${questionnaireCode.value}`)
    if (response.ok) {
      const data = await response.json()
      if (data.code === 200 && data.data) {
        message.success('问卷ID验证成功，正在跳转...')
        console.log('问卷验证成功，准备跳转，ID:', questionnaireCode.value)
        // 跳转到问卷填写页面
        try {
          await router.push(`/questionnaire/fill/${questionnaireCode.value}`)
          console.log('路由跳转成功')
        } catch (error) {
          console.error('路由跳转失败:', error)
          message.error('跳转失败，请重试')
        }
      } else {
        message.error('问卷不存在或已被删除')
      }
    } else {
      message.error('问卷ID验证失败，请检查ID是否正确')
    }
  } catch (error) {
    console.error('验证失败:', error)
    message.error('问卷ID验证失败，请检查网络连接')
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
    // 从数据库获取用户填写的问卷历史
    const response = await fetch('/api/questionnaireSubmission/userHistory', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.code === 200) {
        historyList.value = data.data.map(item => ({
          id: item.questionnaire_id,
          title: item.questionnaire_title,
          fillTime: new Date(item.submit_time),
          status: item.is_complete ? 'completed' : 'in-progress'
        }))
      } else {
        message.error('获取历史数据失败')
        historyList.value = []
      }
    } else {
      message.error('获取历史数据失败')
      historyList.value = []
    }
  } catch (error) {
    console.error('加载历史数据失败:', error)
    message.error('加载历史数据失败')
    historyList.value = []
  } finally {
    historyLoading.value = false
  }
}

const loadAvailableQuestionnaires = async () => {
  recentLoading.value = true
  try {
    // 从数据库获取所有可用的问卷
    const response = await fetch('/api/questionCreate/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
        if (response.ok) {
      const data = await response.json()
      console.log('API响应数据:', data)
      if (data.code === 200) {
        // 检查数据结构，data.data.list 是问卷列表
         const questionnaireList = data.data.list || data.data || []
         availableQuestionnaires.value = questionnaireList.map(item => ({
           id: item.id,
           title: item.title,
           description: item.description,
           status: item.status,
           questionnaireType: item.questionnaireType || item.questionnaire_type,
           createdTime: item.createdTime || item.created_time
         }))
      } else {
        message.error('获取问卷列表失败')
        availableQuestionnaires.value = []
      }
    } else {
      message.error('获取问卷列表失败')
      availableQuestionnaires.value = []
    }
      } catch (error) {
      console.error('加载问卷列表失败:', error)
      message.error('加载问卷列表失败: ' + (error.message || '未知错误'))
      availableQuestionnaires.value = []
    } finally {
      recentLoading.value = false
    }
}

const testClick = (id) => {
  console.log('测试点击按钮被点击，ID:', id)
  message.info(`测试点击成功！问卷ID: ${id}`)
}

const goToQuestionnaire = (id) => {
  // 最基础的调试信息
  alert(`函数被调用了！ID: ${id}`)
  
  // 检查路由对象是否有效
  if (!router) {
    alert('❌ 路由对象无效')
    message.error('路由系统未初始化')
    return
  }
  
  alert('✅ 路由对象有效，继续执行...')
  
  // 检查当前路由状态
  try {
    const currentRoute = router.currentRoute.value
    alert(`当前路由路径: ${currentRoute.path}`)
  } catch (error) {
    alert(`获取当前路由失败: ${error.message}`)
    return
  }
  
  alert(`准备跳转到: /questionnaire/fill/${id}`)
  
  try {
    alert('尝试执行 router.push...')
    const result = router.push(`/questionnaire/fill/${id}`)
    alert(`router.push 返回结果类型: ${typeof result}`)
    
    // 检查是否返回了 Promise
    if (result && typeof result.then === 'function') {
      alert('返回的是 Promise，等待结果...')
      result.then(() => {
        alert('✅ 路由跳转成功 (Promise resolved)')
      }).catch((error) => {
        alert(`❌ 路由跳转失败 (Promise rejected): ${error.message}`)
        message.error('跳转失败，请重试')
      })
    } else if (result === undefined) {
      alert('✅ 路由跳转成功 (同步，返回 undefined)')
    } else {
      alert(`⚠️ 路由跳转返回了意外的结果: ${result}`)
    }
  } catch (error) {
    alert(`❌ 路由跳转失败 (同步错误): ${error.message}`)
    message.error('跳转失败，请重试')
  }
  
  alert('=== 路由跳转诊断完成 ===')
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

const getQuestionnaireStatusColor = (status) => {
  const colors = {
    0: 'error',      // 禁用
    1: 'success',    // 启用/已发布
    2: 'warning'     // 草稿
  }
  return colors[status] || 'default'
}

const getQuestionnaireStatusText = (status) => {
  const texts = {
    0: '已禁用',
    1: '已发布',
    2: '草稿'
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

.questionnaire-title {
  font-weight: 600;
  color: #333;
  font-size: 16px;
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
