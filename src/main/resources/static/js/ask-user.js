// 从数据库获取的问卷数据
let recentQuestionnaires = [];

// 后端拉取的历史记录（提交+草稿）
let historyQuestionnaires = [];

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
const switchCameraBtn = document.getElementById('switch-camera');
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
    
    // 从数据库获取问卷数据
    loadQuestionnairesFromDatabase();
    
    setupEventListeners();
    
    // 检测设备类型并显示相应的权限提示
    detectDeviceAndShowHint();
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

/**
 * 从数据库加载问卷数据
 */
async function loadQuestionnairesFromDatabase() {
    try {
        showMessage('正在加载问卷数据...', 'info');
        
        // 获取当前用户信息
        const userInfo = UTILS.getUserInfo();
        if (!userInfo || !userInfo.id) {
            showMessage('用户信息获取失败', 'error');
            return;
        }
        
        // 使用新的API端点获取用户已提交的问卷
        const url = `${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.SUBMISSION_USER_SUBMITTED}?userId=${userInfo.id}&page=1&size=50`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
            // 获取提交记录列表
            const submissionList = data.data.list || [];
            
            // 转换提交记录为问卷信息
            recentQuestionnaires = submissionList.map(submission => ({
                id: submission.questionnaireId,
                title: submission.questionnaireTitle || '未命名问卷',
                description: submission.questionnaireDescription || '暂无描述',
                status: 'completed', // 已提交的问卷状态为completed
                progress: 100, // 已提交的问卷进度为100%
                lastAccess: formatDateTime(submission.submitTime),
                startDate: submission.startTime,
                endDate: submission.submitTime,
                creatorName: submission.creatorName,
                createdTime: submission.startTime,
                updatedTime: submission.submitTime,
                submissionId: submission.id,
                submitTime: submission.submitTime,
                remainingTimes: submission.remainingTimes || 0 // 剩余填写次数
            }));
            
            showMessage('已提交问卷数据加载成功', 'success');
        } else {
            showMessage(data.message || '加载已提交问卷数据失败', 'error');
        }
    } catch (error) {
        console.error('加载已提交问卷数据失败:', error);
        showMessage('加载已提交问卷数据失败，请检查网络连接', 'error');
    } finally {
        // 渲染问卷列表
        renderRecentQuestionnaires();
    }
}

/**
 * 获取问卷状态文本
 */
