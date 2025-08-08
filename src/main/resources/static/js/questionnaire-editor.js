// 使用全局配置
// 问卷编辑器JavaScript

// 全局变量
let questionCount = 0;
let autoSaveTimer = null;
let lastSavedState = null;
let isAutoSaving = false;
let questionnaireId = null;

// 自动保存配置
const AUTO_SAVE_INTERVAL = 5000; // 5秒
const AUTO_SAVE_ENABLED = true;

// 全局函数定义
function getQuestionTemplate(type) {
    switch(type) {
        case 'single':
            return createSingleChoiceTemplate();
        case 'multiple':
            return createMultipleChoiceTemplate();
        case 'text':
            return createTextQuestionTemplate();
        case 'rating':
            return createRatingQuestionTemplate();
        case 'matrix':
            return createMatrixQuestionTemplate();
        case 'date':
            return createDateQuestionTemplate();
        case 'time':
            return createTimeQuestionTemplate();
        case 'file':
            return createFileUploadTemplate();
        case 'location':
            return createLocationTemplate();
        case 'signature':
            return createSignatureTemplate();
        case 'user-info':
            return createUserInfoTemplate();
        default:
            return createSingleChoiceTemplate();
    }
}

// 单选题模板
function createSingleChoiceTemplate() {
    return `
        <div class="question-header">
            <span class="question-type-badge">
                <i class="iconfont icon-radio"></i> 单选题
            </span>
            <div class="header-actions">
                <div class="drag-handle" title="拖拽移动">
                    <i class="iconfont icon-move"></i>
                </div>
                <button class="delete-question" onclick="deleteQuestion(this);">
                    <i class="iconfont icon-delete"></i> 删除
                </button>
            </div>
        </div>
        <div class="question-content">
            <textarea class="question-text" placeholder="请输入问题内容" rows="2"></textarea>
        </div>
        <div class="options-container">
            <div class="option-item">
                <div class="option-content">
                    <input type="radio" name="option_${Date.now()}" value="1">
                    <input type="text" class="option-text" placeholder="选项1">
                </div>
                <div class="option-actions">
                    <button type="button" class="btn-edit-option" title="编辑选项">
                        <i class="iconfont icon-edit"></i>
                    </button>
                    <button type="button" class="btn-delete-option" title="删除选项">
                        <i class="iconfont icon-delete"></i>
                    </button>
                </div>
            </div>
            <div class="option-item">
                <div class="option-content">
                    <input type="radio" name="option_${Date.now()}" value="2">
                    <input type="text" class="option-text" placeholder="选项2">
                </div>
                <div class="option-actions">
                    <button type="button" class="btn-edit-option" title="编辑选项">
                        <i class="iconfont icon-edit"></i>
                    </button>
                    <button type="button" class="btn-delete-option" title="删除选项">
                        <i class="iconfont icon-delete"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="question-footer">
            <button type="button" class="add-option-btn" onclick="addOption(this, 'radio')">
                <i class="iconfont icon-add"></i> 添加选项
            </button>
        </div>
    `;
}

// 多选题模板
function createMultipleChoiceTemplate() {
    return `
        <div class="question-header">
            <span class="question-type-badge">
                <i class="iconfont icon-checkbox"></i> 多选题
            </span>
            <div class="header-actions">
                <div class="drag-handle" title="拖拽移动">
                    <i class="iconfont icon-move"></i>
                </div>
                <button class="delete-question" onclick="deleteQuestion(this);">
                    <i class="iconfont icon-delete"></i> 删除
                </button>
            </div>
        </div>
        <div class="question-content">
            <textarea class="question-text" placeholder="请输入问题内容" rows="2"></textarea>
        </div>
        <div class="options-container">
            <div class="option-item">
                <div class="option-content">
                    <input type="checkbox" name="option_${Date.now()}" value="1">
                    <input type="text" class="option-text" placeholder="选项1">
                </div>
                <div class="option-actions">
                    <button type="button" class="btn-edit-option" title="编辑选项">
                        <i class="iconfont icon-edit"></i>
                    </button>
                    <button type="button" class="btn-delete-option" title="删除选项">
                        <i class="iconfont icon-delete"></i>
                    </button>
                </div>
            </div>
            <div class="option-item">
                <div class="option-content">
                    <input type="checkbox" name="option_${Date.now()}" value="2">
                    <input type="text" class="option-text" placeholder="选项2">
                </div>
                <div class="option-actions">
                    <button type="button" class="btn-edit-option" title="编辑选项">
                        <i class="iconfont icon-edit"></i>
                    </button>
                    <button type="button" class="btn-delete-option" title="删除选项">
                        <i class="iconfont icon-delete"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="question-footer">
            <button type="button" class="add-option-btn" onclick="addOption(this, 'checkbox')">
                <i class="iconfont icon-add"></i> 添加选项
            </button>
        </div>
    `;
}

