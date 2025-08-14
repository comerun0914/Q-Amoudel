// 数据统计页面JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('questionnaire-statistics.js loaded successfully');
    
    // 页面保护 - 校验登录状态并初始化用户信息
    if (!UTILS.protectPage()) {
        console.log('Page protection failed, stopping execution');
        return; // 如果未登录，停止执行后续代码
    }
    
    console.log('Page protection passed, initializing...');
    
    // 启动自动校验（每5秒检查一次）
    UTILS.startAutoAuthCheck();
    
    // 初始化页面
    initPage();
    
    // 绑定事件
    bindEvents();
    
    // 加载统计数据
    loadStatisticsData();
    
    // 启动实时监控
    startRealtimeMonitoring();
    
    // 监听窗口大小变化，重新调整图表大小
    window.addEventListener('resize', function() {
        // 延迟执行，避免频繁调整
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(function() {
            if (chartInstances.rankingChart) {
                chartInstances.rankingChart.resize();
            }
            if (chartInstances.statusChart) {
                chartInstances.statusChart.resize();
            }
            if (chartInstances.trendChart) {
                chartInstances.trendChart.resize();
            }
        }, 250);
    });
});

// 全局变量
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let totalCount = 0;
let statisticsData = {}; // 统计数据
let chartInstances = {}; // 图表实例
let realtimeInterval = null; // 实时监控定时器
let timeRange = 30; // 默认时间范围（天）
let customStartDate = null;
let customEndDate = null;

/**
 * 初始化页面
 */
function initPage() {
    console.log('Initializing statistics page...');
    
    // 初始化用户信息显示
    UTILS.displayUserInfo(UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO));
    
    // 初始化时间筛选器
    initTimeFilter();
    
    // 初始化图表容器
    initChartContainers();
    
    // 设置默认日期范围
    setDefaultDateRange();
}

/**
 * 初始化时间筛选器
 */
function initTimeFilter() {
    const timeRangeSelect = document.getElementById('timeRange');
    const customDateRange = document.getElementById('customDateRange');
    
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function() {
            const value = this.value;
            if (value === 'custom') {
                customDateRange.style.display = 'flex';
                // 设置默认自定义日期范围（最近7天）
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                
                document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
                document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
            } else {
                customDateRange.style.display = 'none';
                timeRange = parseInt(value);
                loadStatisticsData();
            }
        });
    }
    
    // 自定义日期应用按钮
    const applyCustomDateBtn = document.getElementById('applyCustomDate');
    if (applyCustomDateBtn) {
        applyCustomDateBtn.addEventListener('click', function() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (startDate && endDate) {
                customStartDate = startDate;
                customEndDate = endDate;
                loadStatisticsData();
            } else {
                UTILS.showToast('请选择开始和结束日期', 'warning');
            }
        });
    }
}

/**
 * 设置默认日期范围
 */
function setDefaultDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);
    
    if (document.getElementById('startDate')) {
        document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    }
    if (document.getElementById('endDate')) {
        document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    }
}

/**
 * 初始化图表容器
 */
function initChartContainers() {
    // 初始化趋势图表（Chart.js）
    initTrendChart();
    
    // 初始化状态分布图表（ECharts）
    initStatusChart();
    
    // 初始化热门问卷排行图表（ECharts）
    initRankingChart();
    

}

/**
 * 绑定事件
 */
function bindEvents() {
    console.log('Binding events...');
    
    // 导出数据按钮
    const exportBtn = document.getElementById('exportData');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportData);
    }
    
    // 刷新数据按钮
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadStatisticsData);
    }
    
    // 趋势图表指标选择
    const trendMetricSelect = document.getElementById('trendMetric');
    if (trendMetricSelect) {
        trendMetricSelect.addEventListener('change', function() {
            updateTrendChart(this.value);
        });
    }
    
    // 排行图表指标选择
    const rankingMetricSelect = document.getElementById('rankingMetric');
    if (rankingMetricSelect) {
        rankingMetricSelect.addEventListener('change', function() {
            updateRankingChart(this.value);
        });
    }
    
    // 表格指标选择
    const tableMetricSelect = document.getElementById('tableMetric');
    if (tableMetricSelect) {
        tableMetricSelect.addEventListener('change', function() {
            loadTableData(this.value);
        });
    }
    
    // 导出表格数据按钮
    const exportTableBtn = document.getElementById('exportTableData');
    if (exportTableBtn) {
        exportTableBtn.addEventListener('click', handleExportTableData);
    }
    
    // 分页按钮
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
    }
    
    // 用户下拉菜单
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * 加载统计数据
 */
