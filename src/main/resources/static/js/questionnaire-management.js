// 问卷管理界面JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('questionnaire-management.js loaded successfully');
    
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
    
    // 加载问卷数据
    loadQuestionnaireData();
});

// 全局变量
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let totalCount = 0;
let questionnaireData = []; // 当前显示的数据
let selectedIds = [];
let searchKeyword = '';
let statusFilter = '';
let dateFilter = '';

/**
 * 初始化页面
 */
function initPage() {
    console.log('Initializing page...');
    // 初始化用户信息显示
    UTILS.displayUserInfo(UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO));
    
    // 初始化统计信息
    updateStatistics();
    
    // 初始化分页
    initPagination();
}

/**
 * 初始化用户信息显示
 */
function initUserInfo() {
    const userInfo = UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
    if (userInfo) {
        const userInfoElement = document.getElementById('userInfo');
        const userNameElement = document.getElementById('userName');
        const userAvatarElement = document.getElementById('userAvatar');
        const loginBtn = document.getElementById('loginBtn');
        
        if (userInfoElement && userNameElement) {
            userInfoElement.style.display = 'flex';
            userNameElement.textContent = userInfo.username || '用户';
        }
        
        // 设置用户头像
        if (userAvatarElement) {
            if (userInfo.avatar) {
                userAvatarElement.src = userInfo.avatar;
                userAvatarElement.alt = userInfo.username || '用户头像';
            } else {
                // 使用默认头像
                userAvatarElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM5Q0E2RkYiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjIwOTEgMTAgMjQgMTEuNzkwOSAyNCAxNEMyNCAxNi4yMDkxIDIyLjIwOTEgMTggMjAgMThDMTcuNzkwOSAxOCAxNiAxNi4yMDkxIDE2IDE0QzE2IDExLjc5MDkgMTcuNzkwOSAxMCAyMCAxMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yOCAyNkMyOCAyOS4zMTM3IDI0LjQxODMgMzIgMjAgMzJDMjUuNTgxNyAzMiAyMCAyOS4zMTM3IDIwIDI2QzIwIDI5LjMxMzcgMTQuNDE4MyAzMiAxMCAzMkM1LjU4MTcyIDMyIDIgMjkuMzEzNyAyIDI2QzIgMjIuNjg2MyA1LjU4MTcyIDIwIDEwIDIwQzE0LjQxODMgMjAgMTggMjIuNjg2MyAxOCAyNkMxOCAyMi42ODYzIDIxLjU4MTcgMjAgMjYgMjBDMzAuNDE4MyAyMCAzNCAyMi42ODYzIDM0IDI2QzM0IDI5LjMxMzcgMzAuNDE4MyAzMiAyNiAzMkMyMS41ODE3IDMyIDE4IDI5LjMxMzcgMTggMjZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                userAvatarElement.alt = '默认头像';
            }
        }
        
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
        
        // 绑定用户下拉菜单事件
        UTILS.bindUserDropdown();
    }
}

/**
 * 绑定事件
 */
function bindEvents() {
    console.log('Binding events...');
    
    // 创建问卷按钮
    const createBtn = document.getElementById('createQuestionnaire');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            window.location.href = 'manual-create-questionnaire.html';
        });
    }
    
    // 导入问卷按钮
    const importBtn = document.getElementById('importQuestionnaire');
    if (importBtn) {
        importBtn.addEventListener('click', handleImportQuestionnaire);
    }
    
    // 搜索功能
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // 筛选功能
    const statusFilterSelect = document.getElementById('statusFilter');
    const dateFilterSelect = document.getElementById('dateFilter');
    const clearFilterBtn = document.getElementById('clearFilter');
    
    if (statusFilterSelect) {
        statusFilterSelect.addEventListener('change', handleFilterChange);
    }
    
    if (dateFilterSelect) {
        dateFilterSelect.addEventListener('change', handleFilterChange);
    }
    
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearFilters);
    }
    
    // 批量操作按钮
    const batchDeleteBtn = document.getElementById('batchDelete');
    const batchEnableBtn = document.getElementById('batchEnable');
    const batchDisableBtn = document.getElementById('batchDisable');
    
    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', handleBatchDelete);
    }
    
    if (batchEnableBtn) {
        batchEnableBtn.addEventListener('click', handleBatchEnable);
    }
    
    if (batchDisableBtn) {
        batchDisableBtn.addEventListener('click', handleBatchDisable);
    }
    
    // 全选功能
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
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
    
    // 模态框事件
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    
    if (closeDeleteModal) {
        closeDeleteModal.addEventListener('click', hideDeleteModal);
    }
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', hideDeleteModal);
    }
    
    if (confirmDelete) {
        confirmDelete.addEventListener('click', confirmBatchDelete);
    }
    
    // 点击模态框外部关闭
    if (deleteModal) {
        deleteModal.addEventListener('click', function(e) {
            if (e.target === deleteModal) {
                hideDeleteModal();
            }
        });
    }
    
    // 用户下拉菜单
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * 加载问卷数据
 */