// 问答题模板
function createTextQuestionTemplate() {
    return `
        <div class="question-header">
            <span class="question-type-badge">
                <i class="iconfont icon-text"></i> 问答题
            </span>
            <div class="header-actions">
                <div class="drag-handle" title="拖拽移动">
                    <i class="iconfont icon-move"></i>
                </div>
                <button class="delete-question" onclick="deleteQuestion(this);">
                    <i class="iconfont icon-delete"></i> 删除
                </button>
            </div>
        </div>
        <div class="question-content">
            <textarea class="question-text" placeholder="请输入问题内容" rows="2"></textarea>
        </div>
        <div class="question-settings">
            <div class="setting-group">
                <label>提示文字:</label>
                <input type="text" class="hint-text" placeholder="请输入提示文字">
            </div>
            <div class="setting-group">
                <label>最大字数:</label>
                <input type="number" class="max-length" value="500" min="1" max="2000">
            </div>
            <div class="setting-group">
                <label>输入类型:</label>
                <select class="input-type">
                    <option value="single">单行文本</option>
                    <option value="multiline">多行文本</option>
                </select>
            </div>
        </div>
    `;
}

// 评分题模板
function createRatingQuestionTemplate() {
    return `
        <div class="question-header">
            <span class="question-type-badge">
                <i class="iconfont icon-star"></i> 评分题
            </span>
            <div class="header-actions">
                <div class="drag-handle" title="拖拽移动">
                    <i class="iconfont icon-move"></i>
                </div>
                <button class="delete-question" onclick="deleteQuestion(this);">
                    <i class="iconfont icon-delete"></i> 删除
                </button>
            </div>
        </div>
        <div class="question-content">
            <textarea class="question-text" placeholder="请输入问题内容" rows="2"></textarea>
        </div>
        <div class="question-settings">
            <div class="setting-group">
                <label>最低分:</label>
                <input type="number" class="min-score" value="1" min="1" max="10">
            </div>
            <div class="setting-group">
                <label>最高分:</label>
                <input type="number" class="max-score" value="5" min="2" max="10">
            </div>
            <div class="setting-group">
                <label>最低分标签:</label>
                <input type="text" class="min-label" value="非常不满意">
            </div>
            <div class="setting-group">
                <label>最高分标签:</label>
                <input type="text" class="max-label" value="非常满意">
            </div>
            <div class="setting-group">
                <label>步长:</label>
                <input type="number" class="rating-step" value="1" min="0.5" max="2" step="0.5">
            </div>
        </div>
    `;
}

// 矩阵题模板
function createMatrixQuestionTemplate() {
    return `
        <div class="question-header">
            <span class="question-type-badge">
                <i class="iconfont icon-table"></i> 矩阵题
            </span>
            <div class="header-actions">
                <div class="drag-handle" title="拖拽移动">
                    <i class="iconfont icon-move"></i>
                </div>
                <button class="delete-question" onclick="deleteQuestion(this);">
                    <i class="iconfont icon-delete"></i> 删除
                </button>
            </div>
        </div>
        <div class="question-content">
            <textarea class="question-text" placeholder="请输入问题内容" rows="2"></textarea>
        </div>
        <div class="matrix-settings">
            <div class="matrix-rows">
                <h4>行标题</h4>
                <div class="row-list">
                    <div class="row-item">
                        <input type="text" class="row-text" placeholder="行1">
                        <button type="button" class="btn-delete-row">删除</button>
                    </div>
                    <div class="row-item">
                        <input type="text" class="row-text" placeholder="行2">
                        <button type="button" class="btn-delete-row">删除</button>
                    </div>
                </div>
                <button type="button" class="add-row-btn">
                    <i class="iconfont icon-add"></i> 添加行
                </button>
            </div>
            <div class="matrix-columns">
                <h4>列标题</h4>
                <div class="column-list">
                    <div class="column-item">
                        <input type="text" class="column-text" placeholder="列1">
                        <button type="button" class="btn-delete-column">删除</button>
                    </div>
                    <div class="column-item">
                        <input type="text" class="column-text" placeholder="列2">
                        <button type="button" class="btn-delete-column">删除</button>
                    </div>
                </div>
                <button type="button" class="add-column-btn">
                    <i class="iconfont icon-add"></i> 添加列
                </button>
            </div>
        </div>
    `;
}

// 其他模板函数
function createDateQuestionTemplate() {
    return `<div class="question-item">日期题模板</div>`;
}

function createTimeQuestionTemplate() {
    return `<div class="question-item">时间题模板</div>`;
}

function createFileUploadTemplate() {
    return `<div class="question-item">文件上传模板</div>`;
}

function createLocationTemplate() {
    return `<div class="question-item">位置题模板</div>`;
}

function createSignatureTemplate() {
    return `<div class="question-item">签名题模板</div>`;
}

function createUserInfoTemplate() {
    return `<div class="question-item">填写人信息模板</div>`;
}

// 全局事件绑定函数
function attachQuestionEvents(questionElement, type) {
    // 根据题目类型绑定不同的事件
    switch(type) {
        case 'file':
            attachFileUploadEvents(questionElement);
            break;
        case 'location':
            attachLocationEvents(questionElement);
            break;
        case 'signature':
            attachSignatureEvents(questionElement);
            break;
        case 'user-info':
            attachUserInfoEvents(questionElement);
            break;
    }
}

