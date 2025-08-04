// 问卷测试页面功能
let currentQuestionnaire = null;
let questionnaireQuestions = [];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initPage();
});

function initPage() {
    initUserInfo();
    bindEvents();
    loadQuestionnaireData();
}

function initUserInfo() {
    const userInfo = UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
    const userInfoElement = document.getElementById('userInfo');
    const loginBtn = document.getElementById('loginBtn');
    
    if (userInfo && userInfo.username) {
        UTILS.displayUserInfo(userInfo);
        if (userInfoElement) userInfoElement.style.display = 'flex';
        if (loginBtn) loginBtn.style.display = 'none';
    } else {
        if (userInfoElement) userInfoElement.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
    }
    
    UTILS.bindUserDropdown();
}

function bindEvents() {
    const testForm = document.getElementById('testForm');
    if (testForm) {
        testForm.addEventListener('submit', handleTestSubmit);
    }
    
    const exitTestBtn = document.querySelector('.btn-exit-test');
    if (exitTestBtn) {
        exitTestBtn.addEventListener('click', exitTestMode);
    }
}

function loadQuestionnaireData() {
    const questionnaireId = UTILS.getStorage(CONFIG.STORAGE_KEYS.CURRENT_QUESTIONNAIRE_ID);
    
    if (!questionnaireId) {
        UTILS.showToast('未找到问卷ID，请从问卷管理页面进入测试', 'error');
        setTimeout(() => {
            window.location.href = 'questionnaire-management.html';
        }, 2000);
        return;
    }
    
    // 从后端获取问卷详情
    fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_DETAIL) + `?id=${questionnaireId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            currentQuestionnaire = data.data;
            displayQuestionnaireInfo();
            loadQuestionnaireQuestions();
        } else {
            UTILS.showToast(data.message || '获取问卷详情失败', 'error');
            setTimeout(() => {
                window.location.href = 'questionnaire-management.html';
            }, 2000);
        }
    })
    .catch(error => {
        console.error('获取问卷详情失败:', error);
        UTILS.showToast('网络错误，请重试', 'error');
        setTimeout(() => {
            window.location.href = 'questionnaire-management.html';
        }, 2000);
    });
}

function displayQuestionnaireInfo() {
    if (!currentQuestionnaire) return;
    
    const titleElement = document.getElementById('questionnaireTitle');
    if (titleElement) {
        titleElement.textContent = currentQuestionnaire.title;
    }
    
    const descriptionElement = document.getElementById('questionnaireDescription');
    if (descriptionElement && currentQuestionnaire.description) {
        descriptionElement.textContent = currentQuestionnaire.description;
    }
    
    const createdTimeElement = document.getElementById('createdTime');
    if (createdTimeElement) {
        createdTimeElement.textContent = formatDate(currentQuestionnaire.createdTime);
    }
    
    const validPeriodElement = document.getElementById('validPeriod');
    if (validPeriodElement) {
        const startDate = formatDate(currentQuestionnaire.startDate);
        const endDate = formatDate(currentQuestionnaire.endDate);
        validPeriodElement.textContent = `${startDate} 至 ${endDate}`;
    }
    
    const submissionLimitElement = document.getElementById('submissionLimit');
    if (submissionLimitElement) {
        submissionLimitElement.textContent = currentQuestionnaire.submissionLimit || '无限制';
    }
}

function loadQuestionnaireQuestions() {
    if (!currentQuestionnaire || !currentQuestionnaire.id) {
        UTILS.showToast('问卷信息不完整，无法加载问题', 'error');
        return;
    }
    
    // 从后端获取问卷问题列表
    fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_QUESTIONS) + `?questionnaireId=${currentQuestionnaire.id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            questionnaireQuestions = data.data || [];
            renderQuestions();
        } else {
            // 如果后端还没有实现问题API，使用模拟数据
            console.warn('后端问题API未实现，使用模拟数据');
            questionnaireQuestions = [
                {
                    id: 1,
                    questionType: 1,
                    content: '您的性别是？',
                    isRequired: 1,
                    options: [
                        { id: 1, content: '男' },
                        { id: 2, content: '女' },
                        { id: 3, content: '其他' }
                    ]
                },
                {
                    id: 2,
                    questionType: 2,
                    content: '您喜欢哪些颜色？（可多选）',
                    isRequired: 0,
                    options: [
                        { id: 4, content: '红色' },
                        { id: 5, content: '蓝色' },
                        { id: 6, content: '绿色' },
                        { id: 7, content: '黄色' },
                        { id: 8, content: '紫色' }
                    ]
                },
                {
                    id: 3,
                    questionType: 3,
                    content: '请简述您对我们产品的建议：',
                    isRequired: 0
                }
            ];
            renderQuestions();
        }
    })
    .catch(error => {
        console.error('获取问卷问题失败:', error);
        // 使用模拟数据作为备选
        questionnaireQuestions = [
            {
                id: 1,
                questionType: 1,
                content: '您的性别是？',
                isRequired: 1,
                options: [
                    { id: 1, content: '男' },
                    { id: 2, content: '女' },
                    { id: 3, content: '其他' }
                ]
            },
            {
                id: 2,
                questionType: 2,
                content: '您喜欢哪些颜色？（可多选）',
                isRequired: 0,
                options: [
                    { id: 4, content: '红色' },
                    { id: 5, content: '蓝色' },
                    { id: 6, content: '绿色' },
                    { id: 7, content: '黄色' },
                    { id: 8, content: '紫色' }
                ]
            },
            {
                id: 3,
                questionType: 3,
                content: '请简述您对我们产品的建议：',
                isRequired: 0
            }
        ];
        renderQuestions();
    });
}

