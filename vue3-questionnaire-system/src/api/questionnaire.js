import { api } from '@/utils/request'
import { CONFIG } from './config'

/**
 * 问卷相关API服务
 */
export const questionnaireApi = {
  /**
   * 获取问卷详情
   * @param {number} id 问卷ID
   * @returns {Promise} API响应
   */
  getQuestionnaireDetail(id) {
    return api.get(`${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_DETAIL}/${id}`)
  },

  /**
   * 获取问卷问题列表
   * @param {number} questionnaireId 问卷ID
   * @returns {Promise} API响应
   */
  getQuestionnaireQuestions(questionnaireId) {
    return api.get(`${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_QUESTIONS}`, { questionnaireId })
  },

  /**
   * 提交问卷答案
   * @param {Object} submissionData 提交数据
   * @returns {Promise} API响应
   */
  submitQuestionnaire(submissionData) {
    return api.post(CONFIG.API_ENDPOINTS.SUBMISSION_SUBMIT, submissionData)
  },

  /**
   * 保存草稿
   * @param {Object} draftData 草稿数据
   * @returns {Promise} API响应
   */
  saveDraft(draftData) {
    return api.post(CONFIG.API_ENDPOINTS.SUBMISSION_SAVE_DRAFT, draftData)
  },

  /**
   * 获取草稿
   * @param {number} questionnaireId 问卷ID
   * @param {number} userId 用户ID（可选）
   * @param {string} sessionId 会话ID（可选）
   * @returns {Promise} API响应
   */
  getDraft(questionnaireId, userId = null, sessionId = null) {
    const params = { questionnaireId }
    if (userId) params.userId = userId
    if (sessionId) params.sessionId = sessionId
    
    return api.get(CONFIG.API_ENDPOINTS.SUBMISSION_GET_DRAFT, params)
  },

  /**
   * 删除草稿
   * @param {number} questionnaireId 问卷ID
   * @param {number} userId 用户ID（可选）
   * @param {string} sessionId 会话ID（可选）
   * @returns {Promise} API响应
   */
  deleteDraft(questionnaireId, userId = null, sessionId = null) {
    const params = { questionnaireId }
    if (userId) params.userId = userId
    if (sessionId) params.sessionId = sessionId
    
    return api.delete(CONFIG.API_ENDPOINTS.SUBMISSION_DELETE_DRAFT, params)
  },

  /**
   * 检查用户是否已提交
   * @param {number} questionnaireId 问卷ID
   * @param {number} userId 用户ID（可选）
   * @param {string} ipAddress IP地址（可选）
   * @returns {Promise} API响应
   */
  checkSubmission(questionnaireId, userId = null, ipAddress = null) {
    const params = { questionnaireId }
    if (userId) params.userId = userId
    if (ipAddress) params.ipAddress = ipAddress
    
    return api.get(CONFIG.API_ENDPOINTS.SUBMISSION_CHECK, params)
  },

  /**
   * 获取问卷统计信息
   * @param {number} questionnaireId 问卷ID
   * @returns {Promise} API响应
   */
  getStatistics(questionnaireId) {
    return api.get(`${CONFIG.API_ENDPOINTS.SUBMISSION_STATISTICS}/${questionnaireId}`)
  },

  /**
   * 根据URL获取问卷
   * @param {string} url 问卷URL
   * @returns {Promise} API响应
   */
  getQuestionnaireByUrl(url) {
    return api.post(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_FILL, { url })
  },

  /**
   * 根据代码获取问卷
   * @param {string} code 问卷代码
   * @returns {Promise} API响应
   */
  getQuestionnaireByCode(code) {
    return api.post(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_FILL, { code })
  }
}

/**
 * 问卷填写工具函数
 */
export const questionnaireUtils = {
  /**
   * 根据题目类型初始化答案
   * @param {number} questionType 题目类型ID
   * @returns {any} 初始答案值
   */
  initializeAnswer(questionType) {
    switch (questionType) {
      case 1: // 单选题
        return null
      case 2: // 多选题
        return []
      case 3: // 文本题
        return ''
      case 4: // 评分题
        return 0
      case 5: // 矩阵题
        return {}
      default:
        return null
    }
  },

  /**
   * 验证题目答案是否完整
   * @param {Object} question 题目对象
   * @returns {boolean} 是否完整
   */
  validateAnswer(question) {
    const { answer, questionType, isRequired } = question
    
    if (!isRequired) return true
    
    if (answer === undefined || answer === null) return false
    
    switch (questionType) {
      case 1: // 单选题
        return answer !== null
      case 2: // 多选题
        return Array.isArray(answer) && answer.length > 0
      case 3: // 文本题
        return answer.trim() !== ''
      case 4: // 评分题
        return answer > 0
      case 5: // 矩阵题
        if (!answer || typeof answer !== 'object') return false
        // 检查是否每一行都有选择
        if (!question.matrixQuestionConfig?.rows) return false
        
        return question.matrixQuestionConfig.rows.every(row => {
          return Object.keys(answer).some(key => 
            key.startsWith(`${question.id}_${row.id}_`) && answer[key] === true
          )
        })
      default:
        return false
    }
  },

  /**
   * 格式化答案显示文本
   * @param {Object} question 题目对象
   * @returns {string} 格式化的答案文本
   */
  formatAnswerText(question) {
    const { answer, questionType, options } = question
    
    if (answer === undefined || answer === null || answer === '') {
      return '未填写'
    }
    
    switch (questionType) {
      case 1: // 单选题
        const singleOption = options?.find(opt => opt.id === answer)
        return singleOption ? singleOption.optionContent : '已选择'
      case 2: // 多选题
        if (Array.isArray(answer)) {
          const selectedOptions = options?.filter(opt => answer.includes(opt.id))
          return selectedOptions?.map(opt => opt.optionContent).join(', ') || '已选择'
        }
        return '已选择'
      case 3: // 文本题
        return answer || '未填写'
      case 4: // 评分题
        return `${answer || 0} 分`
      case 5: // 矩阵题
        if (!answer || typeof answer !== 'object') return '未填写'
        // 获取选中的选项
        const selectedOptions = []
        if (question.matrixQuestionConfig?.rows && question.matrixQuestionConfig?.columns) {
          question.matrixQuestionConfig.rows.forEach(row => {
            const selectedCol = question.matrixQuestionConfig.columns.find(col => {
              const answerKey = `${question.id}_${row.id}_${col.id}`
              return answer[answerKey] === true
            })
            if (selectedCol) {
              selectedOptions.push(`${row.rowContent} × ${selectedCol.columnContent}`)
            }
          })
        }
        return selectedOptions.length > 0 ? selectedOptions.join(', ') : '已填写'
      default:
        return '未知类型'
    }
  },

  /**
   * 获取题目类型名称
   * @param {number} questionType 题目类型ID
   * @returns {string} 题目类型名称
   */
  getQuestionTypeName(questionType) {
    const typeNames = {
      1: '单选题',
      2: '多选题',
      3: '问答题',
      4: '评分题',
      5: '矩阵题'
    }
    return typeNames[questionType] || '未知类型'
  },

  /**
   * 格式化填写用时
   * @param {number} milliseconds 毫秒数
   * @returns {string} 格式化的时间字符串
   */
  formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    
    if (minutes > 0) {
      return `${minutes}分${seconds}秒`
    } else {
      return `${seconds}秒`
    }
  }
}

export default questionnaireApi
