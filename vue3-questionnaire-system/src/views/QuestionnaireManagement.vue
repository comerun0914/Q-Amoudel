<template>
  <div class="questionnaire-management-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
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
            <h1 class="page-title">问卷管理</h1>
          </div>
          <p class="page-subtitle">管理您的所有问卷，包括创建、编辑、删除和数据分析</p>
        </div>
        <div class="action-buttons">
          <a-button type="primary" size="large" @click="showCreateModal">
            <PlusOutlined />
            创建问卷
          </a-button>
          <a-button size="large" @click="handleImport">
            <UploadOutlined />
            导入问卷
          </a-button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <a-row :gutter="16" align="middle">
        <a-col :span="6">
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="搜索问卷标题或描述"
            size="large"
            @press-enter="handleSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="searchForm.status"
            placeholder="状态筛选"
            size="large"
            @change="handleSearch"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="1">已发布</a-select-option>
            <a-select-option value="2">草稿</a-select-option>
            <a-select-option value="0">已禁用</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-range-picker
            v-model:value="searchForm.dateRange"
            size="large"
            placeholder="['开始日期', '结束日期']"
            @change="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-input
            v-model:value="searchForm.creator"
            placeholder="创建者用户名"
            size="large"
            @press-enter="handleSearch"
          />
        </a-col>
        <a-col :span="3">
          <a-button type="primary" size="large" @click="handleSearch">
            <SearchOutlined />
            搜索
          </a-button>
        </a-col>
        <a-col :span="3">
          <a-button size="large" @click="clearFilters">
            <ReloadOutlined />
            重置
          </a-button>
        </a-col>
      </a-row>
    </div>

    <!-- 统计信息卡片 -->
    <div class="statistics-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <Statistic
              title="总问卷数"
              :value="statistics.total"
              :value-style="{ color: '#3f8600' }"
            >
              <template #prefix>
                <FileTextOutlined />
              </template>
            </Statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <Statistic
              title="已发布"
              :value="statistics.published"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <CheckCircleOutlined />
              </template>
            </Statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <Statistic
              title="草稿"
              :value="statistics.draft"
              :value-style="{ color: '#faad14' }"
            >
              <template #prefix>
                <EditOutlined />
              </template>
            </Statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <Statistic
              title="总参与人数"
              :value="statistics.totalParticipants"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <TeamOutlined />
              </template>
            </Statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 问卷列表表格 -->
    <div class="table-section">
      <a-card>
        <a-table
          :columns="tableColumns"
          :data-source="questionnaires"
          :loading="tableLoading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          :scroll="{ x: 1000 }"
          :size="tableSize"
        >
          <!-- 问卷标题列 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'title'">
              <div class="questionnaire-title">
                <div class="title-text">{{ record.title }}</div>
                <div v-if="record.description" class="title-desc">{{ record.description }}</div>
              </div>
            </template>

            <!-- 创建者列 -->
            <template v-else-if="column.key === 'creator_id'">
              <div class="creator-info">
                <a-avatar size="small" :src="record.avatarUrl" />
                <span class="creator-name">{{ record.creatorName || '匿名用户' }}</span>
              </div>
            </template>

            <!-- 状态列 -->
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>

            <!-- 时间范围列 -->
            <template v-else-if="column.key === 'dateRange'">
              <div class="date-range">
                <div>开始：{{ formatDate(record.start_date) }}</div>
                <div>结束：{{ formatDate(record.end_date) }}</div>
              </div>
            </template>

            <!-- 参与统计列 -->
            <template v-else-if="column.key === 'participation'">
              <div class="participation-stats">
                <div class="stat-item">
                  <span class="stat-label">参与：</span>
                  <span class="stat-value">{{ record.participantCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">完成：</span>
                  <span class="stat-value">{{ record.completionCount || 0 }}</span>
                </div>
              </div>
            </template>

            <!-- 创建时间列 -->
            <template v-else-if="column.key === 'created_time'">
              {{ formatDateTime(record.created_time) }}
            </template>

            <!-- 操作列 -->
            <template v-else-if="column.key === 'action'">
              <a-space size="small" wrap>
                <a-button type="link" size="small" @click="editQuestionnaire(record)">
                  <EditOutlined />
                  编辑
                </a-button>
                <a-button type="link" size="small" @click="previewQuestionnaire(record)">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="viewStatistics(record)">
                  <BarChartOutlined />
                  统计
                </a-button>
                <a-button type="link" size="small" @click="copyQuestionnaire(record.id)">
                  <CopyOutlined />
                  复制
                </a-button>
                <a-button type="link" size="small" @click="shareQuestionnaire(record)">
                  <ShareAltOutlined />
                  分享
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  @click="toggleQuestionnaireStatus(record)"
                >
                  {{ record.status === 1 ? '停用' : '启用' }}
                </a-button>
                <a-popconfirm
                  title="确定要删除这个问卷吗？"
                  @confirm="deleteQuestionnaire(record.id)"
                >
                  <a-button type="link" size="small" danger>
                    <DeleteOutlined />
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>



    <!-- 分享问卷弹窗 -->
    <a-modal
      v-model:open="shareModalVisible"
      title="分享问卷"
      width="500px"
      @cancel="handleShareModalCancel"
      :footer="null"
    >
      <div class="share-content">
        <div class="share-link">
          <h4>问卷链接：</h4>
          <a-input-group compact>
            <a-input
              :value="shareLink"
              readonly
              style="width: calc(100% - 80px)"
            />
            <a-button type="primary" @click="copyShareLink">
              复制链接
            </a-button>
          </a-input-group>
        </div>

        <div class="qr-code-container">
          <h4>二维码：</h4>
          <div class="qr-code" ref="qrCodeRef"></div>
          <a-button type="link" @click="generateQRCode">
            重新生成
          </a-button>
        </div>

        <div class="share-options">
          <h4>分享方式：</h4>
          <a-space>
            <a-button @click="shareToWeChat">
              <WechatOutlined />
              微信
            </a-button>
            <a-button @click="shareToWeibo">
              <WeiboOutlined />
              微博
            </a-button>
            <a-button @click="shareToEmail">
              <MailOutlined />
              邮件
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { message } from 'ant-design-vue';
import {
  PlusOutlined,
  UploadOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  EditOutlined,
  TeamOutlined,
  EyeOutlined,
  BarChartOutlined,
  CopyOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  ReloadOutlined,
  WechatOutlined,
  WeiboOutlined,
  MailOutlined,
  HomeOutlined
} from '@ant-design/icons-vue';
import { CONFIG, UTILS } from '../api/config';
import { api } from '../utils/request';
import { Statistic } from 'ant-design-vue';

// 响应式数据
const router = useRouter();
const userStore = useUserStore();
const tableSize = ref('middle')

// 响应式表格尺寸控制
const updateTableSize = () => {
  if (window.innerWidth < 768) {
    tableSize.value = 'small'
  } else if (window.innerWidth < 1200) {
    tableSize.value = 'middle'
  } else {
    tableSize.value = 'default'
  }
}

// 工具函数：从本地存储获取用户ID
const getCurrentUserId = () => {
  const userInfoStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo && userInfo.id) {
        return userInfo.id;
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
  return 1; // 默认值
};

// 搜索表单数据
const searchForm = reactive({
  keyword: '',
  status: '',
  type: '',
  dateRange: [],
  dateFilter: '', // 添加dateFilter字段
  creator: ''
});

// 表格数据
const questionnaires = ref([]);
const tableLoading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
});