function attachDragEvents(questionElement) {
    questionElement.addEventListener('dragstart', handleDragStart);
    questionElement.addEventListener('dragover', handleDragOver);
    questionElement.addEventListener('dragenter', handleDragEnter);
    questionElement.addEventListener('dragleave', handleDragLeave);
    questionElement.addEventListener('dragend', handleDragEnd);
    questionElement.addEventListener('drop', handleDrop);
}

// 检查用户登录状态
function checkUserLoginStatus() {
    // 使用工具函数进行身份校验，要求管理员权限
    const userInfo = UTILS.checkAuth(1);
    if (userInfo) {
        // 显示用户信息
        UTILS.displayUserInfo(userInfo);
        // 绑定用户下拉菜单事件
        UTILS.bindUserDropdown();
    }
}

// 加载问卷信息
function loadQuestionnaireInfo() {
    console.log('=== 开始加载问卷信息 ===');
    console.log('当前页面URL:', window.location.href);
    console.log('当前页面search:', window.location.search);

    // 优先从本地存储获取问卷ID
    let questionnaireId = localStorage.getItem('current_questionnaire_id');

    if (questionnaireId) {
        console.log('从本地存储获取到问卷ID:', questionnaireId);
        console.log('支持页面刷新后继续编辑该问卷');
    } else {
        // 如果本地存储没有，尝试从URL参数获取
        console.log('本地存储中没有问卷ID，尝试从URL参数获取');

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const encodedQuestionnaireId = urlParams.get('id');

            if (encodedQuestionnaireId) {
                questionnaireId = decodeURIComponent(encodedQuestionnaireId);
                console.log('成功从URL参数解析问卷ID:', questionnaireId);
            } else {
                console.log('URL中也没有找到id参数');
            }
        } catch (error) {
            console.error('URL参数解析失败:', error);
            // 尝试手动解析
            const search = window.location.search;
            const match = search.match(/[?&]id=([^&]*)/);
            if (match) {
                questionnaireId = decodeURIComponent(match[1]);
                console.log('手动解析成功:', questionnaireId);
            }
        }
    }

    console.log('最终获取的问卷ID:', questionnaireId);
    console.log('问卷ID类型:', typeof questionnaireId);

    if (questionnaireId) {
        // 如果有问卷ID，从后端获取问卷信息
        console.log('调用后端接口获取问卷信息');
        
        // 显示正在访问最近编辑问卷信息的提示
        // 无论是通过刷新还是直接访问，都显示相同的提示
        showInfoMessage('正在访问最近编辑问卷信息');
        
        fetchQuestionnaireFromBackend(questionnaireId);
    } else {
        // 如果没有问卷ID，显示错误信息并跳转
        showErrorMessage('缺少问卷ID，请从正确的入口访问问卷编辑器');
        // 可以选择跳转到问卷列表页面或创建页面
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
}

// 从后端获取问卷信息
async function fetchQuestionnaireFromBackend(questionnaireId) {
    try {
        console.log('正在获取问卷信息，ID:', questionnaireId);
        const baseUrl = CONFIG.BACKEND_BASE_URL + CONFIG.API_ENDPOINTS.QUESTIONNAIRE_GETINFOBYID;
        const separator = baseUrl.includes('?') ? '&' : '?';
        const apiUrl = baseUrl + separator + `id=${questionnaireId}`;
        console.log('API URL:', apiUrl);

        const response = await fetch(apiUrl);
        const result = await response.json();

        console.log('API响应结果:', result);

        if (result.code === 200 && result.data) {
            const questionnaire = result.data; // 问卷数据
            const creatorName = result.userInfo;   // 创建人用户名

            // 合并数据
            const fullQuestionnaire = {
                ...questionnaire,
                creatorName: creatorName
            };
            displayQuestionnaireInfo(fullQuestionnaire);
        } else {
            console.error('获取问卷信息失败:', result.message);
            console.error('响应数据:', result);
            // 如果后端获取失败，显示错误信息
            showErrorMessage('网络问题，。请检查网络连接');
        }
    } catch (error) {
        console.error('获取问卷信息时发生错误:', error);
        console.error('错误详情:', error.message);
        // 如果网络错误，显示错误信息
        showErrorMessage('网络连接错误，请检查网络连接后重试');
    }
}

// 显示问卷信息
function displayQuestionnaireInfo(questionnaire) {
    // 设置全局问卷ID
    questionnaireId = questionnaire.id;
    
    // 更新问卷标题
    const titleElement = document.getElementById('questionnaire-title');
    if (titleElement && questionnaire.title) {
        titleElement.textContent = questionnaire.title;
    }

    // 更新问卷描述
    const descriptionElement = document.getElementById('questionnaire-description-display');
    if (descriptionElement && questionnaire.description) {
        descriptionElement.textContent = questionnaire.description;
    }

    // 更新开始日期
    const startDateElement = document.getElementById('start-date');
    if (startDateElement && questionnaire.startDate) {
        startDateElement.textContent = questionnaire.startDate;
    }

    // 更新结束日期
    const endDateElement = document.getElementById('end-date');
    if (endDateElement && questionnaire.endDate) {
        endDateElement.textContent = questionnaire.endDate;
    }

    // 更新创建人信息
    const creatorElement = document.getElementById('creator-name-display');
    if (creatorElement) {
        if (questionnaire.creatorName) {
            creatorElement.textContent = questionnaire.creatorName;
        } else {
            creatorElement.textContent = '未知用户';
        }
    }

    // 不清除本地存储中的问卷ID，保持刷新页面后仍能获取
    console.log('保持本地存储中的问卷ID，支持页面刷新后继续编辑');

    console.log('问卷信息已加载:', questionnaire);
    
    // 加载问卷的题目信息
    loadQuestionnaireQuestions(questionnaire.id);
    
    // 启动自动保存
    startAutoSave();
}

