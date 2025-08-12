// 使用全局配置
// 问卷编辑器JavaScript

// 全局变量
let questionCount = 0;
let autoSaveTimer = null;
let lastSavedState = null;
let isAutoSaving = false;
let questionnaireId = localStorage.getItem('current_questionnaire_id');
// 全局问题容器引用，供拖拽/排序使用
let questionContainer = null;

// 用户操作监控相关变量
let userActivityTimer = null;
let lastUserActivity = Date.now();
let hasUnsavedChanges = false;

// 自动保存配置
const USER_INACTIVITY_TIMEOUT = 30000; // 30秒无操作后自动保存
const AUTO_SAVE_ENABLED = true;

// 本地存储：按问卷维度维护 问题局部键 -> questionId 的映射
const LOCAL_STORAGE_KEYS = {
    questionIdMap: (qid) => `question_id_map_${qid}`
};

function getQuestionIdMap() {
    // 兜底：若全局 questionnaireId 还未初始化，尝试从本地再取一次
    if (!questionnaireId) {
        questionnaireId = localStorage.getItem('current_questionnaire_id');
    }
    const key = LOCAL_STORAGE_KEYS.questionIdMap(questionnaireId);
    return UTILS.getStorage(key) || {};
}

function setQuestionIdMap(map) {
    if (!questionnaireId) {
        questionnaireId = localStorage.getItem('current_questionnaire_id');
    }
    const key = LOCAL_STORAGE_KEYS.questionIdMap(questionnaireId);
    UTILS.setStorage(key, map || {});
}

