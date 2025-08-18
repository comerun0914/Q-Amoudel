<template>
  <div class="questionnaire-create">
    <div class="page-header">
      <div class="header-left">
        <div class="title-with-back">
          <a-button 
            type="link" 
            size="large" 
            @click="goToHome"
            class="back-home-btn"
          >
            <HomeOutlined />
            主页
          </a-button>
          <h1>创建问卷</h1>
        </div>
        <p>设计您的问卷内容，支持多种题型</p>
      </div>
      <div class="header-actions">
        <a-button @click="saveAsDraft" :loading="saving" :disabled="!canSave">
          <save-outlined />
          保存草稿
        </a-button>
        <a-button type="primary" @click="publishQuestionnaire" :loading="publishing" :disabled="!canPublish">
          <rocket-outlined />
          发布问卷
        </a-button>
      </div>
    </div>

    <div class="create-content">
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
                  :maxlength="100"
                  show-count
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
              :maxlength="500"
              show-count
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
                    :disabled-date="disabledStartDate"
                    :allow-clear="true"
                    :show-now="true"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    @change="onStartTimeChange"
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
                    :disabled-date="disabledEndDate"
                    :allow-clear="true"
                    :show-now="true"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    @change="onEndTimeChange"
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
                <div class="form-help-text">开启后，填写者无需登录即可参与</div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>

      <!-- 问题列表 -->
      <a-card title="问题列表" class="questions-card">
        <template #extra>
          <a-space>
            <a-button @click="importQuestions" :disabled="questions.length > 0">
              <import-outlined />
              导入问题
            </a-button>
            <a-button type="primary" @click="showQuestionModal = true">
              <plus-outlined />
              添加问题
            </a-button>
          </a-space>
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
                <a-button type="link" @click="copyQuestion(question)">
                  <copy-outlined />
                  复制
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
              <div class="question-text">{{ question.title }}</div>
              <div v-if="question.description" class="question-description">
                {{ question.description }}
              </div>

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
                  {{ option.text }}
                  <span v-if="option.value" class="option-value">({{ option.value }})</span>
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
            <a-empty description="暂无问题，请添加问题开始设计问卷">
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

    <!-- 导入问题弹窗 -->
    <a-modal
      v-model:open="importModalVisible"
      title="导入问题"
      width="500px"
      @ok="handleImportQuestions"
      @cancel="importModalVisible = false"
      :confirm-loading="importing"
    >
      <div class="import-content">
        <a-upload
          v-model:file-list="importFileList"
          :before-upload="beforeImportUpload"
          :multiple="false"
          accept=".json,.xlsx,.csv"
        >
          <a-button>
            <upload-outlined />
            选择文件
          </a-button>
        </a-upload>
        <div class="import-help">
          <p>支持的文件格式：JSON、Excel、CSV</p>
          <p>请确保文件格式符合系统要求</p>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CopyOutlined,
  ImportOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  SaveOutlined,
  RocketOutlined,
  DragOutlined,
  HomeOutlined
} from '@ant-design/icons-vue'
import { CONFIG, UTILS } from '@/api/config'
import { api } from '@/utils/request'
import QuestionModal from '@/components/Questionnaire/QuestionModal.vue'

// 使用组合式API
const router = useRouter()

// 响应式数据
const saving = ref(false)
const publishing = ref(false)
const showQuestionModal = ref(false)
const editingQuestion = ref(null)
const infoFormRef = ref()
const previewModalVisible = ref(false)
const previewQuestion = ref(null)
const importModalVisible = ref(false)
const importing = ref(false)
const importFileList = ref([])

// 预览相关数据
const previewAnswer = ref(null)
const previewAnswers = ref([])
const previewTextAnswer = ref('')
const previewRating = ref(0)

// 自动保存相关
const autoSaveInterval = ref(null)

// 工具函数：从本地存储获取用户ID
const getCurrentUserId = () => {
  const userInfoStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo && userInfo.id) {
        return userInfo.id;
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
  return 1; // 默认值
};

// 工具函数：从本地存储获取用户信息
const getCurrentUserInfo = () => {
  const userInfoStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo && userInfo.id) {
        return userInfo;
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
  return null;
};