function loadStatisticsData() {
    console.log('Loading statistics data...');
    showLoading();
    
    // 获取用户信息
    const userInfo = UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
    if (!userInfo || !userInfo.id) {
        UTILS.showToast('用户信息无效，请重新登录', 'error');
        hideLoading();
        return;
    }
    
    // 构建请求参数
    const params = new URLSearchParams({
        creatorId: userInfo.id,
        timeRange: timeRange
    });
    
    if (customStartDate && customEndDate) {
        params.append('startDate', customStartDate);
        params.append('endDate', customEndDate);
    }
    
    // 发送请求到后端
    const url = UTILS.getApiUrl(CONFIG.API_ENDPOINTS.STATISTICS, false) + '?' + params.toString();
    console.log('Requesting statistics URL:', url);
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${UTILS.getStorage(CONFIG.STORAGE_KEYS.TOKEN)}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        hideLoading();
        console.log('Received statistics data:', data);
        
        if (data.code === 200) {
            statisticsData = data.data || {};
            
            // 更新核心统计卡片
            updateCoreStats();
            
            // 更新图表
            updateAllCharts();
            
            // 加载表格数据
            loadTableData('questionnaire');
            
        } else {
            UTILS.showToast(data.message || '加载统计数据失败', 'error');
            // 使用模拟数据
            loadMockData();
        }
    })
    .catch(error => {
        hideLoading();
        console.error('加载统计数据失败:', error);
        UTILS.showToast('网络错误，请检查网络连接后重试', 'error');
        // 使用模拟数据
        loadMockData();
    });
}

/**
 * 加载模拟数据（当后端接口不可用时）
 */
function loadMockData() {
    console.log('Loading mock data...');
    
    // 模拟统计数据
    statisticsData = {
        coreStats: {
            totalQuestionnaires: 25,
            totalSubmissions: 156,
            completionRate: 78.5,
            uniqueUsers: 89
        },
        trends: {
            dates: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
            submissions: [12, 19, 15, 22, 18],
            completions: [10, 16, 12, 18, 15],
            users: [8, 12, 10, 15, 12]
        },
        statusDistribution: [
            { name: '已发布', value: 15, color: '#28a745' },
            { name: '草稿', value: 8, color: '#ffc107' },
            { name: '已禁用', value: 2, color: '#dc3545' }
        ],
        topQuestionnaires: [
            { name: '幼儿教育满意度调查', submissions: 45, completions: 42, views: 120 },
            { name: '家长反馈问卷', submissions: 38, completions: 35, views: 98 },
            { name: '课程质量评估', submissions: 32, completions: 28, views: 85 },
            { name: '教师评价表', submissions: 28, completions: 25, views: 76 },
            { name: '设施使用调查', submissions: 24, completions: 20, views: 65 }
        ],

    };
    
    // 更新核心统计卡片
    updateCoreStats();
    
    // 更新图表
    updateAllCharts();
    
    // 加载表格数据
    loadTableData('questionnaire');
}

/**
 * 更新核心统计卡片
 */
function updateCoreStats() {
    const stats = statisticsData.coreStats || {};
    
    // 更新总问卷数
    const totalElement = document.getElementById('totalQuestionnaires');
    if (totalElement) {
        totalElement.textContent = stats.totalQuestionnaires || 0;
    }
    
    // 更新总提交数
    const submissionsElement = document.getElementById('totalSubmissions');
    if (submissionsElement) {
        submissionsElement.textContent = stats.totalSubmissions || 0;
    }
    
    // 更新完成率
    const completionElement = document.getElementById('completionRate');
    if (completionElement) {
        completionElement.textContent = (stats.completionRate || 0) + '%';
    }
    
    // 更新独立用户数
    const usersElement = document.getElementById('uniqueUsers');
    if (usersElement) {
        usersElement.textContent = stats.uniqueUsers || 0;
    }
    
    // 更新变化率（模拟数据）
    updateChangeRates();
}

/**
 * 更新变化率
 */
