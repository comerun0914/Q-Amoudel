<template>
  <a-modal
    :open="open"
    title="回复详情"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
    @update:open="handleOpenChange"
  >
    <div v-if="responseData" class="response-detail">
      <!-- 基本信息 -->
      <div class="basic-info">
        <h4>基本信息</h4>
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="回复ID">
            {{ responseData.id }}
          </a-descriptions-item>
          <a-descriptions-item label="提交时间">
            {{ formatDateTime(responseData.submitTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="用时">
            {{ responseData.duration }}分钟
          </a-descriptions-item>
          <a-descriptions-item label="IP地址">
            {{ responseData.ipAddress }}
          </a-descriptions-item>
          <a-descriptions-item label="设备信息" :span="2">
            {{ responseData.userAgent }}
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <!-- 问题回复详情 -->
      <div class="questions-responses">
        <h4>问题回复详情</h4>
        <div
          v-for="(response, index) in responseData.questions"
          :key="response.questionId"
          class="question-response"
        >
          <div class="question-header">
            <span class="question-number">Q{{ index + 1 }}</span>
            <span class="question-title">{{ response.questionTitle }}</span>
            <span class="question-type">{{ getQuestionTypeName(response.questionType) }}</span>
          </div>

          <div class="response-content">
            <!-- 单选题回复 -->
            <div v-if="response.questionType === 'single'" class="single-response">
              <div class="selected-option">
                <a-tag color="blue">{{ response.answer }}</a-tag>
              </div>
            </div>

            <!-- 多选题回复 -->
            <div v-if="response.questionType === 'multiple'" class="multiple-response">
              <div class="selected-options">
                <a-tag
                  v-for="option in response.answers"
                  :key="option"
                  color="blue"
                  style="margin-bottom: 8px"
                >
                  {{ option }}
                </a-tag>
              </div>
            </div>

            <!-- 问答题回复 -->
            <div v-if="response.questionType === 'text'" class="text-response">
              <div class="text-content">
                {{ response.answer }}
              </div>
            </div>

            <!-- 评分题回复 -->
            <div v-if="response.questionType === 'rating'" class="rating-response">
              <div class="rating-value">
                <a-rate :value="response.answer" disabled />
                <span class="rating-text">{{ response.answer }}分</span>
              </div>
            </div>

            <!-- 矩阵题回复 -->
            <div v-if="response.questionType === 'matrix'" class="matrix-response">
              <div class="matrix-answers">
                <div
                  v-for="answer in response.answers"
                  :key="`${answer.row}-${answer.column}`"
                  class="matrix-answer"
                >
                  <span class="matrix-label">{{ answer.row }} × {{ answer.column }}:</span>
                  <span class="matrix-value">{{ answer.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="modal-actions">
        <a-button @click="handleCancel">关闭</a-button>
        <a-button type="primary" @click="exportResponse">
          <download-outlined />
          导出此回复
        </a-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-state">
      <a-spin tip="加载回复详情中..." />
    </div>
  </a-modal>
</template>

<script setup>
import { computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'

// 定义props和emits
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  responseData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open'])

// 计算属性
const open = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// 获取问题类型名称
const getQuestionTypeName = (type) => {
  const typeNames = {
    single: '单选题',
    multiple: '多选题',
    text: '问答题',
    rating: '评分题',
    matrix: '矩阵题'
  }
  return typeNames[type] || '未知类型'
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN')
}

// 处理取消
const handleCancel = () => {
  emit('update:open', false)
}

// 处理open变化
const handleOpenChange = (newOpen) => {
  emit('update:open', newOpen)
}

// 导出回复
const exportResponse = () => {
  if (!props.responseData) {
    message.warning('没有可导出的数据')
    return
  }

  // 实现导出逻辑
  message.success('回复导出功能开发中...')

  // 这里可以生成CSV或PDF文件
  // 例如：生成CSV文件
  const csvContent = generateCSV(props.responseData)
  downloadCSV(csvContent, `回复详情_${props.responseData.id}.csv`)
}

// 生成CSV内容
const generateCSV = (data) => {
  const headers = ['问题', '类型', '回复内容']
  const rows = data.questions.map(q => [
    q.questionTitle,
    getQuestionTypeName(q.questionType),
    getAnswerText(q)
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  return csvContent
}

// 获取答案文本
const getAnswerText = (question) => {
  switch (question.questionType) {
    case 'single':
      return question.answer
    case 'multiple':
      return question.answers.join('; ')
    case 'text':
      return question.answer
    case 'rating':
      return `${question.answer}分`
    case 'matrix':
      return question.answers.map(a => `${a.row}×${a.column}:${a.value}`).join('; ')
    default:
      return ''
  }
}

// 下载CSV文件
const downloadCSV = (content, filename) => {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
</script>

<style scoped>
.response-detail {
  max-height: 600px;
  overflow-y: auto;
}

.basic-info,
.questions-responses {
  margin-bottom: 24px;
}

.basic-info h4,
.questions-responses h4 {
  margin: 0 0 16px 0;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 500;
}

/* 问题回复样式 */
.question-response {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.question-number {
  background: #1890ff;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}

.question-title {
  flex: 1;
  font-weight: 500;
  color: #1a1a1a;
}

.question-type {
  background: #52c41a;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.response-content {
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

/* 单选题回复 */
.single-response .selected-option {
  display: flex;
  gap: 8px;
}

/* 多选题回复 */
.multiple-response .selected-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 问答题回复 */
.text-response .text-content {
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

/* 评分题回复 */
.rating-response .rating-value {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-text {
  font-weight: 500;
  color: #1890ff;
}

/* 矩阵题回复 */
.matrix-response .matrix-answers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.matrix-answer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.matrix-label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.matrix-value {
  color: #1890ff;
  font-weight: 500;
}

/* 操作按钮 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .ant-btn {
    width: 100%;
  }
}
</style>
