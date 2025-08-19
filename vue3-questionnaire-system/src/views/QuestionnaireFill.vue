<template>
  <div class="fill-container">
    <!-- 填写头部 -->
    <header class="fill-header">
      <div class="header-content">
        <div class="header-left">
          <div class="back-buttons">
            <button class="btn-home" @click="goToHome">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              主页
            </button>
            <a-button class="btn-back" @click="goBack" :loading="backLoading">
              <template #icon>
                <ArrowLeftOutlined />
              </template>
              返回
            </a-button>
          </div>
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
            <!-- 调试信息 -->
            <div v-if="isDevelopment" class="debug-info" style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 4px; font-size: 12px;">
              <strong>调试信息:</strong>
              <div>问题ID: {{ currentQuestion.id }}</div>
              <div>问题类型: {{ currentQuestion.questionType }} ({{ getQuestionTypeName(currentQuestion.questionType) }})</div>
              <div>问题内容: {{ currentQuestion.content }}</div>
              <div>是否必填: {{ currentQuestion.isRequired }}</div>
              <div>选项数量: {{ currentQuestion.options?.length || 0 }}</div>
              <div>文本题配置: {{ currentQuestion.textQuestionConfig ? '有' : '无' }}</div>
              <div>评分题配置: {{ currentQuestion.ratingQuestionConfig ? '有' : '无' }}</div>
              <div>矩阵题配置: {{ currentQuestion.matrixQuestionConfig ? '有' : '无' }}</div>
            </div>
            
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
              <div v-if="currentQuestion.textQuestionConfig?.hintText" class="hint-text">
                <small style="color: #666;">{{ currentQuestion.textQuestionConfig.hintText }}</small>
              </div>
            </div>

            <!-- 评分题 -->
            <div v-else-if="currentQuestion.questionType === 4" class="question-content">
              <a-rate
                v-model:value="currentQuestion.answer"
                :count="currentQuestion.ratingQuestionConfig?.maxScore || 5"
                :tooltips="ratingTooltips"
                show-tooltip
              />
              <div class="rating-labels">
                <span>{{ currentQuestion.ratingQuestionConfig?.minLabel || '非常不满意' }}</span>
                <span>{{ currentQuestion.ratingQuestionConfig?.maxLabel || '非常满意' }}</span>
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
import { questionnaireAPI as questionnaireApi, questionnaireUtils } from '@/api/questionnaire'
import { CONFIG } from '@/api/config'

const router = useRouter()
const route = useRoute()

// 工具函数：从本地存储获取用户ID
const getCurrentUserId = () => {
  const userInfoStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo && userInfo.id) {
        return parseInt(userInfo.id); // 确保返回整数类型
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
  return null; // 允许匿名填写
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

// 获取客户端IP地址
const getClientIP = async () => {
  try {
    // 尝试从第三方服务获取IP
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('获取IP地址失败:', error);
    return '127.0.0.1'; // 默认IP
  }
};

// 格式化日期时间为后端期望的格式
// 尝试多种格式，找到后端能够解析的格式
const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  // 当前使用的格式: yyyy-MM-dd'T'HH:mm:ss (ISO 8601本地时间格式)
  // 如果这个格式仍然不行，可以尝试其他格式
  
  // 格式1: yyyy/MM/dd HH:mm:ss (Java SimpleDateFormat常用格式)
  // return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  
  // 格式2: dd-MM-yyyy HH:mm:ss (欧洲常用格式)
  // return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  
  // 格式3: MM/dd/yyyy HH:mm:ss (美国常用格式)
  // return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  
  // 格式4: yyyy-MM-dd'T'HH:mm:ss (ISO 8601本地时间格式) - 当前使用
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  
  // 格式5: yyyy-MM-dd HH:mm:ss (MySQL datetime格式)
  // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  // 格式6: 时间戳 (毫秒)
  // return date.getTime();
  
  // 格式7: 只发送日期部分，让后端处理时间
  // return `${year}-${month}-${day}`;
};

// 响应式数据
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('无法加载问卷数据')
const backLoading = ref(false)
const saveLoading = ref(false)
const submitLoading = ref(false)

// 开发环境标识
const isDevelopment = ref(import.meta.env.DEV || import.meta.env.MODE === 'development')

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
      question: question.content || '问题标题',
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

  const maxScore = currentQuestion.value.ratingQuestionConfig?.maxScore || 5
  return Array.from({ length: maxScore }, (_, i) => `${i + 1}分`)
})

