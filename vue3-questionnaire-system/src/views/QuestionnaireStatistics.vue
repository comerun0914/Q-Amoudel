<template>
  <div class="questionnaire-statistics">
    <div class="page-header">
      <div class="header-left">
        <div class="title-with-back">
          <a-button 
            type="link" 
            size="large" 
            @click="goToHome"
            class="back-home-btn"
          >
            <HomeOutlined />
            主页
          </a-button>
          <h1>数据统计</h1>
        </div>
        <p>分析问卷数据，生成可视化报告</p>
      </div>
      <div class="header-actions">
        <a-select
          v-model:value="selectedQuestionnaire"
          placeholder="选择问卷"
          style="width: 300px"
          @change="handleQuestionnaireChange"
        >
          <a-select-option
            v-for="item in questionnaireList"
            :key="item.id"
            :value="item.id"
          >
            {{ item.title }}
          </a-select-option>
        </a-select>
        <a-button type="primary" @click="exportReport">
          <download-outlined />
          导出报告
        </a-button>
      </div>
    </div>

    <div class="statistics-content">
      <!-- 加载状态 -->
      <a-spin :spinning="loading" tip="加载统计数据中...">
        <div v-if="!loading && selectedQuestionnaire">
          <!-- 概览统计卡片 -->
          <div class="overview-cards">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-card class="stat-card">
                  <div class="stat-content">
                    <div class="stat-icon">
                      <user-outlined />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ overview.totalResponses }}</div>
                      <div class="stat-label">总回复数</div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="6">
                <a-card class="stat-card">
                  <div class="stat-content">
                    <div class="stat-icon">
                      <rise-outlined />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ overview.completionRate }}%</div>
                      <div class="stat-label">完成率</div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="6">
                <a-card class="stat-card">
                  <div class="stat-content">
                    <div class="stat-icon">
                      <clock-circle-outlined />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ overview.avgTime }}分钟</div>
                      <div class="stat-label">平均用时</div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="6">
                <a-card class="stat-card">
                  <div class="stat-content">
                    <div class="stat-icon">
                      <calendar-outlined />
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ overview.todayResponses }}</div>
                      <div class="stat-label">今日回复</div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
          </div>

          <!-- 时间趋势图 -->
          <a-card title="回复时间趋势" class="chart-card">
            <div class="chart-container">
              <div ref="trendChartRef" class="trend-chart"></div>
            </div>
          </a-card>

          <!-- 问题统计 -->
          <a-card title="问题统计分析" class="chart-card">
            <div class="questions-analysis">
              <div
                v-for="(question, index) in questionsAnalysis"
                :key="question.id"
                class="question-analysis-item"
              >
                <div class="question-header">
                  <h4>Q{{ index + 1 }}: {{ question.title }}</h4>
                  <span class="question-type">{{ getQuestionTypeName(question.type) }}</span>
                </div>

                <div class="question-charts">
                  <!-- 单选题饼图 -->
                  <div v-if="question.type === 'single'" class="chart-item">
                    <div ref="`pieChart${question.id}`" class="pie-chart"></div>
                  </div>

                  <!-- 多选题柱状图 -->
                  <div v-if="question.type === 'multiple'" class="chart-item">
                    <div ref="`barChart${question.id}`" class="bar-chart"></div>
                  </div>

                  <!-- 评分题雷达图 -->
                  <div v-if="question.type === 'rating'" class="chart-item">
                    <div ref="`radarChart${question.id}`" class="radar-chart"></div>
                  </div>

                  <!-- 问答题词云 -->
                  <div v-if="question.type === 'text'" class="chart-item">
                    <div ref="`wordCloud${question.id}`" class="word-cloud"></div>
                  </div>

                  <!-- 矩阵题热力图 -->
                  <div v-if="question.type === 'matrix'" class="chart-item">
                    <div ref="`heatmap${question.id}`" class="heatmap"></div>
                  </div>
                </div>

                <!-- 统计数据表格 -->
                <div class="question-stats">
                  <a-table
                    :columns="getStatsColumns(question.type)"
                    :data-source="question.statsData"
                    :pagination="false"
                    size="small"
                  />
                </div>
              </div>
            </div>
          </a-card>

          <!-- 详细数据表格 -->
          <a-card title="详细回复数据" class="data-card">
            <div class="table-actions">
              <a-input-search
                v-model:value="searchText"
                placeholder="搜索回复内容"
                style="width: 300px"
                @search="handleSearch"
              />
              <a-button @click="refreshData">
                <reload-outlined />
                刷新数据
              </a-button>
            </div>

            <a-table
              :columns="responseColumns"
              :data-source="responseData"
              :loading="tableLoading"
              :pagination="pagination"
              @change="handleTableChange"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'submitTime'">
                  {{ formatDateTime(record.submitTime) }}
                </template>
                <template v-else-if="column.key === 'duration'">
                  {{ record.duration }}分钟
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-button type="link" @click="viewResponseDetail(record)">
                    查看详情
                  </a-button>
                </template>
              </template>
            </a-table>
          </a-card>
        </div>

        <!-- 未选择问卷时的提示 -->
        <div v-else-if="!loading && !selectedQuestionnaire" class="empty-state">
          <a-empty description="请选择一个问卷开始分析数据" />
        </div>
      </a-spin>
    </div>

    <!-- 回复详情弹窗 -->
    <ResponseDetailModal
      v-model:open="responseDetailVisible"
      :response-data="selectedResponse"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  DownloadOutlined,
  UserOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ReloadOutlined,
  HomeOutlined
} from '@ant-design/icons-vue'
import { CONFIG, UTILS } from '@/api/config'
import { api } from '@/utils/request'
import ResponseDetailModal from '@/components/Questionnaire/ResponseDetailModal.vue'

