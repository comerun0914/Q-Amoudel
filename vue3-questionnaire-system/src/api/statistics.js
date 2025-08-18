import { api } from '@/utils/request'
import { CONFIG } from './config'

// 统计相关API - 基于数据库表结构修正
export const statisticsApi = {
  // 获取统计仪表板 - 基于questionnaire_submission表
  getDashboard: (params) => {
    return api.get(CONFIG.API_ENDPOINTS.STATISTICS_DASHBOARD, { params })
  },

  // 获取完成率统计 - 基于questionnaire_submission表
  getCompletionRate: (params) => {
    return api.get(CONFIG.API_ENDPOINTS.STATISTICS_COMPLETION_RATE, { params })
  },

  // 获取唯一用户统计 - 基于questionnaire_submission表
  getUniqueUsers: (params) => {
    return api.get(CONFIG.API_ENDPOINTS.STATISTICS_UNIQUE_USERS, { params })
  },

  // 获取问卷统计 - 基于questionnaire_submission表
  getQuestionnaireStatistics: (questionnaireId) => {
    return api.get(`${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_STATISTICS}/${questionnaireId}`)
  },

  // 获取问题统计 - 基于question_answer表
  getQuestionStatistics: (questionId) => {
    return api.get(`/question/statistics/${questionId}`)
  },

  // 获取用户参与统计 - 基于questionnaire_submission表
  getUserParticipation: (params) => {
    return api.get('/submission/userParticipation', { params })
  },

  // 获取时间趋势统计 - 基于questionnaire_submission表
  getTimeTrend: (params) => {
    return api.get('/submission/timeTrend', { params })
  }
}

/**
 * 统计数据转换工具 - 基于数据库表结构修正
 */
export const statisticsUtils = {
  /**
   * 转换统计数据为前端格式 - 基于数据库表结构
   * @param {Object} apiData API数据
   * @returns {Object}
   */
  fromApiFormat(apiData) {
    return {
      // 问卷统计
      totalQuestionnaires: apiData.totalQuestionnaires || 0,
      publishedQuestionnaires: apiData.publishedQuestionnaires || 0,
      draftQuestionnaires: apiData.draftQuestionnaires || 0,
      
      // 参与统计
      totalParticipants: apiData.totalParticipants || 0,
      totalSubmissions: apiData.totalSubmissions || 0,
      completedSubmissions: apiData.completedSubmissions || 0,
      
      // 问题统计
      totalQuestions: apiData.totalQuestions || 0,
      answeredQuestions: apiData.answeredQuestions || 0,
      
      // 时间统计
      avgCompletionRate: apiData.avgCompletionRate || 0,
      avgDuration: apiData.avgDuration || 0,
      
      // 详细数据
      dailyStats: apiData.dailyStats || [],
      questionStats: apiData.questionStats || [],
      userStats: apiData.userStats || []
    }
  },

  /**
   * 格式化百分比
   * @param {number} value 数值
   * @param {number} total 总数
   * @returns {string}
   */
  formatPercentage(value, total) {
    if (total === 0) return '0%'
    return `${((value / total) * 100).toFixed(1)}%`
  },

  /**
   * 格式化时间
   * @param {number} seconds 秒数
   * @returns {string}
   */
  formatDuration(seconds) {
    if (!seconds) return '0秒'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    } else if (minutes > 0) {
      return `${minutes}分钟${secs}秒`
    } else {
      return `${secs}秒`
    }
  },

  /**
   * 格式化数字
   * @param {number} num 数字
   * @returns {string}
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  },

  /**
   * 获取状态颜色
   * @param {string} status 状态
   * @returns {string}
   */
  getStatusColor(status) {
    const colorMap = {
      'active': '#52c41a',
      'inactive': '#faad14',
      'completed': '#1890ff',
      'draft': '#d9d9d9'
    }
    return colorMap[status] || '#666'
  },

  /**
   * 获取状态文本
   * @param {string} status 状态
   * @returns {string}
   */
  getStatusText(status) {
    const textMap = {
      'active': '活跃',
      'inactive': '非活跃',
      'completed': '已完成',
      'draft': '草稿'
    }
    return textMap[status] || '未知'
  }
}