// 统计信息
const statistics = reactive({
  total: 0,
  published: 0,
  draft: 0,
  totalParticipants: 0,
  totalQuestions: 0,
  avgCompletionRate: 0,
  avgDuration: 0
});

// 弹窗状态
const shareModalVisible = ref(false);

// 分享相关数据
const shareLink = ref('');
const currentQuestionnaire = ref(null);

// 表格列定义 - 基于数据库表结构修正
const tableColumns = [
  {
    title: '问卷标题',
    dataIndex: 'title',
    key: 'title',
    width: 160,
    ellipsis: true,
    fixed: 'left',
    responsive: ['md']
  },
  {
    title: '创建者',
    dataIndex: 'creator_id', // 对应数据库creator_id字段
    key: 'creator_id',
    width: 90,
    responsive: ['md']
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 70,
    responsive: ['sm']
  },
  {
    title: '时间范围',
    dataIndex: 'dateRange',
    key: 'dateRange',
    width: 120,
    responsive: ['lg']
  },
  {
    title: '参与统计',
    key: 'participation',
    width: 100,
    responsive: ['lg']
  },
  {
    title: '创建时间',
    dataIndex: 'created_time', // 对应数据库created_time字段
    key: 'created_time',
    width: 110,
    responsive: ['md']
  },
  {
    title: '操作',
    key: 'action',
    width: 240,
    fixed: 'right',
    responsive: ['sm']
  }
];

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    1: 'green',    // 已发布
    2: 'orange',   // 草稿
    0: 'red'       // 已禁用
  };
  return colorMap[status] || 'default';
};

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    1: '已发布',
    2: '草稿',
    0: '已禁用'
  };
  return textMap[status] || '未知';
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN');
};

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN');
};