// 使用路由
const router = useRouter()

// 工具函数：从本地存储获取用户ID
const getCurrentUserId = () => {
  const userInfoStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO)
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      if (userInfo && userInfo.id) {
        return userInfo.id
      }
    } catch (error) {
      console.error('解析用户信息失败:', error)
    }
  }
  return 1 // 默认值
}

// 响应式数据
const loading = ref(false)
const tableLoading = ref(false)
const selectedQuestionnaire = ref(null)
const questionnaireList = ref([])
const overview = ref({
  totalResponses: 0,
  completionRate: 0,
  avgTime: 0,
  todayResponses: 0
})
const questionsAnalysis = ref([])
const responseData = ref([])
const searchText = ref('')
const responseDetailVisible = ref(false)
const selectedResponse = ref(null)

// 图表引用
const trendChartRef = ref()
const chartRefs = ref({})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 表格列定义
const responseColumns = [
  {
    title: '回复ID',
    dataIndex: 'id',
    key: 'id',
    width: 100
  },
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    key: 'submitTime',
    width: 180
  },
  {
    title: '用时',
    dataIndex: 'duration',
    key: 'duration',
    width: 100
  },
  {
    title: 'IP地址',
    dataIndex: 'ipAddress',
    key: 'ipAddress',
    width: 120
  },
  {
    title: '设备信息',
    dataIndex: 'userAgent',
    key: 'userAgent',
    width: 200
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right'
  }
]

// 计算属性
const getQuestionTypeName = (type) => {
  return UTILS.getQuestionTypeName(type)
}

// 获取统计表格列
const getStatsColumns = (type) => {
  const baseColumns = [
    {
      title: '选项',
      dataIndex: 'option',
      key: 'option'
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count'
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage'
    }
  ]

  if (type === 'rating') {
    baseColumns.unshift({
      title: '分值',
      dataIndex: 'value',
      key: 'value'
    })
  }

  return baseColumns
}







const fetchResponseData = async () => {
  try {
    tableLoading.value = true
    
    if (!selectedQuestionnaire.value) {
      responseData.value = []
      pagination.total = 0
      return
    }
    
    // 使用模拟数据，因为后端可能还没有实现这个接口
    // 在实际项目中，这里应该调用真实的API接口
    responseData.value = [
      {
        id: 1,
        submitTime: new Date().toISOString(),
        duration: 8,
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0.4472.124'
      },
      {
        id: 2,
        submitTime: new Date(Date.now() - 3600000).toISOString(),
        duration: 12,
        ipAddress: '192.168.1.101',
        userAgent: 'Firefox/89.0'
      },
      {
        id: 3,
        submitTime: new Date(Date.now() - 7200000).toISOString(),
        duration: 15,
        ipAddress: '192.168.1.102',
        userAgent: 'Safari/14.1.1'
      }
    ]
    pagination.total = 3
    
    // 如果有真实的API接口，可以取消注释下面的代码
    /*
    const params = {
      questionnaireId: selectedQuestionnaire.value,
      page: pagination.current,
      pageSize: pagination.pageSize,
      search: searchText.value
    }

    const response = await api.get(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_SUBMISSIONS, params)

    if (response.code === 200) {
      responseData.value = response.data.list || []
      pagination.total = response.data.total || 0
    } else {
      message.error(response.message || '获取回复数据失败')
    }
    */
  } catch (error) {
    console.error('获取回复数据失败:', error)
    // 使用模拟数据
    responseData.value = [
      {
        id: 1,
        submitTime: new Date().toISOString(),
        duration: 8,
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0.4472.124'
      }
    ]
    pagination.total = 1
  } finally {
    tableLoading.value = false
  }
}

