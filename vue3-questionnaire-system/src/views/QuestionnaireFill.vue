<template>
  <div class="fill-container">
    <!-- 填写头部 -->
    <header class="fill-header">
      <div class="header-content">
        <div class="header-left">
          <a-button class="btn-back" @click="goBack" :loading="backLoading">
            <template #icon>
              <ArrowLeftOutlined />
            </template>
            返回
          </a-button>
          <div class="progress-info">
            <span class="progress-text">进度: <span>{{ progressText }}</span></span>
            <a-progress
              :percent="progressPercent"
              :show-info="false"
              stroke-color="#1890ff"
              class="progress-bar"
            />
          </div>
        </div>
        <div class="header-right">
          <a-button class="btn-save" @click="saveDraft" :loading="saveLoading">
            <template #icon>
              <SaveOutlined />
            </template>
            保存草稿
          </a-button>
          <div class="timer">
            <ClockCircleOutlined />
            <span>{{ timerText }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 问卷内容区域 -->
    <main class="questionnaire-content">
      <!-- 问卷标题 -->
      <div class="questionnaire-title">
        <h1>{{ questionnaireTitle }}</h1>
        <p>{{ questionnaireDescription }}</p>
        <div class="questionnaire-meta">
          <span class="meta-item">
            <CalendarOutlined />
            开始时间: {{ startTime }}
          </span>
          <span class="meta-item">
            <ClockCircleOutlined />
            预计用时: {{ estimatedTime }}
          </span>
        </div>
      </div>

      <!-- 加载状态 -->
      <a-spin :spinning="loading" tip="正在加载问卷数据...">
        <div v-if="!loading && !error" class="content-wrapper">
          <!-- 问题列表 -->
          <div v-if="currentQuestion" class="question-container">
            <div class="question-header">
              <h2 class="question-title">
                第{{ currentQuestionIndex + 1 }}题
                <a-tag v-if="currentQuestion.isRequired" color="red">必填</a-tag>
              </h2>
              <p class="question-description">{{ currentQuestion.content }}</p>
            </div>

            <!-- 单选题 -->
            <div v-if="currentQuestion.questionType === 1" class="question-content">
              <a-radio-group v-model:value="currentQuestion.answer" class="option-group">
                <a-radio
                  v-for="option in currentQuestion.options"
                  :key="option.id"
                  :value="option.id"
                  class="option-item"
                >
                  {{ option.optionContent }}
                </a-radio>
              </a-radio-group>
            </div>

            <!-- 多选题 -->
            <div v-else-if="currentQuestion.questionType === 2" class="question-content">
              <a-checkbox-group v-model:value="currentQuestion.answer" class="option-group">
                <a-checkbox
                  v-for="option in currentQuestion.options"
                  :key="option.id"
                  :value="option.id"
                  class="option-item"
                >
                  {{ option.optionContent }}
                </a-checkbox>
              </a-checkbox-group>
            </div>

            <!-- 文本题 -->
            <div v-else-if="currentQuestion.questionType === 3" class="question-content">
              <a-textarea
                v-model:value="currentQuestion.answer"
                :rows="4"
                placeholder="请输入您的答案..."
                :maxlength="currentQuestion.textQuestionConfig?.maxLength || 500"
                show-count
              />
            </div>

            <!-- 评分题 -->
            <div v-else-if="currentQuestion.questionType === 4" class="question-content">
              <a-rate
                v-model:value="currentQuestion.answer"
                :count="currentQuestion.ratingQuestionConfig?.maxRating || 5"
                :tooltips="ratingTooltips"
                show-tooltip
              />
              <div class="rating-labels">
                <span>{{ ratingLabels[0] }}</span>
                <span>{{ ratingLabels[ratingLabels.length - 1] }}</span>
              </div>
            </div>

            <!-- 矩阵题 -->
            <div v-else-if="currentQuestion.questionType === 5" class="question-content">
              <a-table
                :columns="matrixColumns"
                :data-source="matrixData"
                :pagination="false"
                :bordered="true"
                size="small"
                class="matrix-table"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'question'">
                    {{ record.question }}
                  </template>
                  <template v-else>
                    <div
                      class="matrix-radio"
                      :class="{ selected: isMatrixOptionSelected(record.key, column.colId) }"
                      @click="selectMatrixOption(record.key, column.colId)"
                    >
                      <div class="radio-inner"></div>
                    </div>
                  </template>
                </template>
              </a-table>
            </div>
          </div>

          <!-- 导航按钮 -->
          <div class="navigation-buttons">
            <a-button
              class="btn-nav btn-prev"
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              <template #icon>
                <ArrowLeftOutlined />
              </template>
              上一题
            </a-button>
            <a-button
              class="btn-nav btn-next"
              @click="nextQuestion"
              :disabled="currentQuestionIndex === questions.length - 1"
            >
              下一题
              <template #icon>
                <ArrowRightOutlined />
              </template>
            </a-button>
          </div>

          <!-- 提交区域 -->
          <div v-if="currentQuestionIndex === questions.length - 1" class="submit-section">
            <div class="submit-content">
              <h3>问卷填写完成</h3>
              <p>请检查您的答案，确认无误后点击提交按钮</p>
              <div class="answer-summary">
                <a-list
                  :data-source="answerSummary"
                  size="small"
                  class="summary-list"
                >
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <a-list-item-meta>
                        <template #title>
                          <span class="question-number">第{{ item.index + 1 }}题</span>
                          <span class="question-text">{{ item.question }}</span>
                        </template>
                        <template #description>
                          <span class="answer-text">{{ item.answer }}</span>
                        </template>
                      </a-list-item-meta>
                    </a-list-item>
                  </template>
                </a-list>
              </div>
              <div class="submit-actions">
                <a-button @click="reviewAnswers" type="default">
                  重新检查
                </a-button>
                <a-button @click="submitQuestionnaire" type="primary" :loading="submitLoading">
                  <template #icon>
                    <SendOutlined />
                  </template>
                  提交问卷
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </a-spin>

      <!-- 错误状态 -->
      <div v-if="error" class="error-container">
        <a-result
          status="error"
          title="加载失败"
          :sub-title="errorMessage"
        >
          <template #extra>
            <a-button type="primary" @click="retryLoad">
              重试
            </a-button>
          </template>
        </a-result>
      </div>
    </main>

    <!-- 确认对话框 -->
    <a-modal
      v-model:open="confirmModalVisible"
      :title="confirmTitle"
      @ok="handleConfirm"
      @cancel="handleCancel"
    >
      <p>{{ confirmMessage }}</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  SendOutlined
} from '@ant-design/icons-vue'
import { questionnaireApi, questionnaireUtils } from '@/api/questionnaire'
import { CONFIG } from '@/api/config'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('无法加载问卷数据')
const backLoading = ref(false)
const saveLoading = ref(false)
const submitLoading = ref(false)