// 问卷基本信息
const questionnaireInfo = reactive({
  title: '',
  type: '',
  description: '',
  startDate: null,
  endDate: null,
  anonymous: false
})

// 问题列表
const questions = ref([])

// 计算属性
const canSave = computed(() => {
  return questionnaireInfo.title.trim() && questionnaireInfo.type
})

const canPublish = computed(() => {
  return canSave.value && questions.value.length > 0
})

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

// 矩阵题预览列定义
const matrixColumns = computed(() => {
  if (!previewQuestion.value || previewQuestion.value.type !== 'matrix') return []

  const columns = [
    {
      title: '问题',
      dataIndex: 'question',
      key: 'question',
      width: 120
    }
  ]

  // 添加选项列
  if (previewQuestion.value.matrixColumns) {
    previewQuestion.value.matrixColumns.forEach((col, index) => {
      columns.push({
        title: col.text,
        dataIndex: `option${index}`,
        key: `option${index}`,
        width: 80
      })
    })
  }

  return columns
})

// 矩阵题预览数据
const matrixData = computed(() => {
  if (!previewQuestion.value || previewQuestion.value.type !== 'matrix') return []

  return previewQuestion.value.matrixRows?.map(row => ({
    key: row.id,
    question: row.text,
    ...previewQuestion.value.matrixColumns?.reduce((acc, col, index) => {
      acc[`option${index}`] = null
      return acc
    }, {})
  })) || []
})

// 获取问题类型名称
const getQuestionTypeName = (type) => {
  return UTILS.getQuestionTypeName(type)
}