// 搜索和筛选方法
const handleSearch = () => {
  pagination.current = 1;
  fetchQuestionnaires();
};

const clearFilters = () => {
  searchForm.keyword = '';
  searchForm.status = '';
  searchForm.dateFilter = ''; // 重置dateFilter字段
  pagination.current = 1;
  fetchQuestionnaires();
};

// 表格操作方法
const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchQuestionnaires();
};

// 创建问卷相关方法
const showCreateModal = () => {
  router.push('/manual-create');
};

// 问卷操作相关方法
const editQuestionnaire = (record) => {
  router.push(`/questionnaire/edit/${record.id}`);
};

const previewQuestionnaire = (record) => {
  router.push(`/questionnaire/preview/${record.id}`);
};

const viewStatistics = (record) => {
  router.push(`/questionnaire/statistics/${record.id}`);
};

// 获取问卷列表 - 基于数据库表结构修正
const fetchQuestionnaireList = async () => {
  try {
    tableLoading.value = true

    // 构建请求参数 - 直接作为params传递，不要嵌套
    const requestParams = {
      creatorId: getCurrentUserId(), // 使用工具函数获取用户ID
      page: pagination.current,
      size: pagination.pageSize, // 后端参数名是size，不是pageSize
      keyword: searchForm.keyword || '',
      status: searchForm.status || '',
      dateFilter: searchForm.dateFilter || ''
    }

    console.log('发送到后端的参数:', requestParams)
    console.log('请求URL:', CONFIG.API_ENDPOINTS.QUESTIONNAIRE_LIST)
    console.log('完整请求URL:', `${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_LIST}`)

    // 根据数据库表结构，从question_create表获取问卷列表
    // 直接传递params对象，axios会自动序列化为查询字符串
    const response = await api.get(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_LIST, requestParams)

    console.log('后端响应:', response)

    if (response.code === 200) {
      // 转换数据格式，确保字段名与数据库表结构匹配
      questionnaires.value = (response.data.list || []).map(item => ({
        ...item,
        // 确保字段名与数据库表结构一致
        title: item.title,
        description: item.description,
        status: item.status,
        start_date: item.start_date,
        end_date: item.end_date,
        creator_id: item.creator_id, // 使用后端返回的真实creator_id，不要覆盖
        created_time: item.created_time,
        updated_time: item.updated_time,
        submission_limit: item.submission_limit
      }))
      pagination.total = response.data.total || 0
      console.log('处理后的数据:', questionnaires.value)
    } else {
      message.error(response.message || '获取问卷列表失败')
    }
  } catch (error) {
    console.error('获取问卷列表失败:', error)
    console.error('错误详情:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    })
    message.error('获取问卷列表失败')
  } finally {
    tableLoading.value = false
  }
}

// 删除问卷 - 基于数据库表结构修正
const deleteQuestionnaire = async (id) => {
  try {
    // 根据数据库表结构，删除question_create表中的问卷记录
    const response = await api.delete(`${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_DELETE}/${id}`)

    if (response.code === 200) {
      message.success('删除成功')
      fetchQuestionnaireList()
    } else {
      message.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除问卷失败:', error)
    message.error('删除失败')
  }
}

// 复制问卷 - 基于数据库表结构修正
const copyQuestionnaire = async (id) => {
  try {
    // 根据数据库表结构，复制question_create表中的问卷记录
    const response = await api.post(`${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_COPY}/${id}`)

    if (response.code === 200) {
      message.success('复制成功')
      fetchQuestionnaireList()
    } else {
      message.error(response.message || '复制失败')
    }
  } catch (error) {
    console.error('复制问卷失败:', error)
    message.error('复制失败')
  }
}

const shareQuestionnaire = (record) => {
  currentQuestionnaire.value = record;
  shareLink.value = `${window.location.origin}/questionnaire/fill/${record.id}`;
  shareModalVisible.value = true;
};

// 切换问卷状态 - 基于数据库表结构修正
const toggleQuestionnaireStatus = async (record) => {
  try {
    const newStatus = record.status === 1 ? 0 : 1;
    const response = await api.post(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_TOGGLE_STATUS, {
      questionnaireId: record.id,
      status: newStatus
    });

    if (response.code === 200) {
      message.success(`问卷${newStatus === 1 ? '启用' : '停用'}成功！`);
      fetchQuestionnaireList();
      fetchStatistics();
    } else {
      message.error(response.message || '操作失败');
    }
  } catch (error) {
    console.error('切换问卷状态失败:', error);
    message.error('操作失败，请稍后重试');
  }
};

// 分享相关方法
const handleShareModalCancel = () => {
  shareModalVisible.value = false;
  currentQuestionnaire.value = null;
};

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    message.success('链接已复制到剪贴板！');
  } catch (error) {
    console.error('复制失败:', error);
    message.error('复制失败，请手动复制');
  }
};

