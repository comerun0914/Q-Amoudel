import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 应用状态
  const isLoading = ref(false)
  const loadingText = ref('加载中...')
  const isCollapsed = ref(false)
  const theme = ref(localStorage.getItem('theme') || 'light')
  const language = ref(localStorage.getItem('language') || 'zh-CN')
  
  // 通知状态
  const notifications = ref([])
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
  const showNotificationDrawer = ref(false)
  
  // 页面状态
  const currentPage = ref('')
  const breadcrumbs = ref([])
  
  // 设置状态
  const settings = ref({
    autoSave: true,
    autoSaveInterval: 30000, // 30秒
    showTutorial: false,
    enableNotifications: true,
    pageSize: 10,
    compactMode: false
  })

  // 持久化设置
  const persistSettings = () => {
    localStorage.setItem('theme', theme.value)
    localStorage.setItem('language', language.value)
    localStorage.setItem('appSettings', JSON.stringify(settings.value))
  }

  // 加载设置
  const loadSettings = () => {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
      } catch (error) {
        console.error('加载应用设置失败:', error)
      }
    }
  }

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    persistSettings()
    applyTheme()
  }

  // 应用主题
  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value)
    document.body.className = `theme-${theme.value}`
  }

  // 设置语言
  const setLanguage = (lang) => {
    language.value = lang
    persistSettings()
  }

  // 设置加载状态
  const setLoading = (loading, text = '加载中...') => {
    isLoading.value = loading
    loadingText.value = text
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
  }

  // 添加通知
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    }
    notifications.value.unshift(newNotification)
    
    // 限制通知数量
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  // 标记通知为已读
  const markNotificationAsRead = (id) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  // 标记所有通知为已读
  const markAllNotificationsAsRead = () => {
    notifications.value.forEach(n => n.read = true)
  }

  // 删除通知
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // 清空通知
  const clearNotifications = () => {
    notifications.value = []
  }

  // 设置通知抽屉状态
  const setNotificationDrawer = (open) => {
    showNotificationDrawer.value = open
  }

  // 设置页面信息
  const setPageInfo = (page, breadcrumbList = []) => {
    currentPage.value = page
    breadcrumbs.value = breadcrumbList
  }

  // 更新设置
  const updateSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings }
    persistSettings()
  }

  // 重置设置
  const resetSettings = () => {
    settings.value = {
      autoSave: true,
      autoSaveInterval: 30000,
      showTutorial: false,
      enableNotifications: true,
      pageSize: 10,
      compactMode: false
    }
    persistSettings()
  }

  // 初始化应用
  const initApp = () => {
    loadSettings()
    applyTheme()
  }

  return {
    // 状态
    isLoading,
    loadingText,
    isCollapsed,
    theme,
    language,
    notifications,
    unreadCount,
    showNotificationDrawer,
    currentPage,
    breadcrumbs,
    settings,
    
    // 方法
    toggleTheme,
    setLanguage,
    setLoading,
    toggleSidebar,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearNotifications,
    setNotificationDrawer,
    setPageInfo,
    updateSettings,
    resetSettings,
    initApp
  }
})
