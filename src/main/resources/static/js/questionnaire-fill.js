/**
 * 问卷填写页面功能
 */

// 问卷数据
let questionnaireData = {
    id: null,
    title: '',
    description: '',
    questions: [],
    startTime: null,
    estimatedTime: '15分钟'
};

// 用户答案
let userAnswers = {};

// 当前问题索引
let currentQuestionIndex = 0;

// 计时器
let timer = null;
let startTime = null;

// 用户与会话
const userInfo = (window.UTILS && UTILS.getUserInfo && UTILS.getUserInfo()) || null;
const sessionId = getOrCreateSessionId();
const saveDraftDebounced = (window.UTILS && UTILS.debounce) ? UTILS.debounce(saveDraftToServer, 800) : saveDraftToServer;

// DOM元素
const btnBack = document.getElementById('btnBack');
const btnSave = document.getElementById('btnSave');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnSubmit = document.getElementById('btnSubmit');
const btnReview = document.getElementById('btnReview');
const btnCancel = document.getElementById('btnCancel');
const btnConfirm = document.getElementById('btnConfirm');

const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const timerText = document.getElementById('timerText');
const saveToast = document.getElementById('saveToast');
const confirmModal = document.getElementById('confirmModal');

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 保存页面链接，用于登录后跳转
    const currentUrl = window.location.href;
    console.log('用户未登录，保存当前访问URL:', currentUrl);
    UTILS.setStorage(CONFIG.STORAGE_KEYS.ORIGINAL_URL, currentUrl);
    UTILS.startAutoAuthCheck();
    initQuestionnaire();
    setupEventListeners();
    startTimer();
});

/**
 * 初始化问卷
 */
async function initQuestionnaire() {
    try {
        // 从URL参数获取问卷信息
        const urlParams = new URLSearchParams(window.location.search);
        const questionnaireId = urlParams.get('id');
        const link = urlParams.get('link');
        const code = urlParams.get('code');
        
        // 加载问卷数据
        await loadQuestionnaireData(questionnaireId, link, code);
        
        // 加载保存的答案（优先从服务端草稿，其次本地）
        await loadSavedAnswers();
        
        // 渲染问卷
        renderQuestionnaire();
        
        // 显示第一个问题
        showQuestion(0);
        
        // 更新进度
        updateProgress();

        // 显示内容，隐藏加载
        const loading = document.getElementById('loadingContainer');
        const qc = document.getElementById('questionsContainer');
        const nav = document.getElementById('navigationButtons');
        if (loading) loading.style.display = 'none';
        if (qc) qc.style.display = 'block';
        if (nav) nav.style.display = 'flex';
    } catch (error) {
        console.error('初始化问卷失败:', error);
        showErrorMessage('初始化问卷失败，请刷新页面重试');
    }
}

/**
 * 加载问卷数据
 */
