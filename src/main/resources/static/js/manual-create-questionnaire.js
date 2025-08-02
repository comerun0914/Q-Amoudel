// 问卷创建页面逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 页面保护 - 校验登录状态并初始化用户信息
    if (!UTILS.protectPage()) {
        return; // 如果未登录，停止执行后续代码
    }
    
    // 启动自动校验（每5秒检查一次）
    UTILS.startAutoAuthCheck();
    
    // 绑定表单提交事件
    bindFormEvents();
    
    // 设置默认日期
    setDefaultDates();
    
    // 加载已保存的问卷草稿
    loadQuestionnaireDraft();
    
    // 绑定自动保存事件
    bindAutoSave();
    
    // 页面离开前保存草稿
    window.addEventListener('beforeunload', function() {
        autoSaveDraft();
    });
});

/**
 * 绑定表单事件
 */
function bindFormEvents() {
    const createBtn = document.querySelector('.btn-create-questionnaire');
    if (createBtn) {
        createBtn.addEventListener('click', handleCreateQuestionnaire);
    }
    
    // 绑定日期验证
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', validateDates);
        endDateInput.addEventListener('change', validateDates);
    }
}

/**
 * 设置默认日期
 */
function setDefaultDates() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    if (startDateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        startDateInput.value = today.toISOString().split('T')[0];
        startDateInput.min = today.toISOString().split('T')[0];
    }
    
    if (endDateInput) {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        endDateInput.value = nextWeek.toISOString().split('T')[0];
        endDateInput.min = today.toISOString().split('T')[0];
    }
}

/**
 * 验证日期
 */
function validateDates() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        if (endDate <= startDate) {
            UTILS.showToast('结束日期必须晚于开始日期', 'error');
            endDateInput.value = '';
            return false;
        }
    }
    
    return true;
}

/**
 * 处理创建问卷
 */
function handleCreateQuestionnaire() {
    // 获取表单数据
    const formData = getFormData();
    
    // 验证表单数据
    if (!validateFormData(formData)) {
        return;
    }
    
    // 显示加载状态
    showLoadingState();
    
    // 向后端提交问卷数据
    submitQuestionnaireToBackend(formData);
}

/**
 * 获取表单数据
 */
function getFormData() {
    return {
        title: document.getElementById('questionnaire-title').value.trim(),
        description: document.getElementById('questionnaire-description').value.trim(),
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        submissionLimit: parseInt(document.getElementById('max-submissions').value) || 1,
        creatorId: UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO).id,
        createdTime: new Date().toISOString(),
        updatedTime: null
    };
}

/**
 * 验证表单数据
 */
function validateFormData(data) {
    if (!data.title) {
        UTILS.showToast('请输入问卷标题', 'error');
        document.getElementById('questionnaire-title').focus();
        return false;
    }
    
    if (data.title.length > 255) {
        UTILS.showToast('问卷标题不能超过255个字符', 'error');
        document.getElementById('questionnaire-title').focus();
        return false;
    }
    
    if (!data.startDate) {
        UTILS.showToast('请选择开始日期', 'error');
        document.getElementById('start-date').focus();
        return false;
    }
    
    if (!data.endDate) {
        UTILS.showToast('请选择结束日期', 'error');
        document.getElementById('end-date').focus();
        return false;
    }
    
    if (!validateDates()) {
        return false;
    }
    
    if (data.submissionLimit < 1 || data.submissionLimit > 999) {
        UTILS.showToast('每人填写次数限制必须在1-999之间', 'error');
        document.getElementById('max-submissions').focus();
        return false;
    }
    
    return true;
}

/**
 * 向后端提交问卷数据
 */