function ensureLocalKey(questionElement) {
    if (!questionElement.dataset.localKey) {
        questionElement.dataset.localKey = `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }
    return questionElement.dataset.localKey;
}

function getStoredQuestionIdForElement(questionElement) {
    const localKey = ensureLocalKey(questionElement);
    const map = getQuestionIdMap();
    let id = map[localKey];
    // 自愈：若映射缺失，但 DOM 上已有 questionId，则回灌
    if (!id && questionElement.dataset.questionId) {
        id = parseInt(questionElement.dataset.questionId);
        if (id) {
            map[localKey] = id;
            setQuestionIdMap(map);
        }
    }
    return id;
}

function storeQuestionIdForElement(questionElement, id) {
    if (!id) return;
    // 使用稳定的本地键：qid_{id}，避免随机键导致刷新后找不到映射
    questionElement.dataset.localKey = `qid_${id}`;
    const localKey = questionElement.dataset.localKey;
    const map = getQuestionIdMap();
    map[localKey] = id;
    setQuestionIdMap(map);
    questionElement.dataset.questionId = id;
}

function removeStoredQuestionIdForElement(questionElement) {
    const localKey = questionElement.dataset.localKey;
    if (!localKey) return;
    const map = getQuestionIdMap();
    if (map[localKey]) {
        delete map[localKey];
        setQuestionIdMap(map);
    }
}

// 题目类型保存处理器
const QuestionTypeHandler = {
    // 单选题保存（包含默认项）
    singleChoice: async function(questionId, questionElement) {
        const options = this.collectSingleOptions(questionElement);
        return await UTILS.saveQuestionByType('single', questionId, { options });
    },

    // 多选题保存（不包含默认项）
    multipleChoice: async function(questionId, questionElement) {
        const options = this.collectMultipleOptions(questionElement);
        return await UTILS.saveQuestionByType('multiple', questionId, { options });
    },

    // 问答题保存
    text: async function(questionId, questionType, questionElement) {
        const config = this.collectTextConfig(questionElement);
        return await UTILS.saveQuestionByType(questionType, questionId, config);
    },

    // 评分题保存
    rating: async function(questionId, questionType, questionElement) {
        const config = this.collectRatingConfig(questionElement);
        return await UTILS.saveQuestionByType(questionType, questionId, config);
    },

    // 矩阵题保存
    matrix: async function(questionId, questionType, questionElement) {
        const config = this.collectMatrixConfig(questionElement);
        return await UTILS.saveQuestionByType(questionType, questionId, config);
    },

    // 收集单选题选项（识别默认项）
    collectSingleOptions: function(questionElement) {
        const options = [];
        const optionElements = questionElement.querySelectorAll('.option-item');
        optionElements.forEach((optionElement, index) => {
            const optionText = optionElement.querySelector('.option-text')?.value || '';
            const radio = optionElement.querySelector('input[type="radio"]');
            if (optionText.trim()) {
                options.push({
                    optionContent: optionText.trim(),
                    sortNum: index + 1,
                    isDefault: radio && radio.checked ? 1 : 0
                });
            }
        });
        return options;
    },

    // 收集多选题选项（不设置默认项）
    collectMultipleOptions: function(questionElement) {
        const options = [];
        const optionElements = questionElement.querySelectorAll('.option-item');
        optionElements.forEach((optionElement, index) => {
            const optionText = optionElement.querySelector('.option-text')?.value || '';
            if (optionText.trim()) {
                options.push({
                    optionContent: optionText.trim(),
                    sortNum: index + 1
                });
            }
        });
        return options;
    },

    // 收集问答题配置
    collectTextConfig: function(questionElement) {
        const inputTypeRaw = (questionElement.querySelector('.input-type')?.value || 'single');
        const inputType = inputTypeRaw === 'multiline' ? 2 : 1; // 1=单行，2=多行
        return {
            hintText: questionElement.querySelector('.hint-text')?.value || '',
            maxLength: parseInt(questionElement.querySelector('.max-length')?.value) || 500,
            inputType
        };
    },

    // 收集评分题配置
    collectRatingConfig: function(questionElement) {
        return {
            minScore: parseInt(questionElement.querySelector('.min-score')?.value) || 1,
            maxScore: parseInt(questionElement.querySelector('.max-score')?.value) || 5,
            minLabel: questionElement.querySelector('.min-label')?.value || '非常不满意',
            maxLabel: questionElement.querySelector('.max-label')?.value || '非常满意',
            step: parseInt(questionElement.querySelector('.rating-step')?.value) || 1
        };
    },

    // 收集矩阵题配置
    collectMatrixConfig: function(questionElement) {
        const rows = [];
        const columns = [];
        
            // 收集行数据
    const rowElements = questionElement.querySelectorAll('.row-item');
    rowElements.forEach((rowElement, index) => {
        const rowText = rowElement.querySelector('.row-text')?.value || '';
        if (rowText.trim()) {
            rows.push({
                rowContent: rowText,
                sortNum: index + 1
            });
        }
    });

    // 收集列数据
    const columnElements = questionElement.querySelectorAll('.column-item');
    columnElements.forEach((columnElement, index) => {
        const columnText = columnElement.querySelector('.column-text')?.value || '';
        if (columnText.trim()) {
            columns.push({
                columnContent: columnText,
                sortNum: index + 1
            });
        }
    });

        return { rows, columns, subQuestionType: 1 };
    }
};

// 用户操作监控函数
function resetUserActivityTimer() {
    lastUserActivity = Date.now();
    hasUnsavedChanges = true;
    
    // 清除之前的定时器
    if (userActivityTimer) {
        clearTimeout(userActivityTimer);
    }
    
    // 设置新的定时器，在用户停止操作30秒后自动保存
    userActivityTimer = setTimeout(() => {
        if (hasUnsavedChanges && !isAutoSaving) {
            console.log('用户30秒无操作，触发自动保存...');
            performAutoSave();
        }
    }, USER_INACTIVITY_TIMEOUT);
    
    // 立即更新状态显示
    updateAutoSaveStatus();
}

// 绑定用户操作事件
function bindUserActivityEvents() {
    const events = [
        'input', 'change', 'keydown', 'keyup', 'click', 'mousedown', 'mouseup',
        'dragstart', 'dragend', 'drop', 'paste', 'cut', 'focus', 'blur'
    ];
    
    events.forEach(eventType => {
        document.addEventListener(eventType, (e) => {
            // 排除一些不需要触发保存的事件
            if (e.target.tagName === 'BUTTON' && e.target.classList.contains('delete-question')) {
                return; // 删除按钮不触发保存
            }
            if (e.target.tagName === 'BUTTON' && e.target.classList.contains('btn-delete-option')) {
                return; // 删除选项按钮不触发保存
            }
            if (e.target.tagName === 'BUTTON' && e.target.classList.contains('add-option-btn')) {
                return; // 添加选项按钮不触发保存
            }
            if (e.target.tagName === 'BUTTON' && e.target.classList.contains('drag-handle')) {
                return; // 拖拽手柄不触发保存
            }
            
            // 检查是否是有效的用户操作
            if (isValidUserActivity(e)) {
                resetUserActivityTimer();
            }
        }, true);
    });
    
    console.log('用户操作监控已启动，30秒无操作将自动保存');
}

// 检查是否是有效的用户操作
function isValidUserActivity(event) {
    const target = event.target;
    
    // 检查是否在问卷编辑区域内
    const isInEditor = target.closest('.main-content') || 
                      target.closest('.question-item') || 
                      target.closest('.questionnaire-info');
    
    if (!isInEditor) {
        return false;
    }
    
    // 检查是否是内容编辑相关的操作
    const isContentEdit = target.classList.contains('question-text') ||
                         target.classList.contains('option-text') ||
                         target.classList.contains('questionnaire-title') ||
                         target.classList.contains('questionnaire-description') ||
                         target.tagName === 'TEXTAREA' ||
                         target.tagName === 'INPUT';
    
    // 检查是否是拖拽操作
    const isDragOperation = event.type.includes('drag') || event.type.includes('drop');
    
    // 检查是否是键盘输入
    const isKeyboardInput = event.type.includes('key') && 
                           (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
    
    return isContentEdit || isDragOperation || isKeyboardInput;
}

// 手动触发保存（用于页面卸载等场景）
function triggerManualSave() {
    if (hasUnsavedChanges && !isAutoSaving) {
        console.log('手动触发保存...');
        performAutoSave();
    }
}

// 页面卸载前保存
window.addEventListener('beforeunload', function(e) {
    if (hasUnsavedChanges) {
        // 尝试同步保存（如果可能）
        try {
            // 这里可以添加同步保存逻辑，但通常异步保存无法在beforeunload中完成
            console.log('页面即将卸载，有未保存的更改');
        } catch (error) {
            console.error('页面卸载保存失败:', error);
        }
    }
});

// 页面可见性变化时保存
document.addEventListener('visibilitychange', function() {
    if (document.hidden && hasUnsavedChanges) {
        console.log('页面隐藏，触发保存...');
        triggerManualSave();
    }
});

// 更新自动保存状态显示
function updateAutoSaveStatus() {
    const statusElement = document.getElementById('auto-save-status');
    if (!statusElement) return;
    
    if (isAutoSaving) {
        statusElement.textContent = '正在保存...';
        statusElement.className = 'auto-save-status saving';
    } else if (hasUnsavedChanges) {
        const timeSinceLastActivity = Date.now() - lastUserActivity;
        const remainingTime = Math.max(0, USER_INACTIVITY_TIMEOUT - timeSinceLastActivity);
        const seconds = Math.ceil(remainingTime / 1000);
        statusElement.textContent = `${seconds}秒后自动保存`;
        statusElement.className = 'auto-save-status pending';
    } else {
        statusElement.textContent = '已保存';
        statusElement.className = 'auto-save-status saved';
    }
}

// 定期更新状态显示
setInterval(updateAutoSaveStatus, 1000);

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
                    <button type="button" class="btn-delete-option" title="删除选项" onclick="deleteOption(this)">
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
                    <button type="button" class="btn-delete-option" title="删除选项" onclick="deleteOption(this)">
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
                    <button type="button" class="btn-delete-option" title="删除选项" onclick="deleteOption(this)">
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
                    <button type="button" class="btn-delete-option" title="删除选项" onclick="deleteOption(this)">
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
                <input type="number" class="rating-step" value="1" min="1" max="5" step="1">
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
                        <button type="button" class="btn-delete-row" onclick="deleteMatrixRow(this)">删除</button>
                    </div>
                    <div class="row-item">
                        <input type="text" class="row-text" placeholder="行2">
                        <button type="button" class="btn-delete-row" onclick="deleteMatrixRow(this)">删除</button>
                    </div>
                </div>
                <button type="button" class="add-row-btn" onclick="addMatrixRow(this)">
                    <i class="iconfont icon-add"></i> 添加行
                </button>
            </div>
            <div class="matrix-columns">
                <h4>列标题</h4>
                <div class="column-list">
                    <div class="column-item">
                        <input type="text" class="column-text" placeholder="列1">
                        <button type="button" class="btn-delete-column" onclick="deleteMatrixColumn(this)">删除</button>
                    </div>
                    <div class="column-item">
                        <input type="text" class="column-text" placeholder="列2">
                        <button type="button" class="btn-delete-column" onclick="deleteMatrixColumn(this)">删除</button>
                    </div>
                </div>
                <button type="button" class="add-column-btn" onclick="addMatrixColumn(this)">
                    <i class="iconfont icon-add"></i> 添加列
                </button>
            </div>

        </div>
        <div class="matrix-preview">
            <h4>矩阵预览</h4>
            <div class="matrix-table-container">
                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th class="matrix-header-cell">问题</th>
                            <th class="matrix-header-cell">选项1</th>
                            <th class="matrix-header-cell">选项2</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="matrix-row-header">行1</td>
                            <td class="matrix-cell">
                                <input type="radio" name="matrix_row_1" value="1">
                            </td>
                            <td class="matrix-cell">
                                <input type="radio" name="matrix_row_1" value="2">
                            </td>
                        </tr>
                        <tr>
                            <td class="matrix-row-header">行2</td>
                            <td class="matrix-cell">
                                <input type="radio" name="matrix_row_2" value="1">
                            </td>
                            <td class="matrix-cell">
                                <input type="radio" name="matrix_row_2" value="2">
                            </td>
                        </tr>
                    </tbody>
                </table>
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

    // 为所有题型绑定通用的输入变化事件
    attachInputChangeEvents(questionElement);
}

// 为题目绑定输入变化事件
function attachInputChangeEvents(questionElement) {
    console.log('为题目绑定输入变化事件:', questionElement);
    
    // 监听问题文本变化
    const questionText = questionElement.querySelector('.question-text');
    if (questionText) {
        questionText.addEventListener('input', function() {
            console.log('问题文本变化:', this.value);
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.questionTextTimer);
                window.questionTextTimer = setTimeout(() => {
                    console.log('触发问题文本自动保存');
                    performAutoSave();
                }, 2000);
            }
        });
    }
    
    // 监听问答题设置变化
    const hintText = questionElement.querySelector('.hint-text');
    if (hintText) {
        hintText.addEventListener('input', function() {
            console.log('提示文字变化:', this.value);
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.hintTextTimer);
                window.hintTextTimer = setTimeout(() => {
                    console.log('触发提示文字自动保存');
                    performAutoSave();
                }, 2000);
            }
        });
    }
    
    const maxLength = questionElement.querySelector('.max-length');
    if (maxLength) {
        maxLength.addEventListener('input', function() {
            console.log('最大字数变化:', this.value);
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.maxLengthTimer);
                window.maxLengthTimer = setTimeout(() => {
                    console.log('触发最大字数自动保存');
                    performAutoSave();
                }, 2000);
            }
        });
    }
    
    const inputType = questionElement.querySelector('.input-type');
    if (inputType) {
        inputType.addEventListener('change', function() {
            console.log('输入类型变化:', this.value);
            if (AUTO_SAVE_ENABLED) {
                setTimeout(() => {
                    console.log('触发输入类型自动保存');
                    performAutoSave();
                }, 1000);
            }
        });
    }
    
    // 监听评分题设置变化
    const minScore = questionElement.querySelector('.min-score');
    if (minScore) {
        minScore.addEventListener('input', function() {
            console.log('最低分变化:', this.value);
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.minScoreTimer);
                window.minScoreTimer = setTimeout(() => {
                    console.log('触发最低分自动保存');
                    performAutoSave();
                }, 2000);
            }
        });
    }
    
    const maxScore = questionElement.querySelector('.max-score');
    if (maxScore) {
        maxScore.addEventListener('input', function() {
            console.log('最高分变化:', this.value);
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.maxScoreTimer);
                window.maxScoreTimer = setTimeout(() => {
                    console.log('触发最高分自动保存');
                    performAutoSave();
                }, 2000);
            }
        });
    }
    
    const minLabel = questionElement.querySelector('.min-label');
    if (minLabel) {
        minLabel.addEventListener('input', function() {
            console.log('最低分标签变化:', this.value);
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.minLabelTimer);
                window.minLabelTimer = setTimeout(() => {
                    console.log('触发最低分标签自动保存');
                    performAutoSave();
                }, 2000);
            }
        });
    }
    
    const maxLabel = questionElement.querySelector('.max-label');
    if (maxLabel) {
        maxLabel.addEventListener('input', function() {
            console.log('最高分标签变化:', this.value);
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.maxLabelTimer);
                window.maxLabelTimer = setTimeout(() => {
                    console.log('触发最高分标签自动保存');
                    performAutoSave();
                }, 2000);
            }
        });
    }
    
    const ratingStep = questionElement.querySelector('.rating-step');
    if (ratingStep) {
        ratingStep.addEventListener('input', function() {
            console.log('评分步长变化:', this.value);
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.ratingStepTimer);
                window.ratingStepTimer = setTimeout(() => {
                    console.log('触发评分步长自动保存');
                    performAutoSave();
                }, 2000);
            }
        });
    }
    
    // 监听矩阵题设置变化
    const rowTexts = questionElement.querySelectorAll('.row-text');
    rowTexts.forEach((rowText, index) => {
        rowText.addEventListener('input', function() {
            console.log(`矩阵行${index + 1}变化:`, this.value);
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.matrixRowTimer);
                window.matrixRowTimer = setTimeout(() => {
                    console.log('触发矩阵行自动保存');
                    performAutoSave();
                }, 2000);
            }
        });
    });
    
    const columnTexts = questionElement.querySelectorAll('.column-text');
    columnTexts.forEach((columnText, index) => {
        columnText.addEventListener('input', function() {
            console.log(`矩阵列${index + 1}变化:`, this.value);
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.matrixColumnTimer);
                window.matrixColumnTimer = setTimeout(() => {
                    console.log('触发矩阵列自动保存');
                    performAutoSave();
                }, 2000);
            }
        });
    });
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
    questionnaireId = localStorage.getItem('current_questionnaire_id');

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
                // 将URL中的问卷ID保存到本地存储，避免后续重复获取
                localStorage.setItem('current_questionnaire_id', questionnaireId);
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
                // 将URL中的问卷ID保存到本地存储，避免后续重复获取
                localStorage.setItem('current_questionnaire_id', questionnaireId);
            }
        }
    }
    
    // 更新全局变量
    window.questionnaireId = questionnaireId;

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
            // 为后续映射设置稳定的本地键（以后端ID为基准）
            questionElement.dataset.localKey = `qid_${question.id}`;
            // 回灌本地映射，确保刷新后依旧能定位到 questionId
            try { storeQuestionIdForElement(questionElement, question.id); } catch (e) { console.warn('本地映射写入失败:', e); }
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
        
        // 为新添加的选项按钮绑定事件
        const addOptionBtn = questionElement.querySelector('.add-option-btn');
        if (addOptionBtn) {
            addOptionBtn.addEventListener('click', function() {
                const inputType = questionTypeName === 'single' ? 'radio' : 'checkbox';
                addOption(this, inputType);
            });
        }
    }
    
    // 如果是问答题，加载问答题配置
    if (questionTypeName === 'text') {
        loadTextQuestionConfig(questionElement, question);
    }
    
    // 如果是评分题，加载评分题配置
    if (questionTypeName === 'rating') {
        loadRatingQuestionConfig(questionElement, question);
    }
    
    // 如果是矩阵题，加载行列数据
    if (questionTypeName === 'matrix') {
        loadMatrixQuestionData(questionElement, question);
        
        // 为新添加的行列按钮绑定事件
        const addRowBtn = questionElement.querySelector('.add-row-btn');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', function() {
                addMatrixRow(this);
            });
        }
        
        const addColumnBtn = questionElement.querySelector('.add-column-btn');
        if (addColumnBtn) {
            addColumnBtn.addEventListener('click', function() {
                addMatrixColumn(this);
            });
        }
        
        // 初始化矩阵预览
        updateMatrixPreview(questionElement);
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
                <button type="button" class="btn-delete-option" title="删除选项" onclick="deleteOption(this)">
                    <i class="iconfont icon-delete"></i>
                </button>
            </div>
        `;
        
        optionsContainer.appendChild(optionElement);
        
        // 绑定选项事件
        bindOptionEvents(optionElement);
    });
    
    console.log('选项加载完成，共加载', question.options.length, '个选项');
}