async function loadQuestionnaireData(id, link, code) {
    try {
        if (id) {
            // 调用后端 API 获取问卷信息
            const questionnaireInfo = await fetchQuestionnaireInfo(id);
            const questions = await fetchQuestionnaireQuestions(id);
            
            if (questionnaireInfo && questions) {
                questionnaireData = {
                    id: questionnaireInfo.id,
                    title: questionnaireInfo.title,
                    description: questionnaireInfo.description,
                    questions: questions,
                    startTime: new Date().toLocaleString('zh-CN'),
                    estimatedTime: '15分钟',
                    submissionLimit: questionnaireInfo.submissionLimit || 1 // 添加提交次数限制
                };
                
                // 检查用户剩余提交次数
                if (userInfo && userInfo.id) {
                    await checkUserSubmissionLimit(id, userInfo.id);
                }
            } else {
                throw new Error('获取问卷数据失败');
            }
        } else if (link) {
            // 通过链接获取问卷（暂时使用模拟数据）
            questionnaireData = getQuestionnaireByLink(link);
        } else if (code) {
            // 通过代码获取问卷（暂时使用模拟数据）
            questionnaireData = getQuestionnaireByCode(code);
        } else {
            // 使用示例数据（开发测试用）
            questionnaireData = {
                id: 'demo-001',
                title: '幼儿学习能力评估问卷',
                description: '本问卷旨在了解幼儿的学习能力、认知发展水平和学习兴趣，为制定个性化教育方案提供依据。',
                questions: [
                    {
                        id: 1,
                        type: 'single',
                        text: '您的孩子年龄是？',
                        options: ['2-3岁', '3-4岁', '4-5岁', '5-6岁'],
                        required: true
                    },
                    {
                        id: 2,
                        type: 'multiple',
                        text: '您的孩子喜欢哪些活动？（可多选）',
                        options: ['绘画', '音乐', '运动', '阅读', '拼图', '积木'],
                        required: false
                    },
                    {
                        id: 3,
                        type: 'text',
                        text: '请描述您孩子最喜欢的学习方式：',
                        required: false
                    },
                    {
                        id: 4,
                        type: 'rating',
                        text: '您对孩子当前的学习能力满意度如何？',
                        maxRating: 5,
                        required: true
                    },
                    {
                        id: 5,
                        type: 'matrix',
                        text: '请评价您孩子在不同方面的表现：',
                        rows: ['语言能力', '数学能力', '社交能力', '创造力'],
                        columns: ['优秀', '良好', '一般', '需要改进'],
                        required: true
                    }
                ],
                startTime: new Date().toLocaleString('zh-CN'),
                estimatedTime: '15分钟',
                submissionLimit: 1
            };
        }
        
        // 设置问卷信息
        document.getElementById('questionnaireTitle').textContent = questionnaireData.title;
        document.getElementById('questionnaireDescription').textContent = questionnaireData.description;
        document.getElementById('startTime').textContent = questionnaireData.startTime;
        document.getElementById('estimatedTime').textContent = questionnaireData.estimatedTime;
        
        // 显示剩余提交次数信息
        if (userInfo && userInfo.id && questionnaireData.submissionLimit) {
            displaySubmissionLimitInfo();
        }
        
    } catch (error) {
        console.error('加载问卷数据失败:', error);
        // 显示错误信息
        showErrorMessage('加载问卷数据失败，请检查网络连接或联系管理员');
    }
}

/**
 * 显示剩余提交次数信息
 */
async function displaySubmissionLimitInfo() {
    try {
        const response = await fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.SUBMISSION_CHECK}?questionnaireId=${questionnaireData.id}&userId=${userInfo.id}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            const { remainingTimes, submissionLimit } = result.data;
            
            // 在问卷标题下方显示剩余次数信息
            const titleElement = document.getElementById('questionnaireTitle');
            if (titleElement) {
                const limitInfoElement = document.createElement('div');
                limitInfoElement.className = 'submission-limit-info';
                limitInfoElement.innerHTML = `
                    <div class="limit-info-content">
                        <span class="limit-label">填写次数限制：</span>
                        <span class="limit-value ${remainingTimes <= 0 ? 'limit-reached' : remainingTimes <= 2 ? 'limit-warning' : 'limit-ok'}">
                            ${remainingTimes <= 0 ? '已达到限制' : `剩余 ${remainingTimes} 次`}
                        </span>
                        <span class="limit-total">（总共 ${submissionLimit} 次）</span>
                    </div>
                `;
                
                // 在标题后插入
                titleElement.parentNode.insertBefore(limitInfoElement, titleElement.nextSibling);
            }
        }
    } catch (error) {
        console.error('获取提交次数信息失败:', error);
    }
}

/**
 * 从后端获取问卷基本信息
 */
async function fetchQuestionnaireInfo(questionnaireId) {
    try {
        const response = await fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_GETINFOBYID}?id=${questionnaireId}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            return result.data;
        } else {
            throw new Error(result.message || '获取问卷信息失败');
        }
    } catch (error) {
        console.error('获取问卷信息失败:', error);
        throw error;
    }
}

/**
 * 从后端获取问卷问题列表
 */
async function fetchQuestionnaireQuestions(questionnaireId) {
    try {
        const response = await fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_QUESTIONS}?questionnaireId=${questionnaireId}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            // 将后端数据转换为前端需要的格式
            return result.data.map(question => convertBackendQuestionToFrontend(question));
        } else {
            throw new Error(result.message || '获取问题列表失败');
        }
    } catch (error) {
        console.error('获取问题列表失败:', error);
        throw error;
    }
}

/**
 * 将后端问题数据转换为前端格式
 */