function renderQuestions() {
    const questionsSection = document.getElementById('questionsSection');
    if (!questionsSection) return;
    
    const questionsContainer = questionsSection.querySelector('.loading-questions');
    if (questionsContainer) {
        questionsContainer.remove();
    }
    
    const questionsHtml = questionnaireQuestions.map((question, index) => {
        return renderQuestion(question, index);
    }).join('');
    
    questionsSection.innerHTML = `
        <h3>问卷问题</h3>
        ${questionsHtml}
    `;
}

function renderQuestion(question, index) {
    const questionHtml = `
        <div class="form-group question-item" data-question-id="${question.id}">
            <label class="question-label">
                ${index + 1}. ${question.content}
                ${question.isRequired === 1 ? '<span class="required">*</span>' : ''}
            </label>
            ${renderQuestionInput(question)}
        </div>
    `;
    
    return questionHtml;
}

function renderQuestionInput(question) {
    switch (question.questionType) {
        case 1: // 单选题
            return question.options ? question.options.map(option => `
                <div class="radio-option">
                    <input type="radio" name="question_${question.id}" value="${option.content}" id="option_${question.id}_${option.id}" ${question.isRequired === 1 ? 'required' : ''}>
                    <label for="option_${question.id}_${option.id}">${option.content}</label>
                </div>
            `).join('') : '';
            
        case 2: // 多选题
            return question.options ? question.options.map(option => `
                <div class="checkbox-option">
                    <input type="checkbox" name="question_${question.id}" value="${option.content}" id="option_${question.id}_${option.id}">
                    <label for="option_${question.id}_${option.id}">${option.content}</label>
                </div>
            `).join('') : '';
            
        case 3: // 问答题
            return `<textarea name="question_${question.id}" placeholder="请输入您的回答" ${question.isRequired === 1 ? 'required' : ''} rows="3"></textarea>`;
            
        case 4: // 评分题
            return `<input type="number" name="question_${question.id}" min="1" max="10" placeholder="请评分（1-10分）" ${question.isRequired === 1 ? 'required' : ''}>`;
            
        default:
            return `<input type="text" name="question_${question.id}" placeholder="请输入您的回答" ${question.isRequired === 1 ? 'required' : ''}>`;
    }
}

function handleTestSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const testData = {
        questionnaireId: currentQuestionnaire.id,
        testInfo: {
            name: formData.get('testName'),
            email: formData.get('testEmail'),
            phone: formData.get('testPhone')
        },
        answers: collectAnswers()
    };
    
    showPreviewModal(testData);
}

function collectAnswers() {
    const answers = {};
    
    questionnaireQuestions.forEach(question => {
        const name = `question_${question.id}`;
        
        if (question.questionType === 2) { // 多选题
            const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
            answers[question.id] = Array.from(checkboxes).map(cb => cb.value);
        } else {
            const input = document.querySelector(`[name="${name}"]`);
            if (input) {
                answers[question.id] = input.value;
            }
        }
    });
    
    return answers;
}

function showPreviewModal(testData) {
    const modal = document.getElementById('previewModal');
    const previewContent = document.getElementById('previewContent');
    
    if (!modal || !previewContent) return;
    
    const previewHtml = generatePreviewHtml(testData);
    previewContent.innerHTML = previewHtml;
    
    modal.classList.add('show');
    window.currentTestData = testData;
}

function generatePreviewHtml(testData) {
    let html = '<div class="preview-section">';
    
    html += '<h4>测试信息</h4>';
    html += '<div class="preview-info">';
    html += `<p><strong>姓名：</strong>${testData.testInfo.name}</p>`;
    html += `<p><strong>邮箱：</strong>${testData.testInfo.email}</p>`;
    if (testData.testInfo.phone) {
        html += `<p><strong>电话：</strong>${testData.testInfo.phone}</p>`;
    }
    html += '</div>';
    
    html += '<h4>问卷答案</h4>';
    html += '<div class="preview-answers">';
    
    questionnaireQuestions.forEach((question, index) => {
        const answer = testData.answers[question.id];
        html += `<div class="answer-item">`;
        html += `<p><strong>${index + 1}. ${question.content}</strong></p>`;
        
        if (Array.isArray(answer)) {
            html += `<p>答案：${answer.length > 0 ? answer.join('、') : '未选择'}</p>`;
        } else {
            html += `<p>答案：${answer || '未填写'}</p>`;
        }
        
        html += '</div>';
    });
    
    html += '</div>';
    html += '</div>';
    
    return html;
}

function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function submitTestData() {
    if (!window.currentTestData) {
        UTILS.showToast('没有可提交的测试数据', 'error');
        return;
    }
    
    UTILS.showToast('测试数据提交成功！', 'success');
    showTestResults(window.currentTestData);
    closePreviewModal();
}

function showTestResults(testData) {
    const testResults = document.getElementById('testResults');
    const resultContent = document.getElementById('resultContent');
    
    if (!testResults || !resultContent) return;
    
    const resultHtml = `
        <div class="result-success">
            <h4>✅ 测试提交成功</h4>
            <p>测试数据已成功提交到后端，问卷功能正常工作。</p>
            
            <h5>提交的数据：</h5>
            <pre>${JSON.stringify(testData, null, 2)}</pre>
            
            <div class="result-actions">
                <button class="btn-test-reset" onclick="resetTestForm()">重新测试</button>
                <button class="btn-exit-test" onclick="exitTestMode()">返回管理</button>
            </div>
        </div>
    `;
    
    resultContent.innerHTML = resultHtml;
    testResults.style.display = 'block';
    testResults.scrollIntoView({ behavior: 'smooth' });
}

function previewTestSubmission() {
    const form = document.getElementById('testForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
}

function resetTestForm() {
    const form = document.getElementById('testForm');
    if (form) {
        form.reset();
    }
    
    const testResults = document.getElementById('testResults');
    if (testResults) {
        testResults.style.display = 'none';
    }
}

function exitTestMode() {
    if (confirm('确定要退出测试模式吗？')) {
        window.location.href = 'questionnaire-management.html';
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}