// 加载问卷题目信息
async function loadQuestionnaireQuestions(questionnaireId) {
    try {
        console.log('正在加载问卷题目信息，问卷ID:', questionnaireId);
        const baseUrl = CONFIG.BACKEND_BASE_URL + CONFIG.API_ENDPOINTS.QUESTIONNAIRE_QUESTIONS;
        const separator = baseUrl.includes('?') ? '&' : '?';
        const apiUrl = baseUrl + separator + `questionnaireId=${questionnaireId}`;
        console.log('题目API URL:', apiUrl);

        const response = await fetch(apiUrl);
        const result = await response.json();

        console.log('题目API响应结果:', result);

        if (result.code === 200 && result.data) {
            const questions = result.data;
            console.log('获取到的题目列表:', questions);
            
            // 清空现有的题目容器
            const questionContainer = document.getElementById('question-container');
            if (questionContainer) {
                questionContainer.innerHTML = '';
            }
            
            // 重置题目计数
            questionCount = 0;
            
            // 显示题目信息
            displayQuestions(questions);
            
            // 更新计数和统计信息
            updateQuestionCount();
            updateEstimatedTime();
            updateQuestionNumbers();
        } else {
            console.error('获取题目信息失败:', result.message);
            console.error('响应数据:', result);
        }
    } catch (error) {
        console.error('获取题目信息时发生错误:', error);
        console.error('错误详情:', error.message);
    }
}

// 显示题目信息
function displayQuestions(questions) {
    if (!questions || questions.length === 0) {
        console.log('没有题目信息');
        return;
    }
    
    const questionContainer = document.getElementById('question-container');
    if (!questionContainer) {
        console.error('找不到题目容器');
        return;
    }
    
    questions.forEach((question, index) => {
        console.log('处理题目:', question);
        
        // 根据题目类型创建对应的题目元素
        const questionElement = createQuestionElement(question, index + 1);
        if (questionElement) {
            // 设置题目ID
            questionElement.dataset.questionId = question.id;
            questionContainer.appendChild(questionElement);
            questionCount++;
        }
    });
    
    console.log('题目显示完成，共显示', questionCount, '个题目');
    
    // 初始化保存状态
    lastSavedState = getCurrentPageState();
}

// 根据题目数据创建题目元素
function createQuestionElement(question, questionNumber) {
    const questionType = question.questionType;
    let questionTypeName = '';
    
    // 根据题目类型ID确定类型名称
    switch (questionType) {
        case 1: questionTypeName = 'single'; break;
        case 2: questionTypeName = 'multiple'; break;
        case 3: questionTypeName = 'text'; break;
        case 4: questionTypeName = 'rating'; break;
        case 5: questionTypeName = 'matrix'; break;
        default: questionTypeName = 'single'; break;
    }
    
    console.log('创建题目元素，类型:', questionTypeName, '内容:', question.content);
    
    // 创建题目元素
    const questionElement = document.createElement('div');
    questionElement.className = 'question-item';
    questionElement.setAttribute('draggable', 'true');
    questionElement.setAttribute('data-type', questionTypeName);
    questionElement.innerHTML = getQuestionTemplate(questionTypeName);
    
    // 设置题目内容
    const questionTextElement = questionElement.querySelector('.question-text');
    if (questionTextElement && question.content) {
        questionTextElement.value = question.content;
    }
    
    // 绑定事件
    attachQuestionEvents(questionElement, questionTypeName);
    attachDragEvents(questionElement);
    
    // 如果是选择题，加载选项
    if (questionTypeName === 'single' || questionTypeName === 'multiple') {
        loadQuestionOptions(questionElement, question);
    }
    
    return questionElement;
}

/**
 * 加载题目选项
 */
function loadQuestionOptions(questionElement, question) {
    console.log('加载题目选项:', question);
    
    if (!question.options || question.options.length === 0) {
        console.log('没有选项数据');
        return;
    }
    
    // 找到选项容器
    const optionsContainer = questionElement.querySelector('.options-container');
    if (!optionsContainer) {
        console.error('找不到选项容器');
        return;
    }
    
    // 清空现有选项
    optionsContainer.innerHTML = '';
    
    // 添加选项
    question.options.forEach((option, index) => {
        console.log('添加选项:', option);
        
        // 创建选项元素
        const optionElement = document.createElement('div');
        optionElement.className = 'option-item';
        
        // 根据题目类型创建不同的选项
        const questionType = questionElement.getAttribute('data-type');
        const inputType = questionType === 'single' ? 'radio' : 'checkbox';
        const name = `option_${question.id}`;
        
        optionElement.innerHTML = `
            <div class="option-content">
                <input type="${inputType}" name="${name}" value="${option.id}" ${option.isDefault ? 'checked' : ''}>
                <input type="text" class="option-text" value="${option.optionContent}" placeholder="选项${index + 1}">
            </div>
            <div class="option-actions">
                <button type="button" class="btn-edit-option" title="编辑选项">
                    <i class="iconfont icon-edit"></i>
                </button>
                <button type="button" class="btn-delete-option" title="删除选项">
                    <i class="iconfont icon-delete"></i>
                </button>
            </div>
        `;
        
        optionsContainer.appendChild(optionElement);
    });
    
    console.log('选项加载完成，共加载', question.options.length, '个选项');
}

