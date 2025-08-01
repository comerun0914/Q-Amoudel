// 使用全局配置

// 问卷结果展示页面JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initPage();
    
    // 绑定事件
    bindEvents();
    
    // 加载结果数据
    loadResultData();
});

// 页面初始化
function initPage() {
    console.log('问卷结果页面初始化');
}

// 绑定事件
function bindEvents() {
    // 返回按钮
    document.getElementById('btnBack').addEventListener('click', function() {
        history.back();
    });
    
    // 打印按钮
    document.getElementById('btnPrint').addEventListener('click', function() {
        window.print();
    });
    
    // 导出PDF按钮
    document.getElementById('btnExport').addEventListener('click', function() {
        exportToPDF();
    });
    
    // 返回列表按钮
    document.getElementById('btnBackToList').addEventListener('click', function() {
                        window.location.href = CONFIG.ROUTES.INDEX;
    });
    
    // 分享按钮
    document.getElementById('btnShare').addEventListener('click', function() {
        showShareModal();
    });
    
    // 分享对话框关闭
    document.getElementById('btnCloseShare').addEventListener('click', function() {
        hideShareModal();
    });
    
    // 分享选项
    document.getElementById('shareCopy').addEventListener('click', function() {
        copyShareLink();
    });
    
    document.getElementById('shareEmail').addEventListener('click', function() {
        shareViaEmail();
    });
    
    document.getElementById('shareWechat').addEventListener('click', function() {
        shareViaWechat();
    });
}

// 加载结果数据
function loadResultData() {
    // 从URL参数获取结果ID
    const urlParams = new URLSearchParams(window.location.search);
    const resultId = urlParams.get('id') || '1';
    
    // 调用API获取结果数据
    fetchQuestionnaireResult(resultId);
}

// 从API获取问卷结果
async function fetchQuestionnaireResult(resultId) {
    try {
        const response = await fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_RESULT + '/' + resultId));
        if (response.ok) {
            const resultData = await response.json();
            renderResult(resultData);
        } else {
            // 如果API不可用，使用模拟数据
            console.warn('API不可用，使用模拟数据');
            loadMockData(resultId);
        }
    } catch (error) {
        console.error('获取结果数据失败:', error);
        // 使用模拟数据
        loadMockData(resultId);
    }
}

// 加载模拟数据
function loadMockData(resultId) {
    const resultData = {
        id: resultId,
        title: '幼儿发展评估问卷',
        description: '本问卷旨在了解幼儿的发展状况，请根据实际情况填写。',
        startTime: '2025-01-15 14:30',
        completionTime: '15分钟',
        submissionTime: '2025-01-15 15:30',
        respondentName: '张三',
        totalQuestions: 10,
        questions: [
            {
                id: 1,
                type: 'radio',
                text: '您的孩子年龄是？',
                answer: '3-4岁',
                options: ['2-3岁', '3-4岁', '4-5岁', '5-6岁']
            },
            {
                id: 2,
                type: 'text',
                text: '您认为孩子最需要提升的能力是什么？',
                answer: '语言表达能力'
            },
            {
                id: 3,
                type: 'checkbox',
                text: '孩子喜欢哪些活动？（多选）',
                answer: '绘画, 音乐, 运动',
                options: ['绘画', '音乐', '运动', '阅读', '游戏']
            },
            {
                id: 4,
                type: 'rating',
                text: '请评价孩子的社交能力',
                answer: 4,
                maxRating: 5
            }
        ]
    };
    
    renderResult(resultData);
}

// 渲染结果
function renderResult(data) {
    // 设置基本信息
    document.getElementById('questionnaireTitle').textContent = data.title;
    document.getElementById('questionnaireDescription').textContent = data.description;
    document.getElementById('startTime').textContent = data.startTime;
    document.getElementById('completionTime').textContent = data.completionTime;
    document.getElementById('submissionTimeText').textContent = `提交时间: ${data.submissionTime}`;
    document.getElementById('respondentName').textContent = data.respondentName;
    document.getElementById('totalTime').textContent = data.completionTime;
    document.getElementById('totalQuestions').textContent = `${data.totalQuestions}题`;
    
    // 渲染问题结果
    renderQuestions(data.questions);
}

// 渲染问题结果
function renderQuestions(questions) {
    const container = document.getElementById('questionsResultContainer');
    container.innerHTML = '';
    
    questions.forEach((question, index) => {
        const questionElement = createQuestionElement(question, index + 1);
        container.appendChild(questionElement);
    });
}

// 创建问题元素
function createQuestionElement(question, number) {
    const div = document.createElement('div');
    div.className = 'question-result-item';
    
    let answerDisplay = '';
    switch (question.type) {
        case 'radio':
            answerDisplay = `<span class="answer-text">${question.answer}</span>`;
            break;
        case 'checkbox':
            answerDisplay = `<span class="answer-text">${question.answer}</span>`;
            break;
        case 'text':
            answerDisplay = `<span class="answer-text">${question.answer}</span>`;
            break;
        case 'rating':
            answerDisplay = createRatingDisplay(question.answer, question.maxRating);
            break;
        default:
            answerDisplay = `<span class="answer-text">${question.answer}</span>`;
    }
    
    div.innerHTML = `
        <div class="question-result-header">
            <span class="question-number">Q${number}</span>
            <span class="question-type">${getQuestionTypeName(question.type)}</span>
        </div>
        <div class="question-result-content">
            <h3 class="question-text">${question.text}</h3>
            <div class="answer-display">
                ${answerDisplay}
            </div>
        </div>
    `;
    
    return div;
}

// 创建评分显示
function createRatingDisplay(rating, maxRating) {
    let stars = '';
    for (let i = 1; i <= maxRating; i++) {
        const filled = i <= rating ? 'filled' : '';
        stars += `<span class="rating-star ${filled}">★</span>`;
    }
    return `<div class="rating-display">${stars} <span class="rating-text">(${rating}/${maxRating})</span></div>`;
}

// 获取问题类型名称
function getQuestionTypeName(type) {
    return CONFIG.QUESTION_TYPE_NAMES[type] || '未知类型';
}

// 导出PDF
function exportToPDF() {
    showToast('PDF导出功能开发中...');
}

// 显示分享对话框
function showShareModal() {
    document.getElementById('shareModal').classList.add('show');
}

// 隐藏分享对话框
function hideShareModal() {
    document.getElementById('shareModal').classList.remove('show');
}

// 复制分享链接
function copyShareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showToast('链接已复制到剪贴板');
        hideShareModal();
    }).catch(() => {
        showToast('复制失败，请手动复制');
    });
}

// 邮件分享
function shareViaEmail() {
    const url = window.location.href;
    const subject = '问卷结果分享';
    const body = `请查看我的问卷结果：${url}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    hideShareModal();
}

// 微信分享
function shareViaWechat() {
    showToast('请使用微信扫描二维码分享');
    hideShareModal();
}

// 显示提示
function showToast(message) {
    UTILS.showToast(message, 'success');
}
