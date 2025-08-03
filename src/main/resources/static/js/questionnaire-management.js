// 问卷管理界面JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 页面保护 - 校验登录状态并初始化用户信息
    if (!UTILS.protectPage()) {
        return; // 如果未登录，停止执行后续代码
    }
    
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
let questionnaireData = [];
let selectedIds = [];
let searchKeyword = '';
let statusFilter = '';
let dateFilter = '';

/**
 * 初始化页面
 */
function initPage() {
    // 初始化用户信息显示
    initUserInfo();
    
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
        const loginBtn = document.getElementById('loginBtn');
        
        if (userInfoElement && userNameElement) {
            userInfoElement.style.display = 'flex';
            userNameElement.textContent = userInfo.username || '用户';
        }
        
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
    }
}

/**
 * 绑定事件
 */
function bindEvents() {
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
    showLoading();
    
    // 构建请求参数
    const params = new URLSearchParams({
        page: currentPage,
        size: pageSize,
        keyword: searchKeyword,
        status: statusFilter,
        dateFilter: dateFilter
    });
    
    // 获取用户信息
    const userInfo = UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
    if (!userInfo || !userInfo.id) {
        UTILS.showToast('用户信息无效，请重新登录', 'error');
        hideLoading();
        return;
    }
    
    // 发送请求到后端
    fetch(`${UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_LIST)}?${params}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_TOKEN)}`
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
        
        if (data.code === 200) {
            questionnaireData = data.data.list || [];
            totalCount = data.data.total || 0;
            totalPages = Math.ceil(totalCount / pageSize);
            
            // 更新表格
            renderQuestionnaireTable();
            
            // 更新统计信息
            updateStatistics();
            
            // 更新分页
            updatePagination();
            
            // 更新批量操作按钮状态
            updateBatchActionButtons();
        } else {
            UTILS.showToast(data.message || '加载问卷数据失败', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('加载问卷数据失败:', error);
        UTILS.showToast('网络错误，请检查网络连接后重试', 'error');
        
        // 显示空状态
        showEmptyState();
    });
}

/**
 * 渲染问卷表格
 */
function renderQuestionnaireTable() {
    const tableBody = document.getElementById('questionnaireTableBody');
    if (!tableBody) return;
    
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
                        <i class="iconfont icon-edit"></i>
                        编辑
                    </button>
                    <button class="btn-action btn-preview" onclick="previewQuestionnaire(${questionnaire.id})" title="预览问卷">
                        <i class="iconfont icon-eye"></i>
                        预览
                    </button>
                    <button class="btn-action btn-test" onclick="testQuestionnaire(${questionnaire.id})" title="测试问卷">
                        <i class="iconfont icon-test"></i>
                        测试
                    </button>
                    <button class="btn-action btn-copy" onclick="copyQuestionnaire(${questionnaire.id})" title="复制问卷">
                        <i class="iconfont icon-copy"></i>
                        复制
                    </button>
                    ${questionnaire.status ? 
                        `<button class="btn-action btn-disable" onclick="toggleQuestionnaireStatus(${questionnaire.id}, false)" title="禁用问卷">
                            <i class="iconfont icon-disable"></i>
                            禁用
                        </button>` :
                        `<button class="btn-action btn-enable" onclick="toggleQuestionnaireStatus(${questionnaire.id}, true)" title="启用问卷">
                            <i class="iconfont icon-enable"></i>
                            启用
                        </button>`
                    }
                    <button class="btn-action btn-delete" onclick="deleteQuestionnaire(${questionnaire.id})" title="删除问卷">
                        <i class="iconfont icon-delete"></i>
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
                    <i class="iconfont icon-empty"></i>
                    <h3>暂无问卷数据</h3>
                    <p>您还没有创建任何问卷，点击"创建问卷"开始您的第一个问卷吧！</p>
                    <button class="btn-create" onclick="window.location.href='manual-create-questionnaire.html'">
                        <i class="iconfont icon-plus"></i>
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
    // 这里可以根据实际数据计算统计信息
    // 暂时使用模拟数据
    const totalElement = document.getElementById('totalQuestionnaires');
    const activeElement = document.getElementById('activeQuestionnaires');
    const draftElement = document.getElementById('draftQuestionnaires');
    const expiredElement = document.getElementById('expiredQuestionnaires');
    
    if (totalElement) totalElement.textContent = totalCount;
    if (activeElement) activeElement.textContent = questionnaireData.filter(q => q.status).length;
    if (draftElement) draftElement.textContent = questionnaireData.filter(q => !q.status).length;
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
    
    if (startIndexElement) {
        startIndexElement.textContent = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    }
    
    if (endIndexElement) {
        endIndexElement.textContent = Math.min(currentPage * pageSize, totalCount);
    }
    
    if (totalCountElement) {
        totalCountElement.textContent = totalCount;
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
        batchToggleStatus(true);
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
        batchToggleStatus(false);
    }
}

/**
 * 显示删除确认模态框
 */
function showDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * 隐藏删除确认模态框
 */
function hideDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * 确认批量删除
 */
function confirmBatchDelete() {
    if (selectedIds.length === 0) {
        UTILS.showToast('没有选中的问卷', 'warning');
        return;
    }
    
    // 发送批量删除请求
    fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_BATCH_DELETE), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ids: selectedIds
        })
    })
    .then(response => response.json())
    .then(data => {
        hideDeleteModal();
        
        if (data.code === 200) {
            UTILS.showToast(`成功删除 ${selectedIds.length} 个问卷`, 'success');
            selectedIds = [];
            loadQuestionnaireData();
        } else {
            UTILS.showToast(data.message || '删除失败', 'error');
        }
    })
    .catch(error => {
        hideDeleteModal();
        console.error('批量删除失败:', error);
        UTILS.showToast('网络错误，请重试', 'error');
    });
}

