import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useErrorStore = defineStore('error', () => {
  // 错误状态
  const errors = ref([])
  const hasErrors = computed(() => errors.value.length > 0)
  const errorCount = computed(() => errors.value.length)
  
  // 错误类型
  const ERROR_TYPES = {
    VALIDATION: 'validation',
    NETWORK: 'network',
    AUTH: 'auth',
    PERMISSION: 'permission',
    SYSTEM: 'system',
    USER: 'user'
  }

  // 错误级别
  const ERROR_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  }

  // 添加错误
  const addError = (error) => {
    const errorObj = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      type: ERROR_TYPES.SYSTEM,
      level: ERROR_LEVELS.MEDIUM,
      handled: false,
      ...error
    }
    
    errors.value.unshift(errorObj)
    
    // 限制错误数量
    if (errors.value.length > 100) {
      errors.value = errors.value.slice(0, 100)
    }
    
    // 记录到控制台
    console.error('应用错误:', errorObj)
    
    return errorObj
  }

  // 添加验证错误
  const addValidationError = (field, message, formId = null) => {
    return addError({
      type: ERROR_TYPES.VALIDATION,
      level: ERROR_LEVELS.LOW,
      field,
      message,
      formId,
      title: '表单验证错误'
    })
  }

  // 添加网络错误
  const addNetworkError = (url, status, message) => {
    return addError({
      type: ERROR_TYPES.NETWORK,
      level: ERROR_LEVELS.MEDIUM,
      url,
      status,
      message,
      title: '网络请求错误'
    })
  }

  // 添加认证错误
  const addAuthError = (message, redirect = false) => {
    return addError({
      type: ERROR_TYPES.AUTH,
      level: ERROR_LEVELS.HIGH,
      message,
      redirect,
      title: '认证错误'
    })
  }

  // 添加权限错误
  const addPermissionError = (resource, action, message) => {
    return addError({
      type: ERROR_TYPES.PERMISSION,
      level: ERROR_LEVELS.HIGH,
      resource,
      action,
      message,
      title: '权限不足'
    })
  }

  // 添加系统错误
  const addSystemError = (message, details = null) => {
    return addError({
      type: ERROR_TYPES.SYSTEM,
      level: ERROR_LEVELS.CRITICAL,
      message,
      details,
      title: '系统错误'
    })
  }

  // 添加用户错误
  const addUserError = (message, action = null) => {
    return addError({
      type: ERROR_TYPES.USER,
      level: ERROR_LEVELS.LOW,
      message,
      action,
      title: '操作错误'
    })
  }

  // 标记错误为已处理
  const markErrorAsHandled = (id) => {
    const error = errors.value.find(e => e.id === id)
    if (error) {
      error.handled = true
    }
  }

  // 标记所有错误为已处理
  const markAllErrorsAsHandled = () => {
    errors.value.forEach(e => e.handled = true)
  }

  // 删除错误
  const removeError = (id) => {
    const index = errors.value.findIndex(e => e.id === id)
    if (index > -1) {
      errors.value.splice(index, 1)
    }
  }

  // 删除已处理的错误
  const removeHandledErrors = () => {
    errors.value = errors.value.filter(e => !e.handled)
  }

  // 清空所有错误
  const clearErrors = () => {
    errors.value = []
  }

  // 获取特定类型的错误
  const getErrorsByType = (type) => {
    return errors.value.filter(e => e.type === type)
  }

  // 获取特定级别的错误
  const getErrorsByLevel = (level) => {
    return errors.value.filter(e => e.level === level)
  }

  // 获取未处理的错误
  const getUnhandledErrors = () => {
    return errors.value.filter(e => !e.handled)
  }

  // 获取错误统计
  const getErrorStats = () => {
    const stats = {
      total: errors.value.length,
      handled: errors.value.filter(e => e.handled).length,
      unhandled: errors.value.filter(e => !e.handled).length,
      byType: {},
      byLevel: {}
    }
    
    // 按类型统计
    Object.values(ERROR_TYPES).forEach(type => {
      stats.byType[type] = errors.value.filter(e => e.type === type).length
    })
    
    // 按级别统计
    Object.values(ERROR_LEVELS).forEach(level => {
      stats.byLevel[level] = errors.value.filter(e => e.level === level).length
    })
    
    return stats
  }

  // 处理API错误
  const handleApiError = (error, context = '') => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          addValidationError('api', data.message || '请求参数错误', context)
          break
        case 401:
          addAuthError(data.message || '未授权访问', true)
          break
        case 403:
          addPermissionError('api', 'access', data.message || '权限不足')
          break
        case 404:
          addNetworkError(error.config?.url, status, '请求的资源不存在')
          break
        case 500:
          addSystemError(data.message || '服务器内部错误')
          break
        default:
          addNetworkError(error.config?.url, status, data.message || '网络请求失败')
      }
    } else if (error.request) {
      addNetworkError('unknown', 0, '网络连接失败')
    } else {
      addSystemError(error.message || '未知错误')
    }
    
    return error
  }

  // 全局错误处理器
  const setupGlobalErrorHandler = () => {
    // 处理未捕获的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      addSystemError(`未处理的Promise错误: ${event.reason}`)
      event.preventDefault()
    })

    // 处理全局JavaScript错误
    window.addEventListener('error', (event) => {
      addSystemError(`JavaScript错误: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
      event.preventDefault()
    })
  }

  return {
    // 状态
    errors,
    hasErrors,
    errorCount,
    ERROR_TYPES,
    ERROR_LEVELS,
    
    // 方法
    addError,
    addValidationError,
    addNetworkError,
    addAuthError,
    addPermissionError,
    addSystemError,
    addUserError,
    markErrorAsHandled,
    markAllErrorsAsHandled,
    removeError,
    removeHandledErrors,
    clearErrors,
    getErrorsByType,
    getErrorsByLevel,
    getUnhandledErrors,
    getErrorStats,
    handleApiError,
    setupGlobalErrorHandler
  }
})