function convertBackendQuestionToFrontend(backendQuestion) {
    const frontendQuestion = {
        id: backendQuestion.id,
        type: getQuestionTypeFromBackend(backendQuestion.questionType),
        text: backendQuestion.content,
        required: backendQuestion.isRequired === 1
    };
    
    // 根据问题类型添加特定配置
    switch (backendQuestion.questionType) {
        case 1: // 单选题
        case 2: // 多选题
            if (backendQuestion.options && backendQuestion.options.length > 0) {
                frontendQuestion.options = backendQuestion.options.map(option => option.optionContent);
            } else {
                frontendQuestion.options = [];
            }
            break;
            
        case 3: // 问答题
            if (backendQuestion.textQuestionConfig) {
                frontendQuestion.maxLength = backendQuestion.textQuestionConfig.maxLength || 500;
                frontendQuestion.hintText = backendQuestion.textQuestionConfig.hintText || '';
            }
            break;
            
        case 4: // 评分题
            if (backendQuestion.ratingQuestionConfig) {
                frontendQuestion.maxRating = backendQuestion.ratingQuestionConfig.maxScore || 5;
                frontendQuestion.minRating = backendQuestion.ratingQuestionConfig.minScore || 1;
                frontendQuestion.minLabel = backendQuestion.ratingQuestionConfig.minLabel || '非常不满意';
                frontendQuestion.maxLabel = backendQuestion.ratingQuestionConfig.maxLabel || '非常满意';
            }
            break;
            
        case 5: // 矩阵题
            if (backendQuestion.matrixQuestionConfig) {
                frontendQuestion.rows = backendQuestion.matrixQuestionConfig.rows?.map(row => row.rowContent) || [];
                frontendQuestion.columns = backendQuestion.matrixQuestionConfig.columns?.map(col => col.columnContent) || [];
            }
            break;
    }
    
    return frontendQuestion;
}

/**
 * 根据后端问题类型ID获取前端类型字符串
 */
function getQuestionTypeFromBackend(questionTypeId) {
    const typeMap = {
        1: 'single',      // 单选题
        2: 'multiple',    // 多选题
        3: 'text',        // 问答题
        4: 'rating',      // 评分题
        5: 'matrix',      // 矩阵题
        6: 'date',        // 日期题
        7: 'time'         // 时间题
    };
    return typeMap[questionTypeId] || 'unknown';
}

/**
 * 显示错误信息
 */
function showErrorMessage(message) {
    // 创建错误提示元素
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    // 插入到页面顶部
    const container = document.querySelector('.questionnaire-container');
    if (container) {
        container.insertBefore(errorDiv, container.firstChild);
    }
    
    // 3秒后自动移除
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 3000);
}

/**
 * 渲染问卷
 */
function renderQuestionnaire() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    questionnaireData.questions.forEach((question, index) => {
        const questionElement = createQuestionElement(question, index + 1);
        container.appendChild(questionElement);
    });
}

/**
 * 创建问题元素
 */
function createQuestionElement(question, questionNumber) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.id = `question-${question.id}`;
    
    const questionTypeText = getQuestionTypeText(question.type);
    
    questionDiv.innerHTML = `
        <div class="question-header">
            <div class="question-number">${questionNumber}</div>
            <div class="question-content">
                <div class="question-text">${question.text}</div>
                <div class="question-type">${questionTypeText}</div>
                ${question.required ? '<div class="question-required">* 必答题</div>' : ''}
            </div>
        </div>
        <div class="question-input">
            ${createInputElement(question)}
        </div>
    `;
    
    return questionDiv;
}

/**
 * 获取问题类型文本
 */
function getQuestionTypeText(type) {
    const typeMap = {
        'single': '单选题',
        'multiple': '多选题',
        'text': '文本题',
        'rating': '评分题',
        'matrix': '矩阵题',
        'date': '日期题',
        'time': '时间题'
    };
    return typeMap[type] || type;
}

/**
 * 创建输入元素
 */
function createInputElement(question) {
    switch (question.type) {
        case 'single':
            return createRadioOptions(question);
        case 'multiple':
            return createCheckboxOptions(question);
        case 'text':
            return createTextInput(question);
        case 'rating':
            return createRatingInput(question);
        case 'matrix':
            return createMatrixInput(question);
        case 'date':
            return createDateInput(question);
        case 'time':
            return createTimeInput(question);
        default:
            return '<p>不支持的问题类型</p>';
    }
}

/**
 * 创建单选选项
 */
