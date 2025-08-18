<template>
  <div class="success-container">
    <div class="success-content">
      <!-- 成功图标 -->
      <div class="success-icon">
        <CheckCircleOutlined />
      </div>

      <!-- 成功标题 -->
      <h1 class="success-title">问卷提交成功！</h1>

      <!-- 成功描述 -->
      <p class="success-description">
        感谢您完成问卷填写，您的反馈对我们非常重要。
      </p>

      <!-- 提交信息 -->
      <div class="submission-info">
        <div class="info-item">
          <span class="info-label">提交时间：</span>
          <span class="info-value">{{ submitTime }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">填写用时：</span>
          <span class="info-value">{{ durationText }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">提交编号：</span>
          <span class="info-value">{{ submissionId }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button
          type="primary"
          size="large"
          @click="goHome"
          class="btn-home"
        >
          <template #icon>
            <HomeOutlined />
          </template>
          返回首页
        </a-button>

        <a-button
          type="default"
          size="large"
          @click="goBack"
          class="btn-back"
        >
          <template #icon>
            <ArrowLeftOutlined />
          </template>
          返回上一页
        </a-button>

        <a-button
          type="default"
          size="large"
          @click="viewResults"
          class="btn-results"
        >
          <template #icon>
            <BarChartOutlined />
          </template>
          查看结果
        </a-button>
      </div>

      <!-- 温馨提示 -->
      <div class="tips">
        <h3>温馨提示</h3>
        <ul>
          <li>您的答案已经被安全保存，不会丢失</li>
          <li>如需修改答案，请联系问卷发布者</li>
          <li>感谢您的参与和支持</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  CheckCircleOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const submitTime = ref('')
const durationText = ref('')
const submissionId = ref('')

// 方法
const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}

const viewResults = () => {
  // 这里可以跳转到问卷结果页面
  message.info('问卷结果功能正在开发中...')
}

// 格式化时间
const formatDuration = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes > 0) {
    return `${minutes}分${seconds}秒`
  } else {
    return `${seconds}秒`
  }
}

// 生命周期
onMounted(() => {
  // 从路由参数或本地存储获取提交信息
  const params = route.params
  const query = route.query

  // 设置提交时间
  submitTime.value = params.submitTime || query.submitTime || new Date().toLocaleString('zh-CN')

  // 设置填写用时
  const duration = params.duration || query.duration || 0
  durationText.value = formatDuration(parseInt(duration))

  // 设置提交编号
  submissionId.value = params.submissionId || query.submissionId || 'N/A'
})
</script>

<style scoped>
.success-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.success-content {
  background: #fff;
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

.success-icon {
  font-size: 80px;
  color: #52c41a;
  margin-bottom: 24px;
}

.success-title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.success-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.6;
}

.submission-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e8e8e8;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #666;
}

.info-value {
  font-weight: 600;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.btn-home,
.btn-back,
.btn-results {
  min-width: 120px;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
}

.tips {
  text-align: left;
  background: #f0f8ff;
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid #1890ff;
}

.tips h3 {
  color: #1890ff;
  margin-bottom: 16px;
  font-size: 18px;
}

.tips ul {
  margin: 0;
  padding-left: 20px;
}

.tips li {
  color: #666;
  margin-bottom: 8px;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .success-content {
    padding: 32px 24px;
  }

  .success-title {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-home,
  .btn-back,
  .btn-results {
    width: 100%;
  }
}
</style>
