<template>
  <div class="questionnaire-edit">
    <div class="page-header">
      <div class="header-left">
        <h1>编辑问卷</h1>
        <p>修改问卷内容和设置</p>
      </div>
      <div class="header-actions">
        <a-button @click="saveAsDraft" :loading="saving">
          <save-outlined />
          保存草稿
        </a-button>
        <a-button type="primary" @click="updateQuestionnaire" :loading="updating">
          <check-outlined />
          更新问卷
        </a-button>
      </div>
    </div>

    <div class="edit-content">
      <!-- 加载状态 -->
      <a-spin :spinning="loading" tip="加载中...">
        <div v-if="!loading">
          <!-- 问卷基本信息 -->
          <a-card title="问卷基本信息" class="info-card">
            <a-form
              :model="questionnaireInfo"
              :rules="infoRules"
              layout="vertical"
              ref="infoFormRef"
            >
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="问卷标题" name="title">
                    <a-input
                      v-model:value="questionnaireInfo.title"
                      placeholder="请输入问卷标题"
                      size="large"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="问卷类型" name="type">
                    <a-select
                      v-model:value="questionnaireInfo.type"
                      placeholder="请选择问卷类型"
                      size="large"
                    >
                      <a-select-option value="survey">调查问卷</a-select-option>
                      <a-select-option value="feedback">反馈问卷</a-select-option>
                      <a-select-option value="evaluation">评价问卷</a-select-option>
                      <a-select-option value="other">其他</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="问卷描述" name="description">
                <a-textarea
                  v-model:value="questionnaireInfo.description"
                  placeholder="请输入问卷描述"
                  :rows="3"
                />
              </a-form-item>

              <a-row :gutter="16">
                <a-col :span="8">
                  <a-form-item label="开始时间" name="startDate">
                    <div class="date-picker-wrapper">
                      <a-date-picker
                        v-model:value="questionnaireInfo.startDate"
                        placeholder="选择开始时间"
                        style="width: 100%"
                        :allow-clear="true"
                        :show-now="true"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        @change="onStartTimeChange"
                        :value="questionnaireInfo.startDate ? dayjs(questionnaireInfo.startDate) : null"
                      />
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="结束时间" name="endDate">
                    <div class="date-picker-wrapper">
                      <a-date-picker
                        v-model:value="questionnaireInfo.endDate"
                        placeholder="选择结束时间"
                        style="width: 100%"
                        :allow-clear="true"
                        :show-now="true"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        @change="onEndTimeChange"
                        :value="questionnaireInfo.endDate ? dayjs(questionnaireInfo.endDate) : null"
                      />
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="是否匿名" name="anonymous">
                    <a-switch
                      v-model:checked="questionnaireInfo.anonymous"
                      checked-children="是"
                      un-checked-children="否"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>

          <!-- 问题列表 -->
          <a-card title="问题列表" class="questions-card">
            <template #extra>
              <a-button type="primary" @click="showQuestionModal = true">
                <plus-outlined />
                添加问题
              </a-button>
            </template>

            <div class="questions-list">
              <div
                v-for="(question, index) in questions"
                :key="question.id"
                class="question-item"
                draggable="true"
                @dragstart="handleQuestionDragStart(index, $event)"
                @dragover.prevent
                @drop="handleQuestionDrop(index, $event)"
                @dragenter.prevent
              >
                <div class="question-header">
                  <div class="drag-handle">
                    <drag-outlined />
                  </div>
                  <span class="question-number">Q{{ index + 1 }}</span>
                  <span class="question-type">{{ getQuestionTypeName(question.type) }}</span>
                  <div class="question-actions">
                    <a-button type="link" @click="editQuestion(question)">
                      <edit-outlined />
                      编辑
                    </a-button>
                    <a-button type="link" @click="handlePreviewQuestion(question)">
                      <eye-outlined />
                      预览
                    </a-button>
                    <a-popconfirm
                      title="确定要删除这个问题吗？"
                      @confirm="deleteQuestion(question.id)"
                    >
                      <a-button type="link" danger>
                        <delete-outlined />
                        删除
                      </a-button>
                    </a-popconfirm>
                  </div>
                </div>

                <div class="question-content">
                  <div class="question-text">{{ question.content || question.title }}</div>

                  <!-- 矩阵题显示行和列 -->
                  <div v-if="question.type === 'matrix' && (question.matrixRows || question.rows)" class="matrix-preview">
                    <div class="matrix-rows">
                      <h5>行标题：</h5>
                      <div v-for="row in (question.matrixRows || question.rows)" :key="row.id" class="matrix-row">
                        {{ row.text || row.content }}
                      </div>
                    </div>
                    <div class="matrix-columns">
                      <h5>列标题：</h5>
                      <div v-for="col in (question.matrixColumns || question.columns)" :key="col.id" class="matrix-column">
                        {{ col.text || col.content }}
                      </div>
                    </div>
                  </div>

                  <!-- 其他题型显示选项 -->
                  <div v-else-if="question.options && question.options.length" class="question-options">
                    <div
                      v-for="option in question.options"
                      :key="option.id"
                      class="option-item"
                    >
                      {{ option.optionContent || option.text }}
                    </div>
                  </div>
                </div>

                <div class="question-footer">
                  <a-tag :color="question.required ? 'red' : 'blue'">
                    {{ question.required ? '必填' : '选填' }}
                  </a-tag>
                  <div class="drag-handles">
                    <a-button type="text" @click="moveQuestion(index, 'up')" :disabled="index === 0">
                      <arrow-up-outlined />
                    </a-button>
                    <a-button type="text" @click="moveQuestion(index, 'down')" :disabled="index === questions.length - 1">
                      <arrow-down-outlined />
                    </a-button>
                  </div>
                </div>
              </div>

              <div v-if="questions.length === 0" class="empty-questions">
                <a-empty description="暂无问题，请添加问题开始设计问卷" />
              </div>
            </div>
          </a-card>
        </div>
      </a-spin>
    </div>

    <!-- 添加/编辑问题弹窗 -->
    <QuestionModal
      v-model:open="showQuestionModal"
      :question="editingQuestion"
      @save="handleQuestionSave"
    />

    <!-- 问题预览弹窗 -->
    <a-modal
      v-model:open="previewModalVisible"
      title="问题预览"
      width="600px"
      :footer="null"
    >
      <div class="question-preview" v-if="previewQuestion">
        <div class="preview-question">
          <h4>{{ previewQuestion.title }}</h4>
          <p v-if="previewQuestion.description">{{ previewQuestion.description }}</p>

          <!-- 单选题预览 -->
          <div v-if="previewQuestion.type === 'single'" class="preview-options">
            <a-radio-group v-model:value="previewAnswer">
              <a-radio
                v-for="option in previewQuestion.options"
                :key="option.id"
                :value="option.id"
              >
                {{ option.text }}
              </a-radio>
            </a-radio-group>
          </div>

          <!-- 多选题预览 -->
          <div v-if="previewQuestion.type === 'multiple'" class="preview-options">
            <a-checkbox-group v-model:value="previewAnswers">
              <a-checkbox
                v-for="option in previewQuestion.options"
                :key="option.id"
                :value="option.id"
              >
                {{ option.text }}
              </a-checkbox>
            </a-checkbox-group>
          </div>

          <!-- 问答题预览 -->
          <div v-if="previewQuestion.type === 'text'" class="preview-options">
            <a-textarea
              v-model:value="previewTextAnswer"
              placeholder="请输入您的回答"
              :rows="4"
            />
          </div>

          <!-- 评分题预览 -->
          <div v-if="previewQuestion.type === 'rating'" class="preview-options">
            <a-rate v-model:value="previewRating" />
            <div class="rating-text">{{ previewRating }}分</div>
          </div>

          <!-- 矩阵题预览 -->
          <div v-if="previewQuestion.type === 'matrix'" class="preview-options">
            <div class="matrix-preview">
              <div class="matrix-rows">
                <h5>行标题：</h5>
                <div v-for="row in previewQuestion.matrixRows" :key="row.id" class="matrix-row">
                  {{ row.text }}
                </div>
              </div>
              <div class="matrix-columns">
                <h5>列标题：</h5>
                <div v-for="col in previewQuestion.matrixColumns" :key="col.id" class="matrix-column">
                  {{ col.text }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  SaveOutlined,
  CheckOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DragOutlined
} from '@ant-design/icons-vue'
import { CONFIG } from '@/api/config'
import { api } from '@/utils/request'
import QuestionModal from '@/components/Questionnaire/QuestionModal.vue'
import dayjs from 'dayjs'