function createRadioOptions(question) {
    const optionsHtml = question.options.map((option, index) => `
        <div class="option-item" onclick="selectRadioOption(${question.id}, ${index})">
            <input type="radio" name="question-${question.id}" value="${index}" id="option-${question.id}-${index}">
            <label class="option-text" for="option-${question.id}-${index}">${option}</label>
        </div>
    `).join('');
    
    return `<div class="options-container">${optionsHtml}</div>`;
}

/**
 * 创建多选选项
 */
function createCheckboxOptions(question) {
    const optionsHtml = question.options.map((option, index) => `
        <div class="option-item" onclick="toggleCheckboxOption(${question.id}, ${index})">
            <input type="checkbox" name="question-${question.id}" value="${index}" id="option-${question.id}-${index}">
            <label class="option-text" for="option-${question.id}-${index}">${option}</label>
        </div>
    `).join('');
    
    return `<div class="options-container">${optionsHtml}</div>`;
}

// 读取DOM中多选题已勾选的索引数组
function getCheckedMultipleIndices(questionId) {
    const nodes = document.querySelectorAll(`input[type="checkbox"][name="question-${questionId}"]:checked`);
    const result = [];
    nodes.forEach(n => {
        const v = Number(n.value);
        if (!Number.isNaN(v)) result.push(v);
    });
    return result;
}

// 将DOM勾选状态与内存数组同步，保证一致性
function syncMultipleFromDom(questionId, stateArr) {
    const inputs = document.querySelectorAll(`input[type="checkbox"][name="question-${questionId}"]`);
    const set = new Set((stateArr || []).map(Number));
    inputs.forEach(inp => {
        const v = Number(inp.value);
        inp.checked = set.has(v);
    });
}

/**
 * 创建文本输入
 */
function createTextInput(question) {
    const isShort = question.text.length < 50;
    const maxLength = question.maxLength || 500;
    const hintText = question.hintText || '';
    
    let placeholder = hintText || '请输入您的答案...';
    if (maxLength && maxLength !== 500) {
        placeholder += `（最多${maxLength}字）`;
    }
    
    return `<textarea class="text-input ${isShort ? 'short' : ''}" 
                      placeholder="${placeholder}" 
                      maxlength="${maxLength}"
                      onchange="saveTextAnswer(${question.id}, this.value)"></textarea>`;
}

/**
 * 创建评分输入
 */
function createRatingInput(question) {
    const maxRating = question.maxRating || 5;
    const minRating = question.minRating || 1;
    const minLabel = question.minLabel || '非常不满意';
    const maxLabel = question.maxLabel || '非常满意';
    
    const starsHtml = Array.from({length: maxRating}, (_, i) => `
        <span class="rating-star" onclick="setRating(${question.id}, ${i + 1})">★</span>
    `).join('');
    
    return `<div class="rating-container">
        <div class="rating-labels">
            <span class="rating-label min">${minLabel}</span>
            <span class="rating-label max">${maxLabel}</span>
        </div>
        <div class="rating-stars">${starsHtml}</div>
    </div>`;
}

/**
 * 创建矩阵输入
 */
