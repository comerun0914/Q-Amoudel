import { api } from '@/utils/request'
import { CONFIG } from './config'

// 用户相关API - 基于数据库users表结构修正
export const userApi = {
  // 用户登录 - 基于users表
  login: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.LOGIN, data)
  },

  // 用户注册 - 基于users表
  register: (data) => {
    return api.post(CONFIG.API_ENDPOINTS.REGISTER, data)
  },

  // 用户退出 - 基于users表
  logout: () => {
    return api.post(CONFIG.API_ENDPOINTS.LOGOUT)
  },

  // 获取用户资料 - 基于users表
  getProfile: () => {
    return api.get(CONFIG.API_ENDPOINTS.USER_PROFILE)
  },

  // 更新用户资料 - 基于users表
  updateProfile: (data) => {
    return api.put(CONFIG.API_ENDPOINTS.USER_PROFILE, data)
  },

  // 修改密码 - 基于users表的password字段
  changePassword: (data) => {
    return api.put(CONFIG.API_ENDPOINTS.USER_PROFILE, data)
  },

  // 获取登录历史 - 基于login_history表
  getLoginHistory: (params) => {
    return api.get(CONFIG.API_ENDPOINTS.LOGIN_HISTORY, { params })
  }
}

/**
 * 用户数据转换工具 - 基于数据库表结构修正
 */
export const userUtils = {
  /**
   * 转换用户数据为API格式 - 基于users表结构
   * @param {Object} user 用户数据
   * @returns {Object}
   */
  toApiFormat(user) {
    return {
      username: user.username,           // 对应数据库username字段
      password: user.password,           // 对应数据库password字段
      phone: user.phone,                 // 对应数据库phone字段
      avatar_url: user.avatarUrl,        // 对应数据库avatar_url字段
      role: user.role || 0               // 对应数据库role字段
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
      username: apiData.username,        // 对应数据库username字段
      phone: apiData.phone,              // 对应数据库phone字段
      avatarUrl: apiData.avatar_url,     // 对应数据库avatar_url字段
      role: apiData.role,                // 对应数据库role字段
      lastLoginTime: apiData.last_login_time,    // 对应数据库last_login_time字段
      lastLogoutTime: apiData.last_logout_time   // 对应数据库last_logout_time字段
    }
  },

  /**
   * 验证用户数据 - 基于数据库表结构
   * @param {Object} user 用户数据
   * @returns {Object} 验证结果
   */
  validate(user) {
    const errors = []
    
    if (!user.username?.trim()) {
      errors.push('用户名不能为空')
    }
    
    if (!user.password?.trim()) {
      errors.push('密码不能为空')
    }
    
    if (user.password && user.password.length < 6) {
      errors.push('密码长度不能少于6位')
    }
    
    if (user.phone && !/^1[3-9]\d{9}$/.test(user.phone)) {
      errors.push('手机号格式不正确')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * 获取用户角色名称
   * @param {number} role 角色ID
   * @returns {string}
   */
  getRoleName(role) {
    const roleMap = {
      0: '普通用户',
      1: '幼儿园教师'
    }
    return roleMap[role] || '未知角色'
  },

  /**
   * 检查用户权限
   * @param {number} userRole 用户角色
   * @param {number} requiredRole 所需角色
   * @returns {boolean}
   */
  checkPermission(userRole, requiredRole) {
    return userRole >= requiredRole
  }
}