/**
 * 加载矩阵题行列数据
 */
function loadMatrixQuestionData(questionElement, question) {
    console.log('加载矩阵题行列数据:', question);
    
    // 加载行数据
    if (question.matrixQuestionConfig && question.matrixQuestionConfig.rows && question.matrixQuestionConfig.rows.length > 0) {
        const rowList = questionElement.querySelector('.row-list');
        if (rowList) {
            // 清空现有行
            rowList.innerHTML = '';
            
            question.matrixQuestionConfig.rows.forEach((row, index) => {
                const rowElement = document.createElement('div');
                rowElement.className = 'row-item';
                rowElement.innerHTML = `
                    <input type="text" class="row-text" value="${row.rowContent || row.text || ''}" placeholder="行${index + 1}">
                    <button type="button" class="btn-delete-row" onclick="deleteMatrixRow(this)">删除</button>
                `;
                rowList.appendChild(rowElement);
                bindMatrixRowEvents(rowElement);
            });
        }
    }
    
    // 加载列数据
    if (question.matrixQuestionConfig && question.matrixQuestionConfig.columns && question.matrixQuestionConfig.columns.length > 0) {
        const columnList = questionElement.querySelector('.column-list');
        if (columnList) {
            // 清空现有列
            columnList.innerHTML = '';
            
            question.matrixQuestionConfig.columns.forEach((column, index) => {
                const columnElement = document.createElement('div');
                columnElement.className = 'column-item';
                columnElement.innerHTML = `
                    <input type="text" class="column-text" value="${column.columnContent || column.text || ''}" placeholder="列${index + 1}">
                    <button type="button" class="btn-delete-column" onclick="deleteMatrixColumn(this)">删除</button>
                `;
                columnList.appendChild(columnElement);
                bindMatrixColumnEvents(columnElement);
            });
        }
    }
    
    // 加载矩阵题配置数据
    loadMatrixQuestionConfig(questionElement, question);
    
    console.log('矩阵题行列数据加载完成');
}

// 添加选项函数
function addOption(button, inputType) {
    // 修复容器查找逻辑：从按钮向上查找，找到选项容器
    const questionItem = button.closest('.question-item');
    const optionsContainer = questionItem.querySelector('.options-container');
    
    if (!optionsContainer) {
        console.error('找不到选项容器');
        return;
    }
    
    const optionCount = optionsContainer.children.length + 1;
    // 修复name属性，确保单选和多选有不同的name
    const questionId = questionItem.dataset.questionId || Date.now();
    const name = inputType === 'radio' ? `single_${questionId}` : `multiple_${questionId}`;
    
    const optionElement = document.createElement('div');
    optionElement.className = 'option-item';
    optionElement.innerHTML = `
        <div class="option-content">
            <input type="${inputType}" name="${name}" value="${optionCount}">
            <input type="text" placeholder="选项${optionCount}" class="option-text">
        </div>
        <div class="option-actions">
            <button type="button" class="btn-edit-option" title="编辑选项">
                <i class="iconfont icon-edit"></i>
            </button>
            <button type="button" class="btn-delete-option" title="删除选项" onclick="deleteOption(this)">
                <i class="iconfont icon-delete"></i>
            </button>
        </div>
    `;
    
    optionsContainer.appendChild(optionElement);
    
    // 绑定新选项的事件
    bindOptionEvents(optionElement);
    
    // 更新题目序号
    updateQuestionNumbers();
    
    // 触发自动保存检查
    if (AUTO_SAVE_ENABLED) {
        setTimeout(() => {
            performAutoSave();
        }, 1000);
    }
    
    console.log(`成功添加${inputType === 'radio' ? '单选' : '多选'}选项，当前选项数量:`, optionCount);
}

// 删除选项函数
function deleteOption(button) {
    const optionElement = button.closest('.option-item');
    if (optionElement) {
        // 检查是否至少保留2个选项
        const optionsContainer = optionElement.parentElement;
        if (optionsContainer.children.length > 2) {
            optionElement.remove();
            
            // 重新编号选项
            renumberOptions(optionsContainer);
            
            // 更新题目序号
            updateQuestionNumbers();
            
            // 触发自动保存检查
            if (AUTO_SAVE_ENABLED) {
                setTimeout(() => {
                    performAutoSave();
                }, 1000);
            }
            
            console.log('选项删除成功，当前选项数量:', optionsContainer.children.length);
        } else {
            alert('至少需要保留2个选项');
        }
    }
}

// 添加矩阵行
function addMatrixRow(button) {
    const questionItem = button.closest('.question-item');
    const rowList = questionItem.querySelector('.row-list');
    
    if (!rowList) {
        console.error('找不到行列表容器');
        return;
    }
    
    const rowCount = rowList.children.length + 1;
    
    const rowElement = document.createElement('div');
    rowElement.className = 'row-item';
    rowElement.innerHTML = `
        <input type="text" class="row-text" placeholder="行${rowCount}">
        <button type="button" class="btn-delete-row" onclick="deleteMatrixRow(this)">删除</button>
    `;
    
    rowList.appendChild(rowElement);
    
    // 绑定新行的事件
    bindMatrixRowEvents(rowElement);
    
    // 更新矩阵预览
    updateMatrixPreview(questionItem);
    
    // 更新题目序号
    updateQuestionNumbers();
    
    // 触发自动保存检查
    if (AUTO_SAVE_ENABLED) {
        setTimeout(() => {
            performAutoSave();
        }, 1000);
    }
    
    console.log(`成功添加矩阵行，当前行数量:`, rowCount);
}

// 删除矩阵行
function deleteMatrixRow(button) {
    const rowElement = button.closest('.row-item');
    const questionItem = rowElement.closest('.question-item');
    const rowList = questionItem.querySelector('.row-list');
    
    // 检查是否至少保留2行
    if (rowList.children.length > 2) {
        rowElement.remove();
        
        // 重新编号行
        renumberMatrixRows(rowList);
        
        // 更新矩阵预览
        updateMatrixPreview(questionItem);
        
        // 更新题目序号
        updateQuestionNumbers();
        
        // 触发自动保存检查
        if (AUTO_SAVE_ENABLED) {
            setTimeout(() => {
                performAutoSave();
            }, 1000);
        }
        
        console.log('矩阵行删除成功，当前行数量:', rowList.children.length);
    } else {
        alert('至少需要保留2行');
    }
}