function getQuestionnaireStatus(status) {
    switch (status) {
        case 0:
            return 'disabled';
        case 1:
            return 'active';
        case 2:
            return 'draft';
        case 'completed':
            return 'completed';
        default:
            return 'unknown';
    }
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '未知时间';
    
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return '未知时间';
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
            window.location.href = link;
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
async function startQRScan() {
    if (html5QrcodeScanner) {
        return; // 已经在扫描中
    }

    try {
        // 检测浏览器兼容性
        const browser = BrowserDetector.detectBrowser();
        const compatibility = BrowserDetector.getCompatibilityInfo();
        
        // 针对特定浏览器的特殊处理
        if (browser.isWeChat || browser.isAlipay || browser.isQQ || browser.isWeibo) {
            showMessage('检测到内置浏览器，摄像头访问可能受限', 'warning');
            // 显示浏览器兼容性信息
            BrowserDetector.showCompatibilityInfo();
            return;
        }

        // 检查是否支持getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showMessage('您的设备不支持摄像头访问，请使用其他方式', 'error');
            // 显示浏览器兼容性信息
            BrowserDetector.showCompatibilityInfo();
            return;
        }

        // 检查HTTPS环境（iOS Safari特别需要）
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            if (browser.isSafari && browser.isIOS) {
                showMessage('iOS Safari需要HTTPS环境才能访问摄像头', 'error');
                showHTTPSWarning();
                return;
            } else {
                showMessage('摄像头访问需要HTTPS环境，请使用HTTPS链接或localhost', 'warning');
                showHTTPSWarning();
                return;
            }
        }

        // 针对不同浏览器的摄像头配置优化
        let videoConstraints = {
            facingMode: "environment",
            width: { ideal: 1280, min: 320, max: 1920 },
            height: { ideal: 720, min: 240, max: 1080 },
            aspectRatio: { ideal: 16/9 },
            frameRate: { ideal: 30, min: 10, max: 60 }
        };

        // iOS Safari特殊配置
        if (browser.isSafari && browser.isIOS) {
            videoConstraints = {
                facingMode: "environment",
                width: { ideal: 640, min: 320, max: 1280 },
                height: { ideal: 480, min: 240, max: 720 },
                aspectRatio: { ideal: 4/3 },
                frameRate: { ideal: 24, min: 15, max: 30 }
            };
        }

        // Android Chrome特殊配置
        if (browser.isChrome && browser.isAndroid) {
            videoConstraints = {
                facingMode: "environment",
                width: { ideal: 1280, min: 640, max: 1920 },
                height: { ideal: 720, min: 480, max: 1080 },
                aspectRatio: { ideal: 16/9 },
                frameRate: { ideal: 30, min: 15, max: 60 }
            };
        }

        // 针对不同设备的摄像头选择优化
        if (browser.isMobile) {
            // 移动设备优先使用后置摄像头
            videoConstraints.facingMode = "environment";
            
            // 检测设备支持的摄像头数量
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = devices.filter(device => device.kind === 'videoinput');
                    
                    if (videoDevices.length > 1) {
                        // 多个摄像头时，优先选择后置摄像头
                        const backCamera = videoDevices.find(device => 
                            device.label.toLowerCase().includes('back') || 
                            device.label.toLowerCase().includes('rear') ||
                            device.label.toLowerCase().includes('环境') ||
                            device.label.toLowerCase().includes('后置')
                        );
                        
                        if (backCamera) {
                            videoConstraints.deviceId = { exact: backCamera.deviceId };
                        }
                    }
                } catch (error) {
                    console.log('无法枚举摄像头设备:', error);
                }
            }
        } else {
            // 桌面设备可以使用前置摄像头
            videoConstraints.facingMode = "user";
        }

        // 请求摄像头权限，支持降级配置
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: videoConstraints
            });
        } catch (error) {
            // 如果高配置失败，尝试降级配置
            if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                console.log('高配置摄像头失败，尝试降级配置...');
                
                // 降级配置
                const fallbackConstraints = {
                    facingMode: videoConstraints.facingMode,
                    width: { min: 320, max: 1280 },
                    height: { min: 240, max: 720 }
                };
                
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ 
                        video: fallbackConstraints
                    });
                    showMessage('摄像头启动成功（使用兼容模式）', 'success');
                } catch (fallbackError) {
                    console.error('降级配置也失败:', fallbackError);
                    throw fallbackError; // 重新抛出错误，让外层处理
                }
            } else {
                throw error; // 其他错误直接抛出
            }
        }

        // 权限获取成功，开始扫描
        const config = {
            fps: browser.isSafari ? 5 : 10, // Safari降低帧率提高稳定性
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
            // 新增配置项
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true
        };

        // 针对不同浏览器的扫描器配置
        if (browser.isSafari) {
            config.fps = 5;
            config.disableFlip = true; // Safari中禁用翻转提高性能
            config.qrbox = { width: 200, height: 200 }; // Safari使用较小的扫描框
        } else if (browser.isChrome && browser.isAndroid) {
            config.fps = 15; // Android Chrome可以使用更高帧率
            config.qrbox = { width: 300, height: 300 }; // 更大的扫描框
        } else if (browser.isMobile) {
            config.fps = 8; // 移动设备适中的帧率
            config.qrbox = { width: 250, height: 250 };
        }

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
            
            // 检查是否有多个摄像头，如果有则显示切换按钮
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                navigator.mediaDevices.enumerateDevices().then(devices => {
                    const videoDevices = devices.filter(device => device.kind === 'videoinput');
                    if (videoDevices.length > 1) {
                        switchCameraBtn.style.display = 'inline-block';
                    }
                }).catch(err => {
                    console.log('无法检查摄像头数量:', err);
                });
            }
            
            // 针对不同浏览器的成功提示
            if (browser.isSafari) {
                showMessage('扫描已开始（Safari模式），请将二维码对准摄像头', 'success');
            } else if (browser.isChrome && browser.isAndroid) {
                showMessage('扫描已开始（Android模式），请将二维码对准摄像头', 'success');
            } else {
                showMessage('扫描已开始，请将二维码对准摄像头', 'success');
            }
            
            // 隐藏权限提示
            hidePermissionHint();
        }).catch(err => {
            console.error('QR扫描启动失败:', err);
            
            // 针对不同浏览器的错误处理
            if (err.name === 'NotAllowedError') {
                if (browser.isSafari && browser.isIOS) {
                    showMessage('iOS Safari摄像头权限被拒绝，请在设置中开启', 'error');
                } else if (browser.isChrome && browser.isAndroid) {
                    showMessage('Android Chrome摄像头权限被拒绝，请重新授权', 'error');
                } else {
                    showMessage('摄像头权限被拒绝，请在浏览器设置中允许', 'error');
                }
                showPermissionError();
            } else if (err.name === 'NotFoundError') {
                showMessage('未找到摄像头设备，请检查设备连接', 'error');
            } else if (err.name === 'NotReadableError') {
                showMessage('摄像头被其他应用占用，请关闭其他使用摄像头的应用', 'error');
            } else if (err.name === 'NotSupportedError') {
                showMessage('您的设备不支持摄像头访问', 'error');
            } else if (err.name === 'SecurityError') {
                showMessage('安全策略限制，请使用HTTPS环境', 'error');
            } else {
                showMessage('无法启动摄像头，请检查权限设置', 'error');
            }
            
            // 显示浏览器兼容性信息
            BrowserDetector.showCompatibilityInfo();
        });

    } catch (error) {
        console.error('启动扫描失败:', error);
        
        // 针对不同浏览器的错误处理
        if (error.name === 'NotAllowedError') {
            const browser = BrowserDetector.detectBrowser();
            if (browser.isSafari && browser.isIOS) {
                showMessage('iOS Safari摄像头权限被拒绝，请在设置中开启', 'error');
            } else if (browser.isChrome && browser.isAndroid) {
                showMessage('Android Chrome摄像头权限被拒绝，请重新授权', 'error');
            } else {
                showMessage('摄像头权限被拒绝，请在浏览器设置中允许', 'error');
            }
            showPermissionError();
        } else if (error.name === 'NotSupportedError') {
            showMessage('您的设备不支持摄像头访问', 'error');
        } else if (error.name === 'SecurityError') {
            showMessage('安全策略限制，请使用HTTPS环境', 'error');
        } else {
            showMessage('启动扫描失败: ' + error.message, 'error');
        }
        
        // 显示浏览器兼容性信息
        BrowserDetector.showCompatibilityInfo();
    }
}

// 停止二维码扫描
function stopQRScan() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner = null;
            qrOverlay.style.display = 'flex';
            startScanBtn.style.display = 'inline-block';
            stopScanBtn.style.display = 'none';
            switchCameraBtn.style.display = 'none';
            showMessage('扫描已停止', 'info');
        }).catch(err => {
            console.error('停止扫描失败:', err);
        });
    }
}