/**
 * 批量切换状态
 */
function batchToggleStatus(status) {
    fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_BATCH_TOGGLE_STATUS), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ids: selectedIds,
            status: status
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            const action = status ? '启用' : '禁用';
            UTILS.showToast(`成功${action} ${selectedIds.length} 个问卷`, 'success');
            selectedIds = [];
            loadQuestionnaireData();
        } else {
            UTILS.showToast(data.message || '操作失败', 'error');
        }
    })
    .catch(error => {
        console.error('批量操作失败:', error);
        UTILS.showToast('网络错误，请重试', 'error');
    });
}

/**
 * 导入问卷处理
 */
function handleImportQuestionnaire() {
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.txt';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const questionnaireData = JSON.parse(e.target.result);
                    importQuestionnaire(questionnaireData);
                } catch (error) {
                    UTILS.showToast('文件格式错误，请选择正确的问卷文件', 'error');
                }
            };
            reader.readAsText(file);
        }
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

/**
 * 导入问卷
 */
function importQuestionnaire(data) {
    // 发送导入请求
    fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_IMPORT), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200) {
            UTILS.showToast('问卷导入成功', 'success');
            loadQuestionnaireData();
        } else {
            UTILS.showToast(result.message || '导入失败', 'error');
        }
    })
    .catch(error => {
        console.error('导入失败:', error);
        UTILS.showToast('网络错误，请重试', 'error');
    });
}

/**
 * 退出登录处理
 */
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        UTILS.logout();
        window.location.href = 'login.html';
    }
}

/**
 * 显示加载状态
 */
function showLoading() {
    // 可以添加加载动画
    const tableBody = document.getElementById('questionnaireTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem;">
                    <div class="loading"></div>
                    <p style="margin-top: 1rem; color: #7f8c8d;">加载中...</p>
                </td>
            </tr>
        `;
    }
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    // 加载状态会在数据加载完成后自动清除
}

// ==================== 单个问卷操作函数 ====================

/**
 * 编辑问卷
 */
function editQuestionnaire(id) {
    // 保存当前问卷ID到本地存储
    UTILS.setStorage(CONFIG.STORAGE_KEYS.CURRENT_QUESTIONNAIRE_ID, id);
    window.location.href = 'questionnaire-editor.html';
}

/**
 * 预览问卷
 */
function previewQuestionnaire(id) {
    // 保存当前问卷ID到本地存储
    UTILS.setStorage(CONFIG.STORAGE_KEYS.CURRENT_QUESTIONNAIRE_ID, id);
    window.location.href = 'questionnaire-preview.html';
}

/**
 * 测试问卷
 */
function testQuestionnaire(id) {
    // 保存当前问卷ID到本地存储
    UTILS.setStorage(CONFIG.STORAGE_KEYS.CURRENT_QUESTIONNAIRE_ID, id);
    // 跳转到问卷测试页面
    window.location.href = CONFIG.ROUTES.QUESTIONNAIRE_TEST;
}

/**
 * 复制问卷
 */
function copyQuestionnaire(id) {
    if (confirm('确定要复制这个问卷吗？')) {
        fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_COPY), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                UTILS.showToast('问卷复制成功', 'success');
                loadQuestionnaireData();
            } else {
                UTILS.showToast(data.message || '复制失败', 'error');
            }
        })
        .catch(error => {
            console.error('复制失败:', error);
            UTILS.showToast('网络错误，请重试', 'error');
        });
    }
}

/**
 * 切换问卷状态
 */
function toggleQuestionnaireStatus(id, status) {
    const action = status ? '启用' : '禁用';
    if (confirm(`确定要${action}这个问卷吗？`)) {
        fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_TOGGLE_STATUS), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                id: id, 
                status: status 
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                UTILS.showToast(`问卷${action}成功`, 'success');
                loadQuestionnaireData();
            } else {
                UTILS.showToast(data.message || `${action}失败`, 'error');
            }
        })
        .catch(error => {
            console.error(`${action}失败:`, error);
            UTILS.showToast('网络错误，请重试', 'error');
        });
    }
}

/**
 * 删除问卷
 */
function deleteQuestionnaire(id) {
    if (confirm('确定要删除这个问卷吗？此操作不可恢复。')) {
        fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_DELETE), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                UTILS.showToast('问卷删除成功', 'success');
                loadQuestionnaireData();
            } else {
                UTILS.showToast(data.message || '删除失败', 'error');
            }
        })
        .catch(error => {
            console.error('删除失败:', error);
            UTILS.showToast('网络错误，请重试', 'error');
        });
    }
}

// ==================== 工具函数 ====================

/**
 * 获取状态样式类
 */
function getStatusClass(status) {
    if (status === true || status === 1) {
        return 'status-active';
    } else if (status === false || status === 0) {
        return 'status-inactive';
    } else {
        return 'status-draft';
    }
}

/**
 * 获取状态文本
 */
function getStatusText(status) {
    if (status === true || status === 1) {
        return '已启用';
    } else if (status === false || status === 0) {
        return '已禁用';
    } else {
        return '草稿';
    }
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
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

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 导出函数供全局使用
window.editQuestionnaire = editQuestionnaire;
window.previewQuestionnaire = previewQuestionnaire;
window.copyQuestionnaire = copyQuestionnaire;
window.toggleQuestionnaireStatus = toggleQuestionnaireStatus;
window.deleteQuestionnaire = deleteQuestionnaire; 