// 添加矩阵列
function addMatrixColumn(button) {
    const questionItem = button.closest('.question-item');
    const columnList = questionItem.querySelector('.column-list');
    
    if (!columnList) {
        console.error('找不到列列表容器');
        return;
    }
    
    const columnCount = columnList.children.length + 1;
    
    const columnElement = document.createElement('div');
    columnElement.className = 'column-item';
    columnElement.innerHTML = `
        <input type="text" class="column-text" placeholder="列${columnCount}">
        <button type="button" class="btn-delete-column" onclick="deleteMatrixColumn(this)">删除</button>
    `;
    
    columnList.appendChild(columnElement);
    
    // 绑定新列的事件
    bindMatrixColumnEvents(columnElement);
    
    // 更新矩阵预览
    updateMatrixPreview(questionItem);
    
    // 更新题目序号
    updateQuestionNumbers();
    
    // 触发自动保存检查
    if (AUTO_SAVE_ENABLED) {
        setTimeout(() => {
            performAutoSave();
        }, 1000);
    }
    
    console.log(`成功添加矩阵列，当前列数量:`, columnCount);
}

// 删除矩阵列
function deleteMatrixColumn(button) {
    const columnElement = button.closest('.column-item');
    const questionItem = columnElement.closest('.question-item');
    const columnList = questionItem.querySelector('.column-list');
    
    // 检查是否至少保留2列
    if (columnList.children.length > 2) {
        columnElement.remove();
        
        // 重新编号列
        renumberMatrixColumns(columnList);
        
        // 更新矩阵预览
        updateMatrixPreview(questionItem);
        
        // 更新题目序号
        updateQuestionNumbers();
        
        // 触发自动保存检查
        if (AUTO_SAVE_ENABLED) {
            setTimeout(() => {
                performAutoSave();
            }, 1000);
        }
        
        console.log('矩阵列删除成功，当前列数量:', columnList.children.length);
    } else {
        alert('至少需要保留2列');
    }
}

// 重新编号选项
function renumberOptions(optionsContainer) {
    const optionElements = optionsContainer.querySelectorAll('.option-item');
    optionElements.forEach((optionElement, index) => {
        const optionText = optionElement.querySelector('.option-text');
        if (optionText) {
            optionText.placeholder = `选项${index + 1}`;
        }
        
        const input = optionElement.querySelector('input[type="radio"], input[type="checkbox"]');
        if (input) {
            input.value = index + 1;
        }
    });
    
    console.log('选项重新编号完成，共', optionElements.length, '个选项');
}

// 重新编号矩阵行
function renumberMatrixRows(rowList) {
    const rowElements = rowList.querySelectorAll('.row-item');
    rowElements.forEach((rowElement, index) => {
        const rowText = rowElement.querySelector('.row-text');
        if (rowText) {
            rowText.placeholder = `行${index + 1}`;
        }
    });
    
    console.log('矩阵行重新编号完成，共', rowElements.length, '行');
}

// 重新编号矩阵列
function renumberMatrixColumns(columnList) {
    const columnElements = columnList.querySelectorAll('.column-item');
    columnElements.forEach((columnElement, index) => {
        const columnText = columnElement.querySelector('.column-text');
        if (columnText) {
            columnText.placeholder = `列${index + 1}`;
        }
    });
    
    console.log('矩阵列重新编号完成，共', columnElements.length, '列');
}

// 绑定矩阵行事件
function bindMatrixRowEvents(rowElement) {
    const rowText = rowElement.querySelector('.row-text');
    if (rowText) {
        rowText.addEventListener('input', function() {
            // 更新矩阵预览
            const questionItem = rowElement.closest('.question-item');
            if (questionItem) {
                updateMatrixPreview(questionItem);
            }
            
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.matrixRowInputTimer);
                window.matrixRowInputTimer = setTimeout(() => {
                    performAutoSave();
                }, 2000);
            }
        });
    }
}

// 绑定矩阵列事件
function bindMatrixColumnEvents(columnElement) {
    const columnText = columnElement.querySelector('.column-text');
    if (columnText) {
        columnText.addEventListener('input', function() {
            // 更新矩阵预览
            const questionItem = columnElement.closest('.question-item');
            if (questionItem) {
                updateMatrixPreview(questionItem);
            }
            
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.matrixColumnInputTimer);
                window.matrixColumnInputTimer = setTimeout(() => {
                    performAutoSave();
                }, 2000);
            }
        });
    }
}

// 绑定选项事件
function bindOptionEvents(optionElement) {
    console.log('绑定选项事件:', optionElement); // 添加调试日志
    
    // 绑定选项文本输入事件
    const optionText = optionElement.querySelector('.option-text');
    if (optionText) {
        // 移除之前的事件监听器（避免重复绑定）
        optionText.removeEventListener('input', optionText._inputHandler);
        
        // 创建新的事件处理函数
        optionText._inputHandler = function() {
            console.log('选项文本输入变化:', this.value); // 添加调试日志
            // 输入变化时触发自动保存检查
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.optionInputTimer);
                window.optionInputTimer = setTimeout(() => {
                    console.log('触发选项文本自动保存'); // 添加调试日志
                    performAutoSave();
                }, 2000);
            }
        };
        
        // 绑定事件
        optionText.addEventListener('input', optionText._inputHandler);
        console.log('选项文本输入事件绑定成功'); // 添加调试日志
    }
    
    // 绑定选项选中状态变化事件
    const input = optionElement.querySelector('input[type="radio"], input[type="checkbox"]');
    if (input) {
        // 移除之前的事件监听器（避免重复绑定）
        input.removeEventListener('change', input._changeHandler);
        
        // 创建新的事件处理函数
        input._changeHandler = function() {
            console.log('选项选中状态变化:', this.checked); // 添加调试日志
            // 选项状态变化时触发自动保存检查
            if (AUTO_SAVE_ENABLED) {
                setTimeout(() => {
                    console.log('触发选项状态自动保存'); // 添加调试日志
                    performAutoSave();
                }, 1000);
            }
        };
        
        // 绑定事件
        input.addEventListener('change', input._changeHandler);
        console.log('选项状态变化事件绑定成功'); // 添加调试日志
    }
}

// 更新问题计数
function updateQuestionCount() {
    const questions = document.querySelectorAll('.question-item');
    // 排除填写人信息卡片
    const actualQuestions = Array.from(questions).filter(q => 
        q.getAttribute('data-type') !== 'user-info'
    );
    questionCount = actualQuestions.length;
    const questionCountElement = document.getElementById('question-count');
    if (questionCountElement) {
        questionCountElement.textContent = questionCount;
    }
}