// 切换摄像头
async function switchCamera() {
    if (!html5QrcodeScanner) {
        showMessage('请先开始扫描', 'warning');
        return;
    }

    try {
        // 获取可用的摄像头设备
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length < 2) {
            showMessage('设备只有一个摄像头，无法切换', 'info');
            return;
        }

        // 停止当前扫描
        await html5QrcodeScanner.stop();
        html5QrcodeScanner = null;

        // 获取当前使用的摄像头
        const currentDeviceId = html5QrcodeScanner.getCurrentDeviceId();
        const currentIndex = videoDevices.findIndex(device => device.deviceId === currentDeviceId);
        const nextIndex = (currentIndex + 1) % videoDevices.length;
        const nextDevice = videoDevices[nextIndex];

        showMessage(`正在切换到${nextDevice.label || '摄像头'}...`, 'info');

        // 重新开始扫描，使用新的摄像头
        setTimeout(() => {
            startQRScanWithDevice(nextDevice.deviceId);
        }, 500);

    } catch (error) {
        console.error('切换摄像头失败:', error);
        showMessage('切换摄像头失败: ' + error.message, 'error');
    }
}

// 使用指定设备开始扫描
async function startQRScanWithDevice(deviceId) {
    try {
        const browser = BrowserDetector.detectBrowser();
        
        // 配置扫描器
        const config = {
            fps: browser.isSafari ? 5 : 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true
        };

        // 针对不同浏览器的扫描器配置
        if (browser.isSafari) {
            config.fps = 5;
            config.disableFlip = true;
            config.qrbox = { width: 200, height: 200 };
        } else if (browser.isChrome && browser.isAndroid) {
            config.fps = 15;
            config.qrbox = { width: 300, height: 300 };
        } else if (browser.isMobile) {
            config.fps = 8;
            config.qrbox = { width: 250, height: 250 };
        }

        html5QrcodeScanner = new Html5Qrcode("qr-reader");
        
        html5QrcodeScanner.start(
            { deviceId: { exact: deviceId } },
            config,
            onScanSuccess,
            onScanFailure
        ).then(() => {
            qrOverlay.style.display = 'none';
            startScanBtn.style.display = 'none';
            stopScanBtn.style.display = 'inline-block';
            
            showMessage('摄像头切换成功，扫描已重新开始', 'success');
        }).catch(err => {
            console.error('重新启动扫描失败:', err);
            showMessage('重新启动扫描失败: ' + err.message, 'error');
        });

    } catch (error) {
        console.error('使用指定设备启动扫描失败:', error);
        showMessage('启动扫描失败: ' + error.message, 'error');
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
    const buttonText = getButtonText(questionnaire.status);
    const buttonAction = getButtonAction(questionnaire.status);

    return `
        <div class="recent-item">
            <h3>${questionnaire.title}</h3>
            <p>${questionnaire.description}</p>
            <div class="recent-meta">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <span>创建时间: ${questionnaire.lastAccess}</span>
            </div>
            <div class="recent-meta">
                <span>问卷ID: ${questionnaire.id}</span>
                <span>创建者用户名: ${questionnaire.creatorName || '未知'}</span>
            </div>
            <div class="recent-meta">
                <span class="remaining-times ${getRemainingTimesClass(questionnaire.remainingTimes)}">${getRemainingTimesText(questionnaire.remainingTimes)}</span>
            </div>
            <button class="btn-continue" onclick="${buttonAction}(${questionnaire.id})">
                ${buttonText}
            </button>
        </div>
    `;
}

/**
 * 获取按钮文本
 */
function getButtonText(status) {
    switch (status) {
        case 'active':
            return '开始填写';
        case 'disabled':
            return '问卷已禁用';
        case 'draft':
            return '问卷草稿';
        case 'completed':
            return '查看结果';
        default:
            return '查看详情';
    }
}

/**
 * 获取按钮动作
 */
function getButtonAction(status) {
    switch (status) {
        case 'active':
            return 'startFill';
        case 'disabled':
            return 'showDisabledMessage';
        case 'draft':
            return 'showDraftMessage';
        case 'completed':
            return 'viewResult';
        default:
            return 'viewDetail';
    }
}

// 开始填写问卷
function startFill(questionnaireId) {
    window.location.href = `${CONFIG.ROUTES.QUESTIONNAIRE_FILL}?id=${questionnaireId}`;
}

// 继续填写问卷
function continueFill(questionnaireId) {
    window.location.href = `${CONFIG.ROUTES.QUESTIONNAIRE_FILL}?id=${questionnaireId}`;
}

// 查看问卷结果
function viewResult(questionnaireId) {
    window.location.href = `${CONFIG.ROUTES.QUESTIONNAIRE_RESULT}?id=${questionnaireId}`;
}

// 显示禁用消息
function showDisabledMessage(questionnaireId) {
    showMessage('该问卷已被禁用，无法填写', 'warning');
}

// 显示草稿消息
function showDraftMessage(questionnaireId) {
    showMessage('该问卷为草稿状态，无法填写', 'warning');
}

// 查看问卷详情
function viewDetail(questionnaireId) {
    window.location.href = `${CONFIG.ROUTES.QUESTIONNAIRE_PREVIEW}?id=${questionnaireId}`;
}

// 打开历史记录模态框
function openHistoryModal() {
    historyModal.classList.add('active');
    // 打开时刷新一次用户历史
    loadHistoryForUser().then(() => {
        renderHistoryList();
    }).catch(() => renderHistoryList());
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

// 按用户拉取历史记录（已提交+草稿）
async function loadHistoryForUser() {
    try {
        const user = UTILS.getUserInfo();
        if (!user || !user.id) return;

        const results = [];

        // 1) 查询最近可填写/曾经填写过的问卷列表（用于补全标题描述）
        const allUrl = `${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTIONNAIRE_ALL}?page=1&size=200`;
        const allRes = await fetch(allUrl, { headers: { 'Content-Type': 'application/json' } });
        const allData = await allRes.json();
        const questionnaireMap = new Map();
        if (allData && allData.code === 200) {
            const list = allData.data.list || allData.data || [];
            list.forEach(q => questionnaireMap.set(q.id, q));
        }

        // 2) 查询用户是否提交（单个问卷的"是否提交"接口已存在：/submission/checkSubmission），
        //    这里没有后端批量列表接口，前端临时用草稿+全部问卷拼装：
        //    2.1 尝试为每个问卷获取自身草稿（有则视为进行中）
        const drafts = [];
        for (const [qid] of questionnaireMap) {
            const params = new URLSearchParams();
            params.set('questionnaireId', qid);
            params.set('userId', user.id);
            const draftUrl = `${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.SUBMISSION_GET_DRAFT}?${params.toString()}`;
            try {
                const res = await fetch(draftUrl, { headers: { 'Content-Type': 'application/json' } });
                const data = await res.json();
                if (data && data.code === 200 && data.data) {
                    drafts.push({ questionnaireId: qid, draft: data.data });
                }
            } catch (e) {
                // 忽略单个失败
            }
        }

        // 3) 生成历史列表：优先展示有草稿的为进行中，其余仅展示可填写为普通项
        const merged = [];
        for (const [qid, q] of questionnaireMap) {
            const draftInfo = drafts.find(d => d.questionnaireId === qid);
            const isDraft = !!draftInfo;
            merged.push({
                id: qid,
                title: (q && q.title) || '未命名问卷',
                description: (q && q.description) || '暂无描述',
                status: isDraft ? 'in-progress' : getQuestionnaireStatus(q && q.status),
                progress: isDraft ? (draftInfo.draft.progress || 0) : 0,
                startDate: q && q.startDate,
                lastAccess: UTILS.formatDate(q && (q.updatedTime || q.createdTime) || Date.now()),
                estimatedTime: '—'
            });
        }

        // 4) 去重（以问卷ID为主键）
        const unique = new Map();
        merged.forEach(item => unique.set(item.id, item));
        historyQuestionnaires = Array.from(unique.values());

    } catch (e) {
        console.warn('加载用户历史记录失败:', e);
    }
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
        'expired': '已过期',
        'active': '可填写',
        'disabled': '已禁用',
        'draft': '草稿',
        'unknown': '未知状态'
    };
    return statusMap[status] || status;
}

/**
 * 获取剩余填写次数文本
 */
function getRemainingTimesText(remainingTimes) {
    if (remainingTimes === -1) {
        return '无填写次数限制';
    } else if (remainingTimes === 0) {
        return '已达到填写次数限制';
    } else if (remainingTimes === 1) {
        return '剩余填写次数: 1次';
    } else {
        return `剩余填写次数: ${remainingTimes}次`;
    }
}

/**
 * 获取剩余填写次数CSS类
 */
function getRemainingTimesClass(remainingTimes) {
    if (remainingTimes === -1) {
        return 'unlimited';
    } else if (remainingTimes === 0) {
        return 'limited';
    } else {
        return 'remaining';
    }
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

// 显示HTTPS警告
function showHTTPSWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'https-warning';
    warningDiv.innerHTML = `
        <div class="warning-content">
            <h3>⚠️ 摄像头访问需要HTTPS环境</h3>
            <p>为了安全起见，现代浏览器要求HTTPS环境才能访问摄像头。</p>
            <div class="warning-solutions">
                <h4>解决方案：</h4>
                <ul>
                    <li>使用HTTPS链接访问页面</li>
                    <li>在本地开发环境使用localhost</li>
                    <li>联系管理员配置HTTPS证书</li>
                </ul>
            </div>
            <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">我知道了</button>
        </div>
    `;
    
    // 添加到页面
    const qrSection = document.querySelector('.qr-section');
    qrSection.appendChild(warningDiv);
}

// 显示权限错误
function showPermissionError() {
    const permissionDiv = document.createElement('div');
    permissionDiv.className = 'permission-error';
    permissionDiv.innerHTML = `
        <div class="error-content">
            <h3>🔒 需要摄像头权限</h3>
            <p>二维码扫描功能需要访问您的摄像头。</p>
            <div class="permission-steps">
                <h4>如何开启权限：</h4>
                <div class="step-item">
                    <span class="step-number">1</span>
                    <span>点击地址栏左侧的锁定图标 🔒</span>
                </div>
                <div class="step-item">
                    <span class="step-number">2</span>
                    <span>找到"摄像头"权限设置</span>
                </div>
                <div class="step-item">
                    <span class="step-number">3</span>
                    <span>选择"允许"或"始终允许"</span>
                </div>
                <div class="step-item">
                    <span class="step-number">4</span>
                    <span>刷新页面后重试</span>
                </div>
            </div>
            <div class="permission-actions">
                <button class="btn-primary" onclick="retryPermission()">重试权限</button>
                <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">稍后再说</button>
            </div>
        </div>
    `;
    
    // 添加到页面
    const qrSection = document.querySelector('.qr-section');
    qrSection.appendChild(permissionDiv);
}

// 重试权限
async function retryPermission() {
    try {
        // 移除错误提示
        const errorDiv = document.querySelector('.permission-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        
        // 重新请求权限
        await startQRScan();
    } catch (error) {
        console.error('重试权限失败:', error);
    }
}

// 隐藏权限提示
function hidePermissionHint() {
    const permissionDiv = document.querySelector('.permission-error');
    if (permissionDiv) {
        permissionDiv.remove();
    }
}

// 检测设备类型并显示相应的权限提示
function detectDeviceAndShowHint() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isMobile) {
        // 显示移动端权限提示
        const mobileHint = document.getElementById('mobilePermissionHint');
        if (mobileHint) {
            mobileHint.style.display = 'block';
            
            // 根据设备类型调整提示内容
            if (isIOS) {
                updateIOSPermissionHint();
            } else if (isAndroid) {
                updateAndroidPermissionHint();
            }
        }
    } else {
        // 桌面端隐藏移动端提示
        const mobileHint = document.getElementById('mobilePermissionHint');
        if (mobileHint) {
            mobileHint.style.display = 'none';
        }
    }
}

