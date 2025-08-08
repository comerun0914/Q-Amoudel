/**
 * 选项管理JavaScript
 * 用于处理单选题和多选题的选项保存、查询、更新和删除
 */

// 使用全局配置
const CONFIG = window.CONFIG || {};
const UTILS = window.UTILS || {};

/**
 * 选项管理类
 */
class OptionManager {
    constructor() {
        this.baseUrl = CONFIG.BACKEND_BASE_URL || 'http://localhost:7070/api';
    }

    /**
     * 保存单选题选项
     * @param {Object} optionData - 选项数据
     * @returns {Promise} 
     */
    async saveSingleChoiceOption(optionData) {
        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_SAVE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(optionData)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('保存单选题选项失败:', error);
            throw error;
        }
    }

    /**
     * 批量保存单选题选项
     * @param {number} questionId - 问题ID
     * @param {Array} options - 选项列表
     * @returns {Promise}
     */
    async batchSaveSingleChoiceOptions(questionId, options) {
        try {
            const requestData = {
                questionId: questionId,
                options: options
            };

            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_BATCH_SAVE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('批量保存单选题选项失败:', error);
            throw error;
        }
    }

    /**
     * 保存多选题选项
     * @param {Object} optionData - 选项数据
     * @returns {Promise}
     */
    async saveMultipleChoiceOption(optionData) {
        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_SAVE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(optionData)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('保存多选题选项失败:', error);
            throw error;
        }
    }

    /**
     * 批量保存多选题选项
     * @param {number} questionId - 问题ID
     * @param {Array} options - 选项列表
     * @returns {Promise}
     */
    async batchSaveMultipleChoiceOptions(questionId, options) {
        try {
            const requestData = {
                questionId: questionId,
                options: options
            };

            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_BATCH_SAVE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('批量保存多选题选项失败:', error);
            throw error;
        }
    }

    /**
     * 获取单选题选项列表
     * @param {number} questionId - 问题ID
     * @returns {Promise}
     */
    async getSingleChoiceOptions(questionId) {
        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_LIST}?questionId=${questionId}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('获取单选题选项失败:', error);
            throw error;
        }
    }

    /**
     * 获取多选题选项列表
     * @param {number} questionId - 问题ID
     * @returns {Promise}
     */
    async getMultipleChoiceOptions(questionId) {
        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_LIST}?questionId=${questionId}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('获取多选题选项失败:', error);
            throw error;
        }
    }

    /**
     * 更新单选题选项
     * @param {Object} optionData - 选项数据
     * @returns {Promise}
     */
    async updateSingleChoiceOption(optionData) {
        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_UPDATE}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(optionData)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('更新单选题选项失败:', error);
            throw error;
        }
    }

    /**
     * 更新多选题选项
     * @param {Object} optionData - 选项数据
     * @returns {Promise}
     */
    async updateMultipleChoiceOption(optionData) {
        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_UPDATE}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(optionData)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('更新多选题选项失败:', error);
            throw error;
        }
    }

    /**
     * 删除单选题选项
     * @param {number} optionId - 选项ID
     * @returns {Promise}
     */
    async deleteSingleChoiceOption(optionId) {
        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_DELETE}/${optionId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('删除单选题选项失败:', error);
            throw error;
        }
    }

    /**
     * 删除多选题选项
     * @param {number} optionId - 选项ID
     * @returns {Promise}
     */
    async deleteMultipleChoiceOption(optionId) {
        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_DELETE}/${optionId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('删除多选题选项失败:', error);
            throw error;
        }
    }

    /**
     * 根据问题ID删除所有单选题选项
     * @param {number} questionId - 问题ID
     * @returns {Promise}
     */
    async deleteSingleChoiceOptionsByQuestionId(questionId) {
        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.SINGLE_CHOICE_OPTION_DELETE_BY_QUESTION}/${questionId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('删除单选题选项失败:', error);
            throw error;
        }
    }

    /**
     * 根据问题ID删除所有多选题选项
     * @param {number} questionId - 问题ID
     * @returns {Promise}
     */
    async deleteMultipleChoiceOptionsByQuestionId(questionId) {
        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.API_ENDPOINTS.MULTIPLE_CHOICE_OPTION_DELETE_BY_QUESTION}/${questionId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('删除多选题选项失败:', error);
            throw error;
        }
    }
}