// 问卷数据
const questionnaireTitle = ref('问卷标题')
const questionnaireDescription = ref('问卷描述信息')
const startTime = ref('-')
const estimatedTime = ref('-')
const questions = ref([])
const currentQuestionIndex = ref(0)

// 计时器
const timerText = ref('00:00')
const startTimeStamp = ref(Date.now())
let timerInterval = null

// 确认对话框
const confirmModalVisible = ref(false)
const confirmTitle = ref('确认操作')
const confirmMessage = ref('确定要执行此操作吗？')
const confirmCallback = ref(null)

// 计算属性
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null
})

const progressText = computed(() => {
  if (questions.value.length === 0) return '0/0'
  return `${currentQuestionIndex.value + 1}/${questions.value.length}`
})

const progressPercent = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100)
})

const answerSummary = computed(() => {
  return questions.value.map((question, index) => {
    const answerText = questionnaireUtils.formatAnswerText(question)

    return {
      index,
      question: question.content,
      answer: answerText
    }
  })
})

const matrixColumns = computed(() => {
  if (!currentQuestion.value || currentQuestion.value.questionType !== 5) return []

  const columns = [
    {
      title: '问题',
      dataIndex: 'question',
      key: 'question',
      width: 120,
      fixed: 'left'
    }
  ]

  // 添加选项列
  if (currentQuestion.value.matrixQuestionConfig?.columns) {
    currentQuestion.value.matrixQuestionConfig.columns.forEach((col, index) => {
      columns.push({
        title: col.columnContent,
        dataIndex: `option${index}`,
        key: `option${index}`,
        colId: col.id,
        width: 100,
        align: 'center'
      })
    })
  }

  return columns
})

const matrixData = computed(() => {
  if (!currentQuestion.value || currentQuestion.value.questionType !== 5) return []

  return currentQuestion.value.matrixQuestionConfig?.rows?.map(row => ({
    key: row.id,
    question: row.rowContent
  })) || []
})

const ratingTooltips = computed(() => {
  if (!currentQuestion.value || currentQuestion.value.questionType !== 4) return []

  const maxRating = currentQuestion.value.ratingQuestionConfig?.maxRating || 5
  return Array.from({ length: maxRating }, (_, i) => `${i + 1}分`)
})

const ratingLabels = computed(() => {
  if (!currentQuestion.value || currentQuestion.value.questionType !== 4) return []

  const maxRating = currentQuestion.value.ratingQuestionConfig?.maxRating || 5
  return Array.from({ length: maxRating }, (_, i) => `${i + 1}分`)
})

