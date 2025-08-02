// 模拟数据
let recentQuestionnaires = [
    {
        id: 1,
        title: "幼儿学习能力评估问卷",
        description: "本问卷旨在了解幼儿的学习能力、认知发展水平和学习兴趣",
        status: "in-progress",
        progress: 60,
        lastAccess: "2025-01-15 14:30"
    },
    {
        id: 2,
        title: "幼儿健康状况调查",
        description: "了解幼儿的身体健康状况、饮食习惯和运动情况",
        status: "completed",
        progress: 100,
        lastAccess: "2025-01-10 09:15"
    }
];

let historyQuestionnaires = [
    {
        id: 1,
        title: "幼儿学习能力评估问卷",
        description: "本问卷旨在了解幼儿的学习能力、认知发展水平和学习兴趣",
        status: "in-progress",
        progress: 60,
        startDate: "2025-01-15",
        lastAccess: "2025-01-15 14:30",
        estimatedTime: "15分钟"
    },
    {
        id: 2,
        title: "幼儿健康状况调查",
        description: "了解幼儿的身体健康状况、饮食习惯和运动情况",
        status: "completed",
        progress: 100,
        startDate: "2025-01-10",
        lastAccess: "2025-01-10 09:15",
        estimatedTime: "10分钟"
    },
    {
        id: 3,
        title: "幼儿行为习惯观察问卷",
        description: "通过观察和记录幼儿的日常行为习惯，分析其性格特点",
        status: "expired",
        progress: 30,
        startDate: "2024-12-01",
        lastAccess: "2024-12-15 16:45",
        estimatedTime: "20分钟"
    }
];

// 二维码扫描器实例
let html5QrcodeScanner = null;

// DOM元素
const methodTabs = document.querySelectorAll('.method-tab');
const methodContents = document.querySelectorAll('.method-content');
const questionnaireLinkInput = document.getElementById('questionnaire-link');
const questionnaireCodeInput = document.getElementById('questionnaire-code');
const submitLinkBtn = document.getElementById('submit-link');
const submitCodeBtn = document.getElementById('submit-code');
const startScanBtn = document.getElementById('start-scan');
const stopScanBtn = document.getElementById('stop-scan');
const qrOverlay = document.getElementById('qr-overlay');
const recentList = document.getElementById('recent-list');
const historyBtn = document.getElementById('historyBtn');
const viewAllHistoryBtn = document.getElementById('view-all-history');
const historyModal = document.getElementById('history-modal');
const closeHistoryModal = document.getElementById('close-history-modal');
const historyList = document.getElementById('history-list');
const historySearch = document.getElementById('history-search');
const historyStatusFilter = document.getElementById('history-status-filter');

// 使用全局配置
// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    checkUserLoginStatus();
    
    renderRecentQuestionnaires();
    setupEventListeners();
});

/**
 * 检查用户登录状态
 */
function checkUserLoginStatus() {
    // 使用工具函数进行身份校验，要求普通用户权限
    const userInfo = UTILS.checkAuth(0);
    if (userInfo) {
        // 显示用户信息
        UTILS.displayUserInfo(userInfo);
        // 绑定用户下拉菜单事件
        UTILS.bindUserDropdown();
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 方法切换
    methodTabs.forEach(tab => {
        tab.addEventListener('click', () => switchMethod(tab.dataset.method));
    });

    // 链接输入
    submitLinkBtn.addEventListener('click', handleLinkSubmit);
    questionnaireLinkInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLinkSubmit();
        }
    });

    // 代码输入
    submitCodeBtn.addEventListener('click', handleCodeSubmit);
    questionnaireCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleCodeSubmit();
        }
    });

    // 二维码扫描
    startScanBtn.addEventListener('click', startQRScan);
    stopScanBtn.addEventListener('click', stopQRScan);
    qrOverlay.addEventListener('click', startQRScan);

    // 历史记录
    historyBtn.addEventListener('click', openHistoryModal);
    viewAllHistoryBtn.addEventListener('click', openHistoryModal);
    closeHistoryModal.addEventListener('click', closeHistoryModalFunc);
    historyModal.addEventListener('click', function(e) {
        if (e.target === historyModal) {
            closeHistoryModalFunc();
        }
    });

    // 历史记录筛选
    historySearch.addEventListener('input', filterHistory);
    historyStatusFilter.addEventListener('change', filterHistory);

    // 退出登录
    document.querySelector('.btn-login').addEventListener('click', function() {
        if (confirm('确定要退出登录吗？')) {
            window.location.href = CONFIG.ROUTES.LOGIN;
        }
    });
}