function createMatrixInput(question) {
    const rows = question.rows || [];
    const columns = question.columns || [];
    
    let tableHtml = '<div class="matrix-container"><table class="matrix-table"><thead><tr><th></th>';
    columns.forEach(col => {
        tableHtml += `<th>${col}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    
    rows.forEach((row, rowIndex) => {
        tableHtml += `<tr><td>${row}</td>`;
        columns.forEach((col, colIndex) => {
            tableHtml += `<td><input type="radio" name="matrix-${question.id}-${rowIndex}" value="${colIndex}" onclick="saveMatrixAnswer(${question.id}, ${rowIndex}, ${colIndex})"></td>`;
        });
        tableHtml += '</tr>';
    });
    
    tableHtml += '</tbody></table></div>';
    return tableHtml;
}

/**
 * 创建日期输入
 */
function createDateInput(question) {
    return `<input type="date" class="text-input short" onchange="saveDateAnswer(${question.id}, this.value)">`;
}

/**
 * 创建时间输入
 */
function createTimeInput(question) {
    return `<input type="time" class="text-input short" onchange="saveTimeAnswer(${question.id}, this.value)">`;
}

/**
 * 显示指定问题
 */
function showQuestion(index) {
    // 隐藏所有问题
    document.querySelectorAll('.question-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 显示当前问题
    const currentQuestion = document.getElementById(`question-${questionnaireData.questions[index].id}`);
    if (currentQuestion) {
        currentQuestion.classList.add('active');
    }
    
    // 更新导航按钮状态
    updateNavigationButtons();
    
    // 更新进度
    updateProgress();
}

/**
 * 更新导航按钮状态
 */
function updateNavigationButtons() {
    btnPrev.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === questionnaireData.questions.length - 1) {
        btnNext.textContent = '完成';
        btnNext.innerHTML = '完成 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
    } else {
        btnNext.textContent = '下一题';
        btnNext.innerHTML = '下一题 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
    }
}

/**
 * 更新进度
 */
function updateProgress() {
    const totalQuestions = questionnaireData.questions.length;
    const answeredQuestions = Object.keys(userAnswers).length;
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    
    progressText.textContent = `${answeredQuestions}/${totalQuestions}`;
    progressFill.style.width = `${progress}%`;
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    btnBack.addEventListener('click', handleBack);
    btnSave.addEventListener('click', handleSave);
    btnPrev.addEventListener('click', handlePrev);
    btnNext.addEventListener('click', handleNext);
    btnSubmit.addEventListener('click', handleSubmit);
    btnReview.addEventListener('click', handleReview);
    btnCancel.addEventListener('click', closeModal);
    btnConfirm.addEventListener('click', handleConfirm);
    
    // 页面离开前提醒保存
    window.addEventListener('beforeunload', handleBeforeUnload);
}

/**
 * 处理返回
 */
function handleBack() {
    if (hasUnsavedChanges()) {
        showConfirmModal('确认离开', '您有未保存的答案，确定要离开吗？', () => {
            window.__allowLeave__ = true;
            window.location.href = CONFIG.ROUTES.ASK_USER;
        });
    } else {
        window.__allowLeave__ = true;
        window.location.href = CONFIG.ROUTES.ASK_USER;
    }
}

/**
 * 处理保存
 */
async function handleSave() {
    saveAnswers();
    await saveDraftToServer();
    showToast('草稿已保存');
}

/**
 * 处理上一题
 */
function handlePrev() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
}

/**
 * 处理下一题
 */
function handleNext() {
    if (currentQuestionIndex < questionnaireData.questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    } else {
        // 最后一题，显示提交区域
        showSubmitSection();
    }
}

/**
 * 处理提交
 */
function handleSubmit() {
    if (validateAnswers()) {
        showConfirmModal('确认提交', '确定要提交问卷吗？提交后将无法修改。', () => {
            submitQuestionnaire();
        });
    } else {
        showToast('请完成所有必答题', 'error');
    }
}

/**
 * 处理重新检查
 */
function handleReview() {
    hideSubmitSection();
    currentQuestionIndex = 0;
    showQuestion(0);
}

/**
 * 处理确认
 */
function handleConfirm() {
    const callback = confirmModal.dataset.callback;
    
    if (callback && typeof window[callback] === 'function') {
        // 临时允许离开，避免 beforeunload 阻拦
        window.__allowLeave__ = true;
        window[callback]();
        setTimeout(() => { window.__allowLeave__ = false; }, 1000);
    }
    
    closeModal();
}

/**
 * 显示提交区域
 */
function showSubmitSection() {
    document.getElementById('submitSection').style.display = 'block';
    const nav = document.getElementById('navigationButtons');
    if (nav) nav.style.display = 'none';
    renderAnswerSummary();
}

/**
 * 隐藏提交区域
 */
function hideSubmitSection() {
    document.getElementById('submitSection').style.display = 'none';
}

/**
 * 渲染答案摘要
 */
function renderAnswerSummary() {
    const summaryContainer = document.getElementById('answerSummary');
    let summaryHtml = '';
    
    questionnaireData.questions.forEach(question => {
        const answer = userAnswers[question.id];
        if (answer !== undefined && answer !== null && answer !== '') {
            summaryHtml += `
                <div class="summary-item">
                    <div class="summary-question">${question.text}</div>
                    <div class="summary-answer">${formatAnswer(answer, question)}</div>
                </div>
            `;
        }
    });
    
    summaryContainer.innerHTML = summaryHtml || '<p>暂无答案</p>';
}

/**
 * 格式化答案显示
 */
function formatAnswer(answer, question) {
    if (Array.isArray(answer)) {
        return answer.map(index => question.options[index]).join(', ');
    } else if (typeof answer === 'number') {
        if (question.type === 'rating') {
            return '★'.repeat(answer);
        } else if (question.type === 'matrix') {
            return question.columns[answer];
        }
    }
    return answer;
}

/**
 * 验证答案
 */
function validateAnswers() {
    const requiredQuestions = questionnaireData.questions.filter(q => q.required);
    
    for (const question of requiredQuestions) {
        const answer = userAnswers[question.id];
        if (answer === undefined || answer === null || answer === '' || 
            (Array.isArray(answer) && answer.length === 0)) {
            return false;
        }
    }
    
    return true;
}

/**
 * 提交问卷
 */
async function submitQuestionnaire() {
    const payload = {
        questionnaireId: Number(questionnaireData.id),
        userId: userInfo && userInfo.id ? Number(userInfo.id) : null,
        // 符合后端期望的时间字段
        startTime: getStartTimeIso(),
        durationSeconds: getDuration(),
        // 符合后端期望的答案列表结构
        answers: buildBackendAnswers(),
        sessionId: sessionId
    };

    try {
        const urls = [ `${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.SUBMISSION_SUBMIT}` ];
        let data = null;
        for (let i = 0; i < urls.length; i++) {
            try {
                const res = await fetch(urls[i], {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                data = await res.json();
                if (data && data.code === 200) break;
            } catch (e) {
                console.warn('提交尝试失败: ', urls[i], e);
            }
        }
        if (data && data.code === 200) {
            // 提交成功后清除本地草稿
            localStorage.removeItem(`questionnaire-${questionnaireData.id}-answers`);
            
            // 关闭确认弹窗
            closeModal();
            
            // 显示成功反馈
            showToast('问卷提交成功！正在跳转...', 'success');
            
            // 延迟跳转，让用户看到成功提示
            setTimeout(() => {
                // 临时允许离开，避免 beforeunload 阻拦
                window.__allowLeave__ = true;
                // 返回用户界面
                window.location.href = CONFIG.ROUTES.ASK_USER;
            }, 2000);
        } else {
            // 关闭确认弹窗
            closeModal();
            showToast((data && data.message) || '提交失败，请稍后再试', 'error');
        }
    } catch (e) {
        console.error('提交失败:', e);
        // 关闭确认弹窗
        closeModal();
        showToast('提交失败，请检查网络后重试', 'error');
    }
}

/**
 * 保存答案
 */
function saveAnswers() {
    localStorage.setItem(`questionnaire-${questionnaireData.id}-answers`, JSON.stringify(userAnswers));
}

/**
 * 加载保存的答案
 */
async function loadSavedAnswers() {
    // 优先从服务端草稿加载
    try {
        if (questionnaireData.id) {
            const params = new URLSearchParams();
            params.set('questionnaireId', questionnaireData.id);
            if (userInfo && userInfo.id) params.set('userId', userInfo.id);
            if (sessionId) params.set('sessionId', sessionId);
            const url = `${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.SUBMISSION_GET_DRAFT}?${params.toString()}`;
            const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
            const data = await res.json();
            if (data && data.code === 200 && data.data) {
                if (data.data.answers) {
                    userAnswers = data.data.answers;
                    return;
                }
                if (data.data.answersList && Array.isArray(data.data.answersList)) {
                    userAnswers = convertAnswerListToMap(data.data.answersList);
                    return;
                }
                if (data.data.answersMap) {
                    userAnswers = data.data.answersMap;
                    return;
                }
            }
        }
    } catch (e) {
        console.warn('从服务端加载草稿失败，使用本地草稿:', e);
    }

    // 本地草稿回退
    const saved = localStorage.getItem(`questionnaire-${questionnaireData.id}-answers`);
    if (saved) {
        try {
            userAnswers = JSON.parse(saved);
        } catch (error) {
            console.error('加载保存的答案失败:', error);
            userAnswers = {};
        }
    }
}

// 将本地答案保存到服务端草稿
async function saveDraftToServer() {
    try {
        if (!questionnaireData.id) return;
        const payload = {
            questionnaireId: Number(questionnaireData.id),
            userId: userInfo && userInfo.id ? Number(userInfo.id) : null,
            answers: userAnswers,
            answersList: buildAnswerList(),
            saveTime: new Date().toISOString(),
            progress: getProgressPercent(),
            sessionId: sessionId
        };
        await fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.SUBMISSION_SAVE_DRAFT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.warn('保存草稿到服务端失败:', e);
    }
}

// 构建提交的答案列表，便于后端解析
function buildAnswerList() {
    const list = [];
    (questionnaireData.questions || []).forEach(q => {
        const ans = userAnswers[q.id];
        if (ans === undefined) return;
        list.push({
            questionId: Number(q.id),
            type: q.type,
            answer: ans
        });
    });
    return list;
}

// 构建符合后端的 answers 数组
function buildBackendAnswers() {
    const answers = [];
    (questionnaireData.questions || []).forEach(q => {
        const ans = userAnswers[q.id];
        if (ans === undefined) return;
        const typeId = getBackendTypeId(q.type);
        const one = { questionId: Number(q.id), questionType: typeId };
        if (q.type === 'single' || q.type === 'rating') {
            one.answerValue = typeof ans === 'number' ? ans : null;
            one.answerText = null;
        } else if (q.type === 'multiple') {
            // 合并状态中的选择与DOM中当前勾选，避免只记录最后一次点击
            const stateArr = Array.isArray(ans) ? ans.slice() : [];
            const domArr = getCheckedMultipleIndices(q.id);
            const merged = [];
            const seen = new Set();
            [...stateArr, ...domArr].forEach(v => {
                const n = Number(v);
                if (!Number.isNaN(n) && !seen.has(n)) {
                    seen.add(n);
                    merged.push(n);
                }
            });
            // 将多选答案从数组改为 {"1":idx1, "2":idx2, ...} 的对象映射
            const obj = {};
            for (let i = 0; i < merged.length; i++) {
                const orderKey = String(i + 1);
                obj[orderKey] = merged[i];
            }
            one.answerJson = JSON.stringify(obj);
            one.answerText = null;
        } else if (q.type === 'text' || q.type === 'date' || q.type === 'time') {
            one.answerText = String(ans);
        } else if (q.type === 'matrix') {
            one.answerJson = JSON.stringify(ans);
            one.answerText = null;
        } else {
            one.answerText = typeof ans === 'string' ? ans : JSON.stringify(ans);
        }
        answers.push(one);
    });
    return answers;
}

function getBackendTypeId(frontType) {
    const map = { single: 1, multiple: 2, text: 3, rating: 4, matrix: 5, date: 6, time: 7 };
    return map[frontType] || 3;
}

function getStartTimeIso() {
    try {
        const now = new Date();
        const started = new Date(now.getTime() - getDuration() * 1000);
        return started.toISOString().replace('Z', '');
    } catch (e) {
        return new Date().toISOString().replace('Z', '');
    }
}

function convertAnswerListToMap(answerList) {
    const map = {};
    answerList.forEach(item => {
        if (item && (item.questionId !== undefined)) {
            map[item.questionId] = item.answer;
        }
    });
    return map;
}

function getOrCreateSessionId() {
    try {
        let id = localStorage.getItem('fill_session_id');
        if (!id) {
            id = 'sess_' + Math.random().toString(36).slice(2) + Date.now();
            localStorage.setItem('fill_session_id', id);
        }
        return id;
    } catch (e) {
        return 'sess_' + Date.now();
    }
}

/**
 * 检查是否有未保存的更改
 */
function hasUnsavedChanges() {
    return Object.keys(userAnswers).length > 0;
}

/**
 * 页面离开前处理
 */
function handleBeforeUnload(event) {
    if (hasUnsavedChanges() && !window.__allowLeave__) {
        event.preventDefault();
        event.returnValue = '您有未保存的答案，确定要离开吗？';
        return event.returnValue;
    }
}

/**
 * 开始计时器
 */
function startTimer() {
    startTime = Date.now();
    timer = setInterval(updateTimer, 1000);
}

/**
 * 更新计时器
 */
function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 获取持续时间
 */
function getDuration() {
    if (startTime) {
        return Math.floor((Date.now() - startTime) / 1000);
    }
    return 0;
}

function getProgressPercent() {
    const totalQuestions = questionnaireData.questions.length || 0;
    const answeredQuestions = Object.keys(userAnswers).length;
    if (totalQuestions === 0) return 0;
    return Math.round((answeredQuestions / totalQuestions) * 100);
}

/**
 * 显示Toast提示
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('saveToast');
    const content = toast.querySelector('span');
    content.textContent = message;
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * 显示确认对话框
 */
function showConfirmModal(title, message, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmModal.classList.add('show');
    
    if (callback) {
        // 将回调挂到全局，避免名称丢失
        window.__confirmCallback__ = callback;
        confirmModal.dataset.callback = '__confirmCallback__';
    }
}

/**
 * 关闭模态框
 */
function closeModal() {
    confirmModal.classList.remove('show');
    delete confirmModal.dataset.callback;
}

// 全局函数，供HTML调用
window.selectRadioOption = function(questionId, optionIndex) {
    userAnswers[questionId] = optionIndex;
    updateProgress();
    saveAnswers();
    saveDraftDebounced();
};

window.toggleCheckboxOption = function(questionId, optionIndex) {
    if (!Array.isArray(userAnswers[questionId])) {
        userAnswers[questionId] = [];
    }
    // 规范化为数字并去重
    const current = userAnswers[questionId];
    const n = Number(optionIndex);
    const idx = current.indexOf(n);
    if (idx > -1) current.splice(idx, 1); else current.push(n);
    // 与DOM同步，确保状态一致
    syncMultipleFromDom(questionId, current);
    updateProgress();
    saveAnswers();
    saveDraftDebounced();
};

window.saveTextAnswer = function(questionId, value) {
    userAnswers[questionId] = value;
    updateProgress();
    saveAnswers();
    saveDraftDebounced();
};

window.setRating = function(questionId, rating) {
    userAnswers[questionId] = rating;
    
    // 更新星星显示
    const container = document.querySelector(`#question-${questionId} .rating-container`);
    const stars = container.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
    
    updateProgress();
    saveAnswers();
    saveDraftDebounced();
};

window.saveMatrixAnswer = function(questionId, rowIndex, colIndex) {
    if (!userAnswers[questionId]) {
        userAnswers[questionId] = {};
    }
    userAnswers[questionId][rowIndex] = colIndex;
    updateProgress();
    saveAnswers();
    saveDraftDebounced();
};

window.saveDateAnswer = function(questionId, value) {
    userAnswers[questionId] = value;
    updateProgress();
    saveAnswers();
    saveDraftDebounced();
};

window.saveTimeAnswer = function(questionId, value) {
    userAnswers[questionId] = value;
    updateProgress();
    saveAnswers();
    saveDraftDebounced();
}; 

/**
 * 检查用户剩余提交次数
 */
async function checkUserSubmissionLimit(questionnaireId, userId) {
    try {
        // 调用后端API检查用户剩余提交次数
        const response = await fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.SUBMISSION_CHECK}?questionnaireId=${questionnaireId}&userId=${userId}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            const { remainingTimes, submissionLimit, canSubmit } = result.data;
            
            // 如果剩余次数为0，阻止填写
            if (!canSubmit || remainingTimes <= 0) {
                showSubmissionLimitError(submissionLimit);
                return false;
            }
            
            // 如果剩余次数较少，显示提醒
            if (remainingTimes <= 2) {
                showSubmissionLimitWarning(remainingTimes, submissionLimit);
            }
            
            return true;
        } else {
            console.warn('检查提交次数失败:', result.message);
            return true; // 如果检查失败，允许继续填写
        }
    } catch (error) {
        console.error('检查提交次数时发生错误:', error);
        return true; // 如果检查失败，允许继续填写
    }
}