// 方法
const goBack = () => {
  backLoading.value = true

  // 检查是否有未保存的更改
  const hasChanges = questions.value.some(q => q.answer !== undefined && q.answer !== null && q.answer !== '')

  if (hasChanges) {
    Modal.confirm({
      title: '确认离开',
      content: '您有未保存的更改，确定要离开吗？',
      onOk: () => {
        router.back()
      },
      onCancel: () => {
        backLoading.value = false
      }
    })
  } else {
    router.back()
  }
}

// 加载问卷
const loadQuestionnaire = async () => {
  loading.value = true
  error.value = false

  try {
    const questionnaireId = route.params.id
    const url = route.query.url
    const code = route.query.code

    let response

    if (questionnaireId) {
      // 根据数据库表结构，从question_create表获取问卷数据
      response = await questionnaireApi.getQuestionnaireDetail(questionnaireId)
    } else if (url) {
      // 根据URL获取问卷
      response = await questionnaireApi.getQuestionnaireByUrl(url)
    } else if (code) {
      // 根据代码获取问卷
      response = await questionnaireApi.getQuestionnaireByCode(code)
    } else {
      throw new Error('缺少问卷标识')
    }

    if (response.code === 200) {
      const data = response.data

      // 根据后端数据结构映射
      const questionnaire = data.questionnaire || data
      questionnaireTitle.value = questionnaire.title || '问卷标题'
      questionnaireDescription.value = questionnaire.description || '问卷描述信息'
      startTime.value = questionnaire.createTime ? new Date(questionnaire.createTime).toLocaleString('zh-CN') : '-'
      estimatedTime.value = `${questionnaire.estimatedTime || 10} 分钟`

      // 初始化问题数据，根据数据库表结构
      const questionList = data.questions || []
      questions.value = questionList.map(q => {
        // 使用工具函数初始化答案
        const answer = questionnaireUtils.initializeAnswer(q.questionType)

        return {
          ...q,
          answer,
          // 确保必填字段存在
          isRequired: q.isRequired !== undefined ? q.isRequired : false
        }
      })

      // 加载草稿数据
      await loadDraft()

      // 启动计时器
      startTimer()
    } else {
      throw new Error(response.message || '加载失败')
    }
  } catch (error) {
    console.error('加载问卷失败:', error)
    error.value = true
    errorMessage.value = error.message || '无法加载问卷数据'
  } finally {
    loading.value = false
  }
}

