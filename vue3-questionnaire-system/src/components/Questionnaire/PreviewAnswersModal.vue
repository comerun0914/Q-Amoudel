<template>
  <a-modal
    :open="open"
    title="预览答案"
    width="900px"
    :footer="null"
    @cancel="handleCancel"
    @update:open="handleOpenChange"
  >
    <div class="preview-content">
      <!-- 问卷信息 -->
      <div class="questionnaire-info">
        <h3>问卷信息</h3>
        <div class="info-summary">
          <div class="info-item">
            <span class="label">总题数：</span>
            <span class="value">{{ questions.length }}</span>
          </div>
          <div class="info-item">
            <span class="label">已答题数：</span>
            <span class="value">{{ answeredCount }}</span>
          </div>
          <div class="info-item">
            <span class="label">必填题完成：</span>
            <span class="value" :class="{ 'completed': requiredCompleted, 'incomplete': !requiredCompleted }">
              {{ requiredCompleted ? '已完成' : '未完成' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 答案列表 -->
      <div class="answers-list">
        <h3>答案详情</h3>
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="answer-item"
          :class="{ 'answered': isQuestionAnswered(question.id) }"
        >
          <div class="question-header">
            <span class="question-number">Q{{ index + 1 }}</span>
            <span class="question-title">{{ question.title }}</span>
            <div class="question-meta">
              <span class="question-type">{{ getQuestionTypeName(question.type) }}</span>
              <a-tag v-if="question.required" color="red" size="small">必填</a-tag>
              <a-tag v-if="isQuestionAnswered(question.id)" color="green" size="small">已答</a-tag>
              <a-tag v-else color="orange" size="small">未答</a-tag>
            </div>
          </div>

          <div class="answer-content">
            <div v-if="isQuestionAnswered(question.id)" class="answer-display">
              <!-- 单选题答案 -->
              <div v-if="question.type === 'single'" class="single-answer">
                <a-tag color="blue">{{ getAnswerText(question) }}</a-tag>
              </div>

              <!-- 多选题答案 -->
              <div v-else-if="question.type === 'multiple'" class="multiple-answer">
                <a-tag
                  v-for="answer in getAnswerText(question)"
                  :key="answer"
                  color="blue"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ answer }}
                </a-tag>
              </div>

              <!-- 问答题答案 -->
              <div v-else-if="question.type === 'text'" class="text-answer">
                <div class="text-content">{{ getAnswerText(question) }}</div>
              </div>

              <!-- 评分题答案 -->
              <div v-else-if="question.type === 'rating'" class="rating-answer">
                <a-rate :value="getAnswerText(question)" disabled />
                <span class="rating-text">{{ getAnswerText(question) }}分</span>
              </div>

              <!-- 矩阵题答案 -->
              <div v-else-if="question.type === 'matrix'" class="matrix-answer">
                <div class="matrix-summary">
                  <div
                    v-for="(answer, key) in getAnswerText(question)"
                    :key="key"
                    class="matrix-item"
                  >
                    <span class="matrix-label">{{ key }}:</span>
                    <span class="matrix-value">{{ answer }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="no-answer">
              <a-empty description="未回答" :image="false" />
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="modal-actions">
        <a-button @click="handleCancel">返回编辑</a-button>
        <a-button type="primary" @click="handleSubmit" :disabled="!canSubmit">
          <check-outlined />
          确认提交
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue'
import { CheckOutlined } from '@ant-design/icons-vue'

// 定义props和emits
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  questions: {
    type: Array,
    default: () => []
  },
  answers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:open', 'submit'])

// 计算属性
const open = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// 已答题数量
const answeredCount = computed(() => {
  return props.questions.filter(question => isQuestionAnswered(question.id)).length
})

// 必填题是否完成
const requiredCompleted = computed(() => {
  return props.questions.every(question => {
    if (!question.required) return true
    return isQuestionAnswered(question.id)
  })
})

// 是否可以提交
const canSubmit = computed(() => {
  return requiredCompleted.value
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

// 检查问题是否已回答
const isQuestionAnswered = (questionId) => {
  const answer = props.answers[questionId]
  if (Array.isArray(answer)) {
    return answer.length > 0
  }
  return answer !== undefined && answer !== null && answer !== ''
}

// 获取答案文本
const getAnswerText = (question) => {
  const answer = props.answers[question.id]

  if (!answer) return ''

  switch (question.type) {
    case 'single':
      return answer
    case 'multiple':
      return Array.isArray(answer) ? answer : []
    case 'text':
      return answer
    case 'rating':
      return answer
    case 'matrix':
      // 处理矩阵题答案
      if (typeof answer === 'object' && answer !== null) {
        const matrixAnswers = {}
        Object.keys(answer).forEach(key => {
          if (answer[key]) {
            const [rowId, columnId] = key.split('-')
            const row = question.matrixRows.find(r => r.id == rowId)
            const column = question.matrixColumns.find(c => c.id == columnId)
            if (row && column) {
              matrixAnswers[`${row.text} × ${column.text}`] = answer[key]
            }
          }
        })
        return matrixAnswers
      }
      return {}
    default:
      return answer
  }
}

// 处理取消
const handleCancel = () => {
  emit('update:open', false)
}

// 处理提交
const handleSubmit = () => {
  emit('submit')
  emit('update:open', false)
}

// 处理 open 状态变化
const handleOpenChange = (newOpen) => {
  emit('update:open', newOpen)
}
</script>

<style scoped>
.preview-content {
  max-height: 600px;
  overflow-y: auto;
}

.questionnaire-info,
.answers-list {
  margin-bottom: 24px;
}

.questionnaire-info h3,
.answers-list h3 {
  margin: 0 0 16px 0;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 500;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

/* 问卷信息摘要 */
.info-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 12px;
  color: #666;
}

.info-item .value {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.info-item .value.completed {
  color: #52c41a;
}

.info-item .value.incomplete {
  color: #ff4d4f;
}

/* 答案列表 */
.answer-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.answer-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.answer-item.answered {
  border-color: #52c41a;
  background: #f6ffed;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.question-number {
  background: #1890ff;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
}

.question-title {
  flex: 1;
  font-weight: 500;
  color: #1a1a1a;
  font-size: 14px;
}

.question-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.question-type {
  background: #52c41a;
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.answer-content {
  padding: 16px;
  background: #fff;
}

.answer-display {
  min-height: 40px;
}

.no-answer {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

/* 单选题答案 */
.single-answer {
  display: flex;
  gap: 8px;
}

/* 多选题答案 */
.multiple-answer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 问答题答案 */
.text-answer .text-content {
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  background: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

/* 评分题答案 */
.rating-answer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-text {
  font-weight: 500;
  color: #1890ff;
}

/* 矩阵题答案 */
.matrix-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.matrix-item {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .info-summary {
    grid-template-columns: 1fr;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .question-meta {
    width: 100%;
    justify-content: flex-start;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .ant-btn {
    width: 100%;
  }
}
</style>
