// 使用全局配置
// 问卷编辑器JavaScript

// 全局变量
let questionCount = 0;

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
                <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
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
                <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
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
                <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
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
                <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
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
                <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
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

    // 清除本地存储中的问卷ID，避免影响后续使用
    localStorage.removeItem('current_questionnaire_id');
    console.log('已清除本地存储中的问卷ID');

    console.log('问卷信息已加载:', questionnaire);
    
    // 加载问卷的题目信息
    loadQuestionnaireQuestions(questionnaire.id);
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
            questionContainer.appendChild(questionElement);
            questionCount++;
        }
    });
    
    console.log('题目显示完成，共显示', questionCount, '个题目');
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
    }
    
    // 保存问卷函数
    function saveQuestionnaire() {
        if (questionCount === 0) {
            alert('请至少添加一个问题！');
            return;
        }
        alert('问卷保存成功！');
    }
    
    // 打开预览函数
    function openPreview() {
        if (questionCount === 0) {
            alert('请至少添加一个问题！');
            return;
        }
        alert('预览功能开发中...');
    }
    
    // 初始化计数
    updateQuestionCount();
    updateEstimatedTime();
    updateQuestionNumbers(); // 初始化题目序号
});