/**
 * 显示提交次数限制错误
 */
function showSubmissionLimitError(submissionLimit) {
    // 隐藏问卷内容
    const questionsContainer = document.getElementById('questionsContainer');
    const navigationButtons = document.getElementById('navigationButtons');
    const submitSection = document.getElementById('submitSection');
    
    if (questionsContainer) questionsContainer.style.display = 'none';
    if (navigationButtons) navigationButtons.style.display = 'none';
    if (submitSection) submitSection.style.display = 'none';
    
    // 显示错误信息
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
        errorContainer.style.display = 'block';
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = `您已达到该问卷的填写次数限制（${submissionLimit}次），无法继续填写。`;
        }
    }
    
    // 显示返回按钮
    const btnBack = document.getElementById('btnBack');
    if (btnBack) {
        btnBack.style.display = 'block';
        btnBack.textContent = '返回问卷列表';
        btnBack.onclick = () => {
            window.location.href = CONFIG.ROUTES.ASK_USER;
        };
    }
}

/**
 * 显示提交次数限制警告
 */
function showSubmissionLimitWarning(remainingTimes, submissionLimit) {
    const warningMessage = `注意：您对该问卷的剩余填写次数为 ${remainingTimes} 次（总共 ${submissionLimit} 次）`;
    showToast(warningMessage, 'warning');
} 