// 保存草稿
const saveDraft = async () => {
  saveLoading.value = true

  try {
    // 收集所有答案，根据数据库表结构
    const answers = questions.value.map(question => ({
      questionId: question.id,
      answer: question.answer,
      questionType: question.questionType
    }))

    // 根据数据库表结构，保存到questionnaire_draft表
    await questionnaireApi.saveDraft({
      questionnaireId: route.params.id,
      answers,
      timestamp: Date.now()
    })

    message.success('草稿已保存')
  } catch (error) {
    console.error('保存草稿失败:', error)
    message.error('保存草稿失败: ' + (error.message || '未知错误'))
  } finally {
    saveLoading.value = false
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const reviewAnswers = () => {
  currentQuestionIndex.value = 0
}

// 提交问卷
const submitQuestionnaire = async () => {
  // 验证必填题目
  const requiredQuestions = questions.value.filter(q => q.isRequired)
  const unansweredRequired = requiredQuestions.filter(q => !questionnaireUtils.validateAnswer(q))

  if (unansweredRequired.length > 0) {
    message.warning(`还有 ${unansweredRequired.length} 道必填题目未完成`)
    return
  }

  submitLoading.value = true

  try {
    // 收集所有答案，根据数据库表结构
    const answers = questions.value.map(question => ({
      questionId: question.id,
      answer: question.answer,
      questionType: question.questionType
    }))

    // 根据数据库表结构，保存到questionnaire_submission和question_answer表
    await questionnaireApi.submitQuestionnaire({
      questionnaireId: route.params.id,
      answers,
      submitTime: Date.now(),
      duration: Date.now() - startTimeStamp.value
    })

    message.success('问卷提交成功！')

    // 跳转到成功页面
    router.push('/questionnaire/success')
  } catch (error) {
    console.error('问卷提交失败:', error)
    message.error('问卷提交失败: ' + (error.message || '未知错误'))
  } finally {
    submitLoading.value = false
  }
}

const retryLoad = () => {
  error.value = false
  loadQuestionnaire()
}

// 加载草稿
const loadDraft = async () => {
  try {
    const questionnaireId = route.params.id
    if (!questionnaireId) return

    // 根据数据库表结构，从questionnaire_draft表获取草稿数据
    const response = await questionnaireApi.getDraft(questionnaireId)

    if (response.code === 200 && response.data) {
      const draft = response.data

      // 恢复草稿答案
      draft.answers?.forEach(draftAnswer => {
        const question = questions.value.find(q => q.id === draftAnswer.questionId)
        if (question) {
          question.answer = draftAnswer.answer
        }
      })

      message.info('已恢复草稿数据')
    }
  } catch (error) {
    console.log('加载草稿失败:', error)
    // 草稿加载失败不影响问卷填写
  }
}

const startTimer = () => {
  startTimeStamp.value = Date.now()

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTimeStamp.value
    const minutes = Math.floor(elapsed / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)

    timerText.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const showConfirm = (title, message, callback) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmCallback.value = callback
  confirmModalVisible.value = true
}

const handleConfirm = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
  confirmModalVisible.value = false
}

const handleCancel = () => {
  confirmModalVisible.value = false
}

// 矩阵题相关方法
const isMatrixOptionSelected = (rowId, colId) => {
  if (!currentQuestion.value || currentQuestion.value.questionType !== 5) return false

  const answerKey = `${currentQuestion.value.id}_${rowId}_${colId}`
  return currentQuestion.value.answer?.[answerKey] === true
}

const selectMatrixOption = (rowId, colId) => {
  if (!currentQuestion.value || currentQuestion.value.questionType !== 5) return

  // 初始化答案对象（如果不存在）
  if (!currentQuestion.value.answer) {
    currentQuestion.value.answer = {}
  }

  const answerKey = `${currentQuestion.value.id}_${rowId}_${colId}`

  // 处理单选逻辑 - 每行只能选择一个选项
  // 先清除当前行的所有选中状态
  Object.keys(currentQuestion.value.answer).forEach(key => {
    if (key.startsWith(`${currentQuestion.value.id}_${rowId}_`)) {
      currentQuestion.value.answer[key] = false
    }
  })

  // 然后选中当前选项
  currentQuestion.value.answer[answerKey] = true

  console.log('矩阵题答案已更新:', currentQuestion.value.answer)
}

// 生命周期
onMounted(() => {
  loadQuestionnaire()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.fill-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.fill-header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: 6px;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.progress-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: 6px;
}

.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 6px;
  font-weight: 500;
  color: #333;
}

.questionnaire-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

.questionnaire-title {
  text-align: center;
  margin-bottom: 40px;
}

.questionnaire-title h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
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
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 14px;
}

.content-wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-container {
  margin-bottom: 32px;
}

.question-header {
  margin-bottom: 24px;
}

.question-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

.question-content {
  margin-bottom: 24px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-item {
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.3s;
}

.option-item:hover {
  border-color: #1890ff;
  background-color: #f0f8ff;
}

.rating-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  color: #999;
  font-size: 14px;
}

.matrix-table {
  margin-top: 16px;
}

.matrix-table :deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  text-align: center;
}

.matrix-table :deep(.ant-table-tbody > tr > td) {
  text-align: center;
  vertical-align: middle;
}

/* 矩阵题单选按钮样式 */
.matrix-radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #d9d9d9;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.matrix-radio:hover {
  border-color: #1890ff;
  transform: scale(1.1);
}

.matrix-radio:active {
  transform: scale(0.95);
}

.matrix-radio.selected {
  border-color: #1890ff;
  background-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.matrix-radio .radio-inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.matrix-radio.selected .radio-inner {
  opacity: 1;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin: 32px 0;
}

.btn-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 24px;
  border-radius: 6px;
}

.submit-section {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #e8e8e8;
}

.submit-content {
  text-align: center;
}

.submit-content h3 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.submit-content p {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.answer-summary {
  margin-bottom: 32px;
  text-align: left;
}

.summary-list {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.question-number {
  font-weight: 600;
  color: #1890ff;
  margin-right: 8px;
}

.question-text {
  color: #333;
}

.answer-text {
  color: #666;
  font-style: italic;
}

.submit-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.submit-actions .ant-btn {
  height: 44px;
  padding: 0 32px;
  border-radius: 6px;
  font-size: 16px;
}

.error-container {
  background: #fff;
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    flex-direction: column;
    gap: 16px;
  }

  .header-left {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .progress-info {
    min-width: auto;
  }

  .questionnaire-content {
    padding: 24px 16px;
  }

  .content-wrapper {
    padding: 24px 16px;
  }

  .questionnaire-title h1 {
    font-size: 24px;
  }

  .questionnaire-meta {
    flex-direction: column;
    gap: 16px;
  }

  .navigation-buttons {
    flex-direction: column;
    gap: 16px;
  }

  .submit-actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