// 更新预计时间
function updateEstimatedTime() {
    const baseTime = 2; // 基础时间2分钟
    const timePerQuestion = 0.5; // 每个问题0.5分钟
    const estimatedMinutes = Math.ceil(baseTime + questionCount * timePerQuestion);
    
    const estimatedTimeElement = document.getElementById('estimated-time');
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
    if (!questionItem) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
    // 统一以整块 question-item 为拖拽对象
    questionItem.classList.add('dragging');
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
        const container = questionContainer || (targetElement && targetElement.parentElement);
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
        const questionType = question.getAttribute('data-type');
        const questionData = {
            index: index,
            type: questionType,
            content: question.querySelector('.question-text')?.value || '',
            questionId: question.dataset.questionId || null,
            options: []
        };
        
        // 根据题目类型收集特定配置
        switch (questionType) {
            case 'single':
            case 'multiple':
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
                break;
                
            case 'text':
                // 收集问答题配置
                questionData.hintText = question.querySelector('.hint-text')?.value || '';
                questionData.maxLength = parseInt(question.querySelector('.max-length')?.value) || 500;
                questionData.inputType = question.querySelector('.input-type')?.value || 'single';
                break;
                
            case 'rating':
                // 收集评分题配置
                questionData.minScore = parseInt(question.querySelector('.min-score')?.value) || 1;
                questionData.maxScore = parseInt(question.querySelector('.max-score')?.value) || 5;
                questionData.minLabel = question.querySelector('.min-label')?.value || '非常不满意';
                questionData.maxLabel = question.querySelector('.max-label')?.value || '非常满意';
                questionData.step = parseInt(question.querySelector('.rating-step')?.value) || 1;
                break;
                
            case 'matrix':
                // 收集矩阵题配置
                questionData.rows = [];
                questionData.columns = [];
                
                const rowElements = question.querySelectorAll('.row-item');
                rowElements.forEach((rowElement, rowIndex) => {
                    const rowText = rowElement.querySelector('.row-text')?.value || '';
                    if (rowText.trim()) {
                        questionData.rows.push({
                            text: rowText.trim(),
                            order: rowIndex + 1
                        });
                    }
                });
                
                const columnElements = question.querySelectorAll('.column-item');
                columnElements.forEach((columnElement, columnIndex) => {
                    const columnText = columnElement.querySelector('.column-text')?.value || '';
                    if (columnText.trim()) {
                        questionData.columns.push({
                            text: columnText.trim(),
                            order: columnIndex + 1
                        });
                    }
                });
                break;
        }
        
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
    
    console.log('检查页面变化:', {
        current: currentState,
        last: lastSavedState
    });
    
    // 比较问题数量
    if (currentState.questionCount !== lastSavedState.questionCount) {
        console.log('问题数量变化:', currentState.questionCount, '->', lastSavedState.questionCount);
        return true;
    }
    
    // 比较每个问题的内容
    for (let i = 0; i < currentState.questions.length; i++) {
        const currentQuestion = currentState.questions[i];
        const lastQuestion = lastSavedState.questions[i];
        
        if (!lastQuestion) {
            console.log('新问题:', currentQuestion);
            return true; // 新问题
        }
        
        // 比较问题内容
        if (currentQuestion.content !== lastQuestion.content) {
            console.log('问题内容变化:', currentQuestion.content, '->', lastQuestion.content);
            return true;
        }
        
        // 比较选项（仅针对选择题）
        if (currentQuestion.type === 'single' || currentQuestion.type === 'multiple') {
            if (currentQuestion.options.length !== lastQuestion.options.length) {
                console.log('选项数量变化:', currentQuestion.options.length, '->', lastQuestion.options.length);
                return true;
            }
            
            for (let j = 0; j < currentQuestion.options.length; j++) {
                const currentOption = currentQuestion.options[j];
                const lastOption = lastQuestion.options[j];
                
                if (!lastOption) {
                    console.log('新选项:', currentOption);
                    return true; // 新选项
                }
                
                if (currentOption.content !== lastOption.content || 
                    currentOption.isDefault !== lastOption.isDefault) {
                    console.log('选项变化:', {
                        content: currentOption.content + ' -> ' + lastOption.content,
                        isDefault: currentOption.isDefault + ' -> ' + lastOption.isDefault
                    });
                    return true;
                }
            }
        }
        
        // 比较问答题配置
        if (currentQuestion.type === 'text') {
            if (currentQuestion.hintText !== lastQuestion.hintText ||
                currentQuestion.maxLength !== lastQuestion.maxLength ||
                currentQuestion.inputType !== lastQuestion.inputType) {
                console.log('问答题配置变化:', {
                    hintText: currentQuestion.hintText + ' -> ' + lastQuestion.hintText,
                    maxLength: currentQuestion.maxLength + ' -> ' + lastQuestion.maxLength,
                    inputType: currentQuestion.inputType + ' -> ' + lastQuestion.inputType
                });
                return true;
            }
        }
        
        // 比较评分题配置
        if (currentQuestion.type === 'rating') {
            if (currentQuestion.minScore !== lastQuestion.minScore ||
                currentQuestion.maxScore !== lastQuestion.maxScore ||
                currentQuestion.minLabel !== lastQuestion.minLabel ||
                currentQuestion.maxLabel !== lastQuestion.maxLabel ||
                currentQuestion.step !== lastQuestion.step) {
                console.log('评分题配置变化:', {
                    minScore: currentQuestion.minScore + ' -> ' + lastQuestion.minScore,
                    maxScore: currentQuestion.maxScore + ' -> ' + lastQuestion.maxScore,
                    minLabel: currentQuestion.minLabel + ' -> ' + lastQuestion.minLabel,
                    maxLabel: currentQuestion.maxLabel + ' -> ' + lastQuestion.maxLabel,
                    step: currentQuestion.step + ' -> ' + lastQuestion.step
                });
                return true;
            }
        }
        
        // 比较矩阵题配置
        if (currentQuestion.type === 'matrix') {
            // 比较行配置
            if (currentQuestion.rows.length !== lastQuestion.rows.length) {
                console.log('矩阵行数量变化:', currentQuestion.rows.length, '->', lastQuestion.rows.length);
                return true;
            }
            
            for (let j = 0; j < currentQuestion.rows.length; j++) {
                const currentRow = currentQuestion.rows[j];
                const lastRow = lastQuestion.rows[j];
                
                if (!lastRow || currentRow.text !== lastRow.text) {
                    console.log('矩阵行变化:', currentRow.text + ' -> ' + (lastRow ? lastRow.text : 'undefined'));
                    return true;
                }
            }
            
            // 比较列配置
            if (currentQuestion.columns.length !== lastQuestion.columns.length) {
                console.log('矩阵列数量变化:', currentQuestion.columns.length, '->', lastQuestion.columns.length);
                return true;
            }
            
            for (let j = 0; j < currentQuestion.columns.length; j++) {
                const currentColumn = currentQuestion.columns[j];
                const lastColumn = lastQuestion.columns[j];
                
                if (!lastColumn || currentColumn.text !== lastColumn.text) {
                    console.log('矩阵列变化:', currentColumn.text + ' -> ' + (lastColumn ? lastColumn.text : 'undefined'));
                    return true;
                }
            }
        }
    }
    
    console.log('页面没有变化');
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
// 合并保存：统一入口，自动判断新建或更新，仅处理题目本体；选项由 saveQuestionOptions 单独处理
async function saveOrUpdateQuestion(questionElement) {
    if (!questionnaireId) {
        console.warn('没有问卷ID，跳过新题目保存');
        return;
    }
    
    try {
        const questionType = questionElement.getAttribute('data-type');
        const questionTextEl = questionElement.querySelector('.question-text');
        const questionContent = questionTextEl?.value?.trim() || '';

        // 前置校验：问题内容必填
        if (!questionContent) {
            if (questionTextEl) {
                questionTextEl.focus();
                questionTextEl.placeholder = '请输入问题内容（必填）';
                questionTextEl.classList.add('input-error');
                setTimeout(() => questionTextEl.classList.remove('input-error'), 1500);
            }
            // console.warn('问题内容为空，已阻止保存');
            // return;
        }
        
        const questionTypeId = UTILS.getQuestionTypeId(questionType);
        // 以 dataset.questionId 为主，保证后端返回的数据优先
        const datasetId = questionElement.dataset.questionId ? parseInt(questionElement.dataset.questionId) : null;
        const localExistingId = getStoredQuestionIdForElement(questionElement) || datasetId;
        const isCreate = !localExistingId;

        if (isCreate) {
            const questionData = {
                id: null,
                questionnaireId: parseInt(questionnaireId),
                content: questionContent,
                questionType: questionTypeId,
                sortNum: Array.from(document.querySelectorAll('.question-item')).indexOf(questionElement) + 1,
                isRequired: 1,
                options: []
            };

            const resp = await fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTION_SAVE}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(questionData)
            });
            const result = await resp.json();
            if (resp.ok && result.code === 200 && result.data) {
                const savedQuestionId = result.data;
                storeQuestionIdForElement(questionElement, savedQuestionId);
                console.log('题目创建成功，ID:', savedQuestionId);
                return savedQuestionId;
            } else {
                throw new Error(result.message || '创建题目失败');
            }
        } else {
            const questionId = localExistingId || parseInt(questionElement.dataset.questionId);
            const questionData = { id: questionId, content: questionContent };
            const resp = await fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTION_UPDATE}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(questionData)
            });
            const result = await resp.json();
            if (resp.ok && result.code === 200) {
                storeQuestionIdForElement(questionElement, questionId);
                console.log('题目更新成功，ID:', questionId);
                return questionId;
            } else {
                throw new Error(result.message || '更新题目失败');
            }
        }
    } catch (error) {
        console.error('保存题目时发生错误:', error);
    }
}

/**
 * 更新现有题目
 * @param {HTMLElement} questionElement - 题目元素
 * @returns {Promise}
 */
// 仅保存题目选项（题目本体已由 saveOrUpdateQuestion 处理）
async function saveQuestionOptions(questionElement, questionTypeOverride) {
    const questionId = getStoredQuestionIdForElement(questionElement) || questionElement.dataset.questionId;
    if (!questionId) {
        console.warn('无题目ID，跳过选项保存');
        return;
    }
    const questionType = questionTypeOverride || questionElement.getAttribute('data-type');
    const typeCode = typeof questionType === 'number' ? UTILS.getQuestionTypeById(questionType) : questionType;

    try {
        if (typeCode === 'single') {
            await QuestionTypeHandler.singleChoice(parseInt(questionId), questionElement);
        } else if (typeCode === 'multiple') {
            await QuestionTypeHandler.multipleChoice(parseInt(questionId), questionElement);
        } else if (typeCode === 'text') {
            await QuestionTypeHandler.text(parseInt(questionId), typeCode, questionElement);
        } else if (typeCode === 'rating') {
            await QuestionTypeHandler.rating(parseInt(questionId), typeCode, questionElement);
        } else if (typeCode === 'matrix') {
            await QuestionTypeHandler.matrix(parseInt(questionId), typeCode, questionElement);
        }
        console.log('选项/配置保存成功，题目ID:', questionId);
    } catch (error) {
        console.error('保存选项/配置失败:', error);
    }
}