function updateChangeRates() {
    const changes = [
        { id: 'totalChange', value: '+12%', isPositive: true },
        { id: 'submissionsChange', value: '+8%', isPositive: true },
        { id: 'completionChange', value: '+3%', isPositive: true },
        { id: 'usersChange', value: '+15%', isPositive: true }
    ];
    
    changes.forEach(change => {
        const element = document.getElementById(change.id);
        if (element) {
            element.textContent = change.value;
            element.className = `stat-change ${change.isPositive ? 'positive' : 'negative'}`;
        }
    });
}

/**
 * 初始化趋势图表
 */
function initTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    chartInstances.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '提交数量',
                data: [],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
				tension: 0.4,
				fill: true,
				borderWidth: 1.5,
				pointRadius: 2,
				pointHoverRadius: 3,
				pointBorderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
					display: true,
					position: 'top',
					labels: {
						font: { size: 10 }
					}
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
						color: 'rgba(0,0,0,0.08)',
						lineWidth: 0.5
					},
					ticks: {
						font: { size: 10 }
					}
                },
                x: {
					grid: {
						color: 'rgba(0,0,0,0.08)',
						lineWidth: 0.5
					},
					ticks: {
						font: { size: 10 }
					}
                }
            }
        }
    });
}

/**
 * 更新趋势图表
 */
function updateTrendChart(metric = 'submissions') {
    if (!chartInstances.trendChart) return;
    
    const trends = statisticsData.trends || {};
    const labels = trends.dates || [];
    let data = [];
    let label = '';
    
    switch (metric) {
        case 'submissions':
            data = trends.submissions || [];
            label = '提交数量';
            break;
        case 'completions':
            data = trends.completions || [];
            label = '完成数量';
            break;
        case 'users':
            data = trends.users || [];
            label = '用户数量';
            break;
        default:
            data = trends.submissions || [];
            label = '提交数量';
    }
    
    chartInstances.trendChart.data.labels = labels;
    chartInstances.trendChart.data.datasets[0].data = data;
    chartInstances.trendChart.data.datasets[0].label = label;
    chartInstances.trendChart.update();
}

/**
 * 初始化状态分布图表
 */
function initStatusChart() {
    const container = document.getElementById('statusChart');
    if (!container) return;
    
    chartInstances.statusChart = echarts.init(container);
    
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: [],
            textStyle: { fontSize: 10 },
            itemWidth: 10,
            itemHeight: 10
        },
        series: [{
            name: '问卷状态',
            type: 'pie',
            radius: ['35%', '60%'],
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 12,
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: []
        }]
    };
    
    chartInstances.statusChart.setOption(option);
}

/**
 * 更新状态分布图表
 */
function updateStatusChart() {
    if (!chartInstances.statusChart) return;
    
    const statusData = statisticsData.statusDistribution || [];
    
    const option = {
        series: [{
            data: statusData.map(item => ({
                name: item.name,
                value: item.value,
                itemStyle: { color: item.color }
            }))
        }]
    };
    
    chartInstances.statusChart.setOption(option);
}

/**
 * 初始化热门问卷排行图表
 */