// 使用组合式API
const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(true)
const saving = ref(false)
const updating = ref(false)
const showQuestionModal = ref(false)
const editingQuestion = ref(null)
const infoFormRef = ref()
const previewModalVisible = ref(false)
const previewQuestion = ref(null)

// 预览相关数据
const previewAnswer = ref(null)
const previewAnswers = ref([])
const previewTextAnswer = ref('')
const previewRating = ref(0)

// 问卷基本信息
const questionnaireInfo = reactive({
  id: '',
  title: '',
  type: '',
  description: '',
  startDate: null,
  endDate: null,
  anonymous: false
})

// 问题列表
const questions = ref([])

// 表单验证规则
const infoRules = {
  title: [
    { required: true, message: '请输入问卷标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在2-100个字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择问卷类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入问卷描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在10-500个字符之间', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}

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

// 获取问题类型代码
const getQuestionTypeCode = (type) => {
  const typeCodes = {
    single: 1,
    multiple: 2,
    text: 3,
    rating: 4,
    matrix: 5
  }
  return typeCodes[type] || 3 // 默认值为3 (问答题)
}

// 获取问题类型名称（根据代码）
const getQuestionTypeNameByCode = (code) => {
  const typeNames = {
    1: 'single',      // 单选题
    2: 'multiple',    // 多选题
    3: 'text',        // 问答题
    4: 'rating',      // 评分题
    5: 'matrix'       // 矩阵题
  }
  return typeNames[code] || 'text' // 默认值为text (问答题)
}

// 日期格式化函数
const formatDateForDisplay = (dateValue) => {
  try {
    if (!dateValue) return null

    // 如果是字符串，尝试解析
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) {
        console.warn('无效的日期字符串:', dateValue)
        return null
      }
      return date.toISOString().slice(0, 10)
    }

    // 如果是Date对象
    if (dateValue instanceof Date) {
      return dateValue.toISOString().slice(0, 10)
    }

    // 如果是dayjs对象
    if (dateValue.$d && dateValue.$d instanceof Date) {
      return dateValue.$d.toISOString().slice(0, 10)
    }

    // 如果是dayjs对象，使用toDate方法
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toISOString().slice(0, 10)
    }

    console.warn('未知的日期类型:', dateValue)
    return null
  } catch (error) {
    console.error('日期格式化错误:', error)
    return null
  }
}