// 兼容旧逻辑：更新现有题目（仅用于手动触发场景）
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
            
            // 根据题目类型调用对应的保存处理器
            await saveQuestionOptions(questionElement, questionType);
            console.log(`${UTILS.getQuestionTypeName(questionType)}配置更新成功`);
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
            // 先保存/更新题目本体，获取/刷新 questionId 映射
            const savedId = await saveOrUpdateQuestion(questionElement);
            // 再保存题目配置/选项
            await saveQuestionOptions(questionElement);
        }
        
        // 更新保存状态
        lastSavedState = getCurrentPageState();
        hasUnsavedChanges = false;
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
    // 清除之前的定时器
    if (userActivityTimer) {
        clearTimeout(userActivityTimer);
    }
    
    // 绑定用户操作事件
    bindUserActivityEvents();
    
    // 初始化用户活动时间
    lastUserActivity = Date.now();
    hasUnsavedChanges = false;
    
    console.log('智能自动保存已启动，30秒无操作将自动保存');
}

/**
 * 停止自动保存
 */
function stopAutoSave() {
    if (userActivityTimer) {
        clearTimeout(userActivityTimer);
        userActivityTimer = null;
    }
    
    // 移除事件监听器（可选，因为页面卸载时会自动清理）
    console.log('智能自动保存已停止');
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
                removeStoredQuestionIdForElement(questionElement);
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
        removeStoredQuestionIdForElement(questionElement);
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
    // 赋值全局容器，供拖拽/排序使用
    questionContainer = document.getElementById('question-container');
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
    document.getElementById('publish-questionnaire')?.addEventListener('click', publishQuestionnaire);
    
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
        
        // 为选择题的现有选项绑定事件
        if (type === 'single' || type === 'multiple') {
            const optionElements = questionElement.querySelectorAll('.option-item');
            optionElements.forEach(optionElement => {
                bindOptionEvents(optionElement);
            });
            
            // 为新添加的选项按钮绑定事件
            const addOptionBtn = questionElement.querySelector('.add-option-btn');
            if (addOptionBtn) {
                addOptionBtn.addEventListener('click', function() {
                    const inputType = type === 'single' ? 'radio' : 'checkbox';
                    addOption(this, inputType);
                });
            }
        }
        
        // 为问答题绑定事件
        if (type === 'text') {
            // 绑定问答题配置变化事件
            const hintText = questionElement.querySelector('.hint-text');
            const maxLength = questionElement.querySelector('.max-length');
            const inputType = questionElement.querySelector('.input-type');
            
            if (hintText) {
                hintText.addEventListener('input', function() {
                    if (AUTO_SAVE_ENABLED) {
                        clearTimeout(window.hintTextTimer);
                        window.hintTextTimer = setTimeout(() => {
                            performAutoSave();
                        }, 2000);
                    }
                });
            }
            
            if (maxLength) {
                maxLength.addEventListener('input', function() {
                    if (AUTO_SAVE_ENABLED) {
                        clearTimeout(window.maxLengthTimer);
                        window.maxLengthTimer = setTimeout(() => {
                            performAutoSave();
                        }, 2000);
                    }
                });
            }
            
            if (inputType) {
                inputType.addEventListener('change', function() {
                    if (AUTO_SAVE_ENABLED) {
                        setTimeout(() => {
                            performAutoSave();
                        }, 1000);
                    }
                });
            }
        }
        
        // 为评分题绑定事件
        if (type === 'rating') {
            // 绑定评分题配置变化事件
            const minScore = questionElement.querySelector('.min-score');
            const maxScore = questionElement.querySelector('.max-score');
            const minLabel = questionElement.querySelector('.min-label');
            const maxLabel = questionElement.querySelector('.max-label');
            const ratingStep = questionElement.querySelector('.rating-step');
            
            if (minScore) {
                minScore.addEventListener('input', function() {
                    if (AUTO_SAVE_ENABLED) {
                        clearTimeout(window.minScoreTimer);
                        window.minScoreTimer = setTimeout(() => {
                            performAutoSave();
                        }, 2000);
                    }
                });
            }
            
            if (maxScore) {
                maxScore.addEventListener('input', function() {
                    if (AUTO_SAVE_ENABLED) {
                        clearTimeout(window.maxScoreTimer);
                        window.maxScoreTimer = setTimeout(() => {
                            performAutoSave();
                        }, 2000);
                    }
                });
            }
            
            if (minLabel) {
                minLabel.addEventListener('input', function() {
                    if (AUTO_SAVE_ENABLED) {
                        clearTimeout(window.minLabelTimer);
                        window.minLabelTimer = setTimeout(() => {
                            performAutoSave();
                        }, 2000);
                    }
                });
            }
            
            if (maxLabel) {
                maxLabel.addEventListener('input', function() {
                    if (AUTO_SAVE_ENABLED) {
                        clearTimeout(window.maxLabelTimer);
                        window.maxLabelTimer = setTimeout(() => {
                            performAutoSave();
                        }, 2000);
                    }
                });
            }
            
            if (ratingStep) {
                ratingStep.addEventListener('input', function() {
                    if (AUTO_SAVE_ENABLED) {
                        clearTimeout(window.ratingStepTimer);
                        window.ratingStepTimer = setTimeout(() => {
                            performAutoSave();
                        }, 2000);
                    }
                });
            }
        }
        
        // 为矩阵题的行列绑定事件
        if (type === 'matrix') {
            const rowElements = questionElement.querySelectorAll('.row-item');
            const columnElements = questionElement.querySelectorAll('.column-item');
            
            rowElements.forEach(rowElement => {
                bindMatrixRowEvents(rowElement);
            });
            
            columnElements.forEach(columnElement => {
                bindMatrixColumnEvents(columnElement);
            });
            
            // 为新添加的行列按钮绑定事件
            const addRowBtn = questionElement.querySelector('.add-row-btn');
            if (addRowBtn) {
                addRowBtn.addEventListener('click', function() {
                    addMatrixRow(this);
                });
            }
            
            const addColumnBtn = questionElement.querySelector('.add-column-btn');
            if (addColumnBtn) {
                addColumnBtn.addEventListener('click', function() {
                    addMatrixColumn(this);
                });
            }
        }
        
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
        console.log('=== 开始预览功能 ===');
        console.log('当前问题数量:', questionCount);
        console.log('当前问卷ID:', questionnaireId);
        console.log('本地存储中的问卷ID:', localStorage.getItem('current_questionnaire_id'));
        
        if (questionCount === 0) {
            alert('请至少添加一个问题！');
            return;
        }
        
        try {
            // 检查是否有问卷ID
            let currentQuestionnaireId = localStorage.getItem('current_questionnaire_id');
            
            // 如果本地存储没有，尝试从URL参数获取
            if (!currentQuestionnaireId) {
                console.log('本地存储中没有问卷ID，尝试从URL参数获取');
                try {
                    const urlParams = new URLSearchParams(window.location.search);
                    const encodedQuestionnaireId = urlParams.get('id');
                    if (encodedQuestionnaireId) {
                        currentQuestionnaireId = decodeURIComponent(encodedQuestionnaireId);
                        console.log('成功从URL参数获取问卷ID:', currentQuestionnaireId);
                        // 将URL中的问卷ID保存到本地存储
                        localStorage.setItem('current_questionnaire_id', currentQuestionnaireId);
                    }
                } catch (error) {
                    console.error('URL参数解析失败:', error);
                    // 尝试手动解析
                    const search = window.location.search;
                    const match = search.match(/[?&]id=([^&]*)/);
                    if (match) {
                        currentQuestionnaireId = decodeURIComponent(match[1]);
                        console.log('手动解析成功:', currentQuestionnaireId);
                        // 将URL中的问卷ID保存到本地存储
                        localStorage.setItem('current_questionnaire_id', currentQuestionnaireId);
                    }
                }
            }
            
            if (currentQuestionnaireId) {
                // 如果有问卷ID，通过URL参数打开预览页面
                // 使用完整的URL，确保serve服务器正确处理参数
                const baseUrl = window.location.origin;
                const previewUrl = `${baseUrl}/${CONFIG.ROUTES.QUESTIONNAIRE_PREVIEW}?questionnaireId=${currentQuestionnaireId}`;
                
                // console.log('=== 构建预览URL ===');
                // console.log('CONFIG.ROUTES.QUESTIONNAIRE_PREVIEW:', CONFIG.ROUTES.QUESTIONNAIRE_PREVIEW);
                // console.log('currentQuestionnaireId:', currentQuestionnaireId);
                // console.log('baseUrl:', baseUrl);
                // console.log('预览页面完整URL:', previewUrl);
                // console.log('URL长度:', previewUrl.length);
                
                // 验证URL格式
                try {
                    const testUrl = new URL(previewUrl);
                    console.log('URL验证成功:', testUrl.href);
                    console.log('URL参数:', testUrl.searchParams.get('questionnaireId'));
                } catch (error) {
                    console.error('URL验证失败:', error);
                }
                
                // 使用页面跳转而不是弹窗，避免被浏览器阻止
                // console.log('正在跳转到预览页面...');
                // console.log('跳转前的当前URL:', window.location.href);
                // console.log('即将跳转到的URL:', previewUrl);
                
                // 验证跳转URL是否包含参数
                if (previewUrl.includes('questionnaireId=')) {
                    // console.log('✅ URL包含questionnaireId参数，准备跳转');
                    
                    // 尝试多种跳转方式，确保兼容性
                    try {
                        // 方式1: 使用完整的URL进行跳转
                        // console.log('使用方式1: window.location.href');
                        window.location.href = previewUrl;
                    } catch (error) {
                        // console.error('方式1失败，尝试方式2:', error);
                        try {
                            // 方式2: 使用location.replace
                            console.log('使用方式2: location.replace');
                            location.replace(previewUrl);
                        } catch (error2) {
                            console.error('方式2也失败，尝试方式3:', error2);
                            // 方式3: 使用assign
                            console.log('使用方式3: location.assign');
                            location.assign(previewUrl);
                        }
                    }
                } else {
                    console.error('❌ URL不包含questionnaireId参数，跳转失败');
                    console.error('previewUrl:', previewUrl);
                    alert('跳转URL构建失败，请检查配置');
                }
            } else {
                // 如果没有问卷ID，显示错误提示
                console.error('预览失败：没有找到问卷ID');
                alert('无法预览：缺少问卷ID，请先保存问卷');
            }
            
        } catch (error) {
            console.error('准备预览功能出现错误:', error);
            alert('预览功能出现错误，请重试');
        }
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
    // setupInputChangeListeners();
});

