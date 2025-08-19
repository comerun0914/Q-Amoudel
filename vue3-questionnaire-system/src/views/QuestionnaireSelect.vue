<template>
  <div class="questionnaire-select-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-with-back">
            <button 
              @click="goToHome"
              class="back-home-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              主页
            </button>
            <h1 class="page-title">选择问卷</h1>
          </div>
          <p class="page-subtitle">选择您要填写的问卷，或通过问卷代码快速填写</p>
        </div>
      </div>
    </div>

    <!-- 问卷代码快速填写 -->
    <div class="quick-fill-section">
      <a-card title="快速填写" class="quick-fill-card">
        <div class="code-input-group">
          <a-input
            v-model:value="questionnaireCode"
            placeholder="请输入问卷代码（问卷ID）"
            size="large"
            @press-enter="handleQuickFill"
          >
            <template #prefix>
              <KeyOutlined />
            </template>
          </a-input>
          <a-button 
            type="primary" 
            size="large" 
            @click="handleQuickFill"
            :loading="quickFillLoading"
          >
            立即填写
          </a-button>
        </div>
        <p class="code-hint">问卷代码通常是数字格式，可以从问卷创建者处获取</p>
      </a-card>
    </div>

    <!-- 可填写的问卷列表 -->
    <div class="questionnaire-list-section">
      <a-card title="可填写的问卷" class="questionnaire-list-card">
        <a-spin :spinning="loading" tip="正在加载问卷列表...">
          <div v-if="!loading && questionnaires.length > 0" class="questionnaire-grid">
            <div 
              v-for="questionnaire in questionnaires" 
              :key="questionnaire.id" 
              class="questionnaire-item"
              @click="fillQuestionnaire(questionnaire)"
            >
              <div class="questionnaire-header">
                <h3 class="questionnaire-title">{{ questionnaire.title }}</h3>
                <a-tag :color="questionnaire.status === 1 ? 'green' : 'orange'">
                  {{ questionnaire.status === 1 ? '已发布' : '草稿' }}
                </a-tag>
              </div>
              <p class="questionnaire-description">{{ questionnaire.description || '暂无描述' }}</p>
              <div class="questionnaire-meta">
                <span class="meta-item">
                  <CalendarOutlined />
                  {{ formatDate(questionnaire.startDate) }}
                </span>
                <span class="meta-item">
                  <UserOutlined />
                  {{ questionnaire.creatorName || '未知用户' }}
                </span>
              </div>
              <div class="questionnaire-actions">
                <a-button type="primary" size="small" @click.stop="fillQuestionnaire(questionnaire)">
                  填写问卷
                </a-button>
                <a-button size="small" @click.stop="previewQuestionnaire(questionnaire)">
                  预览
                </a-button>
              </div>
            </div>
          </div>
          
          <div v-else-if="!loading && questionnaires.length === 0" class="empty-state">
            <a-empty description="暂无可填写的问卷">
              <template #image>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                  <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                  <path d="M12 3c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"/>
                  <path d="M12 21c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"/>
                </svg>
              </template>
              <p>您可以通过问卷代码快速填写，或等待管理员发布新问卷</p>
            </a-empty>
          </div>
        </a-spin>
      </a-card>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-section">
      <a-alert
        :message="errorMessage"
        type="error"
        show-icon
        closable
        @close="clearError"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  KeyOutlined,
  CalendarOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'
import { questionnaireAPI as questionnaireApi } from '@/api/questionnaire'
import { CONFIG } from '@/api/config'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const quickFillLoading = ref(false)
const error = ref(false)
const errorMessage = ref('')
const questionnaireCode = ref('')
const questionnaires = ref([])

// 获取可填写的问卷列表
const fetchQuestionnaires = async () => {
  try {
    loading.value = true
    error.value = false
    
    // 获取所有已发布的问卷
    const response = await questionnaireApi.getAllQuestionnaires({
      status: 1, // 只获取已发布的问卷
      pageSize: 100 // 获取较多数据
    })
    
    if (response.code === 200) {
      questionnaires.value = response.data.list || []
    } else {
      throw new Error(response.message || '获取问卷列表失败')
    }
  } catch (err) {
    console.error('获取问卷列表失败:', err)
    error.value = true
    errorMessage.value = err.message || '获取问卷列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 快速填写问卷
const handleQuickFill = async () => {
  if (!questionnaireCode.value.trim()) {
    message.warning('请输入问卷代码')
    return
  }
  
  const code = questionnaireCode.value.trim()
  
  // 验证代码格式（应该是数字）
  if (!/^\d+$/.test(code)) {
    message.error('问卷代码应该是数字格式')
    return
  }
  
  quickFillLoading.value = true
  
  try {
    // 跳转到问卷填写页面，传递问卷代码
    await router.push({
      path: `/questionnaire/fill/${code}`,
      query: { code: code }
    })
    
    message.success('正在跳转到问卷填写页面...')
  } catch (err) {
    console.error('跳转失败:', err)
    message.error('跳转失败，请稍后重试')
  } finally {
    quickFillLoading.value = false
  }
}

// 填写指定问卷
const fillQuestionnaire = (questionnaire) => {
  if (questionnaire.status !== 1) {
    message.warning('该问卷尚未发布，无法填写')
    return
  }
  
  router.push(`/questionnaire/fill/${questionnaire.id}`)
}

// 预览问卷
const previewQuestionnaire = (questionnaire) => {
  router.push(`/questionnaire/preview/${questionnaire.id}`)
}

// 返回主页
const goToHome = () => {
  router.push('/')
}

// 清除错误
const clearError = () => {
  error.value = false
  errorMessage.value = ''
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  try {
    return new Date(dateString).toLocaleDateString('zh-CN')
  } catch {
    return '未知'
  }
}

// 生命周期
onMounted(() => {
  fetchQuestionnaires()
})
</script>

<style scoped>
.questionnaire-select-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24px;
}

.page-header {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.title-with-back {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.back-home-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: #1890ff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-home-btn:hover {
  background: #40a9ff;
  transform: translateY(-1px);
}

.back-home-btn svg {
  width: 20px;
  height: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.quick-fill-section {
  max-width: 1200px;
  margin: 0 auto 24px;
}

.quick-fill-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.code-input-group {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.code-input-group .ant-input {
  flex: 1;
}

.code-hint {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.questionnaire-list-section {
  max-width: 1200px;
  margin: 0 auto;
}

.questionnaire-list-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.questionnaire-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.questionnaire-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.questionnaire-item:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  transform: translateY(-2px);
}

.questionnaire-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.questionnaire-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  margin-right: 12px;
}

.questionnaire-description {
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.questionnaire-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-size: 14px;
}

.questionnaire-actions {
  display: flex;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
}

.empty-state svg {
  color: #d9d9d9;
}

.error-section {
  max-width: 1200px;
  margin: 24px auto 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-select-page {
    padding: 16px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .code-input-group {
    flex-direction: column;
  }
  
  .questionnaire-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .questionnaire-item {
    padding: 16px;
  }
}
</style>