// 日期变化处理函数
const onStartTimeChange = (date) => {
  try {
    console.log('开始时间变化:', date)

    // 统一处理日期值，确保格式一致
    if (date) {
      if (typeof date === 'string') {
        questionnaireInfo.startDate = date
      } else if (date instanceof Date) {
        questionnaireInfo.startDate = date.toISOString().slice(0, 10)
      } else if (date.$d && date.$d instanceof Date) {
        questionnaireInfo.startDate = date.$d.toISOString().slice(0, 10)
      } else if (date.toDate && typeof date.toDate === 'function') {
        questionnaireInfo.startDate = date.toDate().toISOString().slice(0, 10)
      } else {
        questionnaireInfo.startDate = date
      }
    } else {
      questionnaireInfo.startDate = null
    }

    console.log('开始时间已更新:', questionnaireInfo.startDate)

    // 如果结束时间早于开始时间，自动调整结束时间
    if (questionnaireInfo.endDate && questionnaireInfo.startDate) {
      const startTime = new Date(questionnaireInfo.startDate)
      const endTime = new Date(questionnaireInfo.endDate)

      if (endTime <= startTime) {
        const newEndTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000) // 加1天
        questionnaireInfo.endDate = newEndTime.toISOString().slice(0, 10)
        console.log('自动调整结束时间:', questionnaireInfo.endDate)
      }
    }
  } catch (error) {
    console.error('开始时间处理错误:', error)
  }
}

