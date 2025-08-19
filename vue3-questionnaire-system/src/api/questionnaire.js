import { CONFIG, UTILS } from './config.js';
import request from '../utils/request.js';

/**
 * 问卷相关API接口 - 完整功能版
 */
export const questionnaireAPI = {
  // ==================== 问卷基础操作 ====================
  
  /**
   * 创建问卷（包含问题）
   * @param {Object} data 问卷数据
   * @returns {Promise} 返回创建结果
   */
  createQuestionnaire(data) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_CREATE;
    return request.post(endpoint, data);
  },

  /**
   * 更新问卷
   * @param {number} id 问卷ID
   * @param {Object} data 问卷数据
   * @returns {Promise} 返回更新结果
   */
  updateQuestionnaire(id, data) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_UPDATE.replace('{id}', id);
    return request.put(endpoint, data);
  },

  /**
   * 删除问卷
   * @param {number} id 问卷ID
   * @returns {Promise} 返回删除结果
   */
  deleteQuestionnaire(id) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_DELETE;
    return request.delete(endpoint, { params: { id } });
  },

  /**
   * 批量删除问卷
   * @param {Array} ids 问卷ID数组
   * @returns {Promise} 返回批量删除结果
   */
  batchDeleteQuestionnaires(ids) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_BATCH_DELETE;
    return request.delete(endpoint, { data: { ids } });
  },

  /**
   * 复制问卷
   * @param {number} id 问卷ID
   * @returns {Promise} 返回复制结果
   */
  copyQuestionnaire(id) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_COPY;
    return request.post(endpoint, { id });
  },

  // ==================== 问卷查询和获取 ====================
  
  /**
   * 获取问卷列表（支持分页和筛选）
   * @param {Object} params 查询参数
   * @returns {Promise} 返回问卷列表
   */
  getQuestionnaireList(params = {}) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_LIST;
    return request.get(endpoint, { params });
  },

  /**
   * 获取所有问卷（不分页）
   * @param {Object} params 查询参数
   * @returns {Promise} 返回所有问卷
   */
  getAllQuestionnaires(params = {}) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_ALL;
    return request.get(endpoint, { params });
  },

  /**
   * 根据ID获取问卷详情
   * @param {number} id 问卷ID
   * @returns {Promise} 返回问卷详情
   */
  getQuestionnaireById(id) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_GETINFOBYID;
    return request.get(endpoint, { params: { id } });
  },

  /**
   * 获取问卷详情
   * @param {number} id 问卷ID
   * @returns {Promise} 返回问卷详情
   */
  getQuestionnaireDetail(id) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_DETAIL.replace('{id}', id);
    return request.get(endpoint);
  },

  /**
   * 获取问卷问题列表
   * @param {number} questionnaireId 问卷ID
   * @returns {Promise} 返回问题列表
   */
  getQuestionnaireQuestions(questionnaireId) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_QUESTIONS;
    return request.get(endpoint, { params: { questionnaireId } });
  },

  // ==================== 问卷类型相关 ====================
  
  /**
   * 获取所有问卷类型
   * @returns {Promise} 返回问卷类型列表
   */
  getQuestionnaireTypes() {
    const endpoint = UTILS.getQuestionnaireTypeEndpoint('list');
    return request.get(endpoint);
  },

  /**
   * 根据问卷类型筛选问卷列表
   * @param {string} type 问卷类型
   * @param {Object} params 其他查询参数
   * @returns {Promise} 返回筛选后的问卷列表
   */
  getQuestionnairesByType(type, params = {}) {
    const endpoint = UTILS.getQuestionnaireTypeEndpoint('filter');
    const queryParams = { type, ...params };
    return request.get(endpoint, { params: queryParams });
  },

  // ==================== 问卷状态管理 ====================
  
  /**
   * 切换问卷状态
   * @param {number} id 问卷ID
   * @param {number} status 新状态
   * @returns {Promise} 返回切换结果
   */
  toggleQuestionnaireStatus(id, status) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_TOGGLE_STATUS;
    return request.put(endpoint, { id, status });
  },

  /**
   * 批量切换问卷状态
   * @param {Array} ids 问卷ID数组
   * @param {number} status 新状态
   * @returns {Promise} 返回批量切换结果
   */
  batchToggleQuestionnaireStatus(ids, status) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_BATCH_TOGGLE_STATUS;
    return request.put(endpoint, { ids, status });
  },

  // ==================== 问卷填写和提交 ====================
  
  /**
   * 获取问卷填写页面
   * @param {Object} data 填写参数
   * @returns {Promise} 返回问卷填写数据
   */
  getQuestionnaireForFill(data) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_FILL;
    return request.post(endpoint, data);
  },

  /**
   * 提交问卷答案
   * @param {Object} submissionData 提交数据
   * @returns {Promise} 返回提交结果
   */
  submitQuestionnaire(submissionData) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_SUBMIT;
    return request.post(endpoint, submissionData);
  },

  /**
   * 获取问卷结果
   * @param {number} questionnaireId 问卷ID
   * @returns {Promise} 返回问卷结果
   */
  getQuestionnaireResult(questionnaireId) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_RESULT;
    return request.get(endpoint, { params: { questionnaireId } });
  },

  /**
   * 获取问卷所有结果
   * @param {number} questionnaireId 问卷ID
   * @returns {Promise} 返回所有结果
   */
  getQuestionnaireResults(questionnaireId) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_RESULTS;
    return request.get(endpoint, { params: { questionnaireId } });
  },

  // ==================== 草稿管理 ====================
  
  /**
   * 保存草稿
   * @param {Object} draftData 草稿数据
   * @returns {Promise} 返回保存结果
   */
  saveDraft(draftData) {
    const endpoint = CONFIG.API_ENDPOINTS.SUBMISSION_SAVE_DRAFT;
    return request.post(endpoint, draftData);
  },

  /**
   * 获取草稿
   * @param {number} questionnaireId 问卷ID
   * @param {number} userId 用户ID（可选）
   * @param {string} sessionId 会话ID（可选）
   * @returns {Promise} 返回草稿数据
   */
  getDraft(questionnaireId, userId = null, sessionId = null) {
    const endpoint = CONFIG.API_ENDPOINTS.SUBMISSION_GET_DRAFT;
    const params = { questionnaireId };
    if (userId) params.userId = userId;
    if (sessionId) params.sessionId = sessionId;
    return request.get(endpoint, { params });
  },

  /**
   * 删除草稿
   * @param {number} questionnaireId 问卷ID
   * @param {number} userId 用户ID（可选）
   * @param {string} sessionId 会话ID（可选）
   * @returns {Promise} 返回删除结果
   */
  deleteDraft(questionnaireId, userId = null, sessionId = null) {
    const endpoint = CONFIG.API_ENDPOINTS.SUBMISSION_GET_DRAFT;
    const params = { questionnaireId };
    if (userId) params.userId = userId;
    if (sessionId) params.sessionId = sessionId;
    return request.delete(endpoint, { params });
  },

  // ==================== 提交检查 ====================
  
  /**
   * 检查用户是否已提交
   * @param {number} questionnaireId 问卷ID
   * @param {number} userId 用户ID（可选）
   * @param {string} ipAddress IP地址（可选）
   * @returns {Promise} 返回检查结果
   */
  checkSubmission(questionnaireId, userId = null, ipAddress = null) {
    const endpoint = CONFIG.API_ENDPOINTS.SUBMISSION_CHECK;
    const params = { questionnaireId };
    if (userId) params.userId = userId;
    if (ipAddress) params.ipAddress = ipAddress;
    return request.get(endpoint, { params });
  },

  /**
   * 获取用户已提交的问卷
   * @param {number} userId 用户ID
   * @returns {Promise} 返回已提交的问卷列表
   */
  getUserSubmittedQuestionnaires(userId) {
    const endpoint = CONFIG.API_ENDPOINTS.SUBMISSION_USER_SUBMITTED;
    return request.get(endpoint, { params: { userId } });
  },

  // ==================== 统计相关 ====================
  
  /**
   * 获取问卷统计信息
   * @param {number} questionnaireId 问卷ID
   * @returns {Promise} 返回统计信息
   */
  getQuestionnaireStatistics(questionnaireId) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_STATISTICS;
    return request.get(endpoint, { params: { questionnaireId } });
  },

  // ==================== 导入导出 ====================
  
  /**
   * 导入问卷
   * @param {FormData} formData 包含问卷文件的表单数据
   * @returns {Promise} 返回导入结果
   */
  importQuestionnaire(formData) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_IMPORT;
    return request.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // ==================== 其他功能 ====================
  
  /**
   * 根据URL获取问卷
   * @param {string} url 问卷URL
   * @returns {Promise} 返回问卷数据
   */
  getQuestionnaireByUrl(url) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_FILL;
    return request.post(endpoint, { url });
  },

  /**
   * 根据代码获取问卷
   * @param {string} code 问卷代码
   * @returns {Promise} 返回问卷数据
   */
  getQuestionnaireByCode(code) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_FILL;
    return request.post(endpoint, { code });
  }
};