/**
 * 收集预览数据
 * @returns {Object} 预览数据对象
 */
function collectPreviewData() {
    const questionnaireInfo = {
        title: document.getElementById('questionnaire-title')?.value || '问卷标题',
        description: document.getElementById('questionnaire-description')?.value || '问卷描述'
    };
    
    const questions = [];
    const questionElements = document.querySelectorAll('.question-item');
    
    questionElements.forEach((questionElement, index) => {
        const questionData = collectQuestionData(questionElement, index + 1);
        if (questionData) {
            questions.push(questionData);
        }
    });
    
    return {
        questionnaire: {
            title: questionnaireInfo.title,
            description: questionnaireInfo.description,
            questions: questions
        }
    };
}

/**
 * 收集单个问题的数据
 * @param {HTMLElement} questionElement 问题元素
 * @param {number} questionNumber 问题编号
 * @returns {Object|null} 问题数据对象
 */
function collectQuestionData(questionElement, questionNumber) {
    const questionType = questionElement.getAttribute('data-type');
    const questionText = questionElement.querySelector('.question-text')?.value || `问题${questionNumber}`;
    const isRequired = questionElement.querySelector('.required-checkbox')?.checked || false;
    
    let questionData = {
        type: questionType,
        text: questionText,
        required: isRequired,
        questionNumber: questionNumber
    };
    
    // 根据问题类型收集特定数据
    switch (questionType) {
        case 'single-choice':
            questionData.options = collectSingleChoiceOptions(questionElement);
            break;
        case 'multiple-choice':
            questionData.options = collectMultipleChoiceOptions(questionElement);
            break;
        case 'text':
            questionData.placeholder = questionElement.querySelector('.placeholder-input')?.value || '';
            questionData.maxLength = questionElement.querySelector('.max-length-input')?.value || '';
            break;
        case 'rating':
            questionData.maxRating = questionElement.querySelector('.max-rating-input')?.value || 5;
            questionData.ratingLabels = collectRatingLabels(questionElement);
            break;
        case 'matrix':
            questionData.rows = collectMatrixRows(questionElement);
            questionData.columns = collectMatrixColumns(questionElement);
            break;
        case 'date':
            questionData.dateFormat = questionElement.querySelector('.date-format-select')?.value || 'YYYY-MM-DD';
            break;
        case 'time':
            questionData.timeFormat = questionElement.querySelector('.time-format-select')?.value || 'HH:mm';
            break;
        case 'file-upload':
            questionData.maxFileSize = questionElement.querySelector('.max-file-size-input')?.value || 5;
            questionData.allowedTypes = questionElement.querySelector('.allowed-types-input')?.value || '';
            break;
        case 'location':
            questionData.locationType = questionElement.querySelector('.location-type-select')?.value || 'address';
            break;
        case 'signature':
            questionData.signatureWidth = questionElement.querySelector('.signature-width-input')?.value || 400;
            questionData.signatureHeight = questionElement.querySelector('.signature-height-input')?.value || 200;
            break;
        case 'user-info':
            questionData.fields = collectUserInfoFields(questionElement);
            break;
    }
    
    return questionData;
}

/**
 * 收集单选题选项
 * @param {HTMLElement} questionElement 问题元素
 * @returns {Array} 选项数组
 */
function collectSingleChoiceOptions(questionElement) {
    const options = [];
    const optionElements = questionElement.querySelectorAll('.option-item');
    
    optionElements.forEach((optionElement, index) => {
        const optionText = optionElement.querySelector('.option-text')?.value || `选项${index + 1}`;
        const isDefault = optionElement.querySelector('.default-radio')?.checked || false;
        
        options.push({
            text: optionText,
            isDefault: isDefault,
            order: index + 1
        });
    });
    
    return options;
}

/**
 * 收集多选题选项
 * @param {HTMLElement} questionElement 问题元素
 * @returns {Array} 选项数组
 */
function collectMultipleChoiceOptions(questionElement) {
    const options = [];
    const optionElements = questionElement.querySelectorAll('.option-item');
    
    optionElements.forEach((optionElement, index) => {
        const optionText = optionElement.querySelector('.option-text')?.value || `选项${index + 1}`;
        const isDefault = optionElement.querySelector('.default-checkbox')?.checked || false;
        
        options.push({
            text: optionText,
            isDefault: isDefault,
            order: index + 1
        });
    });
    
    return options;
}

/**
 * 收集评分标签
 * @param {HTMLElement} questionElement 问题元素
 * @returns {Object} 评分标签对象
 */
function collectRatingLabels(questionElement) {
    const labels = {};
    const labelInputs = questionElement.querySelectorAll('.rating-label-input');
    
    labelInputs.forEach((input, index) => {
        if (input.value.trim()) {
            labels[index + 1] = input.value.trim();
        }
    });
    
    return labels;
}

/**
 * 收集矩阵行
 * @param {HTMLElement} questionElement 问题元素
 * @returns {Array} 行数组
 */
function collectMatrixRows(questionElement) {
    const rows = [];
    const rowElements = questionElement.querySelectorAll('.matrix-row-item');
    
    rowElements.forEach((rowElement, index) => {
        const rowText = rowElement.querySelector('.row-text')?.value || `行${index + 1}`;
        rows.push({
            text: rowText,
            order: index + 1
        });
    });
    
    return rows;
}

/**
 * 收集矩阵列
 * @param {HTMLElement} questionElement 问题元素
 * @returns {Array} 列数组
 */
function collectMatrixColumns(questionElement) {
    const columns = [];
    const columnElements = questionElement.querySelectorAll('.matrix-column-item');
    
    columnElements.forEach((columnElement, index) => {
        const columnText = columnElement.querySelector('.column-text')?.value || `列${index + 1}`;
        columns.push({
            text: columnText,
            order: index + 1
        });
    });
    
    return columns;
}

/**
 * 收集用户信息字段
 * @param {HTMLElement} questionElement 问题元素
 * @returns {Array} 字段数组
 */
function collectUserInfoFields(questionElement) {
    const fields = [];
    const fieldElements = questionElement.querySelectorAll('.user-info-field');
    
    fieldElements.forEach((fieldElement, index) => {
        const fieldType = fieldElement.querySelector('.field-type-select')?.value || 'text';
        const fieldLabel = fieldElement.querySelector('.field-label-input')?.value || `字段${index + 1}`;
        const isRequired = fieldElement.querySelector('.field-required-checkbox')?.checked || false;
        
        fields.push({
            type: fieldType,
            label: fieldLabel,
            required: isRequired,
            order: index + 1
        });
    });
    
    return fields;
}

/**
 * 设置输入变化监听器
 */