const generateQRCode = () => {
  message.info('二维码生成功能开发中...');
};

const shareToWeChat = () => {
  message.info('微信分享功能开发中...');
};

const shareToWeibo = () => {
  message.info('微博分享功能开发中...');
};

const shareToEmail = () => {
  message.info('邮件分享功能开发中...');
};

// 导入问卷
const handleImport = () => {
  message.info('导入功能开发中...');
};

// 数据获取方法
const fetchQuestionnaires = async () => {
  try {
    tableLoading.value = true;

    const params = {
      creatorId: getCurrentUserId(), // 使用工具函数获取用户ID
      page: pagination.current,
      size: pagination.pageSize,
      keyword: searchForm.keyword || '',
      status: searchForm.status || '',
      dateFilter: searchForm.dateFilter || '' // 使用dateFilter而不是type
    };

    console.log('fetchQuestionnaires发送参数:', params);

    const response = await api.get(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_LIST, params);

    if (response.code === 200) {
      // 转换数据格式，确保字段名与数据库表结构匹配
      questionnaires.value = (response.data.list || []).map(item => ({
        ...item,
        // 确保字段名与数据库表结构一致
        title: item.title,
        description: item.description,
        status: item.status,
        start_date: item.start_date,
        end_date: item.end_date,
        creator_id: item.creator_id,
        created_time: item.created_time,
        updated_time: item.updated_time,
        submission_limit: item.submission_limit
      }));
      pagination.total = response.data.total || 0;
      console.log('fetchQuestionnaires处理后的数据:', questionnaires.value);
    } else {
      message.error(response.message || '获取问卷列表失败');
    }
  } catch (error) {
    console.error('获取问卷列表失败:', error);
    message.error('获取问卷列表失败，请稍后重试');
  } finally {
    tableLoading.value = false;
  }
};

// 获取统计信息 - 基于数据库表结构修正
const fetchStatistics = async () => {
  try {
    // 首先尝试从新的统计接口获取数据
    const response = await api.get(CONFIG.API_ENDPOINTS.STATISTICS_DASHBOARD)
    
    if (response.code === 200) {
      const data = response.data || {}
      statistics.total = data.totalQuestionnaires || 0
      statistics.published = data.publishedQuestionnaires || 0
      statistics.draft = data.draftQuestionnaires || 0
      statistics.totalParticipants = data.totalParticipants || 0
      statistics.totalQuestions = data.totalQuestions || 0
      statistics.avgCompletionRate = data.avgCompletionRate || 0
      statistics.avgDuration = data.avgDuration || 0
      
      console.log('获取到统计信息:', data)
      console.log('统计数据显示:', {
        total: statistics.total,
        published: statistics.published,
        draft: statistics.draft,
        totalParticipants: statistics.totalParticipants
      })
    } else {
      // 如果新接口失败，尝试从问卷列表接口获取基础统计
      console.warn('统计接口返回失败，尝试从问卷列表获取基础统计')
      await fetchBasicStatistics()
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
    // 如果统计接口失败，尝试从问卷列表接口获取基础统计
    console.warn('统计接口调用失败，尝试从问卷列表获取基础统计')
    await fetchBasicStatistics()
  }
}

// 从问卷列表获取基础统计信息
const fetchBasicStatistics = async () => {
  try {
    // 获取问卷列表来计算基础统计
    const params = {
      creatorId: getCurrentUserId(),
      page: 1,
      size: 1000, // 获取足够多的数据来计算统计
      keyword: '',
      status: '',
      dateFilter: ''
    }
    
    const response = await api.get(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_LIST, params)
    
    if (response.code === 200) {
      const questionnaires = response.data.list || []
      
      // 计算基础统计 - 根据数据库状态值映射
      statistics.total = questionnaires.length
      statistics.published = questionnaires.filter(q => q.status === 1).length  // status = 1 表示已发布
      statistics.draft = questionnaires.filter(q => q.status === 2).length     // status = 2 表示草稿
      statistics.totalParticipants = 0 // 暂时设为0，需要从提交记录中获取
      statistics.totalQuestions = 0 // 暂时设为0，需要从问题表中获取
      statistics.avgCompletionRate = 0 // 暂时设为0，需要从提交记录中获取
      statistics.avgDuration = 0 // 暂时设为0，需要从提交记录中获取
      
      console.log('从问卷列表计算的基础统计:', {
        total: statistics.total,
        published: statistics.published,
        draft: statistics.draft,
        questionnaires: questionnaires.map(q => ({ id: q.id, title: q.title, status: q.status }))
      })
    }
  } catch (error) {
    console.error('获取基础统计失败:', error)
    // 设置默认值
    statistics.total = 0
    statistics.published = 0
    statistics.draft = 0
    statistics.totalParticipants = 0
    statistics.totalQuestions = 0
    statistics.avgCompletionRate = 0
    statistics.avgDuration = 0
  }
}

// 返回主页方法
const goToHome = () => {
  router.push('/');
};

// 生命周期
onMounted(() => {
  updateTableSize()
  window.addEventListener('resize', updateTableSize)
  // 获取数据 - 基于数据库表结构修正
  fetchQuestionnaireList();
  fetchStatistics();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTableSize)
})
</script>

