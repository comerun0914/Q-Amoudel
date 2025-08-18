<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">
        <exclamation-circle-outlined />
      </div>
      <h2 class="error-title">页面出现错误</h2>
      <p class="error-message">{{ errorMessage }}</p>

      <div class="error-actions">
        <a-button type="primary" @click="handleRetry">
          <reload-outlined />
          重试
        </a-button>
        <a-button @click="handleGoHome">
          <home-outlined />
          返回首页
        </a-button>
        <a-button @click="handleReport">
          <bug-outlined />
          报告问题
        </a-button>
      </div>

      <div v-if="showDetails" class="error-details">
        <a-collapse>
          <a-collapse-panel key="1" header="错误详情">
            <pre class="error-stack">{{ errorStack }}</pre>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <div class="error-help">
        <p>如果问题持续存在，请联系技术支持</p>
        <p>错误ID: {{ errorId }}</p>
      </div>
    </div>
  </div>

  <slot v-else />
</template>

<script setup>
import { ref, computed, onErrorCaptured, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ExclamationCircleOutlined,
  ReloadOutlined,
  HomeOutlined,
  BugOutlined
} from '@ant-design/icons-vue'
import { useErrorStore } from '@/stores/error'

// 使用组合式API
const router = useRouter()
const errorStore = useErrorStore()

// 响应式数据
const hasError = ref(false)
const error = ref(null)
const errorId = ref('')
const showDetails = ref(false)

// 计算属性
const errorMessage = computed(() => {
  if (!error.value) return '未知错误'

  // 根据错误类型返回不同的消息
  if (error.value.name === 'TypeError') {
    return '数据类型错误，请检查输入内容'
  } else if (error.value.name === 'ReferenceError') {
    return '引用错误，请刷新页面重试'
  } else if (error.value.name === 'NetworkError') {
    return '网络连接错误，请检查网络设置'
  } else {
    return error.value.message || '页面出现未知错误'
  }
})

const errorStack = computed(() => {
  if (!error.value) return ''
  return error.value.stack || '无堆栈信息'
})

// 错误捕获
onErrorCaptured((err, instance, info) => {
  console.error('组件错误:', err, instance, info)

  // 记录错误
  errorStore.addSystemError(err.message, {
    component: instance?.$options?.name || 'Unknown',
    info,
    stack: err.stack
  })

  // 设置错误状态
  error.value = err
  hasError.value = true
  errorId.value = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return false // 阻止错误继续传播
})

// 重试
const handleRetry = () => {
  hasError.value = false
  error.value = null
  errorId.value = ''

  // 刷新页面
  window.location.reload()
}

// 返回首页
const handleGoHome = () => {
  router.push('/')
}

// 报告问题
const handleReport = () => {
  const reportData = {
    errorId: errorId.value,
    error: error.value?.message,
    stack: error.value?.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }

  // 复制错误信息到剪贴板
  navigator.clipboard.writeText(JSON.stringify(reportData, null, 2))
    .then(() => {
      message.success('错误信息已复制到剪贴板，请发送给技术支持')
    })
    .catch(() => {
      message.error('复制失败，请手动记录错误信息')
    })
}

// 开发环境下显示错误详情
onMounted(() => {
  if (import.meta.env.DEV) {
    showDetails.value = true
  }
})
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.error-container {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 64px;
  color: #ff4d4f;
  margin-bottom: 24px;
}

.error-title {
  font-size: 24px;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.error-message {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.error-actions .ant-btn {
  min-width: 100px;
}

.error-details {
  margin-bottom: 24px;
  text-align: left;
}

.error-stack {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
}

.error-help {
  border-top: 1px solid #e8e8e8;
  padding-top: 24px;
}

.error-help p {
  margin: 8px 0;
  color: #999;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-container {
    padding: 24px;
  }

  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .error-actions .ant-btn {
    width: 100%;
  }
}
</style>