function submitQuestionnaireToBackend(formData) {
    // 获取用户信息
    const userInfo = UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
    if (!userInfo || !userInfo.id) {
        UTILS.showToast('用户信息无效，请重新登录', 'error');
        hideLoadingState();
        return;
    }
    
    // 构建提交数据
    const submitData = {
        id: null,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        submissionLimit: formData.submissionLimit,
        status: 1, // 默认启用状态
        creatorId: formData.creatorId,
        createdTime: formData.createdTime,
        updatedTime: formData.updatedTime
    };
    
    // 发送请求到后端
    fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_CREATE), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_TOKEN)}`
        },
        body: JSON.stringify(submitData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        hideLoadingState();
        
        if (data.code === 200) {
            // 创建成功
            UTILS.showToast('问卷创建成功！', 'success');
            
            // 保存问卷数据到本地存储（用于后续编辑）
            const questionnaireData = {
                ...formData,
                id: data.data.id, // 后端返回的问卷ID
                questionnaireId: data.data.id
            };
            UTILS.setStorage(CONFIG.STORAGE_KEYS.QUESTIONNAIRE_DRAFT, questionnaireData);
            
            // 延迟跳转，让用户看到成功提示
            setTimeout(() => {
                window.location.href = CONFIG.ROUTES.QUESTIONNAIRE_EDITOR;
            }, 1500);
        } else {
            // 创建失败
            UTILS.showToast(data.message || '问卷创建失败，请重试', 'error');
        }
    })
    .catch(error => {
        hideLoadingState();
        console.error('创建问卷失败:', error);
        UTILS.showToast('网络错误，请检查网络连接后重试', 'error');
    });
}

/**
 * 显示加载状态
 */
function showLoadingState() {
    const createBtn = document.querySelector('.btn-create-questionnaire');
    if (createBtn) {
        createBtn.disabled = true;
        createBtn.innerHTML = '<span class="loading-spinner"></span> 创建中...';
        createBtn.classList.add('loading');
    }
}

/**
 * 隐藏加载状态
 */
function hideLoadingState() {
    const createBtn = document.querySelector('.btn-create-questionnaire');
    if (createBtn) {
        createBtn.disabled = false;
        createBtn.innerHTML = '创建问卷';
        createBtn.classList.remove('loading');
    }
}

/**
 * 加载已保存的问卷草稿
 */
function loadQuestionnaireDraft() {
    const draft = UTILS.getStorage(CONFIG.STORAGE_KEYS.QUESTIONNAIRE_DRAFT);
    if (draft) {
        // 填充表单数据
        const titleInput = document.getElementById('questionnaire-title');
        const descriptionInput = document.getElementById('questionnaire-description');
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        const submissionLimitInput = document.getElementById('max-submissions');
        
        if (titleInput) titleInput.value = draft.title || '';
        if (descriptionInput) descriptionInput.value = draft.description || '';
        if (startDateInput) startDateInput.value = draft.startDate || '';
        if (endDateInput) endDateInput.value = draft.endDate || '';
        if (submissionLimitInput) submissionLimitInput.value = draft.submissionLimit || 1;
        
        // 显示草稿提示
        showDraftNotification();
    }
}

/**
 * 显示草稿提示
 */
function showDraftNotification() {
    const notification = document.createElement('div');
    notification.className = 'draft-notification';
    notification.innerHTML = `
        <div class="draft-content">
            <span>📝 检测到未完成的问卷草稿</span>
            <button class="btn-clear-draft" onclick="clearDraft()">清除草稿</button>
        </div>
    `;
    
    // 插入到表单前面
    const form = document.querySelector('.create-container');
    if (form) {
        form.insertBefore(notification, form.firstChild);
    }
}

/**
 * 清除草稿
 */
function clearDraft() {
    if (confirm('确定要清除问卷草稿吗？此操作不可恢复。')) {
        UTILS.removeStorage(CONFIG.STORAGE_KEYS.QUESTIONNAIRE_DRAFT);
        
        // 清空表单
        const titleInput = document.getElementById('questionnaire-title');
        const descriptionInput = document.getElementById('questionnaire-description');
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        const submissionLimitInput = document.getElementById('max-submissions');
        
        if (titleInput) titleInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';
        if (submissionLimitInput) submissionLimitInput.value = '1';
        
        // 重新设置默认日期
        setDefaultDates();
        
        // 移除草稿提示
        const notification = document.querySelector('.draft-notification');
        if (notification) {
            notification.remove();
        }
        
        UTILS.showToast('草稿已清除', 'info');
    }
}

/**
 * 自动保存草稿
 */
function autoSaveDraft() {
    const formData = getFormData();
    
    // 只有当有内容时才保存草稿
    if (formData.title || formData.description) {
        UTILS.setStorage(CONFIG.STORAGE_KEYS.QUESTIONNAIRE_DRAFT, {
            ...formData,
            lastSaved: new Date().toISOString()
        });
    }
}

/**
 * 绑定自动保存事件
 */
function bindAutoSave() {
    const inputs = [
        document.getElementById('questionnaire-title'),
        document.getElementById('questionnaire-description'),
        document.getElementById('start-date'),
        document.getElementById('end-date'),
        document.getElementById('max-submissions')
    ];
    
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', UTILS.debounce(autoSaveDraft, 1000)); // 1秒防抖
            input.addEventListener('change', autoSaveDraft);
        }
    });
}