/**
 * 问卷类型相关工具函数
 */
export const questionnaireTypeUtils = {
  /**
   * 获取问卷类型选项
   * @returns {Array} 问卷类型选项数组
   */
  getTypeOptions() {
    return UTILS.getQuestionnaireTypeOptions();
  },

  /**
   * 获取默认问卷类型
   * @returns {string} 默认问卷类型
   */
  getDefaultType() {
    return UTILS.getQuestionnaireTypeDefault();
  },

  /**
   * 验证问卷类型
   * @param {string} type 问卷类型
   * @returns {boolean} 是否有效
   */
  validateType(type) {
    return UTILS.isValidQuestionnaireType(type);
  },

  /**
   * 格式化问卷类型显示
   * @param {string} type 问卷类型
   * @returns {string} 格式化后的类型名称
   */
  formatType(type) {
    if (!type) return '未设置';
    return type;
  }
};

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
        return null;
      case 2: // 多选题
        return [];
      case 3: // 文本题
        return '';
      case 4: // 评分题
        return 0;
      case 5: // 矩阵题
        return {};
      default:
        return null;
    }
  },

  /**
   * 验证题目答案是否完整
   * @param {Object} question 题目对象
   * @returns {boolean} 是否完整
   */
  validateAnswer(question) {
    const { answer, questionType, isRequired } = question;
    
    if (!isRequired) return true;
    
    if (answer === undefined || answer === null) return false;
    
    switch (questionType) {
      case 1: // 单选题
        return answer !== null;
      case 2: // 多选题
        return Array.isArray(answer) && answer.length > 0;
      case 3: // 文本题
        return answer.trim() !== '';
      case 4: // 评分题
        return answer > 0;
      case 5: // 矩阵题
        if (!answer || typeof answer !== 'object') return false;
        // 检查是否每一行都有选择
        if (!question.matrixQuestionConfig?.rows) return false;
        
        return question.matrixQuestionConfig.rows.every(row => {
          return Object.keys(answer).some(key => 
            key.startsWith(`${question.id}_${row.id}_`) && answer[key] === true
          );
        });
      default:
        return false;
    }
  },

  /**
   * 格式化答案显示文本
   * @param {Object} question 题目对象
   * @returns {string} 格式化的答案文本
   */
  formatAnswerText(question) {
    const { answer, questionType, options } = question;
    
    if (answer === undefined || answer === null || answer === '') {
      return '未填写';
    }
    
    switch (questionType) {
      case 1: // 单选题
        const singleOption = options?.find(opt => opt.id === answer);
        return singleOption ? singleOption.optionContent : '已选择';
      case 2: // 多选题
        if (Array.isArray(answer)) {
          const selectedOptions = options?.filter(opt => answer.includes(opt.id));
          return selectedOptions?.map(opt => opt.optionContent).join(', ') || '已选择';
        }
        return '已选择';
      case 3: // 文本题
        return answer || '未填写';
      case 4: // 评分题
        return `${answer || 0} 分`;
      case 5: // 矩阵题
        if (!answer || typeof answer !== 'object') return '未填写';
        // 获取选中的选项
        const selectedOptions = [];
        if (question.matrixQuestionConfig?.rows && question.matrixQuestionConfig?.columns) {
          question.matrixQuestionConfig.rows.forEach(row => {
            const selectedCol = question.matrixQuestionConfig.columns.find(col => {
              const answerKey = `${question.id}_${row.id}_${col.id}`;
              return answer[answerKey] === true;
            });
            if (selectedCol) {
              selectedOptions.push(`${row.rowContent} × ${selectedCol.columnContent}`);
            }
          });
        }
        return selectedOptions.length > 0 ? selectedOptions.join(', ') : '已填写';
      default:
        return '未知类型';
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
    };
    return typeNames[questionType] || '未知类型';
  },

  /**
   * 格式化填写用时
   * @param {number} milliseconds 毫秒数
   * @returns {string} 格式化的时间字符串
   */
  formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  },

  /**
   * 验证问卷数据完整性
   * @param {Object} questionnaire 问卷数据
   * @returns {Object} 验证结果 { isValid: boolean, errors: Array }
   */
  validateQuestionnaire(questionnaire) {
    const errors = [];
    
    // 验证基本信息
    if (!questionnaire.title || questionnaire.title.trim() === '') {
      errors.push('问卷标题不能为空');
    }
    
    if (!questionnaire.description || questionnaire.description.trim() === '') {
      errors.push('问卷描述不能为空');
    }
    
    if (!questionnaire.questionnaireType) {
      errors.push('请选择问卷类型');
    }
    
    if (!questionnaire.startDate) {
      errors.push('请选择开始日期');
    }
    
    if (!questionnaire.endDate) {
      errors.push('请选择结束日期');
    }
    
    if (questionnaire.startDate && questionnaire.endDate) {
      const startDate = new Date(questionnaire.startDate);
      const endDate = new Date(questionnaire.endDate);
      if (startDate >= endDate) {
        errors.push('结束日期必须晚于开始日期');
      }
    }
    
    // 验证问题
    if (!questionnaire.questions || questionnaire.questions.length === 0) {
      errors.push('问卷至少需要一个问题');
    } else {
      questionnaire.questions.forEach((question, index) => {
        if (!question.content || question.content.trim() === '') {
          errors.push(`第${index + 1}题内容不能为空`);
        }
        
        if (!question.questionType) {
          errors.push(`第${index + 1}题类型不能为空`);
        }
        
        if (question.isRequired === undefined) {
          errors.push(`第${index + 1}题必须设置是否必填`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * 格式化问卷数据用于API提交
   * @param {Object} questionnaire 前端问卷数据
   * @returns {Object} 格式化后的API数据
   */
  formatQuestionnaireForAPI(questionnaire) {
    return {
      title: questionnaire.title,
      description: questionnaire.description,
      questionnaireType: questionnaire.type, // 字段映射
      startDate: questionnaire.startDate,
      endDate: questionnaire.endDate,
      status: questionnaire.status || 1,
      creatorId: questionnaire.creatorId,
      submissionLimit: questionnaire.submissionLimit || 1,
      questions: questionnaire.questions || []
    };
  },

  // ==================== 问卷填写相关API ====================
  
  /**
   * 创建问卷提交记录
   * @param {Object} data 提交数据
   * @returns {Promise} 返回创建结果
   */
  createSubmission(data) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_SUBMISSION_CREATE;
    return request.post(endpoint, data);
  },

  /**
   * 创建问题答案记录
   * @param {Object} data 答案数据
   * @returns {Promise} 返回创建结果
   */
  createQuestionAnswer(data) {
    const endpoint = CONFIG.API_ENDPOINTS.QUESTIONNAIRE_ANSWER_CREATE;
    return request.post(endpoint, data);
  },

  /**
   * 获取用户提交历史
   * @param {Object} params 查询参数
   * @returns {Promise} 返回提交历史
   */
  getUserSubmissionHistory(params = {}) {
    const endpoint = CONFIG.API_ENDPOINTS.USER_SUBMISSION_HISTORY;
    return request.get(endpoint, { params });
  },

  /**
   * 获取用户最近提交
   * @param {Object} params 查询参数
   * @returns {Promise} 返回最近提交
   */
  getUserRecentSubmissions(params = {}) {
    const endpoint = CONFIG.API_ENDPOINTS.USER_RECENT_SUBMISSIONS;
    return request.get(endpoint, { params });
  }
};

export default questionnaireAPI;