function loadQuestionnaireData() {
    console.log('Loading questionnaire data...');
    showLoading();
    
    // 获取用户信息
    const userInfo = UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
    if (!userInfo || !userInfo.id) {
        UTILS.showToast('用户信息无效，请重新登录', 'error');
        hideLoading();
        return;
    }
    
    // 发送请求到后端 - 支持分页和筛选参数
    let url = UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_LIST, false) +
        `?creatorId=${userInfo.id}&page=${currentPage}&size=${pageSize}`;
    if (searchKeyword) url += `&keyword=${encodeURIComponent(searchKeyword)}`;
    if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
    if (dateFilter) url += `&dateFilter=${encodeURIComponent(dateFilter)}`;
    
    console.log('Requesting URL:', url);
    
    fetch(url, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        hideLoading();
        console.log('Received data:', data);
        
        // 兼容后端 data 既可能是数组，也可能是对象（含 list 字段）
        if (data.code === 200) {
            if (Array.isArray(data.data)) {
                questionnaireData = data.data;
                currentPage = 1;
                pageSize = data.data.length;
                totalPages = 1;
                totalCount = data.data.length;
            } else {
                questionnaireData = data.data && data.data.list ? data.data.list : [];
                currentPage = data.data && data.data.currentPage ? data.data.currentPage : 1;
                pageSize = data.data && data.data.pageSize ? data.data.pageSize : 10;
                totalPages = data.data && data.data.totalPages ? data.data.totalPages : 1;
                totalCount = data.data && data.data.totalCount ? data.data.totalCount : 0;
            }
            
            console.log('Processed data:', {
                questionnaireData: questionnaireData.length,
                currentPage,
                pageSize,
                totalPages,
                totalCount
            });
            
            renderQuestionnaireTable();
            updateStatistics();
            updatePagination();
            updateBatchActionButtons();
        } else {
            UTILS.showToast(data.message || '加载问卷数据失败', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('加载问卷数据失败:', error);
        UTILS.showToast('网络错误，请检查网络连接后重试', 'error');
        showEmptyState();
    });
}

/**
 * 渲染问卷表格
 */