const onEndTimeChange = (date) => {
  try {
    console.log('结束时间变化:', date)

    // 统一处理日期值，确保格式一致
    if (date) {
      if (typeof date === 'string') {
        questionnaireInfo.endDate = date
      } else if (date instanceof Date) {
        questionnaireInfo.endDate = date.toISOString().slice(0, 10)
      } else if (date.$d && date.$d instanceof Date) {
        questionnaireInfo.endDate = date.$d.toISOString().slice(0, 10)
      } else if (date.toDate && typeof date.toDate === 'function') {
        questionnaireInfo.endDate = date.toDate().toISOString().slice(0, 10)
      } else {
        questionnaireInfo.endDate = date
      }
    } else {
      questionnaireInfo.endDate = null
    }

    console.log('结束时间已更新:', questionnaireInfo.endDate)
  } catch (error) {
    console.error('结束时间处理错误:', error)
  }
}

// 获取问卷数据
const fetchQuestionnaire = async () => {
  try {
    loading.value = true

    const questionnaireId = route.params.id

    // 根据数据库表结构，从question_create表获取问卷数据
    const response = await api.get(`${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_DETAIL}/${questionnaireId}`)

    if (response.code === 200) {
      const data = response.data

      // 更新问卷基本信息
      Object.assign(questionnaireInfo, {
        id: data.questionnaire.id,
        title: data.questionnaire.title,
        type: data.questionnaire.type,
        description: data.questionnaire.description,
        startDate: data.questionnaire.startDate ? formatDateForDisplay(data.questionnaire.startDate) : null,
        endDate: data.questionnaire.endDate ? formatDateForDisplay(data.questionnaire.endDate) : null,
        anonymous: data.questionnaire.anonymous || false
      })

      // 更新问题列表，确保字段名映射正确
      questions.value = (data.questions || []).map(q => ({
        id: q.id,
        title: q.content || q.title,        // 后端返回content字段，前端使用title
        type: q.questionType ? getQuestionTypeNameByCode(q.questionType) : q.type, // 后端返回questionType数字，前端使用type字符串
        required: q.isRequired === 1,       // 后端返回isRequired数字，前端使用required布尔值
        options: (q.options || []).map((opt, index) => ({
          id: opt.id,
          text: opt.optionContent || opt.text,  // 后端返回optionContent字段，前端使用text
          isDefault: opt.isDefault === 1        // 后端返回isDefault数字，前端使用布尔值
        })),
        minLength: q.minLength,
        maxLength: q.maxLength,
        maxRating: q.maxRating,
        rows: q.rows || [],
        columns: q.columns || []
      }))
    } else {
      message.error(response.message || '获取问卷数据失败')
    }
  } catch (error) {
    console.error('获取问卷数据失败:', error)
    message.error('获取问卷数据失败')
  } finally {
    loading.value = false
  }
}

