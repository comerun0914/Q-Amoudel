<template>
  <div class="questionnaire-preview">
    <div class="page-header">
      <div class="header-left">
        <h1>问卷预览</h1>
        <p>预览问卷的完整内容和填写界面</p>
      </div>
      <div class="header-actions">
        <a-button @click="goBack">
          <arrow-left-outlined />
          返回
        </a-button>
        <a-button type="primary" @click="startFill">
          <eye-outlined />
          开始填写
        </a-button>
      </div>
    </div>

    <div class="preview-content">
      <!-- 加载状态 -->
      <a-spin :spinning="loading" tip="加载中...">
        <div v-if="!loading && questionnaireInfo">
          <!-- 问卷基本信息 -->
          <a-card title="问卷信息" class="info-card">
            <div class="questionnaire-header">
              <h2 class="questionnaire-title">{{ questionnaireInfo.title }}</h2>
              <p class="questionnaire-description">{{ questionnaireInfo.description }}</p>
              <div class="questionnaire-meta">
                <a-tag color="blue">{{ getQuestionnaireTypeName(questionnaireInfo.type) }}</a-tag>
                <a-tag :color="questionnaireInfo.anonymous ? 'green' : 'orange'">
                  {{ questionnaireInfo.anonymous ? '匿名问卷' : '实名问卷' }}
                </a-tag>
                <a-tag color="purple">开始时间: {{ formatDate(questionnaireInfo.startDate) }}</a-tag>
                <a-tag color="red">结束时间: {{ formatDate(questionnaireInfo.endDate) }}</a-tag>
              </div>
            </div>
          </a-card>

          <!-- 问题列表 -->
          <a-card title="问题列表" class="questions-card">
            <div class="questions-list">
              <div
                v-for="(question, index) in questions"
                :key="question.id"
                class="question-item"
              >
                <div class="question-header">
                  <span class="question-number">Q{{ index + 1 }}</span>
                  <span class="question-type">{{ getQuestionTypeName(question.questionType) }}</span>
                  <a-tag :color="question.isRequired ? 'red' : 'blue'">
                    {{ question.isRequired ? '必填' : '选填' }}
                  </a-tag>
                </div>

                <div class="question-content">
                  <div class="question-text">{{ question.content }}</div>

                  <!-- 单选题预览 -->
                  <div v-if="question.questionType === 1" class="question-options">
                    <a-radio-group v-model:value="previewAnswers[question.id]">
                      <a-radio
                        v-for="option in question.options"
                        :key="option.id"
                        :value="option.id"
                      >
                        {{ option.optionContent || option.text }}
                      </a-radio>
                    </a-radio-group>
                  </div>

                  <!-- 多选题预览 -->
                  <div v-if="question.questionType === 2" class="question-options">
                    <a-checkbox-group v-model:value="previewAnswers[question.id]">
                      <a-checkbox
                        v-for="option in question.options"
                        :key="option.id"
                        :value="option.id"
                      >
                        {{ option.optionContent || option.text }}
                      </a-checkbox>
                    </a-checkbox-group>
                  </div>

                  <!-- 问答题预览 -->
                  <div v-if="question.questionType === 3" class="question-options">
                    <a-textarea
                      v-model:value="previewAnswers[question.id]"
                      placeholder="请输入您的回答"
                      :rows="4"
                    />
                  </div>

                  <!-- 评分题预览 -->
                  <div v-if="question.questionType === 4" class="question-options">
                    <a-rate v-model:value="previewAnswers[question.id]" />
                    <div class="rating-text">{{ previewAnswers[question.id] || 0 }}分</div>
                  </div>

                  <!-- 矩阵题预览 -->
                  <div v-if="question.questionType === 5" class="question-options">
                    <div class="matrix-preview-info">
                      <p class="matrix-description">请根据行标题和列标题进行选择：</p>
                      <p class="matrix-rule">每行只能选择一个选项，每列可以选择多个</p>
                    </div>
                    <a-table
                      :columns="getMatrixColumns(question)"
                      :data-source="getMatrixData(question)"
                      :pagination="false"
                      size="small"
                      bordered
                      class="matrix-table"
                    />
                  </div>
                </div>
              </div>

              <div v-if="questions.length === 0" class="empty-questions">
                <a-empty description="暂无问题">
                  <template #image>
                    <div class="empty-icon">
                      <question-circle-outlined />
                    </div>
                  </template>
                </a-empty>
              </div>
            </div>
          </a-card>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  EyeOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons-vue'