// 切换输入方法
function switchMethod(method) {
    // 更新标签状态
    methodTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.method === method);
    });

    // 更新内容显示
    methodContents.forEach(content => {
        content.classList.toggle('active', content.id === `${method}-method`);
    });

    // 如果切换到二维码方法，停止之前的扫描
    if (method !== 'qr' && html5QrcodeScanner) {
        stopQRScan();
    }
}

// 处理链接提交
function handleLinkSubmit() {
    const link = questionnaireLinkInput.value.trim();
    
    if (!link) {
        showMessage('请输入问卷链接', 'error');
        return;
    }

    if (!isValidUrl(link)) {
        showMessage('请输入有效的链接地址', 'error');
        return;
    }

    // 模拟验证链接
    showMessage('正在验证链接...', 'info');
    
    setTimeout(() => {
        // 模拟成功验证
        showMessage('链接验证成功，正在跳转...', 'success');
        setTimeout(() => {
            // 跳转到问卷填写页面
            window.location.href = `${CONFIG.ROUTES.QUESTIONNAIRE_FILL}?link=${encodeURIComponent(link)}`;
        }, 1000);
    }, 1500);
}

// 处理代码提交
function handleCodeSubmit() {
    const code = questionnaireCodeInput.value.trim().toUpperCase();
    
    if (!code) {
        showMessage('请输入问卷代码', 'error');
        return;
    }

    if (!/^[A-Z0-9]{6}$/.test(code)) {
        showMessage('问卷代码应为6位字母数字组合', 'error');
        return;
    }

    // 模拟验证代码
    showMessage('正在验证问卷代码...', 'info');
    
    setTimeout(() => {
        // 模拟成功验证
        showMessage('代码验证成功，正在跳转...', 'success');
        setTimeout(() => {
            // 跳转到问卷填写页面
            window.location.href = `${CONFIG.ROUTES.QUESTIONNAIRE_FILL}?code=${code}`;
        }, 1000);
    }, 1500);
}

// 开始二维码扫描
function startQRScan() {
    if (html5QrcodeScanner) {
        return; // 已经在扫描中
    }

    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    html5QrcodeScanner = new Html5Qrcode("qr-reader");
    
    html5QrcodeScanner.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
    ).then(() => {
        qrOverlay.style.display = 'none';
        startScanBtn.style.display = 'none';
        stopScanBtn.style.display = 'inline-block';
        showMessage('扫描已开始，请将二维码对准摄像头', 'info');
    }).catch(err => {
        showMessage('无法启动摄像头，请检查权限设置', 'error');
        console.error('QR扫描启动失败:', err);
    });
}

// 停止二维码扫描
function stopQRScan() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner = null;
            qrOverlay.style.display = 'flex';
            startScanBtn.style.display = 'inline-block';
            stopScanBtn.style.display = 'none';
            showMessage('扫描已停止', 'info');
        }).catch(err => {
            console.error('停止扫描失败:', err);
        });
    }
}

// 扫描成功回调
function onScanSuccess(decodedText, decodedResult) {
    showMessage('扫描成功！正在处理...', 'success');
    
    // 停止扫描
    stopQRScan();
    
    // 解析扫描结果
    try {
        const url = new URL(decodedText);
        // 如果是问卷链接
        if (url.pathname.includes('questionnaire')) {
                    setTimeout(() => {
            window.location.href = `${CONFIG.ROUTES.QUESTIONNAIRE_FILL}?link=${encodeURIComponent(decodedText)}`;
        }, 1000);
        } else {
            showMessage('扫描的内容不是有效的问卷链接', 'error');
        }
    } catch (e) {
        // 如果不是URL，可能是问卷代码
        if (/^[A-Z0-9]{6}$/.test(decodedText)) {
            setTimeout(() => {
                window.location.href = `${CONFIG.ROUTES.QUESTIONNAIRE_FILL}?code=${decodedText}`;
            }, 1000);
        } else {
            showMessage('扫描的内容不是有效的问卷信息', 'error');
        }
    }
}

// 扫描失败回调
function onScanFailure(error) {
    // 忽略扫描失败，继续扫描
    console.log('扫描失败:', error);
}

// 渲染最近填写的问卷
function renderRecentQuestionnaires() {
    if (recentQuestionnaires.length === 0) {
        recentList.innerHTML = `
            <div class="empty-state">
                <h3>暂无最近填写的问卷</h3>
                <p>开始填写您的第一个问卷吧</p>
            </div>
        `;
        return;
    }

    recentList.innerHTML = recentQuestionnaires.map(questionnaire => 
        createRecentItem(questionnaire)
    ).join('');
}