function renderQuestionnaireTable() {
    console.log('Rendering questionnaire table...');
    const tableBody = document.getElementById('questionnaireTableBody');
    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }
    
    if (questionnaireData.length === 0) {
        showEmptyState();
        return;
    }
    
    tableBody.innerHTML = '';
    
    questionnaireData.forEach((questionnaire, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="questionnaire-checkbox" value="${questionnaire.id}" ${selectedIds.includes(questionnaire.id) ? 'checked' : ''}>
            </td>
            <td>
                <div class="questionnaire-title">
                    <strong>${escapeHtml(questionnaire.title)}</strong>
                    ${questionnaire.description ? `<div class="questionnaire-desc">${escapeHtml(questionnaire.description)}</div>` : ''}
                </div>
            </td>
            <td>
                <span class="status-badge ${getStatusClass(questionnaire.status)}">
                    ${getStatusText(questionnaire.status)}
                </span>
            </td>
            <td>${formatDate(questionnaire.createdTime)}</td>
            <td>${formatDate(questionnaire.startDate)}</td>
            <td>${formatDate(questionnaire.endDate)}</td>
            <td>${questionnaire.submissionCount || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editQuestionnaire(${questionnaire.id})" title="编辑问卷">
                        <i class="fas fa-edit"></i>
                        编辑
                    </button>
                    <button class="btn-action btn-preview" onclick="previewQuestionnaire(${questionnaire.id})" title="预览问卷">
                        <i class="fas fa-eye"></i>
                        预览
                    </button>
                    <button class="btn-action btn-test" onclick="testQuestionnaire(${questionnaire.id})" title="测试问卷">
                        <i class="fas fa-vial"></i>
                        测试
                    </button>
                    <button class="btn-action btn-copy" onclick="copyQuestionnaire(${questionnaire.id})" title="复制问卷">
                        <i class="fas fa-copy"></i>
                        复制
                    </button>
                    ${(questionnaire.status === 0 || questionnaire.status === 1 || questionnaire.status === 2) ? 
                        `<button class="btn-action btn-disable" onclick="toggleQuestionnaireStatus(${questionnaire.id}, false)" title="禁用问卷">
                            <i class="fas fa-ban"></i>
                            禁用
                        </button>` :
                        `<button class="btn-action btn-enable" onclick="toggleQuestionnaireStatus(${questionnaire.id}, true)" title="启用问卷">
                            <i class="fas fa-check"></i>
                            启用
                        </button>`
                    }
                    <button class="btn-action btn-delete" onclick="deleteQuestionnaire(${questionnaire.id})" title="删除问卷">
                        <i class="fas fa-trash"></i>
                        删除
                    </button>
                </div>
            </td>
        `;
        
        // 绑定复选框事件
        const checkbox = row.querySelector('.questionnaire-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', handleCheckboxChange);
        }
        
        tableBody.appendChild(row);
    });
}

/**
 * 显示空状态
 */
function showEmptyState() {
    const tableBody = document.getElementById('questionnaireTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = `
        <tr>
            <td colspan="8">
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>暂无问卷数据</h3>
                    <p>您还没有创建任何问卷，点击"创建问卷"开始您的第一个问卷吧！</p>
                    <button class="btn-create" onclick="window.location.href='manual-create-questionnaire.html'">
                        <i class="fas fa-plus"></i>
                        创建问卷
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * 更新统计信息
 */
function updateStatistics() {
    // 使用当前页面数据计算统计信息（简化版本）
    const totalElement = document.getElementById('totalQuestionnaires');
    const activeElement = document.getElementById('activeQuestionnaires');
    const draftElement = document.getElementById('draftQuestionnaires');
    const expiredElement = document.getElementById('expiredQuestionnaires');
    
    if (totalElement) totalElement.textContent = totalCount;
    if (activeElement) activeElement.textContent = questionnaireData.filter(q => q.status === true || q.status === 1).length;
    if (draftElement) draftElement.textContent = questionnaireData.filter(q => q.status === 2).length;
    if (expiredElement) expiredElement.textContent = questionnaireData.filter(q => isExpired(q.endDate)).length;
}

/**
 * 初始化分页
 */
function initPagination() {
    updatePagination();
}

/**
 * 更新分页
 */
function updatePagination() {
    const startIndexElement = document.getElementById('startIndex');
    const endIndexElement = document.getElementById('endIndex');
    const totalCountElement = document.getElementById('totalCount');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbersElement = document.getElementById('pageNumbers');
    
    // 使用后端返回的分页信息
    if (startIndexElement) {
        startIndexElement.textContent = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    }
    
    if (endIndexElement) {
        // 修正：使用当前页面实际显示的数据数量
        const actualEndIndex = totalCount > 0 ? Math.min((currentPage - 1) * pageSize + questionnaireData.length, totalCount) : 0;
        endIndexElement.textContent = actualEndIndex;
    }
    
    if (totalCountElement) {
        totalCountElement.textContent = totalCount;
    }
    
    // 使用后端返回的分页状态
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
    
    // 使用后端返回的分页信息
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
    
    // 使用传入的分页参数
    currentPage = page;
    // 重新加载数据，后端会返回对应页面的分页信息
    loadQuestionnaireData();
}

/**
 * 更新批量操作按钮状态
 */
function updateBatchActionButtons() {
    const batchDeleteBtn = document.getElementById('batchDelete');
    const batchEnableBtn = document.getElementById('batchEnable');
    const batchDisableBtn = document.getElementById('batchDisable');
    
    const hasSelection = selectedIds.length > 0;
    
    if (batchDeleteBtn) batchDeleteBtn.disabled = !hasSelection;
    if (batchEnableBtn) batchEnableBtn.disabled = !hasSelection;
    if (batchDisableBtn) batchDisableBtn.disabled = !hasSelection;
}

/**
 * 搜索处理
 */
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchKeyword = searchInput.value.trim();
        currentPage = 1; // 重置到第一页
        // 重新加载数据
        loadQuestionnaireData();
    }
}

/**
 * 筛选处理
 */
function handleFilterChange() {
    const statusFilterSelect = document.getElementById('statusFilter');
    const dateFilterSelect = document.getElementById('dateFilter');
    
    if (statusFilterSelect) {
        statusFilter = statusFilterSelect.value;
    }
    
    if (dateFilterSelect) {
        dateFilter = dateFilterSelect.value;
    }
    
    currentPage = 1; // 重置到第一页
    // 重新加载数据
    loadQuestionnaireData();
}

/**
 * 清除筛选
 */
function clearFilters() {
    const statusFilterSelect = document.getElementById('statusFilter');
    const dateFilterSelect = document.getElementById('dateFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (statusFilterSelect) statusFilterSelect.value = '';
    if (dateFilterSelect) dateFilterSelect.value = '';
    if (searchInput) searchInput.value = '';
    
    searchKeyword = '';
    statusFilter = '';
    dateFilter = '';
    
    currentPage = 1;
    // 重新加载数据
    loadQuestionnaireData();
}

/**
 * 全选处理
 */
function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.questionnaire-checkbox');
    
    if (selectAllCheckbox && selectAllCheckbox.checked) {
        selectedIds = questionnaireData.map(q => q.id);
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
    } else {
        selectedIds = [];
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    updateBatchActionButtons();
}

/**
 * 复选框变化处理
 */
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const questionnaireId = parseInt(checkbox.value);
    
    if (checkbox.checked) {
        if (!selectedIds.includes(questionnaireId)) {
            selectedIds.push(questionnaireId);
        }
    } else {
        selectedIds = selectedIds.filter(id => id !== questionnaireId);
    }
    
    // 更新全选复选框状态
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.questionnaire-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = !allChecked && selectedIds.length > 0;
    }
    
    updateBatchActionButtons();
}