import { CONFIG } from '@/api/config'
import { api } from '@/utils/request'

// 使用组合式API
const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(true)
const questionnaireInfo = ref(null)
const questions = ref([])
const previewAnswers = ref({})

// 获取问卷ID
const questionnaireId = computed(() => route.params.id)

// 获取问卷类型名称
const getQuestionnaireTypeName = (type) => {
  const typeMap = {
    'survey': '调查问卷',
    'feedback': '反馈问卷',
    'evaluation': '评价问卷',
    'other': '其他'
  }
  return typeMap[type] || '未知类型'
}

// 获取问题类型名称
const getQuestionTypeName = (type) => {
  const typeMap = {
    1: '单选题',
    2: '多选题',
    3: '问答题',
    4: '评分题',
    5: '矩阵题'
  }
  return typeMap[type] || '未知类型'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未设置'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  } catch (error) {
    return dateString
  }
}

// 获取矩阵题列定义
const getMatrixColumns = (question) => {
  console.log('getMatrixColumns 被调用，question:', question)

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
  if (question.columns && question.columns.length > 0) {
    question.columns.forEach((col, index) => {
      columns.push({
        title: col.text || col.content || col,
        dataIndex: `option${index}`,
        key: `option${index}`,
        width: 100,
        align: 'center',
        customRender: ({ text, record, index: rowIndex }) => {
          const row = question.rows[rowIndex]
          const colId = col.id || index
          const answerKey = `${question.id}_${row.id}_${colId}`
          const isSelected = previewAnswers.value[answerKey]

          console.log('渲染矩阵题单元格:', {
            questionId: question.id,
            rowId: row.id,
            colId: colId,
            answerKey: answerKey,
            isSelected: isSelected,
            rowIndex: rowIndex
          })

          return h('div', {
            style: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '8px'
            },
            onClick: () => {
              console.log('点击矩阵题单元格:', answerKey)
              // 处理单选逻辑 - 每行只能选择一个选项
              const currentRow = row.id

              // 先清除当前行的所有选中状态
              Object.keys(previewAnswers.value).forEach(key => {
                if (key.startsWith(`${question.id}_${currentRow}_`)) {
                  previewAnswers.value[key] = false
                }
              })

              // 然后选中当前选项
              previewAnswers.value[answerKey] = true

              // 强制更新视图
              previewAnswers.value = { ...previewAnswers.value }
              console.log('矩阵题答案已更新:', previewAnswers.value)
            }
          }, [
            h('div', {
              class: 'matrix-radio',
              style: {
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid #d9d9d9',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: isSelected ? '#1890ff' : 'transparent',
                boxShadow: isSelected ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none'
              }
            })
          ])
        }
      })
    })
  }

  console.log('矩阵题列定义完成:', columns)
  return columns
}

// 获取矩阵题数据
const getMatrixData = (question) => {
  if (!question.rows || question.rows.length === 0) {
    return []
  }

  return question.rows.map((row, rowIndex) => {
    const rowData = {
      key: row.id || rowIndex,
      question: row.text || row.content || row
    }

    // 为每一列添加占位数据（实际渲染由customRender处理）
    if (question.columns && question.columns.length > 0) {
      question.columns.forEach((col, colIndex) => {
        rowData[`option${colIndex}`] = '' // 占位符，实际内容由customRender渲染
      })
    }

    return rowData
  })
}

