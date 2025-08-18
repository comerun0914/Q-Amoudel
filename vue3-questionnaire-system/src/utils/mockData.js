// 数据模拟器 - 用于在没有后端数据时提供测试数据

// 模拟问卷列表数据
export const mockQuestionnaireList = [
  {
    id: 1,
    title: '客户满意度调查',
    description: '了解客户对我们服务的满意度',
    type: 'survey',
    status: 1,
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00',
    totalResponses: 1250,
    completionRate: 87.5
  },
  {
    id: 2,
    title: '产品使用反馈',
    description: '收集用户对产品功能的反馈意见',
    type: 'feedback',
    status: 1,
    createTime: '2024-01-10 09:15:00',
    updateTime: '2024-01-18 16:45:00',
    totalResponses: 890,
    completionRate: 92.3
  },
  {
    id: 3,
    title: '员工培训评估',
    description: '评估员工培训效果和改进建议',
    type: 'evaluation',
    status: 0,
    createTime: '2024-01-12 11:00:00',
    updateTime: '2024-01-12 11:00:00',
    totalResponses: 0,
    completionRate: 0
  }
]

// 模拟问卷统计数据
export const mockQuestionnaireStatistics = {
  overview: {
    totalResponses: 1250,
    completionRate: 87.5,
    avgTime: 8.3,
    todayResponses: 45
  },
  questions: [
    {
      id: 1,
      title: '您对我们的服务满意吗？',
      type: 'single',
      statsData: [
        { option: '非常满意', count: 45, percentage: '36%' },
        { option: '满意', count: 38, percentage: '30.4%' },
        { option: '一般', count: 25, percentage: '20%' },
        { option: '不满意', count: 17, percentage: '13.6%' }
      ]
    },
    {
      id: 2,
      title: '您最常使用哪些功能？',
      type: 'multiple',
      statsData: [
        { option: '在线咨询', count: 89, percentage: '71.2%' },
        { option: '产品浏览', count: 76, percentage: '60.8%' },
        { option: '订单管理', count: 65, percentage: '52%' },
        { option: '客户支持', count: 58, percentage: '46.4%' }
      ]
    },
    {
      id: 3,
      title: '请评价我们的产品质量',
      type: 'rating',
      statsData: [
        { value: 5, option: '5分', count: 52, percentage: '41.6%' },
        { value: 4, option: '4分', count: 38, percentage: '30.4%' },
        { value: 3, option: '3分', count: 22, percentage: '17.6%' },
        { value: 2, option: '2分', count: 8, percentage: '6.4%' },
        { value: 1, option: '1分', count: 5, percentage: '4%' }
      ]
    }
  ]
}

// 模拟用户资料数据
export const mockUserProfile = {
  userInfo: {
    id: 1,
    username: 'testuser',
    name: '测试用户',
    email: 'test@example.com',
    phone: '13800138000',
    avatar: '',
    createTime: '2024-01-01 00:00:00'
  },
  stats: {
    totalQuestionnaires: 15,
    totalResponses: 1250,
    totalViews: 5600,
    avgRating: 4.6
  },
  settings: {
    security: {
      twoFactorAuth: false,
      loginNotification: true,
      passwordExpiry: 90
    },
    privacy: {
      dataSharing: false,
      analyticsTracking: true,
      marketingEmails: false
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false
    }
  },
  activities: [
    {
      id: 1,
      type: 'questionnaire_created',
      title: '创建了问卷"客户满意度调查"',
      time: '2024-01-15 10:30:00'
    },
    {
      id: 2,
      type: 'response_received',
      title: '收到问卷"产品使用反馈"的新回复',
      time: '2024-01-18 16:45:00'
    },
    {
      id: 3,
      type: 'profile_updated',
      title: '更新了个人资料',
      time: '2024-01-20 14:20:00'
    }
  ]
}

// 模拟问卷详情数据
export const mockQuestionnaireDetail = {
  id: 1,
  title: '客户满意度调查',
  description: '了解客户对我们服务的满意度，收集改进建议',
  type: 'survey',
  startTime: '2024-01-15 10:30:00',
  endTime: '2024-02-15 23:59:59',
  anonymous: true,
  status: 1,
  questions: [
    {
      id: 1,
      type: 'single',
      title: '您对我们的服务满意吗？',
      description: '请选择最符合您感受的选项',
      required: true,
      options: [
        { id: 1, text: '非常满意' },
        { id: 2, text: '满意' },
        { id: 3, text: '一般' },
        { id: 4, text: '不满意' },
        { id: 5, text: '非常不满意' }
      ]
    },
    {
      id: 2,
      type: 'text',
      title: '您认为我们还有哪些方面需要改进？',
      description: '请详细描述您的建议',
      required: false,
      minLength: 10,
      maxLength: 500
    },
    {
      id: 3,
      type: 'rating',
      title: '请评价我们的产品质量',
      description: '1分表示非常差，5分表示非常好',
      required: true,
      maxRating: 5
    }
  ]
}

// 模拟问卷提交数据
export const mockQuestionnaireSubmissions = {
  list: [
    {
      id: 1,
      submitTime: '2024-01-20 14:30:00',
      duration: 8,
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/91.0.4472.124'
    },
    {
      id: 2,
      submitTime: '2024-01-20 15:45:00',
      duration: 12,
      ipAddress: '192.168.1.101',
      userAgent: 'Firefox/89.0'
    },
    {
      id: 3,
      submitTime: '2024-01-20 16:20:00',
      duration: 6,
      ipAddress: '192.168.1.102',
      userAgent: 'Safari/14.1.1'
    }
  ],
  total: 3
}

// 生成模拟响应数据
export const generateMockResponse = (data, success = true, message = '操作成功') => {
  return {
    code: success ? 200 : 500,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  }
}

// 模拟API延迟
export const mockApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