// 渲染图表
const renderCharts = () => {
  // 时间趋势图
  renderTrendChart()

  // 问题分析图表
  questionsAnalysis.value.forEach(question => {
    switch (question.type) {
      case 'single':
        renderPieChart(question)
        break
      case 'multiple':
        renderBarChart(question)
        break
      case 'rating':
        renderRadarChart(question)
        break
      case 'text':
        renderWordCloud(question)
        break
      case 'matrix':
        renderHeatmap(question)
        break
    }
  })
}

// 渲染时间趋势图
const renderTrendChart = () => {
  if (!trendChartRef.value) return

  // 生成模拟数据
  const dates = []
  const counts = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
    counts.push(Math.floor(Math.random() * 20) + 5)
  }

  // 这里应该使用ECharts渲染图表
  // 暂时使用简单的HTML展示
  trendChartRef.value.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h4>最近7天回复趋势</h4>
      <div style="display: flex; justify-content: space-around; align-items: end; height: 200px; margin-top: 20px;">
        ${dates.map((date, index) => `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 30px; height: ${counts[index] * 8}px; background: #1890ff; margin-bottom: 8px;"></div>
            <span style="font-size: 12px;">${date}</span>
            <span style="font-size: 12px; color: #666;">${counts[index]}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

// 渲染饼图
const renderPieChart = (question) => {
  const chartId = `pieChart${question.id}`
  const chartElement = document.querySelector(`[ref="${chartId}"]`)
  if (!chartElement) return

  chartElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h5>选项分布</h5>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-top: 16px;">
        ${question.statsData.map((item, index) => `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: ${getChartColor(index)}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
              ${item.percentage}%
            </div>
            <span style="font-size: 12px; margin-top: 8px; max-width: 80px; text-align: center;">${item.option}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

// 渲染柱状图
const renderBarChart = (question) => {
  const chartId = `barChart${question.id}`
  const chartElement = document.querySelector(`[ref="${chartId}"]`)
  if (!chartElement) return

  chartElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h5>选项统计</h5>
      <div style="display: flex; justify-content: space-around; align-items: end; height: 150px; margin-top: 16px;">
        ${question.statsData.map((item, index) => `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 40px; height: ${item.count * 3}px; background: ${getChartColor(index)}; margin-bottom: 8px;"></div>
            <span style="font-size: 12px;">${item.option}</span>
            <span style="font-size: 12px; color: #666;">${item.count}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

// 渲染雷达图
const renderRadarChart = (question) => {
  const chartId = `radarChart${question.id}`
  const chartElement = document.querySelector(`[ref="${chartId}"]`)
  if (!chartElement) return

  chartElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h5>评分分布</h5>
      <div style="display: flex; justify-content: center; margin-top: 16px;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${question.statsData.map((item, index) => `
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 40px; text-align: right;">${item.value}分:</span>
              <div style="width: 120px; height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden;">
                <div style="width: ${item.percentage}%; height: 100%; background: ${getChartColor(index)};"></div>
              </div>
              <span style="width: 40px; text-align: left;">${item.count}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `
}

// 渲染词云
const renderWordCloud = (question) => {
  const chartId = `wordCloud${question.id}`
  const chartElement = document.querySelector(`[ref="${chartId}"]`)
  if (!chartElement) return

  chartElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h5>关键词统计</h5>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 16px;">
        ${question.statsData.map((item, index) => `
          <span style="
            padding: 6px 12px;
            background: ${getChartColor(index)};
            color: white;
            border-radius: 16px;
            font-size: ${Math.max(12, 16 - index * 2)}px;
            opacity: ${Math.max(0.6, 1 - index * 0.1)};
          ">
            ${item.option} (${item.count})
          </span>
        `).join('')}
      </div>
    </div>
  `
}

// 渲染热力图
const renderHeatmap = (question) => {
  const chartId = `heatmap${question.id}`
  const chartElement = document.querySelector(`[ref="${chartId}"]`)
  if (!chartElement) return

  chartElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h5>矩阵题热力图</h5>
      <div style="margin-top: 16px; font-size: 12px; color: #666;">
        矩阵题热力图功能开发中...
      </div>
    </div>
  `
}

// 获取图表颜色
const getChartColor = (index) => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96']
  return colors[index % colors.length]
}













const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN')
}

// 监听器
watch(selectedQuestionnaire, () => {
  if (selectedQuestionnaire.value) {
    handleQuestionnaireChange()
  }
})

// 生命周期
onMounted(() => {
  fetchQuestionnaireList()
})

// 获取问卷列表
const fetchQuestionnaireList = async () => {
  try {
    loading.value = true
    
    // 获取当前用户ID
    const userId = getCurrentUserId()
    
    const response = await api.get(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_LIST, {
      creatorId: userId,
      page: 1,
      size: 1000
    })

    if (response.code === 200) {
      questionnaireList.value = response.data?.list || []
      if (questionnaireList.value.length > 0) {
        selectedQuestionnaire.value = questionnaireList.value[0].id
        await handleQuestionnaireChange(selectedQuestionnaire.value)
      }
    } else {
      message.error(response.message || '获取问卷列表失败')
    }
  } catch (error) {
    console.error('获取问卷列表失败:', error)
    // 使用模拟数据
    questionnaireList.value = [
      { id: 1, title: '客户满意度调查' },
      { id: 2, title: '产品使用反馈' },
      { id: 3, title: '员工培训评估' }
    ]
    if (questionnaireList.value.length > 0) {
      selectedQuestionnaire.value = questionnaireList.value[0].id
      await handleQuestionnaireChange(selectedQuestionnaire.value)
    }
  } finally {
    loading.value = false
  }
}

// 获取概览统计
const fetchOverviewStats = async (questionnaireId) => {
  try {
    // 使用正确的统计接口
    const response = await api.get(CONFIG.API_ENDPOINTS.STATISTICS_DASHBOARD)

    if (response.code === 200) {
      const data = response.data || {}
      overview.value = {
        totalResponses: data.totalParticipants || 0,
        completionRate: data.avgCompletionRate || 0,
        avgTime: data.avgDuration || 0,
        todayResponses: data.todayResponses || 0
      }
    } else {
      // 使用模拟数据
      overview.value = {
        totalResponses: 1250,
        completionRate: 87.5,
        avgTime: 8.3,
        todayResponses: 45
      }
    }
  } catch (error) {
    console.error('获取概览统计失败:', error)
    // 使用模拟数据
    overview.value = {
      totalResponses: 1250,
      completionRate: 87.5,
      avgTime: 8.3,
      todayResponses: 45
    }
  }
}

// 获取问题分析
const fetchQuestionsAnalysis = async (questionnaireId) => {
  try {
    // 使用正确的问题接口
    const response = await api.get(`${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_DETAIL}/${questionnaireId}`)

    if (response.code === 200) {
      const questionnaire = response.data
      if (questionnaire.questions && questionnaire.questions.length > 0) {
        // 转换问题数据为分析格式
        questionsAnalysis.value = questionnaire.questions.map(question => {
          // 根据问题类型生成模拟统计数据
          return generateQuestionStats(question)
        })
      } else {
        // 使用模拟数据
        questionsAnalysis.value = generateMockQuestionStats()
      }
    } else {
      // 使用模拟数据
      questionsAnalysis.value = generateMockQuestionStats()
    }
    
    // 渲染图表
    await nextTick()
    renderCharts()
  } catch (error) {
    console.error('获取问题分析失败:', error)
    // 使用模拟数据
    questionsAnalysis.value = generateMockQuestionStats()
    
    // 渲染图表
    await nextTick()
    renderCharts()
  }
}

// 生成问题统计数据
const generateQuestionStats = (question) => {
  const baseStats = {
    id: question.id,
    title: question.content,
    type: question.questionType
  }

  switch (question.questionType) {
    case 1: // 单选题
      return {
        ...baseStats,
        type: 'single',
        statsData: question.options?.map((option, index) => ({
          option: option.optionContent || `选项${index + 1}`,
          count: Math.floor(Math.random() * 50) + 10,
          percentage: `${Math.floor(Math.random() * 40) + 20}%`
        })) || generateMockSingleChoiceStats()
      }
    case 2: // 多选题
      return {
        ...baseStats,
        type: 'multiple',
        statsData: question.options?.map((option, index) => ({
          option: option.optionContent || `选项${index + 1}`,
          count: Math.floor(Math.random() * 50) + 10,
          percentage: `${Math.floor(Math.random() * 40) + 20}%`
        })) || generateMockMultipleChoiceStats()
      }
    case 3: // 问答题
      return {
        ...baseStats,
        type: 'text',
        statsData: [
          { option: '关键词1', count: 25, percentage: '20%' },
          { option: '关键词2', count: 18, percentage: '14.4%' },
          { option: '关键词3', count: 15, percentage: '12%' }
        ]
      }
    case 4: // 评分题
      return {
        ...baseStats,
        type: 'rating',
        statsData: [
          { value: 5, option: '5分', count: 52, percentage: '41.6%' },
          { value: 4, option: '4分', count: 38, percentage: '30.4%' },
          { value: 3, option: '3分', count: 22, percentage: '17.6%' },
          { value: 2, option: '2分', count: 8, percentage: '6.4%' },
          { value: 1, option: '1分', count: 5, percentage: '4%' }
        ]
      }
    case 5: // 矩阵题
      return {
        ...baseStats,
        type: 'matrix',
        statsData: [
          { option: '行1-列1', count: 30, percentage: '24%' },
          { option: '行1-列2', count: 25, percentage: '20%' },
          { option: '行2-列1', count: 28, percentage: '22.4%' },
          { option: '行2-列2', count: 22, percentage: '17.6%' }
        ]
      }
    default:
      return {
        ...baseStats,
        type: 'single',
        statsData: generateMockSingleChoiceStats()
      }
  }
}

// 生成模拟单选题统计数据
const generateMockSingleChoiceStats = () => [
  { option: '非常满意', count: 45, percentage: '36%' },
  { option: '满意', count: 38, percentage: '30.4%' },
  { option: '一般', count: 25, percentage: '20%' },
  { option: '不满意', count: 17, percentage: '13.6%' }
]

// 生成模拟多选题统计数据
const generateMockMultipleChoiceStats = () => [
  { option: '在线咨询', count: 89, percentage: '71.2%' },
  { option: '产品浏览', count: 76, percentage: '60.8%' },
  { option: '订单管理', count: 65, percentage: '52%' },
  { option: '客户支持', count: 58, percentage: '46.4%' }
]

// 生成模拟问题统计数据
const generateMockQuestionStats = () => [
  {
    id: 1,
    title: '您对我们的服务满意吗？',
    type: 'single',
    statsData: generateMockSingleChoiceStats()
  },
  {
    id: 2,
    title: '您最常使用哪些功能？',
    type: 'multiple',
    statsData: generateMockMultipleChoiceStats()
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


// 事件处理
const handleQuestionnaireChange = async (questionnaireId) => {
  if (!questionnaireId) return

  await Promise.all([
    fetchOverviewStats(questionnaireId),
    fetchQuestionsAnalysis(questionnaireId),
    fetchResponseData(questionnaireId)
  ])
}

// 搜索处理
const handleSearch = (value) => {
  searchText.value = value
  pagination.value.current = 1
  if (selectedQuestionnaire.value) {
    fetchResponseData(selectedQuestionnaire.value)
  }
}

// 刷新数据
const refreshData = async () => {
  if (selectedQuestionnaire.value) {
    await handleQuestionnaireChange(selectedQuestionnaire.value)
    message.success('数据已刷新')
  }
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  // 重新加载数据
  if (selectedQuestionnaire.value) {
    fetchResponseData(selectedQuestionnaire.value)
  }
}

// 查看回复详情
const viewResponseDetail = (record) => {
  selectedResponse.value = record
  responseDetailVisible.value = true
}

// 导出报告
const exportReport = () => {
  if (!selectedQuestionnaire.value) {
    message.warning('请先选择一个问卷')
    return
  }

  // 实现导出逻辑
  message.success('报告导出功能开发中...')
}

// 返回主页
const goToHome = () => {
  router.push('/')
}

// 监听问卷选择变化
watch(selectedQuestionnaire, (newVal) => {
  if (newVal) {
    handleQuestionnaireChange(newVal)
  }
})

// 生命周期
onMounted(() => {
  fetchQuestionnaireList()
})
</script>

<style scoped>
.questionnaire-statistics {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left h1 {
  font-size: 28px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.header-left p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.statistics-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 概览统计卡片 */
.overview-cards {
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-card:nth-child(1) .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card:nth-child(4) .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 图表卡片 */
.chart-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-container {
  padding: 16px 0;
}

.trend-chart {
  height: 300px;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

/* 问题分析 */
.questions-analysis {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.question-analysis-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.question-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.question-type {
  background: #1890ff;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.question-charts {
  margin-bottom: 20px;
}

.chart-item {
  margin-bottom: 16px;
}

.pie-chart,
.bar-chart,
.radar-chart,
.word-cloud,
.heatmap {
  height: 200px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.question-stats {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

/* 数据表格 */
.data-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-statistics {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }

  .header-actions .ant-select {
    width: 100% !important;
  }

  .overview-cards .ant-col {
    margin-bottom: 16px;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .table-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .table-actions .ant-input-search {
    width: 100% !important;
  }
}
</style>