// 更新iOS设备权限提示
function updateIOSPermissionHint() {
    const hintContent = document.querySelector('.hint-content');
    if (hintContent) {
        const browser = BrowserDetector.detectBrowser();
        let iosTips = `
            <div class="permission-tips">
                <div class="tip-item">
                    <span class="tip-icon">🔒</span>
                    <span>首次使用时会弹出权限请求</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">✅</span>
                    <span>选择"允许"即可正常使用</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">⚙️</span>
                    <span>如被拒绝，请在"设置 > Safari > 摄像头"中开启</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">📱</span>
                    <span>建议使用Safari浏览器以获得最佳体验</span>
                </div>
        `;
        
        // 针对内置浏览器的特殊提示
        if (browser.isWeChat || browser.isAlipay || browser.isQQ || browser.isWeibo) {
            iosTips += `
                <div class="tip-item">
                    <span class="tip-icon">⚠️</span>
                    <span>当前在${BrowserDetector.getBrowserDisplayName(browser)}中，功能受限</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">🌐</span>
                    <span>建议点击右上角菜单，选择"在浏览器中打开"</span>
                </div>
            `;
        }
        
        iosTips += `</div>`;
        
        const existingTips = hintContent.querySelector('.permission-tips');
        if (existingTips) {
            existingTips.outerHTML = iosTips;
        }
    }
}