/**
 * 从问卷编辑器中收集选项数据
 * @param {HTMLElement} questionElement - 问题元素
 * @returns {Array} 选项数据数组
 */
function collectOptionsFromQuestion(questionElement) {
    const options = [];
    const optionElements = questionElement.querySelectorAll('.option-item');
    
    optionElements.forEach((optionElement, index) => {
        const optionText = optionElement.querySelector('.option-text');
        const radioCheckbox = optionElement.querySelector('input[type="radio"], input[type="checkbox"]');
        
        if (optionText && optionText.value.trim()) {
            const optionData = {
                optionContent: optionText.value.trim(),
                sortNum: index + 1,
                isDefault: radioCheckbox && radioCheckbox.checked ? 1 : 0
            };
            options.push(optionData);
        }
    });
    
    return options;
}

/**
 * 保存问题选项
 * @param {number} questionId - 问题ID
 * @param {string} questionType - 问题类型 ('single' 或 'multiple')
 * @param {HTMLElement} questionElement - 问题元素
 * @returns {Promise}
 */
async function saveQuestionOptions(questionId, questionType, questionElement) {
    const optionManager = new OptionManager();
    const options = collectOptionsFromQuestion(questionElement);
    
    if (options.length === 0) {
        console.warn('没有找到有效的选项数据');
        return;
    }
    
    try {
        let result;
        if (questionType === 'single') {
            result = await optionManager.batchSaveSingleChoiceOptions(questionId, options);
        } else if (questionType === 'multiple') {
            result = await optionManager.batchSaveMultipleChoiceOptions(questionId, options);
        } else {
            throw new Error('不支持的问题类型: ' + questionType);
        }
        
        if (result.code === 200) {
            console.log('选项保存成功:', result.data);
            return result.data;
        } else {
            console.error('选项保存失败:', result.message);
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('保存选项时发生错误:', error);
        throw error;
    }
}

/**
 * 加载问题选项
 * @param {number} questionId - 问题ID
 * @param {string} questionType - 问题类型 ('single' 或 'multiple')
 * @param {HTMLElement} questionElement - 问题元素
 * @returns {Promise}
 */
async function loadQuestionOptions(questionId, questionType, questionElement) {
    const optionManager = new OptionManager();
    
    try {
        let result;
        if (questionType === 'single') {
            result = await optionManager.getSingleChoiceOptions(questionId);
        } else if (questionType === 'multiple') {
            result = await optionManager.getMultipleChoiceOptions(questionId);
        } else {
            throw new Error('不支持的问题类型: ' + questionType);
        }
        
        if (result.code === 200 && result.data) {
            console.log('选项加载成功:', result.data);
            displayOptionsInQuestion(questionElement, result.data, questionType);
            return result.data;
        } else {
            console.error('选项加载失败:', result.message);
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('加载选项时发生错误:', error);
        throw error;
    }
}

/**
 * 在问题元素中显示选项
 * @param {HTMLElement} questionElement - 问题元素
 * @param {Array} options - 选项数据
 * @param {string} questionType - 问题类型
 */
function displayOptionsInQuestion(questionElement, options, questionType) {
    const optionsContainer = questionElement.querySelector('.options-container');
    if (!optionsContainer) {
        console.error('找不到选项容器');
        return;
    }
    
    // 清空现有选项
    optionsContainer.innerHTML = '';
    
    // 添加选项
    options.forEach((option, index) => {
        const inputType = questionType === 'single' ? 'radio' : 'checkbox';
        const name = `option_${questionElement.dataset.questionId || Date.now()}`;
        
        const optionElement = document.createElement('div');
        optionElement.className = 'option-item';
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
}

// 导出到全局作用域
window.OptionManager = OptionManager;
window.collectOptionsFromQuestion = collectOptionsFromQuestion;
window.saveQuestionOptions = saveQuestionOptions;
window.loadQuestionOptions = loadQuestionOptions;
window.displayOptionsInQuestion = displayOptionsInQuestion; 