import { api } from '@/utils/request'
import { CONFIG } from './config'

// 问题相关API - 基于数据库表结构修正
export const questionApi = {
  // 获取问题详情 - 基于question表
  getDetail: (id) => {
    return api.get(`${CONFIG.API_ENDPOINTS.QUESTION_BY_ID}/${id}`)
  },

  // 创建问题 - 基于question表
  create: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.QUESTION_SAVE, data)
  },

  // 更新问题 - 基于question表
  update: (id, data) => {
    return api.put(`${CONFIG.API_ENDPOINTS.QUESTION_UPDATE}/${id}`, data)
  },

  // 删除问题 - 基于question表
  delete: (id) => {
    return api.delete(`${CONFIG.API_ENDPOINTS.QUESTION_DELETE}/${id}`)
  },

  // 更新问题顺序 - 基于question表的sort_num字段
  updateOrder: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.QUESTION_UPDATE_ORDER, data)
  },

  // 获取问题预览 - 基于question表
  getPreview: (id) => {
    return api.get(`${CONFIG.API_ENDPOINTS.QUESTION_PREVIEW}/${id}`)
  },

  // 获取问题类型 - 基于question表的question_type字段
  getTypes: () => {
    return api.get(CONFIG.API_ENDPOINTS.QUESTION_TYPES)
  }
}

// 单选题选项API - 基于数据库表结构修正
export const singleChoiceOptionApi = {
  // 保存单选题选项 - 基于single_choice_option表
  save: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_SAVE, data)
  },

  // 批量保存单选题选项 - 基于single_choice_option表
  batchSave: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_BATCH_SAVE, data)
  },

  // 获取单选题选项列表 - 基于single_choice_option表
  getList: (questionId) => {
    return api.get(`${CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_LIST}?questionId=${questionId}`)
  },

  // 更新单选题选项 - 基于single_choice_option表
  update: (id, data) => {
    return api.put(`${CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_UPDATE}/${id}`, data)
  },

  // 删除单选题选项 - 基于single_choice_option表
  delete: (id) => {
    return api.delete(`${CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_DELETE}/${id}`)
  },

  // 根据问题ID删除所有选项 - 基于single_choice_option表
  deleteByQuestion: (questionId) => {
    return api.delete(`${CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_DELETE_BY_QUESTION}?questionId=${questionId}`)
  }
}

// 多选题选项API - 基于数据库表结构修正
export const multipleChoiceOptionApi = {
  // 保存多选题选项 - 基于multiple_choice_option表
  save: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_SAVE, data)
  },

  // 批量保存多选题选项 - 基于multiple_choice_option表
  batchSave: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_BATCH_SAVE, data)
  },

  // 获取多选题选项列表 - 基于multiple_choice_option表
  getList: (questionId) => {
    return api.get(`${CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_LIST}?questionId=${questionId}`)
  },

  // 更新多选题选项 - 基于multiple_choice_option表
  update: (id, data) => {
    return api.put(`${CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_UPDATE}/${id}`, data)
  },

  // 删除多选题选项 - 基于multiple_choice_option表
  delete: (id) => {
    return api.delete(`${CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_DELETE}/${id}`)
  },

  // 根据问题ID删除所有选项 - 基于multiple_choice_option表
  deleteByQuestion: (questionId) => {
    return api.delete(`${CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_DELETE_BY_QUESTION}?questionId=${questionId}`)
  }
}

// 问答题配置API - 基于数据库表结构修正
export const textQuestionApi = {
  // 保存问答题配置 - 基于text_question表
  save: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.TEXT_QUESTION_SAVE, data)
  },

  // 更新问答题配置 - 基于text_question表
  update: (id, data) => {
    return api.put(`${CONFIG.API_ENDPOINTS.TEXT_QUESTION_UPDATE}/${id}`, data)
  },

  // 删除问答题配置 - 基于text_question表
  delete: (id) => {
    return api.delete(`${CONFIG.API_ENDPOINTS.TEXT_QUESTION_DELETE}/${id}`)
  },

  // 获取问答题配置 - 基于text_question表
  get: (questionId) => {
    return api.get(`${CONFIG.API_ENDPOINTS.TEXT_QUESTION_GET}?questionId=${questionId}`)
  }
}