// 更新Android设备权限提示
function updateAndroidPermissionHint() {
    const hintContent = document.querySelector('.hint-content');
    if (hintContent) {
        const browser = BrowserDetector.detectBrowser();
        let androidTips = `
            <div class="permission-tips">
                <div class="tip-item">
                    <span class="tip-icon">🔒</span>
                    <span>首次使用时会弹出权限请求</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">✅</span>
                    <span>选择"允许"即可正常使用</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">⚙️</span>
                    <span>如被拒绝，请在"设置 > 应用 > 浏览器 > 权限"中开启摄像头</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">🌐</span>
                    <span>支持Chrome、Edge等主流浏览器</span>
                </div>
        `;
        
        // 针对内置浏览器的特殊提示
        if (browser.isWeChat || browser.isAlipay || browser.isQQ || browser.isWeibo) {
            androidTips += `
                <div class="tip-item">
                    <span class="tip-icon">⚠️</span>
                    <span>当前在${BrowserDetector.getBrowserDisplayName(browser)}中，功能受限</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">🌐</span>
                    <span>建议点击右上角菜单，选择"在浏览器中打开"</span>
                </div>
            `;
        }
        
        androidTips += `</div>`;
        
        const existingTips = hintContent.querySelector('.permission-tips');
        if (existingTips) {
            existingTips.outerHTML = androidTips;
        }
    }
}

// 隐藏移动端权限提示
function hideMobilePermissionHint() {
    const mobileHint = document.getElementById('mobilePermissionHint');
    if (mobileHint) {
        mobileHint.style.display = 'none';
        
        // 保存用户选择，避免重复显示
        localStorage.setItem('mobilePermissionHintHidden', 'true');
    }
}