// 加载问卷数据
const loadQuestionnaire = async () => {
  try {
    loading.value = true

    // 调用QuestionController中的预览接口
    const response = await api.get(`/question/preview?questionnaireId=${questionnaireId.value}`)

    if (response.code === 200) {
      // 根据QuestionController返回的数据结构进行处理
      const previewData = response.data

      // 设置问卷基本信息
      questionnaireInfo.value = {
        title: previewData.questionnaireInfo?.title || '问卷标题',
        description: previewData.questionnaireInfo?.description || '问卷描述',
        type: 'survey', // 默认类型
        anonymous: false, // 默认非匿名
        startDate: previewData.questionnaireInfo?.startDate,
        endDate: previewData.questionnaireInfo?.endDate
      }

      // 处理问题数据，根据QuestionnairePreviewDto的结构
      questions.value = (previewData.questions || []).map(q => {
        // 处理矩阵题的行和列数据
        let rows = []
        let columns = []

        if (q.questionType === 5 && q.matrixQuestion) {
          // 矩阵题
          rows = (q.matrixQuestion.rows || []).map(row => ({
            id: row.id,
            text: row.rowContent,
            content: row.rowContent,
            sortNum: row.sortNum
          }))

          columns = (q.matrixQuestion.columns || []).map(col => ({
            id: col.id,
            text: col.columnContent,
            content: col.columnContent,
            sortNum: col.sortNum
          }))

          console.log('矩阵题数据 - matrixQuestion方式:', {
            questionId: q.id,
            rows: rows,
            columns: columns
          })
        } else if (q.questionType === 5) {
          // 如果没有matrixQuestion字段，尝试从其他字段获取
          rows = (q.rows || q.matrixRows || []).map(row => {
            if (typeof row === 'string') {
              return { id: Date.now() + Math.random(), text: row, content: row }
            }
            return {
              id: row.id || Date.now() + Math.random(),
              text: row.text || row.content || row,
              content: row.text || row.content || row
            }
          })

          columns = (q.columns || q.matrixColumns || []).map(col => {
            if (typeof col === 'string') {
              return { id: Date.now() + Math.random(), text: col, content: col }
            }
            return {
              id: col.id || Date.now() + Math.random(),
              text: col.text || col.content || col,
              content: col.text || col.content || col
            }
          })

          // 如果没有行列数据，设置默认值
          if (rows.length === 0) {
            rows = [
              { id: 1, text: '行1', content: '行1' },
              { id: 2, text: '行2', content: '行2' }
            ]
          }

          if (columns.length === 0) {
            columns = [
              { id: 1, text: '列1', content: '列1' },
              { id: 2, text: '列2', content: '列2' }
            ]
          }

          console.log('矩阵题数据 - 备用方式:', {
            questionId: q.id,
            rows: rows,
            columns: columns
          })
        }

        // 处理选项数据
        let options = []
        if (q.questionType === 1 && q.singleChoiceOptions) {
          // 单选题
          options = q.singleChoiceOptions.map(opt => ({
            id: opt.id,
            text: opt.optionContent,
            optionContent: opt.optionContent,
            isDefault: opt.isDefault === 1,
            sortNum: opt.sortNum
          }))
        } else if (q.questionType === 2 && q.multipleChoiceOptions) {
          // 多选题
          options = q.multipleChoiceOptions.map(opt => ({
            id: opt.id,
            text: opt.optionContent,
            optionContent: opt.optionContent,
            isDefault: opt.isDefault === 1,
            sortNum: opt.sortNum
          }))
        }

        const processedQuestion = {
          ...q,
          // 确保矩阵题的行和列数据正确
          rows: rows,
          columns: columns,
          // 设置选项数据
          options: options
        }

        // 如果是矩阵题，打印处理后的数据
        if (q.questionType === 5) {
          console.log('矩阵题处理完成:', {
            questionId: processedQuestion.id,
            rows: processedQuestion.rows,
            columns: processedQuestion.columns,
            rowsLength: processedQuestion.rows?.length,
            columnsLength: processedQuestion.columns?.length
          })
        }

        return processedQuestion
      })

      // 初始化预览答案
      questions.value.forEach(question => {
        if (question.questionType === 2) {
          previewAnswers.value[question.id] = []
        } else if (question.questionType === 5) {
          // 矩阵题：为每个交叉点初始化答案
          if (question.rows && question.columns) {
            question.rows.forEach(row => {
              question.columns.forEach(col => {
                const answerKey = `${question.id}_${row.id}_${col.id}`
                previewAnswers.value[answerKey] = false
              })
            })

            console.log('矩阵题答案初始化完成:', {
              questionId: question.id,
              totalCrossPoints: question.rows.length * question.columns.length,
              answerKeys: Object.keys(previewAnswers.value).filter(key => key.startsWith(`${question.id}_`))
            })
          }
        } else {
          previewAnswers.value[question.id] = null
        }
      })
    } else {
      message.error(response.message || '加载问卷失败')
    }
  } catch (error) {
    console.error('加载问卷失败:', error)
    message.error('加载问卷失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 开始填写问卷
const startFill = () => {
  router.push(`/questionnaire/fill/${questionnaireId.value}`)
}

// 生命周期
onMounted(() => {
  if (questionnaireId.value) {
    loadQuestionnaire()
  } else {
    message.error('问卷ID无效')
    router.push('/questionnaire/management')
  }
})
</script>

<style scoped>
.questionnaire-preview {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  font-size: 28px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.header-left p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card,
.questions-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.questionnaire-header {
  text-align: center;
  padding: 20px 0;
}

.questionnaire-title {
  font-size: 24px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.questionnaire-description {
  color: #666;
  font-size: 16px;
  margin-bottom: 16px;
  line-height: 1.6;
}

.questionnaire-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.questions-list {
  margin-top: 16px;
}

.question-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 16px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.question-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f0f8ff;
  border-bottom: 1px solid #e8e8e8;
  border-radius: 8px 8px 0 0;
}

.question-number {
  background: #1890ff;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
}

.question-type {
  background: #52c41a;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.question-content {
  padding: 16px;
}

.question-text {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.question-options {
  margin-top: 16px;
}

/* 矩阵题表格样式 */
.question-options .ant-table {
  margin-top: 12px;
}

.question-options .ant-table-thead > tr > th {
  background: #f5f5f5;
  font-weight: 600;
  text-align: center;
}

.question-options .ant-table-tbody > tr > td {
  text-align: center;
}

/* 矩阵题特殊样式 */
.matrix-preview-info {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f0f8ff;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
}

.matrix-description {
  margin: 0;
  color: #1890ff;
  font-size: 14px;
  font-weight: 500;
}

.matrix-rule {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
  font-style: italic;
}

.matrix-table {
  margin-top: 8px;
}

.matrix-table .ant-table-thead > tr > th:first-child {
  background: #e6f7ff;
  font-weight: 600;
  color: #1890ff;
}

.matrix-table .ant-table-tbody > tr > td:first-child {
  background: #f6ffed;
  font-weight: 500;
  color: #52c41a;
}

/* 矩阵题单选按钮样式 */
.matrix-radio {
  position: relative;
}

.matrix-radio:hover {
  border-color: #1890ff !important;
  transform: scale(1.1);
}

.matrix-radio:active {
  transform: scale(0.95);
}

/* 选中状态的样式 */
.matrix-radio.selected {
  background-color: #1890ff !important;
  border-color: #1890ff !important;
}

.rating-text {
  margin-top: 8px;
  color: #1890ff;
  font-weight: 500;
}

.empty-questions {
  text-align: center;
  padding: 40px 0;
}

.empty-icon {
  font-size: 64px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-preview {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: stretch;
  }

  .header-actions .ant-btn {
    flex: 1;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .questionnaire-meta {
    justify-content: flex-start;
  }
}
</style>