function initRankingChart() {
    const container = document.getElementById('rankingChart');
    if (!container) return;
    
    chartInstances.rankingChart = echarts.init(container);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function(params) {
                return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value}`;
            }
        },
        grid: {
            left: '15%',
            right: '5%',
            bottom: '8%',
            top: '8%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
            axisLabel: {
                fontSize: 12
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#f0f0f0'
                }
            }
        },
        yAxis: {
            type: 'category',
            data: [],
            axisLabel: {
                fontSize: 12,
                width: 120,
                overflow: 'truncate'
            },
            axisTick: {
                show: false
            }
        },
        series: [{
            name: '提交数量',
            type: 'bar',
            data: [],
            barWidth: '60%',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#667eea' },
                    { offset: 1, color: '#764ba2' }
                ]),
                borderRadius: [0, 4, 4, 0]
            },
            emphasis: {
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#5a6fd8' },
                        { offset: 1, color: '#6a4190' }
                    ])
                }
            }
        }]
    };
    
    chartInstances.rankingChart.setOption(option);
}

/**
 * 更新热门问卷排行图表
 */
function updateRankingChart(metric = 'submissions') {
    if (!chartInstances.rankingChart) return;
    
    const topData = statisticsData.topQuestionnaires || [];
    
    let data = [];
    let name = '';
    
    switch (metric) {
        case 'submissions':
            data = topData.map(item => item.submissions);
            name = '提交数量';
            break;
        case 'completions':
            data = topData.map(item => item.completions);
            name = '完成数量';
            break;
        case 'views':
            data = topData.map(item => item.views);
            name = '浏览量';
            break;
        default:
            data = topData.map(item => item.submissions);
            name = '提交数量';
    }
    
    const names = topData.map(item => item.name);
    
    const option = {
        series: [{
            name: name,
            data: data
        }],
        yAxis: {
            data: names
        }
    };
    
    chartInstances.rankingChart.setOption(option);
}





/**
 * 更新所有图表
 */
function updateAllCharts() {
    updateTrendChart();
    updateStatusChart();
    updateRankingChart();
}

/**
 * 加载表格数据
 */
function loadTableData(metric = 'questionnaire') {
    console.log('Loading table data for metric:', metric);
    
    // 根据指标类型加载不同的数据
    switch (metric) {
        case 'questionnaire':
            loadQuestionnaireTableData();
            break;
        case 'user':
            loadUserTableData();
            break;
        case 'submission':
            loadSubmissionTableData();
            break;
        default:
            loadQuestionnaireTableData();
    }
}

/**
 * 加载问卷表格数据
 */
function loadQuestionnaireTableData() {
    // 模拟问卷数据
    const questionnaireData = [
        {
            id: 1,
            title: '幼儿教育满意度调查',
            status: '已发布',
            createdTime: '2024-01-01',
            submissions: 45,
            completions: 42,
            completionRate: 93.3,
            avgTime: '8分钟'
        },
        {
            id: 2,
            title: '家长反馈问卷',
            status: '已发布',
            createdTime: '2024-01-02',
            submissions: 38,
            completions: 35,
            completionRate: 92.1,
            avgTime: '6分钟'
        },
        {
            id: 3,
            title: '课程质量评估',
            status: '草稿',
            createdTime: '2024-01-03',
            submissions: 0,
            completions: 0,
            completionRate: 0,
            avgTime: '-'
        }
    ];
    
    renderDataTable(questionnaireData);
}

/**
 * 加载用户表格数据
 */
function loadUserTableData() {
    // 模拟用户数据
    const userData = [
        {
            id: 1,
            name: '张家长',
            email: 'zhang@example.com',
            joinTime: '2024-01-01',
            questionnaires: 5,
            submissions: 12,
            lastActive: '2024-01-15'
        }
    ];
    
    // 这里可以渲染用户表格，暂时使用问卷表格
    loadQuestionnaireTableData();
}

/**
 * 加载提交表格数据
 */
function loadSubmissionTableData() {
    // 模拟提交数据
    const submissionData = [
        {
            id: 1,
            questionnaireTitle: '幼儿教育满意度调查',
            submitter: '李家长',
            submitTime: '2024-01-15 14:30',
            status: '已完成',
            timeSpent: '8分钟',
            score: '95分'
        }
    ];
    
    // 这里可以渲染提交表格，暂时使用问卷表格
    loadQuestionnaireTableData();
}

/**
 * 渲染数据表格
 */
function renderDataTable(data) {
    const tableBody = document.getElementById('dataTableBody');
    if (!tableBody) return;
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h3>暂无数据</h3>
                        <p>当前时间范围内没有相关数据</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = '';
    
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.title)}</td>
            <td>
                <span class="status-badge ${getStatusClass(item.status)}">
                    ${item.status}
                </span>
            </td>
            <td>${formatDate(item.createdTime)}</td>
            <td>${item.submissions}</td>
            <td>${item.completions}</td>
            <td>${item.completionRate}%</td>
            <td>${item.avgTime}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-preview" onclick="previewQuestionnaire(${item.id})" title="预览">
                        <i class="fas fa-eye"></i>
                        预览
                    </button>
                    <button class="btn-action btn-edit" onclick="editQuestionnaire(${item.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                        编辑
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 更新分页信息
    updateTablePagination(data.length);
}

/**
 * 更新表格分页
 */
function updateTablePagination(totalItems) {
    totalCount = totalItems;
    totalPages = Math.ceil(totalItems / pageSize);
    
    const startIndexElement = document.getElementById('startIndex');
    const endIndexElement = document.getElementById('endIndex');
    const totalCountElement = document.getElementById('totalCount');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbersElement = document.getElementById('pageNumbers');
    
    if (startIndexElement) {
        startIndexElement.textContent = totalItems > 0 ? 1 : 0;
    }
    
    if (endIndexElement) {
        endIndexElement.textContent = Math.min(pageSize, totalItems);
    }
    
    if (totalCountElement) {
        totalCountElement.textContent = totalItems;
    }
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage <= 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    if (pageNumbersElement) {
        renderPageNumbers(pageNumbersElement);
    }
}

/**
 * 渲染页码
 */
function renderPageNumbers(container) {
    container.innerHTML = '';
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('button');
        pageNumber.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => changePage(i));
        container.appendChild(pageNumber);
    }
}

/**
 * 切换页面
 */
function changePage(page) {
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    // 重新加载表格数据
    const tableMetricSelect = document.getElementById('tableMetric');
    if (tableMetricSelect) {
        loadTableData(tableMetricSelect.value);
    }
}

/**
 * 启动实时监控
 */
function startRealtimeMonitoring() {
    // 模拟实时数据更新
    realtimeInterval = setInterval(() => {
        updateRealtimeData();
    }, 5000); // 每5秒更新一次
}

/**
 * 更新实时数据
 */
function updateRealtimeData() {
    // 模拟实时数据
    const onlineUsers = Math.floor(Math.random() * 20) + 5;
    const todaySubmissions = Math.floor(Math.random() * 10) + 2;
    const responseTime = Math.floor(Math.random() * 50) + 20;
    
    // 更新在线用户数
    const onlineUsersElement = document.getElementById('onlineUsers');
    if (onlineUsersElement) {
        onlineUsersElement.textContent = onlineUsers;
    }
    
    // 更新今日新增提交数
    const todaySubmissionsElement = document.getElementById('todaySubmissions');
    if (todaySubmissionsElement) {
        todaySubmissionsElement.textContent = todaySubmissions;
    }
    
    // 更新系统响应时间
    const responseTimeElement = document.getElementById('responseTime');
    if (responseTimeElement) {
        responseTimeElement.textContent = responseTime + 'ms';
    }
}

/**
 * 导出数据
 */
function handleExportData() {
    UTILS.showToast('正在准备导出数据...', 'info');
    
    // 模拟导出过程
    setTimeout(() => {
        const dataStr = JSON.stringify(statisticsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `统计数据_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        UTILS.showToast('数据导出成功！', 'success');
    }, 2000);
}