// 日期禁用规则 - 修复版本
const disabledStartDate = (current) => {
  if (!current) return false

  // 调试信息
  console.log('disabledStartDate 接收到的 current:', current)
  console.log('current 类型:', typeof current)
  console.log('current 构造函数:', current?.constructor?.name)
  console.log('current 是否有 $d:', !!current?.$d)
  console.log('current 是否有 toDate:', !!current?.toDate)
  console.log('current 是否有 getTime:', !!current?.getTime)

  try {
    // 检查current的类型，可能是dayjs对象或Date对象
    let currentDate
    if (current instanceof Date) {
      currentDate = current
      console.log('识别为原生 Date 对象')
    } else if (current.$d && current.$d instanceof Date) {
      // dayjs对象
      currentDate = current.$d
      console.log('识别为 dayjs 对象，使用 $d 属性')
    } else if (current.toDate && typeof current.toDate === 'function') {
      // dayjs对象，使用toDate()方法
      currentDate = current.toDate()
      console.log('识别为 dayjs 对象，使用 toDate() 方法')
    } else if (current.getTime && typeof current.getTime === 'function') {
      // 有getTime方法的对象
      currentDate = current
      console.log('识别为有 getTime 方法的对象')
    } else {
      console.warn('未知的日期对象类型:', current)
      return false
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const result = currentDate.getTime() < today.getTime()
    console.log('日期比较结果:', result, '当前日期:', currentDate, '今天:', today)
    return result
  } catch (error) {
    console.error('日期比较错误:', error)
    return false
  }
}

const disabledEndDate = (current) => {
  if (!current || !questionnaireInfo.startDate) return false
  try {
    // 检查current的类型
    let currentDate
    if (current instanceof Date) {
      currentDate = current
    } else if (current.$d && current.$d instanceof Date) {
      currentDate = current.$d
    } else if (current.toDate && typeof current.toDate === 'function') {
      currentDate = current.toDate()
    } else if (current.getTime && typeof current.getTime === 'function') {
      currentDate = current
    } else {
      console.warn('未知的日期对象类型:', current)
      return false
    }

    // 将字符串格式的开始时间转换为Date对象进行比较
    const startTime = new Date(questionnaireInfo.startDate)
    return currentDate.getTime() <= startTime.getTime()
  } catch (error) {
    console.error('日期比较错误:', error)
    return false
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

// 方法
const saveAsDraft = async () => {
  try {
    // 验证基本信息
    await infoFormRef.value?.validate()

    saving.value = true

    // 构建保存数据
    const saveData = {
      title: questionnaireInfo.title,
      description: questionnaireInfo.description,
      type: questionnaireInfo.type,
      startDate: questionnaireInfo.startDate,
      endDate: questionnaireInfo.endDate,
      anonymous: questionnaireInfo.anonymous,
      status: 2, // 草稿状态
      creatorId: getCurrentUserId(), // 临时设置，实际应该从用户状态获取
      submissionLimit: 1, // 默认每人填写1次
      questions: questions.value.map((q, index) => {
        const questionData = {
          content: q.title,
          questionType: getQuestionTypeCode(q.type),
          sortNum: index + 1,
          isRequired: q.required ? 1 : 0,
          options: q.options || [],
          minLength: q.minLength,
          maxLength: q.maxLength,
          maxRating: q.maxRating
        }

        // 特殊处理矩阵题的行列数据
        if (q.type === 'matrix') {
          console.log('QuestionnaireCreate - 保存草稿时处理矩阵题:', {
            question: q,
            matrixRows: q.matrixRows,
            matrixColumns: q.matrixColumns,
            rows: q.rows,
            columns: q.columns
          })

          // 矩阵题需要保存行和列数据
          // 优先使用 matrixRows/matrixColumns，如果没有则使用 rows/columns
          const matrixRows = q.matrixRows || q.rows || []
          const matrixColumns = q.matrixColumns || q.columns || []

          console.log('QuestionnaireCreate - 矩阵题行列数据:', {
            matrixRows,
            matrixColumns,
            matrixRowsLength: matrixRows.length,
            matrixColumnsLength: matrixColumns.length
          })

          // 确保有数据，如果没有则设置默认值
          if (matrixRows.length === 0) {
            console.log('QuestionnaireCreate - 矩阵行数据为空，设置默认值')
            questionData.rows = ['行1', '行2']
          } else {
            questionData.rows = matrixRows.map(row => {
              if (typeof row === 'string') return row
              return row.text || row.content || row
            })
          }

          if (matrixColumns.length === 0) {
            console.log('QuestionnaireCreate - 矩阵列数据为空，设置默认值')
            questionData.columns = ['列1', '列2']
          } else {
            questionData.columns = matrixColumns.map(col => {
              if (typeof col === 'string') return col
              return col.text || col.content || col
            })
          }

          questionData.subQuestionType = 1 // 默认单选矩阵

          console.log('QuestionnaireCreate - 矩阵题数据映射完成:', {
            rows: questionData.rows,
            columns: questionData.columns
          })
        }

        return questionData
      })
    }

    // 调用保存API
    const response = await api.post(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_CREATE, saveData)

    if (response.code === 200) {
      message.success('草稿保存成功')
      
      // 保存到本地存储作为备份
      localStorage.setItem('questionnaire_draft', JSON.stringify(saveData))
      
      // 跳转到问卷成功界面，显示问卷信息
      const questionnaireId = response.data?.id || response.data?.questionnaireId
      if (questionnaireId) {
        router.push({
          path: '/questionnaire/success',
          query: {
            id: questionnaireId,
            title: questionnaireInfo.title,
            description: questionnaireInfo.description,
            totalQuestions: questions.value.length,
            startDate: questionnaireInfo.startDate,
            endDate: questionnaireInfo.endDate,
            creator: getCurrentUserInfo()?.username || '当前用户',
            creationTime: new Date().toISOString(),
            action: 'draft' // 标识是保存草稿操作
          }
        })
      } else {
        // 如果没有返回ID，跳转到问卷管理页面
        router.push('/questionnaire/management')
      }
    } else {
      message.error(response.message || '保存草稿失败')
    }

  } catch (error) {
    console.error('保存草稿失败:', error)
    if (error.name === 'ValidationError') {
      message.error('请检查表单信息')
    } else {
      message.error('保存草稿失败，请稍后重试')
    }
  } finally {
    saving.value = false
  }
}

const publishQuestionnaire = async () => {
  try {
    // 验证基本信息
    await infoFormRef.value?.validate()

    // 验证是否有问题
    if (questions.value.length === 0) {
      message.error('请至少添加一个问题')
      return
    }

    // 验证问题完整性
    const invalidQuestions = questions.value.filter(q => !q.title.trim())
    if (invalidQuestions.length > 0) {
      message.error('请完善所有问题的标题')
      return
    }

    publishing.value = true

    // 构建发布数据
    const publishData = {
      title: questionnaireInfo.title,
      description: questionnaireInfo.description,
      type: questionnaireInfo.type,
      startDate: questionnaireInfo.startDate,
      endDate: questionnaireInfo.endDate,
      anonymous: questionnaireInfo.anonymous,
      status: 1, // 已启用状态
      creatorId: getCurrentUserId(), // 临时设置，实际应该从用户状态获取
      submissionLimit: 1, // 默认每人填写1次
      questions: questions.value.map((q, index) => {
        const questionData = {
          content: q.title,
          questionType: getQuestionTypeCode(q.type),
          sortNum: index + 1,
          isRequired: q.required ? 1 : 0,
          options: (q.options || []).map((opt, optIndex) => {
            const mappedOption = {
              optionContent: opt.text,
              optionContent: opt.text,
              sortNum: optIndex + 1,
              isDefault: opt.isDefault || 0
            };
            console.log(`问题 ${index + 1} 选项 ${optIndex + 1} 映射:`, {
              original: opt,
              mapped: mappedOption
            });
            return mappedOption;
          }),
          minLength: q.minLength,
          maxLength: q.maxLength,
          maxRating: q.maxRating
        }

        // 特殊处理矩阵题的行列数据
        if (q.type === 'matrix') {
          console.log('QuestionnaireCreate - 发布问卷时处理矩阵题:', {
            question: q,
            matrixRows: q.matrixRows,
            matrixColumns: q.matrixColumns
          })

          // 优先使用 matrixRows/matrixColumns，如果没有则使用 rows/columns
          const matrixRows = q.matrixRows || q.rows || []
          const matrixColumns = q.matrixColumns || q.columns || []

          // 确保有数据，如果没有则设置默认值
          if (matrixRows.length === 0) {
            questionData.rows = ['行1', '行2']
          } else {
            questionData.rows = matrixRows.map(row => {
              if (typeof row === 'string') return row
              return row.text || row.content || row
            })
          }

          if (matrixColumns.length === 0) {
            questionData.columns = ['列1', '列2']
          } else {
            questionData.columns = matrixColumns.map(col => {
              if (typeof col === 'string') return col
              return col.text || col.content || col
            })
          }

          questionData.subQuestionType = 1 // 默认单选矩阵
        }

        return questionData
      })
    }

    // 添加调试日志
    console.log('发布问卷数据:', publishData);
    console.log('问题数据详情:', publishData.questions);
    
    // 调用发布API
    const response = await api.post(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_CREATE, publishData)

    if (response.code === 200) {
      message.success('问卷发布成功')

      // 清除本地草稿
      localStorage.removeItem('questionnaire_draft')

      // 跳转到问卷成功界面，显示问卷信息
      const questionnaireId = response.data?.id || response.data?.questionnaireId
      if (questionnaireId) {
        router.push({
          path: '/questionnaire/success',
          query: {
            id: questionnaireId,
            title: questionnaireInfo.title,
            description: questionnaireInfo.description,
            totalQuestions: questions.value.length,
            startDate: questionnaireInfo.startDate,
            endDate: questionnaireInfo.endDate,
            creator: getCurrentUserInfo()?.username || '当前用户',
            creationTime: new Date().toISOString(),
            action: 'publish' // 标识是发布问卷操作
          }
        })
      } else {
        // 如果没有返回ID，跳转到问卷管理页面
        router.push('/questionnaire/management')
      }
    } else {
      message.error(response.message || '发布问卷失败')
    }

  } catch (error) {
    console.error('发布问卷失败:', error)
    if (error.name === 'ValidationError') {
      message.error('请检查表单信息')
    } else {
      message.error('发布问卷失败，请稍后重试')
    }
  } finally {
    publishing.value = false
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

  // 重置预览数据
  previewAnswer.value = null
  previewAnswers.value = []
  previewTextAnswer.value = ''
  previewRating.value = 0

  console.log('预览问题已设置:', previewQuestion.value)
}

const copyQuestion = (question) => {
  const newQuestion = {
    ...question,
    id: Date.now(),
    title: `${question.title} (副本)`
  }
  questions.value.push(newQuestion)
  message.success('问题复制成功')
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
      message.success('问题更新成功')
    }
  } else {
    // 添加新问题
    const newQuestion = {
      ...questionData,
      id: Date.now() // 临时ID
    }
    questions.value.push(newQuestion)
    message.success('问题添加成功')
  }

  showQuestionModal.value = false
  editingQuestion.value = null
}

// 导入问题相关方法
const importQuestions = () => {
  importModalVisible.value = true
}

const beforeImportUpload = (file) => {
  const isValidType = ['application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'].includes(file.type)
  if (!isValidType) {
    message.error('只支持 JSON、Excel 或 CSV 文件!')
    return false
  }

  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('文件大小不能超过 2MB!')
    return false
  }

  return false // 阻止自动上传
}

const handleImportQuestions = async () => {
  if (importFileList.value.length === 0) {
    message.error('请选择要导入的文件')
    return
  }

  try {
    importing.value = true

    // 这里应该实现文件解析和问题导入逻辑
    // 暂时使用模拟数据
    const mockQuestions = [
      {
        id: Date.now(),
        type: 'single',
        title: '您对我们的服务满意吗？',
        description: '请选择最符合您感受的选项',
        required: true,
        options: [
          { id: Date.now(), text: '非常满意' },
          { id: Date.now() + 1, text: '满意' },
          { id: Date.now() + 2, text: '一般' },
          { id: Date.now() + 3, text: '不满意' }
        ]
      }
    ]

    questions.value.push(...mockQuestions)
    message.success('问题导入成功')
    importModalVisible.value = false
    importFileList.value = []

  } catch (error) {
    console.error('导入问题失败:', error)
    message.error('导入失败，请检查文件格式')
  } finally {
    importing.value = false
  }
}

// 拖拽相关函数
const handleQuestionDragStart = (index, event) => {
  event.dataTransfer.setData('text/plain', index)
}

const handleQuestionDrop = (index, event) => {
  const draggedIndex = parseInt(event.dataTransfer.getData('text/plain'))
  if (draggedIndex !== index) {
    const temp = questions.value[draggedIndex]
    questions.value[draggedIndex] = questions.value[index]
    questions.value[index] = temp
    message.success('问题顺序已调整')
  }
}

// 自动保存功能
const autoSave = async () => {
  if (canSave.value && questions.value.length > 0) {
    try {
      const saveData = {
        title: questionnaireInfo.title,
        description: questionnaireInfo.description,
        type: questionnaireInfo.type,
        startDate: questionnaireInfo.startDate,
        endDate: questionnaireInfo.endDate,
        anonymous: questionnaireInfo.anonymous,
        status: 2, // 草稿状态
        creatorId: getCurrentUserId(), // 临时设置，实际应该从用户状态获取
        submissionLimit: 1, // 默认每人填写1次
        questions: questions.value.map((q, index) => {
          const questionData = {
            content: q.title,
            questionType: getQuestionTypeCode(q.type),
            sortNum: index + 1,
            isRequired: q.required ? 1 : 0,
            options: q.options || [],
            minLength: q.minLength,
            maxLength: q.maxLength,
            maxRating: q.maxRating
          }

          // 特殊处理矩阵题的行列数据
          if (q.type === 'matrix') {
            // 矩阵题需要保存行和列数据
            questionData.rows = (q.rows || q.matrixRows || []).map(row => row.text || row.content || row)
            questionData.columns = (q.columns || q.matrixColumns || []).map(col => col.text || col.content || col)
            questionData.subQuestionType = 1 // 默认单选矩阵
          }

          return questionData
        }),
        lastSaveTime: new Date().toISOString()
      }
      localStorage.setItem('questionnaire_draft', JSON.stringify(saveData))
    } catch (error) {
      console.error('自动保存失败:', error)
    }
  }
}

// 加载草稿
const loadDraft = () => {
  try {
    const draft = localStorage.getItem('questionnaire_draft')
    if (draft) {
      const draftData = JSON.parse(draft)

      Modal.confirm({
        title: '发现草稿',
        content: '检测到未保存的草稿，是否要恢复？',
        onOk: () => {
          Object.assign(questionnaireInfo, draftData)
          questions.value = draftData.questions || []
          message.success('草稿已恢复')
        },
        onCancel: () => {
          localStorage.removeItem('questionnaire_draft')
        }
      })
    }
  } catch (error) {
    console.error('加载草稿失败:', error)
    localStorage.removeItem('questionnaire_draft')
  }
}

// 保存问卷
const saveQuestionnaire = async () => {
  try {
    saving.value = true

    // 验证表单
    await infoFormRef.value?.validate()

    // 构建保存数据，根据数据库表结构
    const saveData = {
      title: questionnaireInfo.title,
      description: questionnaireInfo.description,
      type: questionnaireInfo.type,
      startDate: questionnaireInfo.startDate,
      endDate: questionnaireInfo.endDate,
      anonymous: questionnaireInfo.anonymous,
      status: 0, // 草稿状态
      creatorId: getCurrentUserId(), // 临时设置，实际应该从用户状态获取
      submissionLimit: 1, // 默认每人填写1次
      questions: questions.value.map((q, index) => {
        const questionData = {
          content: q.title,
          questionType: getQuestionTypeCode(q.type),
          sortNum: index + 1,
          isRequired: q.required ? 1 : 0,
          options: q.options || [],
          minLength: q.minLength,
          maxLength: q.maxLength,
          maxRating: q.maxRating
        }

        // 特殊处理矩阵题的行列数据
        if (q.type === 'matrix') {
          // 矩阵题需要保存行和列数据
          questionData.rows = (q.rows || q.matrixRows || []).map(row => row.text || row.content || row)
          questionData.columns = (q.columns || q.matrixColumns || []).map(col => col.text || col.content || col)
          questionData.subQuestionType = 1 // 默认单选矩阵
        }

        return questionData
      })
    }

    console.log('发送到后端的数据:', saveData)

    // 根据数据库表结构，保存到question_create表
    const response = await api.post(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_CREATE, saveData)

    if (response.code === 200) {
      message.success('问卷创建成功！')
      router.push('/questionnaire/management')
    } else {
      message.error(response.message || '创建失败')
    }
  } catch (error) {
    console.error('保存问卷失败:', error)
    message.error('保存失败，请检查表单信息')
  } finally {
    saving.value = false
  }
}

// 获取问题类型代码
const getQuestionTypeCode = (type) => {
  const typeMap = {
    'single': 1,      // 单选题
    'multiple': 2,    // 多选题
    'text': 3,        // 问答题
    'rating': 4,      // 评分题
    'matrix': 5       // 矩阵题
  }
  return typeMap[type] || 1
}

// 生命周期
onMounted(async () => {
  try {
    // 等待下一个tick确保DOM完全渲染
    await nextTick()

    // 初始化问卷信息 - 使用安全的日期初始化
    const now = new Date()
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 默认7天后结束

    // 确保日期对象正确初始化 - 使用ISO字符串格式
    questionnaireInfo.startDate = now.toISOString().slice(0, 10)
    questionnaireInfo.endDate = endDate.toISOString().slice(0, 10)

    console.log('日期组件初始化完成:', {
      startTime: questionnaireInfo.startDate,
      endTime: questionnaireInfo.endDate,
      startTimeType: typeof questionnaireInfo.startDate,
      endTimeType: typeof questionnaireInfo.endDate
    })

    // 加载草稿
    loadDraft()

    // 设置自动保存
    autoSaveInterval.value = setInterval(autoSave, 30000) // 每30秒自动保存一次

    // 清理定时器
    onUnmounted(() => {
      if (autoSaveInterval.value) {
        clearInterval(autoSaveInterval.value)
      }
    })

  } catch (error) {
    console.error('组件初始化失败:', error)
    message.error('页面初始化失败，请刷新重试')
  }
})

const goToHome = () => {
  router.push('/')
}

</script>

<style scoped>
.questionnaire-create {
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

.create-content {
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

.form-help-text {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.date-picker-wrapper {
  position: relative;
}

.date-picker-wrapper .ant-picker {
  width: 100%;
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
  margin-bottom: 8px;
}

.question-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  font-style: italic;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-value {
  color: #1890ff;
  font-weight: 500;
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

.empty-icon {
  font-size: 64px;
  color: #d9d9d9;
  margin-bottom: 16px;
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

/* 导入弹窗样式 */
.import-content {
  padding: 20px 0;
}

.import-help {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.import-help p {
  margin: 4px 0;
  color: #666;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-create {
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

  .matrix-preview {
    flex-direction: column;
  }
}
</style>
