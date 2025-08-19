/**
 * 问卷类型映射工具
 * 用于前端中文类型和数据库数字类型的转换
 */

// 中文类型到数字的映射
const CHINESE_TO_NUMBER = {
  '调查问卷': 0,
  '反馈问卷': 1,
  '评价问卷': 2,
  '其他': 3
}

// 数字到中文类型的映射
const NUMBER_TO_CHINESE = {
  0: '调查问卷',
  1: '反馈问卷',
  2: '评价问卷',
  3: '其他'
}

/**
 * 将中文问卷类型转换为数据库数字类型
 * @param {string} chineseType - 中文问卷类型
 * @returns {number} 数据库数字类型
 */
export const convertChineseTypeToNumber = (chineseType) => {
  if (typeof chineseType === 'number') {
    return chineseType
  }
  
  if (typeof chineseType === 'string') {
    const number = CHINESE_TO_NUMBER[chineseType]
    if (number !== undefined) {
      return number
    }
    
    // 尝试解析数字字符串
    const parsed = parseInt(chineseType)
    if (!isNaN(parsed) && NUMBER_TO_CHINESE[parsed] !== undefined) {
      return parsed
    }
  }
  
  // 默认返回调查问卷
  return 0
}

/**
 * 将数据库数字类型转换为中文问卷类型
 * @param {number} numberType - 数据库数字类型
 * @returns {string} 中文问卷类型
 */
export const convertNumberToChineseType = (numberType) => {
  if (typeof numberType === 'string') {
    numberType = parseInt(numberType)
  }
  
  if (typeof numberType === 'number' && !isNaN(numberType)) {
    const chineseType = NUMBER_TO_CHINESE[numberType]
    if (chineseType) {
      return chineseType
    }
  }
  
  // 默认返回调查问卷
  return '调查问卷'
}

/**
 * 获取所有可用的问卷类型选项
 * @returns {Array} 问卷类型选项数组
 */
export const getQuestionnaireTypeOptions = () => {
  return Object.entries(CHINESE_TO_NUMBER).map(([label, value]) => ({
    label,
    value: label
  }))
}

/**
 * 验证问卷类型是否有效
 * @param {string|number} type - 问卷类型
 * @returns {boolean} 是否有效
 */
export const isValidQuestionnaireType = (type) => {
  if (typeof type === 'number') {
    return NUMBER_TO_CHINESE[type] !== undefined
  }
  
  if (typeof type === 'string') {
    return CHINESE_TO_NUMBER[type] !== undefined
  }
  
  return false
}

/**
 * 获取默认问卷类型
 * @returns {string} 默认问卷类型
 */
export const getDefaultQuestionnaireType = () => {
  return '调查问卷'
}

/**
 * 获取问卷类型描述
 * @param {string|number} type - 问卷类型
 * @returns {string} 问卷类型描述
 */
export const getQuestionnaireTypeDescription = (type) => {
  const chineseType = typeof type === 'number' 
    ? convertNumberToChineseType(type) 
    : type
    
  const descriptions = {
    '调查问卷': '用于收集用户意见、偏好或行为数据的标准问卷',
    '反馈问卷': '专门用于收集用户对产品或服务反馈的问卷',
    '评价问卷': '用于对特定对象、产品或服务进行评价的问卷',
    '其他': '其他类型的问卷'
  }
  
  return descriptions[chineseType] || descriptions['调查问卷']
}