// 评分题配置API - 基于数据库表结构修正
export const ratingQuestionApi = {
  // 保存评分题配置 - 基于rating_question表
  save: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.RATING_QUESTION_SAVE, data)
  },

  // 更新评分题配置 - 基于rating_question表
  update: (id, data) => {
    return api.put(`${CONFIG.API_ENDPOINTS.RATING_QUESTION_UPDATE}/${id}`, data)
  },

  // 删除评分题配置 - 基于rating_question表
  delete: (id) => {
    return api.delete(`${CONFIG.API_ENDPOINTS.RATING_QUESTION_DELETE}/${id}`)
  },

  // 获取评分题配置 - 基于rating_question表
  get: (questionId) => {
    return api.get(`${CONFIG.API_ENDPOINTS.RATING_QUESTION_GET}?questionId=${questionId}`)
  }
}

// 矩阵题配置API - 基于数据库表结构修正
export const matrixQuestionApi = {
  // 保存矩阵题配置 - 基于matrix_question、matrix_row、matrix_column表
  save: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.MATRIX_QUESTION_SAVE, data)
  },

  // 保存所有矩阵题配置 - 基于matrix_question、matrix_row、matrix_column表
  saveAll: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.MATRIX_QUESTION_SAVE_ALL, data)
  },

  // 更新矩阵题配置 - 基于matrix_question、matrix_row、matrix_column表
  update: (id, data) => {
    return api.put(`${CONFIG.API_ENDPOINTS.MATRIX_QUESTION_UPDATE}/${id}`, data)
  },

  // 删除矩阵题配置 - 基于matrix_question、matrix_row、matrix_column表
  delete: (questionId) => {
    return api.delete(`${CONFIG.API_ENDPOINTS.MATRIX_QUESTION_DELETE}?questionId=${questionId}`)
  },

  // 获取矩阵题详情 - 基于matrix_question、matrix_row、matrix_column表
  getDetail: (questionId) => {
    return api.get(`${CONFIG.API_ENDPOINTS.MATRIX_QUESTION_GET}?questionId=${questionId}`)
  }
}

/**
 * 问题数据转换工具 - 基于数据库表结构修正
 */
export const questionUtils = {
  /**
   * 转换问题数据为API格式 - 基于question表结构
   * @param {Object} question 问题数据
   * @returns {Object}
   */
  toApiFormat(question) {
    return {
      id: question.id,
      questionnaire_id: question.questionnaireId, // 对应数据库questionnaire_id字段
      content: question.title,                   // 对应数据库content字段
      question_type: CONFIG.QUESTION_TYPES.getQuestionTypeId(question.type), // 对应数据库question_type字段
      sort_num: question.order || 1,             // 对应数据库sort_num字段
      is_required: question.required ? 1 : 0     // 对应数据库is_required字段
    }
  },

  /**
   * 转换API数据为前端格式 - 基于数据库表结构
   * @param {Object} apiData API数据
   * @returns {Object}
   */
  fromApiFormat(apiData) {
    return {
      id: apiData.id,
      questionnaireId: apiData.questionnaire_id, // 对应数据库questionnaire_id字段
      title: apiData.content,                    // 对应数据库content字段
      type: CONFIG.QUESTION_TYPES.getQuestionTypeById(apiData.question_type), // 对应数据库question_type字段
      required: apiData.is_required === 1,       // 对应数据库is_required字段
      order: apiData.sort_num,                   // 对应数据库sort_num字段
      createdTime: apiData.created_time,         // 对应数据库created_time字段
      updatedTime: apiData.updated_time          // 对应数据库updated_time字段
    }
  },

  /**
   * 获取问题类型名称
   * @param {number} typeId 类型ID
   * @returns {string}
   */
  getQuestionTypeName(typeId) {
    return CONFIG.QUESTION_TYPES.getQuestionTypeName(
      CONFIG.QUESTION_TYPES.getQuestionTypeById(typeId)
    )
  },

  /**
   * 验证问题数据
   * @param {Object} question 问题数据
   * @returns {Object} 验证结果
   */
  validate(question) {
    const errors = []
    
    if (!question.title?.trim()) {
      errors.push('问题标题不能为空')
    }
    
    if (!question.type) {
      errors.push('请选择问题类型')
    }
    
    if (question.required === undefined) {
      errors.push('请设置是否必填')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