// 保存草稿
const saveAsDraft = async () => {
  try {
    saving.value = true

    // 验证基本信息
    await infoFormRef.value?.validate()

    // 构建保存数据，根据数据库表结构
    const saveData = {
      title: questionnaireInfo.title,
      description: questionnaireInfo.description,
      type: questionnaireInfo.type,
      startDate: questionnaireInfo.startDate,
      endDate: questionnaireInfo.endDate,
      anonymous: questionnaireInfo.anonymous,
      status: 2, // 草稿状态
      questions: questions.value.map(q => {
        const questionData = {
          content: q.title,           // 映射到数据库的content字段
          questionType: getQuestionTypeCode(q.type), // 映射到数据库的questionType字段
          sortNum: questions.value.indexOf(q) + 1,  // 添加排序号
          isRequired: q.required ? 1 : 0,          // 映射到数据库的isRequired字段
          // 处理选项数据，根据问题类型映射到不同的选项表
          options: (q.options || []).map((opt, index) => {
            console.log('保存草稿 - 处理选项数据:', { opt, index, qType: q.type })
            return {
              optionContent: opt.text || opt.content,  // 映射到数据库的optionContent字段
              sortNum: index + 1,                     // 选项排序号
              isDefault: q.type === 'single' ? (opt.isDefault ? 1 : 0) : undefined  // 单选题才有默认选项
            }
          }),
          minLength: q.minLength,
          maxLength: q.maxLength,
          maxRating: q.maxRating
        }

        // 特殊处理矩阵题的行列数据
        if (q.type === 'matrix') {
          console.log('QuestionnaireEdit - 保存草稿时处理矩阵题:', {
            question: q,
            matrixRows: q.matrixRows,
            matrixColumns: q.matrixColumns,
            rows: q.rows,
            columns: q.columns
          })

          // 优先使用 matrixRows/matrixColumns，如果没有则使用 rows/columns
          const matrixRows = q.matrixRows || q.rows || []
          const matrixColumns = q.matrixColumns || q.columns || []

          console.log('QuestionnaireEdit - 矩阵题行列数据:', {
            matrixRows,
            matrixColumns,
            matrixRowsLength: matrixRows.length,
            matrixColumnsLength: matrixColumns.length
          })

          // 确保有数据，如果没有则设置默认值
          if (matrixRows.length === 0) {
            console.log('QuestionnaireEdit - 矩阵行数据为空，设置默认值')
            questionData.rows = ['行1', '行2']
          } else {
            questionData.rows = matrixRows.map(row => {
              if (typeof row === 'string') return row
              return row.text || row.content || row
            })
          }

          if (matrixColumns.length === 0) {
            console.log('QuestionnaireEdit - 矩阵列数据为空，设置默认值')
            questionData.columns = ['列1', '列2']
          } else {
            questionData.columns = matrixColumns.map(col => {
              if (typeof col === 'string') return col
              return col.text || col.content || col
            })
          }

          questionData.subQuestionType = 1 // 默认单选矩阵

          console.log('QuestionnaireEdit - 矩阵题数据映射完成:', {
            rows: questionData.rows,
            columns: questionData.columns
          })
        }

        return questionData
      })
    }

    console.log('发送到后端的保存草稿数据:', saveData)

    // 根据数据库表结构，更新question_create表
    const response = await api.put(`${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_UPDATE}/${questionnaireInfo.id}`, saveData)

    if (response.code === 200) {
      message.success('草稿保存成功')
    } else {
      message.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    message.error('保存草稿失败，请检查表单信息')
  } finally {
    saving.value = false
  }
}

// 更新问卷
const updateQuestionnaire = async () => {
  try {
    updating.value = true

    // 验证基本信息
    await infoFormRef.value?.validate()

    // 验证是否有问题
    if (questions.value.length === 0) {
      message.error('请至少添加一个问题')
      return
    }

    // 构建更新数据，根据数据库表结构
    const updateData = {
      title: questionnaireInfo.title,
      description: questionnaireInfo.description,
      type: questionnaireInfo.type,
      startDate: questionnaireInfo.startDate,
      endDate: questionnaireInfo.endDate,
      anonymous: questionnaireInfo.anonymous,
      // 不修改问卷状态，保持原有状态
      questions: questions.value.map(q => {
        const questionData = {
          content: q.title,           // 映射到数据库的content字段
          questionType: getQuestionTypeCode(q.type), // 映射到数据库的questionType字段
          sortNum: questions.value.indexOf(q) + 1,  // 添加排序号
          isRequired: q.required ? 1 : 0,          // 映射到数据库的isRequired字段
          // 处理选项数据，根据问题类型映射到不同的选项表
          options: (q.options || []).map((opt, index) => {
            console.log('处理选项数据:', { opt, index, qType: q.type })
            return {
              optionContent: opt.text || opt.optionContent,  // 优先使用text字段，备选optionContent
              sortNum: index + 1,                     // 选项排序号
              isDefault: q.type === 'single' ? (opt.isDefault ? 1 : 0) : undefined  // 单选题才有默认选项
            }
          }),
          minLength: q.minLength,
          maxLength: q.maxLength,
          maxRating: q.maxRating
        }

        // 特殊处理矩阵题的行列数据
        if (q.type === 'matrix') {
          console.log('QuestionnaireEdit - 更新问卷时处理矩阵题:', {
            question: q,
            matrixRows: q.matrixRows,
            matrixColumns: q.matrixColumns,
            rows: q.rows,
            columns: q.columns
          })

          // 优先使用 matrixRows/matrixColumns，如果没有则使用 rows/columns
          const matrixRows = q.matrixRows || q.rows || []
          const matrixColumns = q.matrixColumns || q.columns || []

          console.log('QuestionnaireEdit - 矩阵题行列数据:', {
            matrixRows,
            matrixColumns,
            matrixRowsLength: matrixRows.length,
            matrixColumnsLength: matrixColumns.length
          })

          // 确保有数据，如果没有则设置默认值
          if (matrixRows.length === 0) {
            console.log('QuestionnaireEdit - 矩阵行数据为空，设置默认值')
            questionData.rows = ['行1', '行2']
          } else {
            questionData.rows = matrixRows.map(row => {
              if (typeof row === 'string') return row
              return row.text || row.content || row
            })
          }

          if (matrixColumns.length === 0) {
            console.log('QuestionnaireEdit - 矩阵列数据为空，设置默认值')
            questionData.columns = ['列1', '列2']
          } else {
            questionData.columns = matrixColumns.map(col => {
              if (typeof col === 'string') return col
              return col.text || col.content || col
            })
          }

          questionData.subQuestionType = 1 // 默认单选矩阵

          console.log('QuestionnaireEdit - 矩阵题数据映射完成:', {
            rows: questionData.rows,
            columns: questionData.columns
          })
        }

        return questionData
      })
    }

    console.log('发送到后端的更新数据:', updateData)

    // 根据数据库表结构，更新question_create表
    const response = await api.put(`${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_UPDATE}/${questionnaireInfo.id}`, updateData)

    if (response.code === 200) {
      message.success('问卷更新成功')

      // 跳转到问卷管理页面
      router.push('/questionnaire/management')
    } else {
      message.error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新问卷失败:', error)
    message.error('更新问卷失败，请检查表单信息')
  } finally {
    updating.value = false
  }
}

const editQuestion = (question) => {
  editingQuestion.value = { ...question }
  showQuestionModal.value = true
}

const handlePreviewQuestion = (question) => {
  console.log('预览问题:', question)

  // 确保question是普通对象，不是Proxy
  previewQuestion.value = JSON.parse(JSON.stringify(question))
  previewModalVisible.value = true

  // 根据问题类型设置预览数据
  if (question.type === 'single') {
    previewAnswer.value = question.options?.find(opt => opt.isDefault)?.id || null
  } else if (question.type === 'multiple') {
    previewAnswers.value = question.options?.filter(opt => opt.isDefault).map(opt => opt.id) || []
  } else if (question.type === 'text') {
    previewTextAnswer.value = ''
  } else if (question.type === 'rating') {
    previewRating.value = 0
  } else if (question.type === 'matrix') {
    previewAnswer.value = null
    previewAnswers.value = []
    previewTextAnswer.value = ''
    previewRating.value = 0
  }

  console.log('预览问题已设置:', previewQuestion.value)
}

const deleteQuestion = (questionId) => {
  const index = questions.value.findIndex(q => q.id === questionId)
  if (index > -1) {
    questions.value.splice(index, 1)
    message.success('问题删除成功')
  }
}

const moveQuestion = (index, direction) => {
  if (direction === 'up' && index > 0) {
    const temp = questions.value[index]
    questions.value[index] = questions.value[index - 1]
    questions.value[index - 1] = temp
  } else if (direction === 'down' && index < questions.value.length - 1) {
    const temp = questions.value[index]
    questions.value[index] = questions.value[index + 1]
    questions.value[index + 1] = temp
  }
}

const handleQuestionSave = (questionData) => {
  if (editingQuestion.value) {
    // 编辑现有问题
    const index = questions.value.findIndex(q => q.id === questionData.id)
    if (index > -1) {
      questions.value[index] = questionData
    }
  } else {
    // 添加新问题
    const newQuestion = {
      ...questionData,
      id: Date.now() // 临时ID
    }
    questions.value.push(newQuestion)
  }

  showQuestionModal.value = false
  editingQuestion.value = null
  message.success(editingQuestion.value ? '问题更新成功' : '问题添加成功')
}

// 拖拽相关函数
const handleQuestionDragStart = (index, event) => {
  event.dataTransfer.setData('text/plain', index)
}

const handleQuestionDrop = (index, event) => {
  const draggedIndex = event.dataTransfer.getData('text/plain')
  if (draggedIndex !== index) {
    const temp = questions.value[draggedIndex]
    questions.value[draggedIndex] = questions.value[index]
    questions.value[index] = temp
    message.success('问题顺序已调整')
  }
}

// 生命周期
onMounted(() => {
  fetchQuestionnaire()
})
</script>

<style scoped>
.questionnaire-edit {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
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

.edit-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  background: #fff;
  border-radius: 8px;
}

.date-picker-wrapper {
  position: relative;
}

.date-picker-wrapper .ant-picker {
  width: 100%;
}

.questions-card {
  background: #fff;
  border-radius: 8px;
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

.drag-handle {
  cursor: grab;
  color: #999;
  font-size: 16px;
  padding: 0 8px;
  user-select: none;
  display: flex;
  align-items: center;
}

.drag-handle:active {
  cursor: grabbing;
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

.question-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.question-content {
  padding: 16px;
}

.question-text {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.option-item {
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  color: #666;
}

/* 矩阵题样式 */
.matrix-preview {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.matrix-rows,
.matrix-columns {
  flex: 1;
}

.matrix-preview h5 {
  margin: 0 0 12px 0;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 600;
}

.matrix-row,
.matrix-column {
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  margin-bottom: 8px;
  color: #333;
  font-size: 13px;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9f9f9;
  border-top: 1px solid #e8e8e8;
  border-radius: 0 0 8px 8px;
}

.drag-handles {
  display: flex;
  gap: 4px;
}

.empty-questions {
  text-align: center;
  padding: 40px 0;
}

/* 预览弹窗样式 */
.question-preview {
  padding: 20px 0;
}

.preview-question h4 {
  margin: 0 0 12px 0;
  color: #1a1a1a;
  font-size: 16px;
}

.preview-question p {
  color: #666;
  margin-bottom: 20px;
}

.preview-options {
  margin-top: 16px;
}

.rating-text {
  margin-top: 8px;
  color: #1890ff;
  font-weight: 500;
}

.matrix-preview {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.matrix-rows,
.matrix-columns {
  flex: 1;
}

.matrix-row,
.matrix-column {
  background: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  margin-bottom: 4px;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-edit {
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

  .question-actions {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }

  .question-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