/**
 * 导出表格数据
 */
function handleExportTableData() {
    UTILS.showToast('正在导出表格数据...', 'info');
    
    // 模拟导出过程
    setTimeout(() => {
        const tableMetricSelect = document.getElementById('tableMetric');
        const metric = tableMetricSelect ? tableMetricSelect.value : 'questionnaire';
        
        const dataStr = `问卷统计表格_${metric}_${new Date().toISOString().split('T')[0]}.csv`;
        const dataBlob = new Blob([dataStr], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `表格数据_${metric}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        UTILS.showToast('表格数据导出成功！', 'success');
    }, 1500);
}

/**
 * 登出处理
 */
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除实时监控定时器
        if (realtimeInterval) {
            clearInterval(realtimeInterval);
        }
        
        UTILS.clearStorage();
        window.location.href = 'login.html';
    }
}

/**
 * 显示加载状态
 */
function showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

/**
 * 获取状态样式类
 */
function getStatusClass(status) {
    switch (status) {
        case '已发布':
            return 'status-published';
        case '草稿':
            return 'status-draft';
        case '已禁用':
            return 'status-disabled';
        default:
            return 'status-unknown';
    }
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 预览问卷
 */
function previewQuestionnaire(id) {
    console.log('预览问卷:', id);
    // 跳转到预览页面
    window.open(`questionnaire-preview.html?questionnaireId=${id}`, '_blank');
}

/**
 * 编辑问卷
 */
function editQuestionnaire(id) {
    console.log('编辑问卷:', id);
    // 跳转到编辑页面
    window.location.href = `questionnaire-editor.html?id=${id}`;
}

// 导出函数到全局作用域
window.loadStatisticsData = loadStatisticsData;
window.handleExportData = handleExportData;
window.handleExportTableData = handleExportTableData;
window.previewQuestionnaire = previewQuestionnaire;
window.editQuestionnaire = editQuestionnaire;
window.changePage = changePage;
window.handleLogout = handleLogout;

// 页面卸载时清理定时器
window.addEventListener('beforeunload', function() {
    if (realtimeInterval) {
        clearInterval(realtimeInterval);
    }
});