// 添加选项函数
function addOption(button, inputType) {
    const optionsContainer = button.previousElementSibling;
    const optionCount = optionsContainer.children.length + 1;
    const name = inputType === 'radio' ? `single_${questionCount}` : 'multiple';
    
    const optionElement = document.createElement('div');
    optionElement.className = 'option-item';
    optionElement.innerHTML = `
        <input type="${inputType}" name="${name}" disabled>
        <input type="text" placeholder="选项${optionCount}" class="option-content">
    `;
    
    optionsContainer.appendChild(optionElement);
}

// 更新问题计数
function updateQuestionCount() {
    const questions = document.querySelectorAll('.question-item');
    // 排除填写人信息卡片
    const actualQuestions = Array.from(questions).filter(q => 
        q.getAttribute('data-type') !== 'user-info'
    );
    questionCount = actualQuestions.length;
    if (questionCountElement) {
        questionCountElement.textContent = questionCount;
    }
}

// 更新预计时间
function updateEstimatedTime() {
    const baseTime = 2; // 基础时间2分钟
    const timePerQuestion = 0.5; // 每个问题0.5分钟
    const estimatedMinutes = Math.ceil(baseTime + questionCount * timePerQuestion);
    
    if (estimatedTimeElement) {
        estimatedTimeElement.textContent = `约 ${estimatedMinutes} 分钟`;
    }
}

// 更新题目序号
function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-item');
    let questionNumber = 1;
    
    questions.forEach(question => {
        const type = question.getAttribute('data-type');
        // 排除特殊类型和功能卡片
        if (type !== 'user-info' && type !== 'signature' && type !== 'file' && type !== 'location') {
            const questionHeader = question.querySelector('.question-header');
            if (questionHeader) {
                // 查找或创建题目序号元素
                let numberElement = questionHeader.querySelector('.question-number');
                if (!numberElement) {
                    numberElement = document.createElement('span');
                    numberElement.className = 'question-number';
                    questionHeader.insertBefore(numberElement, questionHeader.firstChild);
                }
                numberElement.textContent = `Q${questionNumber}`;
                questionNumber++;
            }
        } else {
            // 移除特殊类型和功能卡片的序号
            const numberElement = question.querySelector('.question-number');
            if (numberElement) {
                numberElement.remove();
            }
        }
    });
    
    // 序号更新后，触发自动保存检查
    if (AUTO_SAVE_ENABLED) {
        setTimeout(() => {
            performAutoSave();
        }, 1000); // 延迟1秒执行，避免频繁保存
    }
}

// 这些事件绑定已经在DOMContentLoaded事件处理程序中重新绑定

// 拖拽开始
function handleDragStart(e) {
    // 如果点击的是组件内部的交互元素，不启动拖拽
    if (e.target.closest('.signature-canvas') || 
        e.target.closest('.upload-area') || 
        e.target.closest('.location-display') ||
        e.target.closest('.description-input') ||
        e.target.closest('.signature-toolbar') ||
        e.target.closest('.edit-info-btn') ||
        e.target.closest('.clear-signature-btn') ||
        e.target.closest('.save-signature') ||
        e.target.closest('.remove-file') ||
        e.target.closest('.delete-question')) {
        return;
    }
    
    // 如果点击的是拖拽手柄，确保拖拽的是整个问题项
    const questionItem = e.target.closest('.question-item');
    if (e.target.closest('.drag-handle')) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', questionItem.outerHTML);
        questionItem.classList.add('dragging');
    } else {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        e.target.classList.add('dragging');
    }
}

// 拖拽悬停
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

// 拖拽进入
function handleDragEnter(e) {
    e.preventDefault();
    e.target.closest('.question-item')?.classList.add('drag-over');
}

// 拖拽离开
function handleDragLeave(e) {
    e.target.closest('.question-item')?.classList.remove('drag-over');
}

// 拖拽结束
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.question-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

// 拖拽放置
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedElement = document.querySelector('.dragging');
    const targetElement = e.target.closest('.question-item');
    
    if (draggedElement && targetElement && draggedElement !== targetElement) {
        const draggedType = draggedElement.getAttribute('data-type');
        const targetType = targetElement.getAttribute('data-type');
        
        // 检查是否可以放置（填写人信息可以放在任何位置）
        if (draggedType === 'user-info' || targetType === 'user-info' || 
            (draggedType !== 'user-info' && targetType !== 'user-info')) {
            
            // 获取位置信息
            const container = questionContainer;
            const draggedRect = draggedElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // 判断放置位置
            const draggedCenter = draggedRect.top + draggedRect.height / 2;
            const targetCenter = targetRect.top + targetRect.height / 2;
            
            if (draggedCenter < targetCenter) {
                // 放在目标元素之前
                container.insertBefore(draggedElement, targetElement);
            } else {
                // 放在目标元素之后
                container.insertBefore(draggedElement, targetElement.nextSibling);
            }
        }
    }
    
    // 清理样式
    document.querySelectorAll('.question-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    
    // 更新题目序号
    updateQuestionNumbers();
    
    // 拖拽完成后，触发自动保存检查
    if (AUTO_SAVE_ENABLED) {
        setTimeout(() => {
            performAutoSave();
        }, 1000); // 延迟1秒执行，避免频繁保存
    }
}

