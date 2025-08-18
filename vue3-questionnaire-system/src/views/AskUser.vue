<template>
  <div class="ask-user-container">
    <!-- 导航栏 -->
    <a-layout-header class="navbar">
      <div class="logo">幼儿星</div>
      <div class="nav-links">
        <router-link to="/user" class="nav-link">用户中心</router-link>
        <router-link to="/ask-user" class="nav-link active">问卷填写</router-link>
        <a class="nav-link" @click="showHistory">我的记录</a>
        <div class="user-info" @click="toggleUserDropdown">
          <a-avatar :src="userAvatar" class="user-avatar" />
          <span class="user-name">{{ userName }}</span>
          <a-dropdown v-model:open="userDropdownOpen" placement="bottomRight">
            <template #overlay>
              <a-menu>
                <a-menu-item key="userCenter" @click="goToUserCenter">
                  <UserOutlined />
                  用户中心
                </a-menu-item>
                <a-menu-item key="logout" @click="logout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </a-layout-header>

    <main class="main-content">
      <div class="ask-container">
        <h1>我的问卷记录</h1>
        <p class="page-description">查看您已填写过的问卷记录</p>

        <!-- 问卷输入方式选择 -->
        <div class="input-methods">
          <a-tabs v-model:activeKey="activeMethod" class="method-tabs">
            <a-tab-pane key="link" tab="链接输入">
              <div class="method-content">
                <div class="input-section">
                  <a-form-item label="问卷链接">
                    <a-input-group compact>
                      <a-input
                        v-model:value="questionnaireLink"
                        placeholder="请输入问卷链接，例如：https://example.com/questionnaire/123"
                        style="width: calc(100% - 120px)"
                      />
                      <a-button type="primary" @click="submitLink" :loading="linkLoading">
                        开始填写
                      </a-button>
                    </a-input-group>
                  </a-form-item>
                  <p class="input-hint">请从问卷发布者处获取完整的问卷链接</p>
                </div>
              </div>
            </a-tab-pane>

            <a-tab-pane key="code" tab="问卷代码">
              <div class="method-content">
                <div class="input-section">
                  <a-form-item label="问卷代码">
                    <a-input-group compact>
                      <a-input
                        v-model:value="questionnaireCode"
                        placeholder="请输入6位问卷代码，例如：ABC123"
                        style="width: calc(100% - 120px)"
                        maxlength="6"
                      />
                      <a-button type="primary" @click="submitCode" :loading="codeLoading">
                        开始填写
                      </a-button>
                    </a-input-group>
                  </a-form-item>
                  <p class="input-hint">问卷代码通常为6位字母数字组合</p>
                </div>
              </div>
            </a-tab-pane>

            <a-tab-pane key="qr" tab="二维码扫描">
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
                      <a-button @click="checkPermissionStatus">
                        <EyeOutlined />
                        检测权限
                      </a-button>
                      <a-button @click="showCompatibilityInfo">
                        <InfoCircleOutlined />
                        浏览器兼容性
                      </a-button>
                      <a-button @click="showCameraInfo">
                        <CameraOutlined />
                        摄像头信息
                      </a-button>
                    </a-space>
                    <p class="input-hint">将二维码对准摄像头进行扫描</p>
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
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
      </div>
    </main>

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

    <footer class="footer">
      <div class="copyright">© 2025 湖北工程学院. 保留所有权利</div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  UserOutlined,
  LogoutOutlined,
  ScanOutlined,
  StopOutlined,
  ReloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  CameraOutlined
} from '@ant-design/icons-vue'
import { api } from '@/utils/request'

const router = useRouter()

// 响应式数据
const activeMethod = ref('link')
const questionnaireLink = ref('')
const questionnaireCode = ref('')
const linkLoading = ref(false)
const codeLoading = ref(false)
const scanLoading = ref(false)
const isScanning = ref(false)
const userDropdownOpen = ref(false)
const historyModalVisible = ref(false)
const historySearch = ref('')
const historyStatusFilter = ref('')
const showMobilePermissionHint = ref(true)

// 数据列表
const recentQuestionnaires = ref([])
const historyList = ref([])
const recentLoading = ref(false)
const historyLoading = ref(false)

