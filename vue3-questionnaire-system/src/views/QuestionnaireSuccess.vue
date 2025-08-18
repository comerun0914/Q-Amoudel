<template>
  <div class="result-container">
    <!-- 结果头部 -->
    <header class="result-header">
      <div class="header-content">
        <div class="header-left">
          <button class="btn-back" @click="goToHome">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回主页
          </button>
          <div class="completion-info">
            <span class="completion-text">{{ getActionInfo().title }}</span>
            <div class="completion-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="header-right">
          <button class="btn-print" @click="handlePrint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 6,2 18,2 18,9"/>
              <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
              <polyline points="6,14 6,18 18,18 18,14"/>
            </svg>
            打印信息
          </button>
          <button class="btn-export" @click="handleExport">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导出信息
          </button>
          <div class="creation-time">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>创建时间: {{ creationTime }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 问卷创建成功内容区域 -->
    <main class="questionnaire-result-content">
      <!-- 问卷标题 -->
      <div class="questionnaire-title">
        <h1>{{ getActionInfo().title }}</h1>
        <p>{{ getActionInfo().subtitle }}</p>
        <div class="questionnaire-meta">
          <span class="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            开始时间: <span>{{ startTime }}</span>
          </span>
          <span class="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            结束时间: <span>{{ endTime }}</span>
          </span>
          <span class="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
              <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
              <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"/>
              <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"/>
            </svg>
            创建者: <span>{{ creatorName }}</span>
          </span>
        </div>
      </div>

      <!-- 创建成功统计 -->
      <div class="result-summary">
        <div class="summary-card">
          <div class="summary-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div class="summary-content">
            <h3>问卷ID</h3>
            <p class="questionnaire-id">{{ questionnaireId }}</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
            </svg>
          </div>
          <div class="summary-content">
            <h3>问题数量</h3>
            <p>{{ totalQuestions }}题</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div class="summary-content">
            <h3>创建状态</h3>
            <p>已完成</p>
          </div>
        </div>
      </div>

      <!-- 问卷链接信息 -->
      <div class="questionnaire-links">
        <div class="link-section">
          <h3>问卷访问链接</h3>
          <div class="link-item">
            <label>填写链接：</label>
            <div class="link-input-group">
              <input 
                type="text" 
                :value="fillLink" 
                readonly 
                class="link-input"
                id="fillLinkInput"
              />
              <button class="copy-btn" @click="copyLink('fillLinkInput')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                复制
              </button>
            </div>
          </div>
          <div class="link-item">
            <label>预览链接：</label>
            <div class="link-input-group">
              <input 
                type="text" 
                :value="previewLink" 
                readonly 
                class="link-input"
                id="previewLinkInput"
              />
              <button class="copy-btn" @click="copyLink('previewLinkInput')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                复制
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="btn-secondary" @click="goToManagement">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          问卷管理
        </button>
        <button class="btn-primary" @click="showShareModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          分享问卷
        </button>
        <button class="btn-secondary" @click="editQuestionnaire">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          编辑问卷
        </button>
      </div>
    </main>

    <!-- 分享对话框 -->
    <div class="modal" :class="{ 'show': shareModalVisible }" @click="closeShareModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>分享问卷</h3>
          <button class="btn-close" @click="closeShareModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="share-options">
            <button class="share-option" @click="shareCopy">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>复制链接</span>
            </button>
            <button class="share-option" @click="shareEmail">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>邮件分享</span>
            </button>
            <button class="share-option" @click="shareWechat">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <span>微信分享</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div class="toast" :class="{ 'show': toastVisible }">
      <div class="toast-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const questionnaireTitle = ref('问卷标题')
const questionnaireDescription = ref('问卷描述信息')
const questionnaireId = ref('')
const totalQuestions = ref(0)
const startTime = ref('')
const endTime = ref('')
const creatorName = ref('')
const creationTime = ref('')
const fillLink = ref('')
const previewLink = ref('')
const actionType = ref('') // 操作类型：create, draft, publish, update, update_draft

// 弹窗状态
const shareModalVisible = ref(false)
const toastVisible = ref(false)
const toastMessage = ref('')

// 根据操作类型获取相应的提示信息
const getActionInfo = () => {
  const actionMap = {
    create: { title: '问卷创建成功', subtitle: '您的问卷已成功创建', badge: '创建成功' },
    draft: { title: '草稿保存成功', subtitle: '您的问卷草稿已成功保存', badge: '草稿保存' },
    publish: { title: '问卷发布成功', subtitle: '您的问卷已成功发布', badge: '发布成功' },
    update: { title: '问卷更新成功', subtitle: '您的问卷已成功更新', badge: '更新成功' },
    update_draft: { title: '草稿更新成功', subtitle: '您的问卷草稿已成功更新', badge: '草稿更新' }
  }
  return actionMap[actionType.value] || actionMap.create
}

// 方法
const goToHome = () => {
  router.push('/')
}

const goToManagement = () => {
  router.push('/questionnaire/management')
}

const editQuestionnaire = () => {
  if (questionnaireId.value) {
    router.push(`/questionnaire/edit/${questionnaireId.value}`)
  } else {
    message.warning('问卷ID不存在，无法编辑')
  }
}

const showShareModal = () => {
  shareModalVisible.value = true
}

const closeShareModal = () => {
  shareModalVisible.value = false
}

const handlePrint = () => {
  window.print()
}

const handleExport = () => {
  // 导出问卷信息
  const exportData = {
    问卷标题: questionnaireTitle.value,
    问卷ID: questionnaireId.value,
    问题数量: totalQuestions.value,
    开始时间: startTime.value,
    结束时间: endTime.value,
    创建者: creatorName.value,
    创建时间: creationTime.value,
    填写链接: fillLink.value,
    预览链接: previewLink.value
  }
  
  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `问卷信息_${questionnaireId.value}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  showToast('问卷信息导出成功')
}

const copyLink = async (inputId) => {
  try {
    const input = document.getElementById(inputId)
    await navigator.clipboard.writeText(input.value)
    showToast('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    showToast('复制失败，请手动复制')
  }
}

const shareCopy = () => {
  copyLink('fillLinkInput')
  closeShareModal()
}

const shareEmail = () => {
  const subject = encodeURIComponent(`问卷分享：${questionnaireTitle.value}`)
  const body = encodeURIComponent(`请填写以下问卷：\n\n问卷标题：${questionnaireTitle.value}\n填写链接：${fillLink.value}\n\n感谢您的参与！`)
  window.open(`mailto:?subject=${subject}&body=${body}`)
  closeShareModal()
  showToast('邮件分享功能已启动')
}

const shareWechat = () => {
  showToast('微信分享功能开发中...')
  closeShareModal()
}

const showToast = (msg) => {
  toastMessage.value = msg
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 3000)
}

// 格式化时间
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN')
}

// 生命周期
onMounted(() => {
  // 从路由参数或本地存储获取问卷信息
  const params = route.params
  const query = route.query

  // 设置操作类型
  actionType.value = query.action || 'create'
  
  // 设置问卷基本信息
  questionnaireTitle.value = params.title || query.title || '问卷标题'
  questionnaireDescription.value = params.description || query.description || '问卷描述信息'
  questionnaireId.value = params.id || query.id || 'N/A'
  totalQuestions.value = parseInt(params.totalQuestions || query.totalQuestions || 0)
  
  // 设置时间信息
  startTime.value = formatDate(params.startDate || query.startDate)
  endTime.value = formatDate(params.endDate || query.endDate)
  creationTime.value = formatDateTime(params.creationTime || query.creationTime || new Date())
  
  // 设置创建者信息
  creatorName.value = params.creator || query.creator || '当前用户'
  
  // 生成链接
  const baseUrl = window.location.origin
  fillLink.value = `${baseUrl}/questionnaire/fill/${questionnaireId.value}`
  previewLink.value = `${baseUrl}/questionnaire/preview/${questionnaireId.value}`
  
  // 如果没有问卷ID，显示提示
  if (!questionnaireId.value || questionnaireId.value === 'N/A') {
    message.warning('未获取到问卷ID，部分功能可能无法正常使用')
  }
  
  // 根据操作类型设置页面标题
  const actionInfo = getActionInfo()
  document.title = `${actionInfo.title} - 幼儿星`
})
</script>

<style scoped>
.result-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 结果头部样式 */
.result-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 24px;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.btn-back {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.completion-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.completion-text {
  font-size: 18px;
  font-weight: 500;
}

.completion-badge {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-print,
.btn-export {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-print:hover,
.btn-export:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.creation-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
}

/* 问卷结果内容区域 */
.questionnaire-result-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

.questionnaire-title {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.questionnaire-title h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.questionnaire-title p {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

.questionnaire-meta {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.meta-item span {
  color: #1a1a1a;
  font-weight: 500;
}

/* 结果统计 */
.result-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-icon {
  width: 48px;
  height: 48px;
  background: #f0f8ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
}

.summary-content h3 {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.summary-content p {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.questionnaire-id {
  color: #1890ff !important;
  font-family: 'Courier New', monospace;
  font-size: 20px !important;
}

/* 问卷链接信息 */
.questionnaire-links {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.link-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
}

.link-item {
  margin-bottom: 24px;
}

.link-item:last-child {
  margin-bottom: 0;
}

.link-item label {
  display: block;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.link-input-group {
  display: flex;
  gap: 12px;
}

.link-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  background: #fafafa;
  color: #666;
}

.copy-btn {
  background: #1890ff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.copy-btn:hover {
  background: #40a9ff;
  transform: translateY(-1px);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
  min-width: 140px;
  justify-content: center;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.btn-secondary {
  background: white;
  color: #666;
  border: 1px solid #d9d9d9;
}

.btn-secondary:hover {
  border-color: #40a9ff;
  color: #40a9ff;
  transform: translateY(-2px);
}

/* 分享对话框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.modal.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 24px;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.share-option {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.share-option:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.share-option span {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 成功提示 */
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  background: #52c41a;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.toast.show {
  transform: translateX(0);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .questionnaire-meta {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  .result-summary {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .link-input-group {
    flex-direction: column;
  }

  .copy-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .questionnaire-result-content {
    padding: 0 16px 32px;
  }

  .questionnaire-title {
    padding: 24px 20px;
  }

  .questionnaire-title h1 {
    font-size: 24px;
  }

  .summary-card {
    padding: 20px;
  }

  .questionnaire-links {
    padding: 24px 20px;
  }
}
</style>