/**
 * 编辑问卷
 */
function editQuestionnaire(id) {
    console.log('=== 开始编辑功能 ===');
    console.log('问卷ID:', id);
    
    if (!id) {
        console.error('编辑失败：没有找到问卷ID');
        alert('无法编辑：缺少问卷ID');
        return;
    }
    
    try {
        // 构建编辑URL，使用与预览界面一致的逻辑
        const baseUrl = window.location.origin;
        const editUrl = `${baseUrl}/${CONFIG.ROUTES.QUESTIONNAIRE_EDITOR}?id=${id}`;
        
        console.log('=== 构建编辑URL ===');
        console.log('CONFIG.ROUTES.QUESTIONNAIRE_EDITOR:', CONFIG.ROUTES.QUESTIONNAIRE_EDITOR);
        console.log('问卷ID:', id);
        console.log('baseUrl:', baseUrl);
        console.log('编辑页面完整URL:', editUrl);
        
        // 验证URL格式
        try {
            const testUrl = new URL(editUrl);
            console.log('URL验证成功:', testUrl.href);
            console.log('URL参数:', testUrl.searchParams.get('id'));
        } catch (error) {
            console.error('URL验证失败:', error);
        }
        
        // 验证跳转URL是否包含参数
        if (editUrl.includes('id=')) {
            console.log('✅ URL包含id参数，准备跳转');
            
            // 直接跳转到编辑页面，替换当前窗口
            try {
                console.log('跳转到编辑页面');
                window.location.href = editUrl;
            } catch (error) {
                console.error('跳转失败:', error);
                alert('跳转失败，请重试');
            }
        } else {
            console.error('❌ URL不包含id参数，跳转失败');
            console.error('editUrl:', editUrl);
            alert('跳转URL构建失败，请检查配置');
        }
        
    } catch (error) {
        console.error('准备编辑功能出现错误:', error);
        alert('编辑功能出现错误，请重试');
    }
}

/**
 * 预览问卷
 */