// 权限检测工具
const PermissionChecker = {
    // 检查摄像头权限状态
    async checkCameraPermission() {
        try {
            // 检测浏览器兼容性
            const browser = BrowserDetector.detectBrowser();
            const compatibility = BrowserDetector.getCompatibilityInfo();
            
            // 针对内置浏览器的特殊处理
            if (browser.isWeChat || browser.isAlipay || browser.isQQ || browser.isWeibo) {
                return {
                    supported: false,
                    permission: 'restricted',
                    reason: '内置浏览器对摄像头访问有限制',
                    solution: '建议在微信/支付宝中点击右上角菜单，选择"在浏览器中打开"',
                    browser: browser,
                    compatibility: compatibility
                };
            }

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return {
                    supported: false,
                    permission: 'unsupported',
                    reason: '设备不支持摄像头访问',
                    solution: '请使用支持摄像头的设备',
                    browser: browser,
                    compatibility: compatibility
                };
            }

            // 检查HTTPS环境（iOS Safari特别需要）
            if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                if (browser.isSafari && browser.isIOS) {
                    return {
                        supported: false,
                        permission: 'restricted',
                        reason: 'iOS Safari需要HTTPS环境才能访问摄像头',
                        solution: '请使用HTTPS链接或localhost访问',
                        browser: browser,
                        compatibility: compatibility
                    };
                } else {
                    return {
                        supported: false,
                        permission: 'restricted',
                        reason: '摄像头访问需要HTTPS环境',
                        solution: '请使用HTTPS链接或localhost访问',
                        browser: browser,
                        compatibility: compatibility
                    };
                }
            }

            // 针对不同浏览器的摄像头配置优化
            let videoConstraints = { facingMode: "environment" };
            
            if (browser.isSafari && browser.isIOS) {
                videoConstraints = {
                    facingMode: "environment",
                    width: { ideal: 640, min: 320, max: 1280 },
                    height: { ideal: 480, min: 240, max: 720 },
                    aspectRatio: { ideal: 4/3 },
                    frameRate: { ideal: 24, min: 15, max: 30 }
                };
            } else if (browser.isChrome && browser.isAndroid) {
                videoConstraints = {
                    facingMode: "environment",
                    width: { ideal: 1280, min: 640, max: 1920 },
                    height: { ideal: 720, min: 480, max: 1080 },
                    aspectRatio: { ideal: 16/9 },
                    frameRate: { ideal: 30, min: 15, max: 60 }
                };
            }

            // 检测可用的摄像头设备
            let availableCameras = [];
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    availableCameras = devices.filter(device => device.kind === 'videoinput');
                    console.log('可用摄像头设备:', availableCameras.length);
                } catch (error) {
                    console.log('无法枚举摄像头设备:', error);
                }
            }

            // 尝试获取摄像头权限
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: videoConstraints
            });
            
            // 停止流
            stream.getTracks().forEach(track => track.stop());
            
            return {
                supported: true,
                permission: 'granted',
                reason: '摄像头权限已获取',
                solution: '可以正常使用二维码扫描功能',
                browser: browser,
                compatibility: compatibility
            };

        } catch (error) {
            const browser = BrowserDetector.detectBrowser();
            const compatibility = BrowserDetector.getCompatibilityInfo();
            
            let reason = '未知错误';
            let solution = '请检查设备设置';

            switch (error.name) {
                case 'NotAllowedError':
                    if (browser.isSafari && browser.isIOS) {
                        reason = 'iOS Safari摄像头权限被拒绝';
                        solution = '请在"设置 > Safari > 摄像头"中开启权限';
                    } else if (browser.isChrome && browser.isAndroid) {
                        reason = 'Android Chrome摄像头权限被拒绝';
                        solution = '请在"设置 > 应用 > 浏览器 > 权限"中开启摄像头';
                    } else {
                        reason = '摄像头权限被拒绝';
                        solution = '请在浏览器设置中允许摄像头权限';
                    }
                    break;
                case 'NotFoundError':
                    reason = '未找到摄像头设备';
                    solution = '请检查设备是否连接摄像头';
                    break;
                case 'NotReadableError':
                    reason = '摄像头被其他应用占用';
                    solution = '请关闭其他使用摄像头的应用';
                    break;
                case 'NotSupportedError':
                    reason = '设备不支持摄像头访问';
                    solution = '请使用支持摄像头的设备';
                    break;
                case 'SecurityError':
                    reason = '安全策略限制';
                    solution = '请使用HTTPS环境或localhost';
                    break;
                case 'AbortError':
                    reason = '摄像头访问被中断';
                    solution = '请重新尝试访问摄像头';
                    break;
                case 'NotReadableError':
                    reason = '摄像头无法读取';
                    solution = '请检查摄像头是否正常工作';
                    break;
            }

            return {
                supported: false,
                permission: 'denied',
                reason: reason,
                solution: solution,
                error: error,
                browser: browser,
                compatibility: compatibility
            };
        }
    },

    // 显示权限检测结果
    async showPermissionStatus() {
        const status = await this.checkCameraPermission();
        
        let statusClass = 'permission-status';
        let statusIcon = '❌';
        let statusTitle = '权限检测失败';
        
        if (status.supported && status.permission === 'granted') {
            statusClass += ' success';
            statusIcon = '✅';
            statusTitle = '权限检测通过';
        } else if (status.supported) {
            statusClass += ' warning';
            statusIcon = '⚠️';
            statusTitle = '权限需要配置';
        } else if (status.permission === 'restricted') {
            statusClass += ' restricted';
            statusIcon = '🚫';
            statusTitle = '功能受限';
        } else {
            statusClass += ' error';
        }

        const statusDiv = document.createElement('div');
        statusDiv.className = statusClass;
        statusDiv.innerHTML = `
            <div class="status-content">
                <h3>${statusIcon} ${statusTitle}</h3>
                <div class="status-details">
                    <p><strong>状态：</strong>${status.reason}</p>
                    <p><strong>解决方案：</strong>${status.solution}</p>
                    ${status.browser ? `<p><strong>当前浏览器：</strong>${BrowserDetector.getBrowserDisplayName(status.browser)}</p>` : ''}
                </div>
                
                ${status.compatibility && status.compatibility.limitations.length > 0 ? `
                    <div class="browser-limitations">
                        <h4>⚠️ 浏览器限制：</h4>
                        <ul>
                            ${status.compatibility.limitations.map(limitation => `<li>${limitation}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${status.compatibility && status.compatibility.recommendations.length > 0 ? `
                    <div class="browser-recommendations">
                        <h4>💡 使用建议：</h4>
                        <ul>
                            ${status.compatibility.recommendations.map(recommendation => `<li>${recommendation}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${status.permission === 'restricted' ? `
                    <div class="restricted-actions">
                        <button class="btn-primary" onclick="BrowserDetector.openInExternalBrowser()">在外部浏览器中打开</button>
                        <button class="btn-secondary" onclick="BrowserDetector.showCompatibilityInfo()">查看兼容性信息</button>
                    </div>
                ` : ''}
                
                ${status.supported && status.permission !== 'granted' ? `
                    <div class="permission-actions">
                        <button class="btn-primary" onclick="PermissionChecker.retryPermission()">重试权限</button>
                        <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">关闭</button>
                    </div>
                ` : ''}
                
                <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">关闭</button>
            </div>
        `;

        // 添加到页面
        const qrSection = document.querySelector('.qr-section');
        qrSection.appendChild(statusDiv);
    },

    // 重试权限
    async retryPermission() {
        try {
            // 移除状态提示
            const statusDiv = document.querySelector('.permission-status');
            if (statusDiv) {
                statusDiv.remove();
            }

            // 重新检测权限
            await this.showPermissionStatus();
        } catch (error) {
            console.error('重试权限检测失败:', error);
        }
    }
};

// 将权限检测工具添加到全局作用域
window.PermissionChecker = PermissionChecker;

// 浏览器检测和兼容性处理
const BrowserDetector = {
    // 检测浏览器类型
    detectBrowser() {
        const userAgent = navigator.userAgent;
        const isWeChat = /MicroMessenger/i.test(userAgent);
        const isAlipay = /AlipayClient/i.test(userAgent);
        const isQQ = /QQ\//i.test(userAgent);
        const isWeibo = /Weibo/i.test(userAgent);
        const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
        const isChrome = /Chrome/i.test(userAgent) && !/Edge/i.test(userAgent);
        const isEdge = /Edge/i.test(userAgent);
        const isFirefox = /Firefox/i.test(userAgent);
        const isOpera = /Opera|OPR/i.test(userAgent);
        const isIE = /MSIE|Trident/i.test(userAgent);
        
        return {
            isWeChat,
            isAlipay,
            isQQ,
            isWeibo,
            isSafari,
            isChrome,
            isEdge,
            isFirefox,
            isOpera,
            isIE,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
            isIOS: /iPad|iPhone|iPod/.test(userAgent),
            isAndroid: /Android/.test(userAgent),
            userAgent
        };
    },

    // 获取浏览器兼容性信息
    getCompatibilityInfo() {
        const browser = this.detectBrowser();
        const info = {
            cameraSupported: false,
            qrScanSupported: false,
            limitations: [],
            recommendations: [],
            browser: browser
        };

        // 检查摄像头支持
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            info.cameraSupported = true;
        } else {
            info.limitations.push('设备不支持摄像头访问');
        }

        // 检查二维码扫描支持
        if (typeof Html5Qrcode !== 'undefined') {
            info.qrScanSupported = true;
        } else {
            info.limitations.push('二维码扫描库未加载');
        }

        // 针对不同浏览器的特殊处理
        if (browser.isWeChat) {
            info.limitations.push('微信内置浏览器对摄像头访问有限制');
            info.recommendations.push('建议在微信中点击右上角菜单，选择"在浏览器中打开"');
            info.recommendations.push('或使用系统默认浏览器访问');
        }

        if (browser.isAlipay) {
            info.limitations.push('支付宝内置浏览器对摄像头访问有限制');
            info.recommendations.push('建议在支付宝中点击右上角菜单，选择"在浏览器中打开"');
            info.recommendations.push('或使用系统默认浏览器访问');
        }

        if (browser.isQQ) {
            info.limitations.push('QQ内置浏览器对摄像头访问有限制');
            info.recommendations.push('建议在QQ中点击右上角菜单，选择"在浏览器中打开"');
        }

        if (browser.isWeibo) {
            info.limitations.push('微博内置浏览器对摄像头访问有限制');
            info.recommendations.push('建议在微博中点击右上角菜单，选择"在浏览器中打开"');
        }

        if (browser.isSafari && browser.isIOS) {
            info.recommendations.push('iOS Safari需要HTTPS环境才能访问摄像头');
            info.recommendations.push('建议使用Safari浏览器以获得最佳体验');
        }

        if (browser.isChrome && browser.isAndroid) {
            info.recommendations.push('Android Chrome支持摄像头访问，但需要用户授权');
        }

        if (browser.isIE) {
            info.limitations.push('Internet Explorer不支持现代摄像头API');
            info.recommendations.push('建议使用Edge、Chrome或Firefox等现代浏览器');
        }

        return info;
    },

    // 显示浏览器兼容性信息
    showCompatibilityInfo() {
        const info = this.getCompatibilityInfo();
        const browser = info.browser;
        
        let statusClass = 'browser-compatibility';
        let statusIcon = '🌐';
        let statusTitle = '浏览器兼容性检测';
        
        if (info.cameraSupported && info.qrScanSupported) {
            statusClass += ' success';
            statusIcon = '✅';
            statusTitle = '浏览器兼容性良好';
        } else if (info.cameraSupported || info.qrScanSupported) {
            statusClass += ' warning';
            statusIcon = '⚠️';
            statusTitle = '部分功能受限';
        } else {
            statusClass += ' error';
            statusIcon = '❌';
            statusTitle = '浏览器兼容性较差';
        }

        const statusDiv = document.createElement('div');
        statusDiv.className = statusClass;
        statusDiv.innerHTML = `
            <div class="compatibility-content">
                <h3>${statusIcon} ${statusTitle}</h3>
                <div class="browser-info">
                    <p><strong>当前浏览器：</strong>${this.getBrowserDisplayName(browser)}</p>
                    <p><strong>设备类型：</strong>${browser.isMobile ? '移动设备' : '桌面设备'}</p>
                    <p><strong>操作系统：</strong>${browser.isIOS ? 'iOS' : browser.isAndroid ? 'Android' : '其他'}</p>
                </div>
                ${info.limitations.length > 0 ? `
                    <div class="limitations">
                        <h4>⚠️ 功能限制：</h4>
                        <ul>
                            ${info.limitations.map(limitation => `<li>${limitation}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${info.recommendations.length > 0 ? `
                    <div class="recommendations">
                        <h4>💡 使用建议：</h4>
                        <ul>
                            ${info.recommendations.map(recommendation => `<li>${recommendation}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div class="compatibility-actions">
                    <button class="btn-primary" onclick="BrowserDetector.openInExternalBrowser()">在外部浏览器中打开</button>
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">关闭</button>
                </div>
            </div>
        `;

        // 添加到页面
        const qrSection = document.querySelector('.qr-section');
        qrSection.appendChild(statusDiv);
    },

    // 获取浏览器显示名称
    getBrowserDisplayName(browser) {
        if (browser.isWeChat) return '微信内置浏览器';
        if (browser.isAlipay) return '支付宝内置浏览器';
        if (browser.isQQ) return 'QQ内置浏览器';
        if (browser.isWeibo) return '微博内置浏览器';
        if (browser.isSafari) return 'Safari';
        if (browser.isChrome) return 'Chrome';
        if (browser.isEdge) return 'Edge';
        if (browser.isFirefox) return 'Firefox';
        if (browser.isOpera) return 'Opera';
        if (browser.isIE) return 'Internet Explorer';
        return '未知浏览器';
    },

    // 尝试在外部浏览器中打开
    openInExternalBrowser() {
        const currentUrl = window.location.href;
        
        if (this.detectBrowser().isWeChat) {
            // 微信中显示提示
            this.showWeChatGuide();
        } else if (this.detectBrowser().isAlipay) {
            // 支付宝中显示提示
            this.showAlipayGuide();
        } else {
            // 其他情况尝试直接打开
            window.open(currentUrl, '_blank');
        }
    },

    // 显示微信使用指南
    showWeChatGuide() {
        const guideDiv = document.createElement('div');
        guideDiv.className = 'wechat-guide';
        guideDiv.innerHTML = `
            <div class="guide-content">
                <h3>📱 微信使用指南</h3>
                <div class="guide-steps">
                    <div class="step-item">
                        <span class="step-number">1</span>
                        <span>点击右上角"..."菜单</span>
                    </div>
                    <div class="step-item">
                        <span class="step-number">2</span>
                        <span>选择"在浏览器中打开"</span>
                    </div>
                    <div class="step-item">
                        <span class="step-number">3</span>
                        <span>使用系统浏览器访问</span>
                    </div>
                </div>
                <div class="guide-tips">
                    <p>💡 提示：在外部浏览器中可以获得更好的摄像头访问体验</p>
                </div>
                <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">我知道了</button>
            </div>
        `;

        // 添加到页面
        const qrSection = document.querySelector('.qr-section');
        qrSection.appendChild(guideDiv);
    },

    // 显示支付宝使用指南
    showAlipayGuide() {
        const guideDiv = document.createElement('div');
        guideDiv.className = 'alipay-guide';
        guideDiv.innerHTML = `
            <div class="guide-content">
                <h3>💰 支付宝使用指南</h3>
                <div class="guide-steps">
                    <div class="step-item">
                        <span class="step-number">1</span>
                        <span>点击右上角"..."菜单</span>
                    </div>
                    <div class="step-item">
                        <span class="step-number">2</span>
                        <span>选择"在浏览器中打开"</span>
                    </div>
                    <div class="step-item">
                        <span class="step-number">3</span>
                        <span>使用系统浏览器访问</span>
                    </div>
                </div>
                <div class="guide-tips">
                    <p>💡 提示：在外部浏览器中可以获得更好的摄像头访问体验</p>
                </div>
                <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">我知道了</button>
            </div>
        `;

        // 添加到页面
        const qrSection = document.querySelector('.qr-section');
        qrSection.appendChild(guideDiv);
    },

    // 获取摄像头设备信息
    async getCameraInfo() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                return { error: '设备不支持摄像头枚举' };
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            const cameraInfo = videoDevices.map(device => ({
                deviceId: device.deviceId,
                label: device.label || `摄像头 ${device.deviceId.slice(0, 8)}`,
                groupId: device.groupId,
                isBackCamera: device.label.toLowerCase().includes('back') || 
                             device.label.toLowerCase().includes('rear') ||
                             device.label.toLowerCase().includes('环境') ||
                             device.label.toLowerCase().includes('后置'),
                isFrontCamera: device.label.toLowerCase().includes('front') || 
                              device.label.toLowerCase().includes('前置') ||
                              device.label.toLowerCase().includes('user')
            }));

            return {
                count: videoDevices.length,
                devices: cameraInfo,
                hasMultipleCameras: videoDevices.length > 1,
                hasBackCamera: cameraInfo.some(cam => cam.isBackCamera),
                hasFrontCamera: cameraInfo.some(cam => cam.isFrontCamera)
            };
        } catch (error) {
            return { error: '获取摄像头信息失败: ' + error.message };
        }
    },

    // 显示摄像头设备信息
    async showCameraInfo() {
        const cameraInfo = await this.getCameraInfo();
        
        if (cameraInfo.error) {
            showMessage(cameraInfo.error, 'error');
            return;
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'camera-info';
        infoDiv.innerHTML = `
            <div class="info-content">
                <h3>📷 摄像头设备信息</h3>
                <div class="camera-summary">
                    <p><strong>设备数量：</strong>${cameraInfo.count} 个</p>
                    <p><strong>多摄像头：</strong>${cameraInfo.hasMultipleCameras ? '是' : '否'}</p>
                    <p><strong>后置摄像头：</strong>${cameraInfo.hasBackCamera ? '是' : '否'}</p>
                    <p><strong>前置摄像头：</strong>${cameraInfo.hasFrontCamera ? '是' : '否'}</p>
                </div>
                ${cameraInfo.devices.length > 0 ? `
                    <div class="camera-list">
                        <h4>📱 设备详情：</h4>
                        ${cameraInfo.devices.map((device, index) => `
                            <div class="camera-item">
                                <span class="camera-number">${index + 1}</span>
                                <span class="camera-label">${device.label}</span>
                                <span class="camera-type">
                                    ${device.isBackCamera ? '🔙 后置' : device.isFrontCamera ? '📱 前置' : '❓ 未知'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">关闭</button>
            </div>
        `;

        // 添加到页面
        const qrSection = document.querySelector('.qr-section');
        qrSection.appendChild(infoDiv);
    }
};

// 将浏览器检测器添加到全局作用域
window.BrowserDetector = BrowserDetector;

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