const ratingLabels = computed(() => {
  if (!currentQuestion.value || currentQuestion.value.questionType !== 4) return []

  const maxScore = currentQuestion.value.ratingQuestionConfig?.maxScore || 5
  return Array.from({ length: maxScore }, (_, i) => `${i + 1}分`)
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

const goToHome = () => {
  router.push('/')
}

// 加载问卷
const loadQuestionnaire = async () => {
  console.log('开始加载问卷数据...')
  loading.value = true
  error.value = false

  try {
    const questionnaireId = route.params.id
    const url = route.query.url
    const code = route.query.code
    
    console.log('问卷ID:', questionnaireId)
    console.log('URL参数:', url)
    console.log('代码参数:', code)

    let response

    if (questionnaireId) {
      console.log('使用问卷ID加载数据:', questionnaireId)
      
      // 根据数据库表结构，从question_create表获取问卷数据
      console.log('调用 getQuestionnaireDetail API...')
      const questionnaireResponse = await questionnaireApi.getQuestionnaireDetail(questionnaireId)
      console.log('问卷详情响应:', questionnaireResponse)
      
      if (questionnaireResponse.code !== 200) {
        throw new Error(questionnaireResponse.message || '获取问卷信息失败')
      }
      
      // 获取问卷问题列表
      console.log('调用 getQuestionnaireQuestions API...')
      const questionsResponse = await questionnaireApi.getQuestionnaireQuestions(questionnaireId)
      console.log('问题列表响应:', questionsResponse)
      
      if (questionsResponse.code !== 200) {
        throw new Error(questionsResponse.message || '获取问题列表失败')
      }
      
      response = {
        code: 200,
        data: {
          questionnaire: questionnaireResponse.data,
          questions: questionsResponse.data
        }
      }
    } else if (url) {
      // 根据URL获取问卷
      response = await questionnaireApi.getQuestionnaireByUrl(url)
    } else if (code) {
      // 根据代码获取问卷 - 现在代码就是问卷ID
      const questionnaireResponse = await questionnaireApi.getQuestionnaireDetail(code)
      if (questionnaireResponse.code !== 200) {
        throw new Error(questionnaireResponse.message || '获取问卷信息失败')
      }
      
      // 获取问卷问题列表
      const questionsResponse = await questionnaireApi.getQuestionnaireQuestions(code)
      if (questionsResponse.code !== 200) {
        throw new Error(questionsResponse.message || '获取问题列表失败')
      }
      
      response = {
        code: 200,
        data: {
          questionnaire: questionnaireResponse.data,
          questions: questionsResponse.data
        }
      }
    } else {
      throw new Error('缺少问卷标识')
    }

    if (response.code === 200) {
      const data = response.data

      // 根据后端数据结构映射 - 修复嵌套问题
      let questionnaire = data.questionnaire || data
      
      // 处理嵌套的questionnaire结构
      if (questionnaire && questionnaire.questionnaire) {
        questionnaire = questionnaire.questionnaire
      }
      
      // 检查问卷状态，只有已发布的问卷才能填写
      if (questionnaire.status !== 1) {
        throw new Error('该问卷尚未发布，无法填写')
      }
      
      questionnaireTitle.value = questionnaire.title || '问卷标题'
      questionnaireDescription.value = questionnaire.description || '问卷描述信息'
      startTime.value = questionnaire.startDate ? new Date(questionnaire.startDate).toLocaleString('zh-CN') : '-'
      estimatedTime.value = `${questionnaire.estimatedTime || 10} 分钟`

      // 初始化问题数据，根据数据库表结构
      let questionList = data.questions || []
      
      // 处理嵌套的questions结构
      if (data.questionnaire && data.questionnaire.questions) {
        questionList = data.questionnaire.questions
      }
      
      console.log('原始问题数据:', questionList)
      
      questions.value = questionList.map(q => {
        // 使用工具函数初始化答案
        const answer = questionnaireUtils.initializeAnswer(q.questionType)

        // 根据数据库表结构映射字段
        const mappedQuestion = {
          id: q.id,
          questionnaireId: q.questionnaireId,
          content: q.content, // 问题内容
          questionType: q.questionType, // 问题类型
          sortNum: q.sortNum, // 排序号
          isRequired: q.isRequired === 1, // 是否必填（后端返回1=是，0=否）
          createdTime: q.createdTime,
          updatedTime: q.updatedTime,
          answer: answer, // 初始化的答案
          
          // 选项信息（单选题和多选题）
          options: q.options || [],
          
          // 文本题配置
          textQuestionConfig: q.textQuestionConfig || null,
          
          // 评分题配置
          ratingQuestionConfig: q.ratingQuestionConfig || null,
          
          // 矩阵题配置
          matrixQuestionConfig: q.matrixQuestionConfig || null
        }
        
        console.log('映射后的问题数据:', mappedQuestion)
        return mappedQuestion
      })

      console.log('处理后的问题列表:', questions.value)

      // 加载草稿数据
      await loadDraft()

      // 启动计时器
      startTimer()
    } else {
      throw new Error(response.message || '加载失败')
    }
  } catch (error) {
    console.error('加载问卷失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    error.value = true
    errorMessage.value = error.message || '无法加载问卷数据'
  } finally {
    loading.value = false
    console.log('加载完成，loading状态:', loading.value, 'error状态:', error.value)
  }
}

// 保存草稿
const saveDraft = async () => {
  saveLoading.value = true

  try {
    // 收集所有答案，根据数据库表结构
    const answers = questions.value.map(question => ({
      questionId: parseInt(question.id), // 确保转换为整数
      answer: question.answer,
      questionType: parseInt(question.questionType) // 确保转换为整数
    }))

    // 根据数据库表结构，保存到questionnaire_draft表
    await questionnaireApi.saveDraft({
      questionnaireId: parseInt(route.params.id), // 确保转换为整数
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
    // 获取问卷ID（支持多种方式）
    const questionnaireId = route.params.id || route.query.code
    
    if (!questionnaireId) {
      throw new Error('无法获取问卷ID')
    }

    // 收集所有答案，根据数据库表结构
    const answers = questions.value.map(question => ({
      questionId: parseInt(question.id), // 确保转换为整数
      answer: question.answer,
      questionType: parseInt(question.questionType) // 确保转换为整数
    }))

         // 构建提交数据，根据数据库表结构
     const submissionData = {
       questionnaireId: questionnaireId,
       answers: answers,
       submitTime: formatDateTime(new Date()), // 转换为后端期望的日期格式
       duration: Math.floor((Date.now() - startTimeStamp.value) / 1000), // 转换为秒
       // 添加用户信息（如果有的话）
       userId: getCurrentUserId(),
       submitterName: getCurrentUserInfo()?.username || null,
       submitterEmail: getCurrentUserInfo()?.email || null,
       submitterPhone: getCurrentUserInfo()?.phone || null,
       ipAddress: await getClientIP(),
       userAgent: navigator.userAgent,
       startTime: formatDateTime(new Date(startTimeStamp.value)), // 转换为后端期望的日期格式
       isComplete: true,
       status: 1
     }

         // 使用后端的/submission/submit接口一次性提交所有数据
     const submissionResponse = await questionnaireUtils.createSubmission({
       questionnaireId: parseInt(questionnaireId), // 确保转换为整数
       userId: getCurrentUserId() ? parseInt(getCurrentUserId()) : null, // 确保转换为整数
       submitterName: getCurrentUserInfo()?.username || null,
       submitterEmail: getCurrentUserInfo()?.email || null,
       submitterPhone: getCurrentUserInfo()?.phone || null,
       ipAddress: await getClientIP(),
       userAgent: navigator.userAgent,
       startTime: formatDateTime(new Date(startTimeStamp.value)), // 转换为后端期望的日期格式
       durationSeconds: parseInt(submissionData.duration), // 确保转换为整数
       answers: answers // 直接传递答案数组，后端会处理
     })

           if (submissionResponse.code !== 200) {
        throw new Error('问卷提交失败: ' + submissionResponse.message)
      }

      // 提交成功，显示成功提示
      message.success('问卷提交成功！')
      
      // 延迟1秒后返回首页，让用户看到成功提示
      setTimeout(() => {
        router.push('/')
      }, 1000)
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
    const questionnaireId = parseInt(route.params.id) // 确保转换为整数
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

// 矩阵题选择逻辑
const isMatrixOptionSelected = (rowId, colId) => {
  if (!currentQuestion.value || currentQuestion.value.questionType !== 5) return false
  
  const answerKey = `${currentQuestion.value.id}_${rowId}_${colId}`
  return currentQuestion.value.answer && currentQuestion.value.answer[answerKey] === true
}

const selectMatrixOption = (rowId, colId) => {
  if (!currentQuestion.value || currentQuestion.value.questionType !== 5) return
  
  // 初始化答案对象
  if (!currentQuestion.value.answer || typeof currentQuestion.value.answer !== 'object') {
    currentQuestion.value.answer = {}
  }
  
  const answerKey = `${currentQuestion.value.id}_${rowId}_${colId}`
  
  // 如果是单选矩阵，先清除同一行的其他选择
  if (currentQuestion.value.matrixQuestionConfig?.subQuestionType === 1) {
    currentQuestion.value.matrixQuestionConfig.columns.forEach(col => {
      const key = `${currentQuestion.value.id}_${rowId}_${col.id}`
      currentQuestion.value.answer[key] = false
    })
  }
  
  // 切换当前选择状态
  currentQuestion.value.answer[answerKey] = !currentQuestion.value.answer[answerKey]
}

// 获取问题类型名称
const getQuestionTypeName = (type) => {
  switch (type) {
    case 1:
      return '单选题'
    case 2:
      return '多选题'
    case 3:
      return '文本题'
    case 4:
      return '评分题'
    case 5:
      return '矩阵题'
    default:
      return '未知类型'
  }
}

// 生命周期
onMounted(() => {
  console.log('QuestionnaireFill 组件已挂载')
  console.log('当前路由参数:', route.params)
  console.log('当前路由查询:', route.query)
  
  // 检查用户信息
  const userInfo = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO)
  console.log('用户信息:', userInfo)
  
  // 检查token
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_TOKEN)
  console.log('用户token:', token)
  
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

.back-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-home {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: 6px;
  background-color: #1890ff;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-home:hover {
  background-color: #40a9ff;
}

.btn-home:focus {
  outline: none;
}

.btn-home svg {
  fill: white;
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

  .back-buttons {
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

/* 主页按钮统一样式 */
.btn-home {
  background: #1890ff;
  border: 1px solid #1890ff;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  border: none;
}

.btn-home:hover {
  background: #40a9ff;
  border-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.btn-home svg {
  width: 20px;
  height: 20px;
}
</style>