function previewQuestionnaire(id) {
    console.log('=== 开始预览功能 ===');
    console.log('问卷ID:', id);
    
    if (!id) {
        console.error('预览失败：没有找到问卷ID');
        alert('无法预览：缺少问卷ID');
        return;
    }
    
    try {
        // 构建预览URL，使用与编辑界面一致的逻辑
        const baseUrl = window.location.origin;
        const previewUrl = `${baseUrl}/${CONFIG.ROUTES.QUESTIONNAIRE_PREVIEW}?questionnaireId=${id}`;
        
        console.log('=== 构建预览URL ===');
        console.log('CONFIG.ROUTES.QUESTIONNAIRE_PREVIEW:', CONFIG.ROUTES.QUESTIONNAIRE_PREVIEW);
        console.log('问卷ID:', id);
        console.log('baseUrl:', baseUrl);
        console.log('预览页面完整URL:', previewUrl);
        
        // 验证URL格式
        try {
            const testUrl = new URL(previewUrl);
            console.log('URL验证成功:', testUrl.href);
            console.log('URL参数:', testUrl.searchParams.get('questionnaireId'));
        } catch (error) {
            console.error('URL验证失败:', error);
        }
        
        // 验证跳转URL是否包含参数
        if (previewUrl.includes('questionnaireId=')) {
            console.log('✅ URL包含questionnaireId参数，准备跳转');
            
            // 使用新窗口打开预览页面，保持管理界面不关闭
            try {
                console.log('使用window.open打开预览页面');
                const previewWindow = window.open(previewUrl, '_blank');
                
                // 检查是否成功打开新窗口
                if (previewWindow) {
                    console.log('预览页面打开成功');
                } else {
                    // 如果弹窗被阻止，尝试直接跳转
                    console.log('弹窗被阻止，尝试直接跳转');
                    window.location.href = previewUrl;
                }
            } catch (error) {
                console.error('打开预览页面失败，尝试直接跳转:', error);
                try {
                    window.location.href = previewUrl;
                } catch (error2) {
                    console.error('直接跳转也失败:', error2);
                    alert('预览功能出现错误，请重试');
                }
            }
        } else {
            console.error('❌ URL不包含questionnaireId参数，跳转失败');
            console.error('previewUrl:', previewUrl);
            alert('跳转URL构建失败，请检查配置');
        }
        
    } catch (error) {
        console.error('准备预览功能出现错误:', error);
        alert('预览功能出现错误，请重试');
    }
}

/**
 * 测试问卷
 */
function testQuestionnaire(id) {
    console.log('=== 开始测试功能 ===');
    console.log('问卷ID:', id);
    
    if (!id) {
        console.error('测试失败：没有找到问卷ID');
        alert('无法测试：缺少问卷ID');
        return;
    }
    
    try {
        // 构建测试URL，使用与预览界面一致的逻辑
        const baseUrl = window.location.origin;
        const testUrl = `${baseUrl}/${CONFIG.ROUTES.QUESTIONNAIRE_TEST}?questionnaireId=${id}`;
        
        console.log('=== 构建测试URL ===');
        console.log('CONFIG.ROUTES.QUESTIONNAIRE_TEST:', CONFIG.ROUTES.QUESTIONNAIRE_TEST);
        console.log('问卷ID:', id);
        console.log('baseUrl:', baseUrl);
        console.log('测试页面完整URL:', testUrl);
        
        // 验证URL格式
        try {
            const testUrlObj = new URL(testUrl);
            console.log('URL验证成功:', testUrlObj.href);
            console.log('URL参数:', testUrlObj.searchParams.get('questionnaireId'));
        } catch (error) {
            console.error('URL验证失败:', error);
        }
        
        // 验证跳转URL是否包含参数
        if (testUrl.includes('questionnaireId=')) {
            console.log('✅ URL包含questionnaireId参数，准备跳转');
            
            // 使用新窗口打开测试页面，保持管理界面不关闭
            try {
                console.log('使用window.open打开测试页面');
                const testWindow = window.open(testUrl, '_blank');
                
                // 检查是否成功打开新窗口
                if (testWindow) {
                    console.log('测试页面打开成功');
                } else {
                    // 如果弹窗被阻止，尝试直接跳转
                    console.log('弹窗被阻止，尝试直接跳转');
                    window.location.href = testUrl;
                }
            } catch (error) {
                console.error('打开测试页面失败，尝试直接跳转:', error);
                try {
                    window.location.href = testUrl;
                } catch (error2) {
                    console.error('直接跳转也失败:', error2);
                    alert('测试功能出现错误，请重试');
                }
            }
        } else {
            console.error('❌ URL不包含questionnaireId参数，跳转失败');
            console.error('testUrl:', testUrl);
            alert('跳转URL构建失败，请检查配置');
        }
        
    } catch (error) {
        console.error('准备测试功能出现错误:', error);
        alert('测试功能出现错误，请重试');
    }
}

/**
 * 复制问卷
 */
function copyQuestionnaire(id) {
    if (confirm('确定要复制这个问卷吗？')) {
        // TODO: 实现复制问卷的逻辑
        UTILS.showToast('复制功能开发中...', 'info');
    }
}

/**
 * 切换问卷状态
 */