function setupInputChangeListeners() {
    // 使用事件委托监听所有输入变化
    document.addEventListener('input', function(e) {
        // 扩展监听的输入元素类型
        if (e.target.matches('.question-text, .option-text, .hint-text, .max-length, .min-score, .max-score, .min-label, .max-label, .rating-step, .row-text, .column-text')) {
            // 输入变化时，延迟触发自动保存检查
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.inputChangeTimer);
                window.inputChangeTimer = setTimeout(() => {
                    console.log('输入变化触发自动保存:', e.target.className, e.target.value);
                    performAutoSave();
                }, 2000); // 输入停止2秒后触发保存
            }
        }
    });
    
    // 监听选项的选中状态变化
    document.addEventListener('change', function(e) {
        if (e.target.matches('input[type="radio"], input[type="checkbox"], .input-type')) {
            // 选项状态变化时，延迟触发自动保存检查
            if (AUTO_SAVE_ENABLED) {
                clearTimeout(window.optionChangeTimer);
                window.optionChangeTimer = setTimeout(() => {
                    console.log('选择变化触发自动保存:', e.target.className, e.target.value);
                    performAutoSave();
                }, 1000); // 选项变化1秒后触发保存
            }
        }
    });
}

/**
 * 加载矩阵题配置数据
 */
function loadMatrixQuestionConfig(questionElement, question) {
    console.log('加载矩阵题配置数据:', question);
    
    // 初始化矩阵预览
    updateMatrixPreview(questionElement);
    
    console.log('矩阵题配置数据加载完成');
}

/**
 * 加载问答题配置数据
 */
function loadTextQuestionConfig(questionElement, question) {
    console.log('加载问答题配置数据:', question);
    
    if (question.textQuestionConfig) {
        // 设置提示文字
        const hintTextElement = questionElement.querySelector('.hint-text');
        if (hintTextElement && question.textQuestionConfig.hintText) {
            hintTextElement.value = question.textQuestionConfig.hintText;
        }
        
        // 设置最大字数
        const maxLengthElement = questionElement.querySelector('.max-length');
        if (maxLengthElement && question.textQuestionConfig.maxLength) {
            maxLengthElement.value = question.textQuestionConfig.maxLength;
        }
        
        // 设置输入类型
        const inputTypeElement = questionElement.querySelector('.input-type');
        if (inputTypeElement && question.textQuestionConfig.inputType) {
            const inputType = question.textQuestionConfig.inputType === 2 ? 'multiline' : 'single';
            inputTypeElement.value = inputType;
        }
        
        console.log('问答题配置数据加载完成:', {
            hintText: question.textQuestionConfig.hintText,
            maxLength: question.textQuestionConfig.maxLength,
            inputType: question.textQuestionConfig.inputType
        });
    }
}

/**
 * 加载评分题配置数据
 */
function loadRatingQuestionConfig(questionElement, question) {
    console.log('加载评分题配置数据:', question);
    
    if (question.ratingQuestionConfig) {
        // 设置最低分
        const minScoreElement = questionElement.querySelector('.min-score');
        if (minScoreElement && question.ratingQuestionConfig.minScore) {
            minScoreElement.value = question.ratingQuestionConfig.minScore;
        }
        
        // 设置最高分
        const maxScoreElement = questionElement.querySelector('.max-score');
        if (maxScoreElement && question.ratingQuestionConfig.maxScore) {
            maxScoreElement.value = question.ratingQuestionConfig.maxScore;
        }
        
        // 设置最低分标签
        const minLabelElement = questionElement.querySelector('.min-label');
        if (minLabelElement && question.ratingQuestionConfig.minLabel) {
            minLabelElement.value = question.ratingQuestionConfig.minLabel;
        }
        
        // 设置最高分标签
        const maxLabelElement = questionElement.querySelector('.max-label');
        if (maxLabelElement && question.ratingQuestionConfig.maxLabel) {
            maxLabelElement.value = question.ratingQuestionConfig.maxLabel;
        }
        
        // 设置评分步长
        const ratingStepElement = questionElement.querySelector('.rating-step');
        if (ratingStepElement && question.ratingQuestionConfig.step) {
            ratingStepElement.value = question.ratingQuestionConfig.step;
        }
        
        console.log('评分题配置数据加载完成:', {
            minScore: question.ratingQuestionConfig.minScore,
            maxScore: question.ratingQuestionConfig.maxScore,
            minLabel: question.ratingQuestionConfig.minLabel,
            maxLabel: question.ratingQuestionConfig.maxLabel,
            step: question.ratingQuestionConfig.step
        });
    }
}

// 更新矩阵预览表格
function updateMatrixPreview(questionElement) {
    const matrixTable = questionElement.querySelector('.matrix-table');
    if (!matrixTable) return;
    
    const rowElements = questionElement.querySelectorAll('.row-item .row-text');
    const columnElements = questionElement.querySelectorAll('.column-item .column-text');
    
    // 更新表头
    const thead = matrixTable.querySelector('thead tr');
    thead.innerHTML = '<th class="matrix-header-cell" style="background: #f8f9fa; padding: 8px; border: 1px solid #dee2e6; font-weight: bold; text-align: center;">问题</th>';
    columnElements.forEach((colElement, index) => {
        const colText = colElement.value.trim() || `选项${index + 1}`;
        thead.innerHTML += `<th class="matrix-header-cell" style="background: #f8f9fa; padding: 8px; border: 1px solid #dee2e6; font-weight: bold; text-align: center;">${colText}</th>`;
    });
    
    // 更新表格内容
    const tbody = matrixTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    rowElements.forEach((rowElement, rowIndex) => {
        const rowText = rowElement.value.trim() || `行${rowIndex + 1}`;
        const rowName = `matrix_row_${rowIndex + 1}`;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="matrix-row-header" style="background: #f8f9fa; padding: 8px; border: 1px solid #dee2e6; font-weight: bold; text-align: center;">${rowText}</td>`;
        
        columnElements.forEach((colElement, colIndex) => {
            const inputType = 'radio'; // 固定使用单选题
            const inputName = rowName; // 每行使用相同的name，确保单选
            const inputValue = colIndex + 1;
            
            tr.innerHTML += `
                <td class="matrix-cell" style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">
                    <input type="${inputType}" name="${inputName}" value="${inputValue}" style="margin: 0;">
                </td>
            `;
        });
        
        tbody.appendChild(tr);
    });
    
    // 设置表格样式
    matrixTable.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 14px;
    `;
    
    console.log('矩阵预览已更新，行数:', rowElements.length, '列数:', columnElements.length, '类型: 单选题');
}

// 发布问卷函数
async function publishQuestionnaire() {
    if (questionCount === 0) {
        alert('请至少添加一个问题！');
        return;
    }
    
    // 获取当前问卷ID
    const currentQuestionnaireId = localStorage.getItem('current_questionnaire_id');
    if (!currentQuestionnaireId) {
        alert('请先保存问卷！');
        return;
    }
    
    try {
        // 调用发布API
        const response = await fetch(`${CONFIG.BACKEND_BASE_URL}/questionCreate/publish/${currentQuestionnaireId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${UTILS.getStorage(CONFIG.STORAGE_KEYS.TOKEN)}`
            }
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            // 发布成功，显示分享信息
            showPublishSuccessModal(result.data);
        } else {
            alert('发布失败：' + result.message);
        }
    } catch (error) {
        console.error('发布失败:', error);
        alert('发布失败，请重试');
    }
}

// 显示发布成功弹窗
function showPublishSuccessModal(accessUrl) {
    const modal = document.createElement('div');
    modal.className = 'publish-success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🎉 问卷发布成功！</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="share-section">
                    <h4>分享链接</h4>
                    <div class="url-input-group">
                        <input type="text" id="shareUrl" value="${window.location.origin}${accessUrl}" readonly>
                        <button onclick="copyShareUrl()">复制链接</button>
                    </div>
                </div>
                
                <div class="qr-section">
                    <h4>二维码</h4>
                    <div id="qrCode"></div>
                    <button onclick="downloadQRCode()">下载二维码</button>
                </div>
                
                <div class="stats-section">
                    <h4>访问统计</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-number">0</span>
                            <span class="stat-label">访问次数</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">0</span>
                            <span class="stat-label">填写次数</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="window.location.href='questionnaire-management.html'">返回管理</button>
                <button onclick="previewPublishedQuestionnaire('${accessUrl}')">预览发布</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 生成二维码
    generateQRCode(accessUrl);
}

// 复制分享链接
function copyShareUrl() {
    const urlInput = document.getElementById('shareUrl');
    urlInput.select();
    document.execCommand('copy');
    alert('链接已复制到剪贴板！');
}

// 生成二维码
function generateQRCode(accessUrl) {
    const qrContainer = document.getElementById('qrCode');
    const fullUrl = window.location.origin + accessUrl;
    
    // 使用qrcode.js库生成二维码
    if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
            text: fullUrl,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        // 如果没有QRCode库，显示链接
        qrContainer.innerHTML = `<p>二维码生成失败，请手动分享链接</p>`;
    }
}

// 下载二维码
function downloadQRCode() {
    const qrCanvas = document.querySelector('#qrCode canvas');
    if (qrCanvas) {
        const link = document.createElement('a');
        link.download = '问卷二维码.png';
        link.href = qrCanvas.toDataURL();
        link.click();
    }
}

// 预览已发布的问卷
function previewPublishedQuestionnaire(accessUrl) {
    window.open(accessUrl, '_blank');
}