<style scoped>
.questionnaire-management-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

/* 页面头部样式 */
.page-header {
  background: white;
  color: #1a1a1a;
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
}

.title-section {
  flex: 1;
}

.title-with-back {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.back-home-btn {
  color: #1890ff !important;
  font-size: 16px;
  padding: 4px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.back-home-btn:hover {
  background: #f0f8ff !important;
  color: #1890ff !important;
}

.back-home-btn .anticon {
  margin-right: 4px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #1a1a1a;
  text-shadow: none;
}

.page-subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons .ant-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-buttons .ant-btn-primary {
  background: #1890ff;
  border-color: #1890ff;
}

.action-buttons .ant-btn-primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.action-buttons .ant-btn:not(.ant-btn-primary) {
  border-color: #d9d9d9;
  color: #595959;
}

.action-buttons .ant-btn:not(.ant-btn-primary):hover {
  border-color: #40a9ff;
  color: #40a9ff;
  transform: translateY(-1px);
}

/* 搜索筛选区域样式 */
.search-filter-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 统计信息区域样式 */
.statistics-section {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card .ant-card-body {
  padding: 20px;
}

/* 表格区域样式 */
.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-section .ant-card-body {
  padding: 0;
}

/* 表格样式优化 */
.table-section {
  margin-top: 24px;
}

.table-section .ant-table {
  font-size: 14px;
}

.table-section .ant-table-thead > tr > th {
  background: #fafafa;
  font-weight: 600;
  color: #374151;
  padding: 12px 8px;
  white-space: nowrap;
}

.table-section .ant-table-tbody > tr > td {
  padding: 12px 8px;
  vertical-align: top;
}

/* 问卷标题列样式 */
.questionnaire-title {
  max-width: 160px;
}

.title-text {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-desc {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 创建者列样式 */
.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.creator-name {
  font-size: 13px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80px;
}

/* 时间范围列样式 */
.date-range {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.date-range div {
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 参与统计列样式 */
.participation-stats {
  font-size: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.stat-label {
  color: #6b7280;
}

.stat-value {
  color: #1f2937;
  font-weight: 500;
}

/* 操作列样式 */
.ant-table .ant-space {
  flex-wrap: wrap;
  gap: 4px;
}

.ant-table .ant-btn-link {
  padding: 2px 6px;
  height: auto;
  font-size: 12px;
}

/* 弹窗样式 */
.form-help-text {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}

/* 分享弹窗样式 */
.share-content {
  padding: 20px 0;
}

.share-content h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-weight: 500;
}

.share-link {
  margin-bottom: 24px;
}

.qr-code-container {
  margin-bottom: 24px;
}

.qr-code {
  width: 200px;
  height: 200px;
  background: #f5f5f5;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px 0;
}

.share-options {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-management-page {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .action-buttons {
    width: 100%;
    justify-content: stretch;
  }

  .action-buttons .ant-btn {
    flex: 1;
  }

  .search-filter-section .ant-col {
    margin-bottom: 12px;
  }
}

/* 表格滚动条样式 */
.ant-table-body::-webkit-scrollbar {
  height: 8px;
}

.ant-table-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.ant-table-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.ant-table-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
