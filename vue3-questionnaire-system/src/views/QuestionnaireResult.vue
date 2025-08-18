<template>
  <div class="questionnaire-result">
    <div class="result-header">
      <h1>问卷结果</h1>
      <p class="result-subtitle">问卷ID: {{ questionnaireId }}</p>
    </div>

    <div class="result-content">
      <a-card title="基本信息" class="result-card">
        <a-descriptions :column="2">
          <a-descriptions-item label="问卷标题">
            {{ questionnaireData.title || '加载中...' }}
          </a-descriptions-item>
          <a-descriptions-item label="提交时间">
            {{ questionnaireData.submitTime || '加载中...' }}
          </a-descriptions-item>
          <a-descriptions-item label="总题数">
            {{ questionnaireData.totalQuestions || 0 }}
          </a-descriptions-item>
          <a-descriptions-item label="完成状态">
            <a-tag :color="questionnaireData.completed ? 'success' : 'warning'">
              {{ questionnaireData.completed ? '已完成' : '未完成' }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-card title="答题详情" class="result-card">
        <div v-if="answers.length === 0" class="no-answers">
          <a-empty description="暂无答题数据" />
        </div>
        <div v-else class="answers-list">
          <div
            v-for="(answer, index) in answers"
            :key="index"
            class="answer-item"
          >
            <h4>Q{{ index + 1 }}: {{ answer.questionText }}</h4>
            <div class="answer-content">
              <p><strong>答案:</strong> {{ answer.answerText }}</p>
              <p v-if="answer.score" class="score">
                <strong>得分:</strong> {{ answer.score }}
              </p>
            </div>
          </div>
        </div>
      </a-card>

      <div class="result-actions">
        <a-button type="primary" @click="goBack">
          返回问卷管理
        </a-button>
        <a-button @click="exportResult">
          导出结果
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { api } from '@/utils/request'
import { CONFIG } from '@/api/config'

const route = useRoute()
const router = useRouter()

const questionnaireId = ref(route.params.id)
const questionnaireData = ref({})
const answers = ref([])
const loading = ref(false)

// 获取问卷结果数据
const fetchResultData = async () => {
  try {
    loading.value = true

    // 根据数据库表结构，从questionnaire_submission和question_answer表获取结果数据
    const response = await api.get(`${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_RESULT}/${questionnaireId.value}`)

    if (response.code === 200) {
      questionnaireData.value = response.data.questionnaire || {}
      answers.value = response.data.answers || []
    } else {
      message.error(response.message || '获取问卷结果失败')
    }
  } catch (error) {
    console.error('获取问卷结果失败:', error)
    message.error('获取问卷结果失败')
  } finally {
    loading.value = false
  }
}

// 返回问卷管理
const goBack = () => {
  router.push('/questionnaire/management')
}

// 导出结果
const exportResult = () => {
  message.info('导出功能开发中...')
}

onMounted(() => {
  if (questionnaireId.value) {
    fetchResultData()
  }
})
</script>

<style scoped>
.questionnaire-result {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.result-header {
  text-align: center;
  margin-bottom: 32px;
}

.result-header h1 {
  color: #1890ff;
  margin-bottom: 8px;
}

.result-subtitle {
  color: #666;
  font-size: 16px;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.result-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.answer-item {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.answer-item h4 {
  color: #1890ff;
  margin-bottom: 12px;
}

.answer-content {
  color: #333;
}

.score {
  color: #52c41a;
  font-weight: 500;
}

.no-answers {
  text-align: center;
  padding: 40px 0;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .questionnaire-result {
    padding: 16px;
  }

  .result-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