// 显示错误信息
function showErrorMessage(message) {
    // 创建错误提示元素
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #dc3545;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(220, 53, 69, 0.3);
        z-index: 10000;
        text-align: center;
        max-width: 400px;
        font-weight: 500;
    `;

    errorContainer.innerHTML = `
        <div style="margin-bottom: 10px;">
            <i style="font-size: 24px;">⚠️</i>
        </div>
        <div style="margin-bottom: 15px;">${message}</div>
        <div style="font-size: 14px; opacity: 0.8;">页面将在3秒后自动跳转...</div>
    `;

    document.body.appendChild(errorContainer);

    // 3秒后自动移除
    setTimeout(() => {
        if (errorContainer.parentNode) {
            errorContainer.parentNode.removeChild(errorContainer);
        }
    }, 3000);
}

// 显示信息提示（用于显示正在访问最近编辑问卷信息）
function showInfoMessage(message) {
    // 创建信息提示元素
    const infoContainer = document.createElement('div');
    infoContainer.className = 'info-message';
    infoContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #17a2b8;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(23, 162, 184, 0.3);
        z-index: 10000;
        text-align: center;
        max-width: 400px;
        font-weight: 500;
    `;

    infoContainer.innerHTML = `
        <div style="margin-bottom: 10px;">
            <i style="font-size: 24px;">ℹ️</i>
        </div>
        <div style="margin-bottom: 15px;">${message}</div>
        <div style="font-size: 14px; opacity: 0.8;">正在加载问卷信息...</div>
    `;

    document.body.appendChild(infoContainer);

    // 2秒后自动移除
    setTimeout(() => {
        if (infoContainer.parentNode) {
            infoContainer.parentNode.removeChild(infoContainer);
        }
    }, 2000);
}

// 删除本地存储的问卷ID
function clearLocalQuestionnaireId() {
    localStorage.removeItem('current_questionnaire_id');
    console.log('已清除本地存储中的问卷ID');
}

/**
 * 获取当前页面状态
 * @returns {Object} 页面状态对象
 */
function getCurrentPageState() {
    const questions = document.querySelectorAll('.question-item');
    const state = {
        questionCount: questions.length,
        questions: []
    };
    
    questions.forEach((question, index) => {
        const questionData = {
            index: index,
            type: question.getAttribute('data-type'),
            content: question.querySelector('.question-text')?.value || '',
            questionId: question.dataset.questionId || null,
            options: []
        };
        
        // 收集选项数据
        const optionElements = question.querySelectorAll('.option-item');
        optionElements.forEach((optionElement, optionIndex) => {
            const optionText = optionElement.querySelector('.option-text');
            const radioCheckbox = optionElement.querySelector('input[type="radio"], input[type="checkbox"]');
            
            if (optionText && optionText.value.trim()) {
                questionData.options.push({
                    content: optionText.value.trim(),
                    isDefault: radioCheckbox && radioCheckbox.checked ? 1 : 0,
                    sortNum: optionIndex + 1
                });
            }
        });
        
        state.questions.push(questionData);
    });
    
    return state;
}

/**
 * 检查页面是否有变化
 * @returns {boolean} 是否有变化
 */
function hasPageChanged() {
    const currentState = getCurrentPageState();
    
    if (!lastSavedState) {
        lastSavedState = currentState;
        return false;
    }
    
    // 比较问题数量
    if (currentState.questionCount !== lastSavedState.questionCount) {
        return true;
    }
    
    // 比较每个问题的内容
    for (let i = 0; i < currentState.questions.length; i++) {
        const currentQuestion = currentState.questions[i];
        const lastQuestion = lastSavedState.questions[i];
        
        if (!lastQuestion) return true; // 新问题
        
        // 比较问题内容
        if (currentQuestion.content !== lastQuestion.content) {
            return true;
        }
        
        // 比较选项
        if (currentQuestion.options.length !== lastQuestion.options.length) {
            return true;
        }
        
        for (let j = 0; j < currentQuestion.options.length; j++) {
            const currentOption = currentQuestion.options[j];
            const lastOption = lastQuestion.options[j];
            
            if (!lastOption) return true; // 新选项
            
            if (currentOption.content !== lastOption.content || 
                currentOption.isDefault !== lastOption.isDefault) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * 更新题目序号
 * @returns {Promise}
 */
async function updateQuestionOrder() {
    if (!questionnaireId) {
        console.warn('没有问卷ID，跳过序号更新');
        return;
    }
    
    try {
        const questions = document.querySelectorAll('.question-item');
        const questionOrderData = [];
        
        questions.forEach((question, index) => {
            const questionId = question.dataset.questionId;
            if (questionId) {
                questionOrderData.push({
                    id: parseInt(questionId),
                    sortNum: index + 1
                });
            }
        });
        
        if (questionOrderData.length > 0) {
                    // 调用后端API更新题目序号
        const response = await fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTION_UPDATE_ORDER}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    questionnaireId: questionnaireId,
                    questionOrder: questionOrderData
                })
            });
            
            const result = await response.json();
            if (result.code === 200) {
                console.log('题目序号更新成功');
            } else {
                console.error('题目序号更新失败:', result.message);
            }
        }
    } catch (error) {
        console.error('更新题目序号时发生错误:', error);
    }
}

