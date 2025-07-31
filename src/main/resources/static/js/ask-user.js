// 问卷数据（模拟数据，实际应该从后端获取）
let questionnaires = [
    {
        id: 1,
        title: "幼儿学习能力评估问卷",
        description: "本问卷旨在了解幼儿的学习能力、认知发展水平和学习兴趣，为制定个性化教育方案提供依据。",
        category: "education",
        categoryName: "教育类",
        status: "active",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        maxSubmissions: 1,
        currentSubmissions: 0,
        isCompleted: false
    },
    {
        id: 2,
        title: "幼儿健康状况调查",
        description: "了解幼儿的身体健康状况、饮食习惯和运动情况，帮助家长和教师更好地关注幼儿健康。",
        category: "health",
        categoryName: "健康类",
        status: "active",
        startDate: "2025-01-15",
        endDate: "2025-11-30",
        maxSubmissions: 2,
        currentSubmissions: 1,
        isCompleted: false
    },
    {
        id: 3,
        title: "幼儿行为习惯观察问卷",
        description: "通过观察和记录幼儿的日常行为习惯，分析其性格特点和行为模式。",
        category: "behavior",
        categoryName: "行为类",
        status: "upcoming",
        startDate: "2025-02-01",
        endDate: "2025-08-31",
        maxSubmissions: 1,
        currentSubmissions: 0,
        isCompleted: false
    },
    {
        id: 4,
        title: "家庭环境对幼儿发展影响调查",
        description: "研究家庭环境、父母教育方式对幼儿发展的影响，为家庭教育提供指导。",
        category: "family",
        categoryName: "家庭类",
        status: "ending",
        startDate: "2024-10-01",
        endDate: "2025-01-31",
        maxSubmissions: 1,
        currentSubmissions: 0,
        isCompleted: false
    },
    {
        id: 5,
        title: "幼儿语言发展评估",
        description: "评估幼儿的语言表达能力、词汇量和语言理解能力，为语言教育提供参考。",
        category: "education",
        categoryName: "教育类",
        status: "active",
        startDate: "2025-01-01",
        endDate: "2025-06-30",
        maxSubmissions: 1,
        currentSubmissions: 0,
        isCompleted: false
    }
];

// 当前页码和每页显示数量
let currentPage = 1;
const itemsPerPage = 6;

// 筛选条件
let searchTerm = '';
let categoryFilter = '';
let statusFilter = '';

// DOM元素
const questionnaireList = document.getElementById('questionnaire-list');
const searchInput = document.getElementById('search-questionnaire');
const searchBtn = document.querySelector('.search-btn');
const categoryFilterSelect = document.getElementById('category-filter');
const statusFilterSelect = document.getElementById('status-filter');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageNumbers = document.querySelector('.page-numbers');

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    renderQuestionnaires();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 筛选功能
    categoryFilterSelect.addEventListener('change', handleFilter);
    statusFilterSelect.addEventListener('change', handleFilter);

    // 分页功能
    prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));

    // 退出登录
    document.querySelector('.btn-login').addEventListener('click', function() {
        if (confirm('确定要退出登录吗？')) {
            window.location.href = 'login.html';
        }
    });
}

// 处理搜索
function handleSearch() {
    searchTerm = searchInput.value.trim();
    currentPage = 1;
    renderQuestionnaires();
}

// 处理筛选
function handleFilter() {
    categoryFilter = categoryFilterSelect.value;
    statusFilter = statusFilterSelect.value;
    currentPage = 1;
    renderQuestionnaires();
}

// 渲染问卷列表
function renderQuestionnaires() {
    const filteredQuestionnaires = filterQuestionnaires();
    const paginatedQuestionnaires = paginateQuestionnaires(filteredQuestionnaires);
    
    if (paginatedQuestionnaires.length === 0) {
        questionnaireList.innerHTML = `
            <div class="empty-state">
                <h3>暂无符合条件的问卷</h3>
                <p>请尝试调整搜索条件或筛选条件</p>
            </div>
        `;
        return;
    }

    questionnaireList.innerHTML = paginatedQuestionnaires.map(questionnaire => 
        createQuestionnaireCard(questionnaire)
    ).join('');

    renderPagination(filteredQuestionnaires.length);
}

// 筛选问卷
function filterQuestionnaires() {
    return questionnaires.filter(questionnaire => {
        // 搜索筛选
        if (searchTerm && !questionnaire.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !questionnaire.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // 分类筛选
        if (categoryFilter && questionnaire.category !== categoryFilter) {
            return false;
        }

        // 状态筛选
        if (statusFilter && questionnaire.status !== statusFilter) {
            return false;
        }

        return true;
    });
}

// 分页处理
function paginateQuestionnaires(questionnaires) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return questionnaires.slice(startIndex, endIndex);
}

// 创建问卷卡片
function createQuestionnaireCard(questionnaire) {
    const isDisabled = questionnaire.isCompleted || 
                      (questionnaire.currentSubmissions >= questionnaire.maxSubmissions) ||
                      questionnaire.status === 'upcoming';
    
    const buttonText = questionnaire.isCompleted ? '已完成' : 
                      questionnaire.currentSubmissions >= questionnaire.maxSubmissions ? '已达上限' :
                      questionnaire.status === 'upcoming' ? '即将开始' : '填写问卷';

    return `
        <div class="questionnaire-card">
            <div class="card-header">
                <div class="card-title">${questionnaire.title}</div>
                <div class="card-category">${questionnaire.categoryName}</div>
            </div>
            <div class="card-body">
                <div class="card-description">${questionnaire.description}</div>
                <div class="card-meta">
                    <span>开始时间: ${formatDate(questionnaire.startDate)}</span>
                    <span>结束时间: ${formatDate(questionnaire.endDate)}</span>
                </div>
                <div class="card-meta">
                    <span>填写次数: ${questionnaire.currentSubmissions}/${questionnaire.maxSubmissions}</span>
                    <span class="card-status status-${questionnaire.status}">${getStatusText(questionnaire.status)}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn-fill-questionnaire" 
                        ${isDisabled ? 'disabled' : ''} 
                        onclick="fillQuestionnaire(${questionnaire.id})">
                    ${buttonText}
                </button>
            </div>
        </div>
    `;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'active': '进行中',
        'upcoming': '即将开始',
        'ending': '即将结束'
    };
    return statusMap[status] || status;
}

// 填写问卷
function fillQuestionnaire(questionnaireId) {
    // 这里应该跳转到问卷填写页面
    // 实际项目中可能需要传递问卷ID作为参数
    window.location.href = `questionnaire-preview.html?id=${questionnaireId}`;
}

// 渲染分页
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // 更新分页按钮状态
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    // 更新页码
    pageNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => changePage(i));
        pageNumbers.appendChild(pageNumber);
    }
}

// 切换页面
function changePage(page) {
    const totalPages = Math.ceil(filterQuestionnaires().length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderQuestionnaires();
    }
}

// 模拟从后端获取数据
function fetchQuestionnaires() {
    // 这里应该发送AJAX请求到后端获取问卷数据
    // 目前使用模拟数据
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(questionnaires);
        }, 500);
    });
}

// 页面加载时获取数据
window.addEventListener('load', async function() {
    try {
        // const data = await fetchQuestionnaires();
        // questionnaires = data;
        renderQuestionnaires();
    } catch (error) {
        console.error('获取问卷数据失败:', error);
        questionnaireList.innerHTML = `
            <div class="empty-state">
                <h3>加载失败</h3>
                <p>请刷新页面重试</p>
            </div>
        `;
    }
});