// 用户信息
const userName = ref('用户名')
const userAvatar = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NjZFRkEiLz4KPHBhdGggZD0iTTE2IDhDMTguMjA5MSA4IDIwIDkuNzkwODYgMjAgMTJDMjAgMTQuMjA5MSAxOC4yMDkxIDE2IDE2IDE2QzEzLjc5MDkgMTYgMTIgMTQuMjA5MSAxMiAxMkMxMiA5Ljc5MDg2IDEzLjc5MDkgOCAxNiA4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTI0IDI0QzI0IDIwLjY4NjMgMjAuNDE0MiAxOCAxNiAxOEMxMS41ODU4IDE4IDggMjAuNjg2MyA4IDI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K')

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

// 方法
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

const checkPermissionStatus = () => {
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'camera' }).then(result => {
      let status = '未知'
      switch (result.state) {
        case 'granted':
          status = '已授权'
          break
        case 'denied':
          status = '已拒绝'
          break
        case 'prompt':
          status = '需要授权'
          break
      }
      message.info(`摄像头权限状态: ${status}`)
    })
  } else {
    message.info('无法检测权限状态，请手动检查')
  }
}

const showCompatibilityInfo = () => {
  const info = {
    userAgent: navigator.userAgent,
    camera: 'camera' in navigator || 'getUserMedia' in navigator,
    permissions: 'permissions' in navigator,
    mediaDevices: 'mediaDevices' in navigator
  }

  Modal.info({
    title: '浏览器兼容性信息',
    content: `
      <div>
        <p><strong>用户代理:</strong> ${info.userAgent}</p>
        <p><strong>摄像头支持:</strong> ${info.camera ? '是' : '否'}</p>
        <p><strong>权限API:</strong> ${info.permissions ? '是' : '否'}</p>
        <p><strong>媒体设备API:</strong> ${info.mediaDevices ? '是' : '否'}</p>
      </div>
    `,
    dangerouslySetHTMLContent: true
  })
}

const showCameraInfo = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const cameras = devices.filter(device => device.kind === 'videoinput')
        if (cameras.length > 0) {
          const cameraList = cameras.map((camera, index) =>
            `${index + 1}. ${camera.label || `摄像头 ${index + 1}`}`
          ).join('\n')

          Modal.info({
            title: '摄像头信息',
            content: `检测到 ${cameras.length} 个摄像头:\n${cameraList}`,
            okText: '确定'
          })
        } else {
          message.warning('未检测到摄像头设备')
        }
      })
      .catch(() => {
        message.error('无法获取摄像头信息')
      })
  } else {
    message.warning('浏览器不支持摄像头检测')
  }
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

const logout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗？',
    onOk: () => {
      localStorage.clear()
      router.push('/login')
      message.success('已退出登录')
    }
  })
}

const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value
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

// 生命周期
onMounted(() => {
  loadRecentData()

  // 检查是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  if (!isMobile) {
    showMobilePermissionHint.value = false
  }
})

onUnmounted(() => {
  // 清理二维码扫描器
  if (isScanning.value) {
    stopScan()
  }
})
</script>

<style scoped>
.ask-user-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #1890ff;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: #666;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #1890ff;
  background-color: #f0f8ff;
}

.nav-link.active {
  color: #1890ff;
  background-color: #e6f7ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
}

.user-name {
  color: #333;
  font-weight: 500;
}

.main-content {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.ask-container {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ask-container h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
}

.page-description {
  text-align: center;
  color: #666;
  margin-bottom: 32px;
  font-size: 16px;
}

.input-methods {
  margin-bottom: 40px;
}

.method-tabs {
  background: #fff;
  border-radius: 8px;
}

.method-content {
  padding: 24px 0;
}

.input-section {
  max-width: 600px;
  margin: 0 auto;
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

.recent-section {
  margin-bottom: 32px;
}

.recent-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.recent-list {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.questionnaire-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.history-section {
  text-align: center;
}

.footer {
  background: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 24px;
  text-align: center;
  margin-top: 40px;
}

.copyright {
  color: #999;
  font-size: 14px;
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
    padding: 0 16px;
  }

  .nav-links {
    gap: 16px;
  }

  .main-content {
    padding: 16px;
  }

  .ask-container {
    padding: 24px 16px;
  }

  .qr-container {
    width: 250px;
    height: 250px;
  }
}
</style>