function toggleQuestionnaireStatus(id, enable) {
    const action = enable ? '启用' : '禁用';
    if (confirm(`确定要${action}这个问卷吗？`)) {
        // TODO: 实现状态切换的逻辑
        UTILS.showToast(`${action}功能开发中...`, 'info');
    }
}

/**
 * 删除问卷
 */
function deleteQuestionnaire(id) {
    if (confirm('确定要删除这个问卷吗？此操作不可恢复！')) {
        // TODO: 实现删除问卷的逻辑
        UTILS.showToast('删除功能开发中...', 'info');
    }
}

/**
 * 批量删除处理
 */
function handleBatchDelete() {
    if (selectedIds.length === 0) {
        UTILS.showToast('请先选择要删除的问卷', 'warning');
        return;
    }
    
    showDeleteModal();
}

/**
 * 批量启用处理
 */
function handleBatchEnable() {
    if (selectedIds.length === 0) {
        UTILS.showToast('请先选择要启用的问卷', 'warning');
        return;
    }
    
    if (confirm(`确定要启用选中的 ${selectedIds.length} 个问卷吗？`)) {
        // TODO: 实现批量启用的逻辑
        UTILS.showToast('批量启用功能开发中...', 'info');
    }
}

/**
 * 批量禁用处理
 */
function handleBatchDisable() {
    if (selectedIds.length === 0) {
        UTILS.showToast('请先选择要禁用的问卷', 'warning');
        return;
    }
    
    if (confirm(`确定要禁用选中的 ${selectedIds.length} 个问卷吗？`)) {
        // TODO: 实现批量禁用的逻辑
        UTILS.showToast('批量禁用功能开发中...', 'info');
    }
}

/**
 * 确认批量删除
 */
function confirmBatchDelete() {
    // TODO: 实现批量删除的逻辑
    UTILS.showToast('批量删除功能开发中...', 'info');
    hideDeleteModal();
}

/**
 * 显示删除确认模态框
 */
function showDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.style.display = 'block';
    }
}

/**
 * 隐藏删除确认模态框
 */
function hideDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.style.display = 'none';
    }
}

/**
 * 导入问卷处理
 */
function handleImportQuestionnaire() {
    // TODO: 实现导入问卷的逻辑
    UTILS.showToast('导入功能开发中...', 'info');
}

/**
 * 登出处理
 */
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
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
    
    // 显示加载提示
    const tableBody = document.getElementById('questionnaireTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>正在加载问卷数据...</p>
                    </div>
                </td>
            </tr>
        `;
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
 * 获取状态文本
 */
function getStatusText(status) {
    switch (status) {
        case 0:
        case false:
            return '禁用';
        case 1:
        case true:
            return '启用';
        case 2:
            return '草稿';
    }
}

/**
 * 获取状态样式类
 */
function getStatusClass(status) {
    switch (status) {
        case 0:
        case false:
            return 'status-draft';
        case 1:
        case true:
            return 'status-active';
        case 2:
            return 'status-paused';
        case 3:
            return 'status-expired';
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
 * 检查是否过期
 */
function isExpired(endDate) {
    if (!endDate) return false;
    
    try {
        const end = new Date(endDate);
        const now = new Date();
        return end < now;
    } catch (error) {
        return false;
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

// 导出函数到全局作用域，以便HTML中的onclick事件可以调用
window.loadQuestionnaireData = loadQuestionnaireData;
window.editQuestionnaire = editQuestionnaire;
window.previewQuestionnaire = previewQuestionnaire;
window.testQuestionnaire = testQuestionnaire;
window.copyQuestionnaire = copyQuestionnaire;
window.toggleQuestionnaireStatus = toggleQuestionnaireStatus;
window.deleteQuestionnaire = deleteQuestionnaire;

// 确保所有函数都在全局作用域中可用
window.handleSearch = handleSearch;
window.handleFilterChange = handleFilterChange;
window.clearFilters = clearFilters;
window.handleSelectAll = handleSelectAll;
window.handleCheckboxChange = handleCheckboxChange;
window.handleBatchDelete = handleBatchDelete;
window.handleBatchEnable = handleBatchEnable;
window.handleBatchDisable = handleBatchDisable;
window.confirmBatchDelete = confirmBatchDelete;
window.showDeleteModal = showDeleteModal;
window.hideDeleteModal = hideDeleteModal;
window.handleImportQuestionnaire = handleImportQuestionnaire;
window.handleLogout = handleLogout;
window.changePage = changePage;
