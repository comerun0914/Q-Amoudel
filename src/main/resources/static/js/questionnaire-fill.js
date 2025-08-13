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
        
        // 加载保存的答案
        loadSavedAnswers();
        
        // 渲染问卷
        renderQuestionnaire();
        
        // 显示第一个问题
        showQuestion(0);
        
        // 更新进度
        updateProgress();
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
                    estimatedTime: '15分钟'
                };
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
                        text: '请评价以下各项能力：',
                        rows: ['语言表达', '数学思维', '社交能力', '创造力'],
                        columns: ['很差', '较差', '一般', '较好', '很好'],
                        required: true
                    }
                ],
                startTime: new Date().toLocaleString('zh-CN'),
                estimatedTime: '10分钟'
            };
        }
        
        // 设置问卷信息
        document.getElementById('questionnaireTitle').textContent = questionnaireData.title;
        document.getElementById('questionnaireDescription').textContent = questionnaireData.description;
        document.getElementById('startTime').textContent = questionnaireData.startTime;
        document.getElementById('estimatedTime').textContent = questionnaireData.estimatedTime;
        
    } catch (error) {
        console.error('加载问卷数据失败:', error);
        // 显示错误信息
        showErrorMessage('加载问卷数据失败，请检查网络连接或联系管理员');
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
            window.location.href = CONFIG.ROUTES.ASK_USER;
        });
    } else {
        window.location.href = CONFIG.ROUTES.ASK_USER;
    }
}

/**
 * 处理保存
 */
function handleSave() {
    saveAnswers();
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
    if (confirmModal.dataset.action) {
        const action = confirmModal.dataset.action;
        const callback = confirmModal.dataset.callback;
        
        if (callback && typeof window[callback] === 'function') {
            window[callback]();
        }
    }
    closeModal();
}

/**
 * 显示提交区域
 */
function showSubmitSection() {
    document.getElementById('submitSection').style.display = 'block';
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
function submitQuestionnaire() {
    // 模拟提交到后端
    const submitData = {
        questionnaireId: questionnaireData.id,
        answers: userAnswers,
        submitTime: new Date().toISOString(),
        duration: getDuration()
    };
    
    console.log('提交数据:', submitData);
    
    // 保存答案数据到localStorage，供预览页面使用
    const previewData = {
        questionnaire: questionnaireData,
        answers: userAnswers,
        submitTime: submitData.submitTime,
        duration: submitData.duration
    };
    localStorage.setItem('questionnaire_preview_data', JSON.stringify(previewData));
    
    // 清除本地保存的答案
    localStorage.removeItem(`questionnaire-${questionnaireData.id}-answers`);
    
    // 显示成功消息并跳转到预览页面
    showToast('问卷提交成功！', 'success');
    setTimeout(() => {
        window.location.href = CONFIG.ROUTES.QUESTIONNAIRE_PREVIEW;
    }, 2000);
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
function loadSavedAnswers() {
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
    if (hasUnsavedChanges()) {
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
        confirmModal.dataset.callback = callback.name;
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
};

window.toggleCheckboxOption = function(questionId, optionIndex) {
    if (!userAnswers[questionId]) {
        userAnswers[questionId] = [];
    }
    
    const index = userAnswers[questionId].indexOf(optionIndex);
    if (index > -1) {
        userAnswers[questionId].splice(index, 1);
    } else {
        userAnswers[questionId].push(optionIndex);
    }
    updateProgress();
};

window.saveTextAnswer = function(questionId, value) {
    userAnswers[questionId] = value;
    updateProgress();
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
};

window.saveMatrixAnswer = function(questionId, rowIndex, colIndex) {
    if (!userAnswers[questionId]) {
        userAnswers[questionId] = {};
    }
    userAnswers[questionId][rowIndex] = colIndex;
    updateProgress();
};

window.saveDateAnswer = function(questionId, value) {
    userAnswers[questionId] = value;
    updateProgress();
};

window.saveTimeAnswer = function(questionId, value) {
    userAnswers[questionId] = value;
    updateProgress();
}; 