// 创建最近填写项目
function createRecentItem(questionnaire) {
    const statusText = getStatusText(questionnaire.status);
    const statusClass = `status-${questionnaire.status}`;
    const buttonText = questionnaire.status === 'completed' ? '查看结果' : '继续填写';
    const buttonAction = questionnaire.status === 'completed' ? 'viewResult' : 'continueFill';

    return `
        <div class="recent-item">
            <h3>${questionnaire.title}</h3>
            <p>${questionnaire.description}</p>
            <div class="recent-meta">
                <span>进度: ${questionnaire.progress}%</span>
                <span>${questionnaire.lastAccess}</span>
            </div>
            <button class="btn-continue" onclick="${buttonAction}(${questionnaire.id})">
                ${buttonText}
            </button>
        </div>
    `;
}

// 继续填写问卷
function continueFill(questionnaireId) {
    window.location.href = `${CONFIG.ROUTES.QUESTIONNAIRE_FILL}?id=${questionnaireId}`;
}

// 查看问卷结果
function viewResult(questionnaireId) {
    window.location.href = `${CONFIG.ROUTES.QUESTIONNAIRE_RESULT}?id=${questionnaireId}`;
}

// 打开历史记录模态框
function openHistoryModal() {
    historyModal.classList.add('active');
    renderHistoryList();
}

// 关闭历史记录模态框
function closeHistoryModalFunc() {
    historyModal.classList.remove('active');
}

// 渲染历史记录列表
function renderHistoryList() {
    const filteredHistory = filterHistoryData();
    
    if (filteredHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <h3>暂无历史记录</h3>
                <p>开始填写问卷来创建您的历史记录</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = filteredHistory.map(questionnaire => 
        createHistoryItem(questionnaire)
    ).join('');
}

// 创建历史记录项目
function createHistoryItem(questionnaire) {
    const statusText = getStatusText(questionnaire.status);
    const statusClass = `status-${questionnaire.status}`;
    const buttonText = questionnaire.status === 'completed' ? '查看结果' : 
                      questionnaire.status === 'in-progress' ? '继续填写' : '重新开始';
    const buttonAction = questionnaire.status === 'completed' ? 'viewResult' : 
                        questionnaire.status === 'in-progress' ? 'continueFill' : 'restartQuestionnaire';

    return `
        <div class="history-item">
            <h3>${questionnaire.title}</h3>
            <p>${questionnaire.description}</p>
            <div class="history-meta">
                <span>开始时间: ${formatDate(questionnaire.startDate)}</span>
                <span>最后访问: ${questionnaire.lastAccess}</span>
                <span class="history-status ${statusClass}">${statusText}</span>
            </div>
            <div class="history-meta">
                <span>进度: ${questionnaire.progress}%</span>
                <span>预计用时: ${questionnaire.estimatedTime}</span>
            </div>
            <button class="btn-secondary" onclick="${buttonAction}(${questionnaire.id})" style="margin-top: 10px;">
                ${buttonText}
            </button>
        </div>
    `;
}

// 筛选历史记录数据
function filterHistoryData() {
    const searchTerm = historySearch.value.toLowerCase();
    const statusFilter = historyStatusFilter.value;

    return historyQuestionnaires.filter(questionnaire => {
        // 搜索筛选
        if (searchTerm && !questionnaire.title.toLowerCase().includes(searchTerm) && 
            !questionnaire.description.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // 状态筛选
        if (statusFilter && questionnaire.status !== statusFilter) {
            return false;
        }

        return true;
    });
}

// 筛选历史记录
function filterHistory() {
    renderHistoryList();
}

// 重新开始问卷
function restartQuestionnaire(questionnaireId) {
    if (confirm('确定要重新开始这个问卷吗？之前的进度将会丢失。')) {
        window.location.href = `${CONFIG.ROUTES.QUESTIONNAIRE_FILL}?id=${questionnaireId}&restart=true`;
    }
}

// 工具函数
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

function getStatusText(status) {
    const statusMap = {
        'completed': '已完成',
        'in-progress': '进行中',
        'expired': '已过期'
    };
    return statusMap[status] || status;
}

function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // 添加样式
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // 根据类型设置背景色
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'info': '#3b82f6',
        'warning': '#f59e0b'
    };
    messageDiv.style.backgroundColor = colors[type] || colors.info;
    
    // 添加到页面
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);