/**
 * 保存新题目
 * @param {HTMLElement} questionElement - 题目元素
 * @returns {Promise}
 */
async function saveNewQuestion(questionElement) {
    if (!questionnaireId) {
        console.warn('没有问卷ID，跳过新题目保存');
        return;
    }
    
    try {
        const questionType = questionElement.getAttribute('data-type');
        const questionContent = questionElement.querySelector('.question-text')?.value || '';
        
        // 确定题目类型ID
        let questionTypeId;
        switch (questionType) {
            case 'single': questionTypeId = 1; break;
            case 'multiple': questionTypeId = 2; break;
            case 'text': questionTypeId = 3; break;
            case 'rating': questionTypeId = 4; break;
            case 'matrix': questionTypeId = 5; break;
            default: questionTypeId = 1;
        }
        
        // 保存题目基本信息
        const questionData = {
            questionnaireId: questionnaireId,
            content: questionContent,
            questionType: questionTypeId,
            sortNum: Array.from(document.querySelectorAll('.question-item')).indexOf(questionElement) + 1,
            isRequired: 1
        };
        
        const response = await fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTION_SAVE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionData)
        });
        
        const result = await response.json();
        if (result.code === 200 && result.data) {
            const savedQuestion = result.data;
            questionElement.dataset.questionId = savedQuestion.id;
            console.log('新题目保存成功:', savedQuestion);
            
            // 如果是选择题，保存选项
            if (questionType === 'single' || questionType === 'multiple') {
                await saveQuestionOptions(savedQuestion.id, questionType, questionElement);
            }
        } else {
            console.error('新题目保存失败:', result.message);
        }
    } catch (error) {
        console.error('保存新题目时发生错误:', error);
    }
}

/**
 * 更新现有题目
 * @param {HTMLElement} questionElement - 题目元素
 * @returns {Promise}
 */
async function updateExistingQuestion(questionElement) {
    const questionId = questionElement.dataset.questionId;
    if (!questionId) {
        console.warn('题目没有ID，跳过更新');
        return;
    }
    
    try {
        const questionContent = questionElement.querySelector('.question-text')?.value || '';
        const questionType = questionElement.getAttribute('data-type');
        
        // 更新题目基本信息
        const questionData = {
            id: parseInt(questionId),
            content: questionContent
        };
        
        const response = await fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTION_UPDATE}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionData)
        });
        
        const result = await response.json();
        if (result.code === 200) {
            console.log('题目更新成功');
            
            // 如果是选择题，更新选项
            if (questionType === 'single' || questionType === 'multiple') {
                await saveQuestionOptions(parseInt(questionId), questionType, questionElement);
            }
        } else {
            console.error('题目更新失败:', result.message);
        }
    } catch (error) {
        console.error('更新题目时发生错误:', error);
    }
}

/**
 * 执行自动保存
 */
async function performAutoSave() {
    if (isAutoSaving || !AUTO_SAVE_ENABLED) {
        return;
    }
    
    if (!hasPageChanged()) {
        return; // 没有变化，不需要保存
    }
    
    console.log('检测到页面变化，开始自动保存...');
    isAutoSaving = true;
    
    try {
        const currentState = getCurrentPageState();
        
        // 1. 检查序号是否变化，更新题目序号
        await updateQuestionOrder();
        
        // 2. 处理每个题目
        const questions = document.querySelectorAll('.question-item');
        for (let i = 0; i < questions.length; i++) {
            const questionElement = questions[i];
            const questionId = questionElement.dataset.questionId;
            
            if (!questionId) {
                // 新题目，需要保存
                await saveNewQuestion(questionElement);
            } else {
                // 现有题目，检查是否需要更新
                const currentQuestion = currentState.questions[i];
                const lastQuestion = lastSavedState.questions[i];
                
                if (lastQuestion && (
                    currentQuestion.content !== lastQuestion.content ||
                    JSON.stringify(currentQuestion.options) !== JSON.stringify(lastQuestion.options)
                )) {
                    await updateExistingQuestion(questionElement);
                }
            }
        }
        
        // 更新保存状态
        lastSavedState = getCurrentPageState();
        console.log('自动保存完成');
        
    } catch (error) {
        console.error('自动保存时发生错误:', error);
    } finally {
        isAutoSaving = false;
    }
}

/**
 * 启动自动保存
 */
function startAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }
    
    autoSaveTimer = setInterval(() => {
        performAutoSave();
    }, AUTO_SAVE_INTERVAL);
    
    console.log('自动保存已启动，间隔:', AUTO_SAVE_INTERVAL, 'ms');
}

/**
 * 停止自动保存
 */
function stopAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
        console.log('自动保存已停止');
    }
}

/**
 * 删除题目
 * @param {HTMLElement} button - 删除按钮
 */
function deleteQuestion(button) {
    const questionElement = button.closest('.question-item');
    const questionId = questionElement.dataset.questionId;
    
    // 如果有题目ID，需要从后端删除
    if (questionId) {
        if (confirm('确定要删除这个题目吗？删除后无法恢复。')) {
            // 从后端删除题目
            deleteQuestionFromBackend(questionId).then(() => {
                // 删除成功后从页面移除
                questionElement.remove();
                updateQuestionCount();
                updateEstimatedTime();
                updateQuestionNumbers();
            }).catch(error => {
                console.error('删除题目失败:', error);
                alert('删除题目失败，请重试');
            });
        }
    } else {
        // 新题目，直接从页面移除
        questionElement.remove();
        updateQuestionCount();
        updateEstimatedTime();
        updateQuestionNumbers();
    }
}

/**
 * 从后端删除题目
 * @param {number} questionId - 题目ID
 * @returns {Promise}
 */
async function deleteQuestionFromBackend(questionId) {
    try {
        const response = await fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTION_DELETE}/${questionId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.code === 200) {
            console.log('题目删除成功');
            return result;
        } else {
            throw new Error(result.message || '删除失败');
        }
    } catch (error) {
        console.error('删除题目时发生错误:', error);
        throw error;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    checkUserLoginStatus();
    
    // 延迟加载问卷信息，确保URL完全加载
    setTimeout(() => {
        loadQuestionnaireInfo();
    }, 100);

    // 获取DOM元素
    const formatButtons = document.querySelectorAll('.format-btn');
    const questionContainer = document.getElementById('question-container');
    const questionCountElement = document.getElementById('question-count');
    const estimatedTimeElement = document.getElementById('estimated-time');
    
    // 为每个格式按钮添加点击事件
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            addQuestion(type);
        });
    });
    
    // 绑定操作按钮事件
    document.getElementById('save-draft')?.addEventListener('click', saveQuestionnaire);
    document.getElementById('preview-questionnaire')?.addEventListener('click', openPreview);
    document.getElementById('publish-questionnaire')?.addEventListener('click', saveQuestionnaire);
    
    // 添加问题函数
    function addQuestion(type) {
        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        questionElement.setAttribute('draggable', 'true');
        questionElement.setAttribute('data-type', type);
        questionElement.innerHTML = getQuestionTemplate(type);
        
        questionContainer.appendChild(questionElement);
        
        // 绑定事件
        attachQuestionEvents(questionElement, type);
        
        // 绑定拖拽事件
        attachDragEvents(questionElement);
        
        // 更新计数（填写人信息不算作问题）
        if (type !== 'user-info') {
            questionCount++;
        }
        updateQuestionCount();
        updateEstimatedTime();
        updateQuestionNumbers(); // 更新题目序号
        
        // 新题目会在下次自动保存时处理
        console.log('新题目已添加，将在下次自动保存时保存到后端');
    }
    
    // 保存问卷函数
    function saveQuestionnaire() {
        if (questionCount === 0) {
            alert('请至少添加一个问题！');
            return;
        }
        // 保存问卷时清除本地存储的问卷ID
        clearLocalQuestionnaireId();
        alert('问卷保存成功！');
    }
    
    // 打开预览函数
    function openPreview() {
        if (questionCount === 0) {
            alert('请至少添加一个问题！');
            return;
        }
        // 预览问卷时清除本地存储的问卷ID
        clearLocalQuestionnaireId();
        alert('预览功能开发中...');
    }
    
    // 初始化计数
    updateQuestionCount();
    updateEstimatedTime();
    updateQuestionNumbers(); // 初始化题目序号
    
    // 页面卸载时停止自动保存
    window.addEventListener('beforeunload', function() {
        stopAutoSave();
    });
    
    // 页面隐藏时停止自动保存，显示时重新启动
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoSave();
        } else if (questionnaireId) {
            startAutoSave();
        }
    });
    
    // 监听输入变化，触发自动保存检查
    setupInputChangeListeners();
});

/**
 * 设置输入变化监听器
 */
function setupInputChangeListeners() {
    // 使用事件委托监听所有输入变化
    document.addEventListener('input', function(e) {
        if (e.target.matches('.question-text, .option-text')) {
            // 输入变化时，延迟触发自动保存检查
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.inputChangeTimer);
                window.inputChangeTimer = setTimeout(() => {
                    performAutoSave();
                }, 2000); // 输入停止2秒后触发保存
            }
        }
    });
    
    // 监听选项的选中状态变化
    document.addEventListener('change', function(e) {
        if (e.target.matches('input[type="radio"], input[type="checkbox"]')) {
            // 选项状态变化时，延迟触发自动保存检查
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.optionChangeTimer);
                window.optionChangeTimer = setTimeout(() => {
                    performAutoSave();
                }, 1000); // 选项变化1秒后触发保存
            }
        }
    });
}