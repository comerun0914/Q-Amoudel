// 问卷创建页面逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const createBtn = document.querySelector('.btn-create-questionnaire');
    const titleInput = document.getElementById('questionnaire-title');
    const descriptionInput = document.getElementById('questionnaire-description');
    if (createBtn) {
        createBtn.addEventListener('click', handleCreateQuestionnaire);
    }

    // 绑定问卷管理按钮
    const questionnaireManagementBtn = document.getElementById('questionnaireManagementBtn');
    if (questionnaireManagementBtn) {
        questionnaireManagementBtn.addEventListener('click', handleQuestionnaireManagement);
    }

    // 绑定日期验证
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const maxSubmissionsInput = document.getElementById('max-submissions');

    // 设置默认日期
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

    startDateInput.value = today.toISOString().split('T')[0];
    endDateInput.value = nextMonth.toISOString().split('T')[0];

    // 创建问卷按钮点击事件
    createBtn.addEventListener('click', async function(e) {
        console.log('=== 创建问卷按钮被点击 ===');
        // 阻止默认行为，确保我们的代码执行
        e.preventDefault();
        e.stopPropagation();
        
        // 验证必填字段
        if (!titleInput.value.trim()) {
            alert('请输入问卷标题');
            titleInput.focus();
            return;
        }

        if (!startDateInput.value) {
            alert('请选择开始日期');
            startDateInput.focus();
            return;
        }

        if (!endDateInput.value) {
            alert('请选择结束日期');
            endDateInput.focus();
            return;
        }

        // 验证日期逻辑
        if (new Date(startDateInput.value) >= new Date(endDateInput.value)) {
            alert('结束日期必须晚于开始日期');
            return;
        }

        // 准备请求数据
        const questionnaireData = {
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            submissionLimit: parseInt(maxSubmissionsInput.value) || 1,
            status: true,
            creatorId: getCurrentUserId() // 从localStorage或session获取当前用户ID
        };

        try {
            console.log('=== 开始创建问卷 ===');
            // 显示加载动画卡片
            // showLoadingCard();

            // 显示加载状态
            createBtn.disabled = true;
            createBtn.textContent = '创建中...';

            // 开始动画流程
            // simulateAsyncSteps();

            // 发送创建请求
            const response = await fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_CREATE), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionnaireData)
            });

            const result = await response.json();
            console.log('=== 后端响应 ===');
            console.log('创建问卷响应:', result);
            console.log('响应状态码:', result.code);
            console.log('响应数据:', result.data);

            if (result.code === 200 && result.data) {
                // 创建成功，先执行动画
                const questionnaire = result.data;
                console.log('创建的问卷数据:', questionnaire);
                console.log('问卷ID:', questionnaire.id);
                console.log('问卷ID类型:', typeof questionnaire.id);
                console.log('问卷ID是否为null:', questionnaire.id === null);
                console.log('问卷ID是否为undefined:', questionnaire.id === undefined);

                // 检查ID是否存在
                if (!questionnaire.id) {
                    console.error('问卷ID不存在或为空');
                    alert('创建问卷失败: 问卷ID为空');
                    return;
                }

                // 更新加载文本为成功状态
                // updateLoadingText('问卷创建成功！');
                // updateProgressText('100%');

                // 等待动画完成后再跳转
                // await sleep(1000); // 等待1秒让用户看到成功状态

                // 使用类似Vue Router的跳转方式
                console.log('准备跳转...');
                console.log('问卷ID:', questionnaire.id);
                console.log('当前页面URL:', window.location.href);

                // 将问卷ID存储到本地存储
                console.log('准备跳转...');
                console.log('问卷ID:', questionnaire.id);
                console.log('当前页面URL:', window.location.href);

                // 存储问卷ID到本地存储
                localStorage.setItem('current_questionnaire_id', questionnaire.id);
                console.log('问卷ID已存储到本地存储:', questionnaire.id);

                // 直接跳转到编辑页面（不带ID参数）
                const targetUrl = 'questionnaire-editor.html';
                console.log('目标URL:', targetUrl);

                // 直接跳转
                window.location.href = targetUrl;

                console.log('跳转代码已执行');
            } else {
                alert('创建问卷失败: ' + (result.message || '未知错误'));
            }
        } catch (error) {
            console.error('创建问卷时发生错误:', error);
            alert('创建问卷失败，请稍后重试');
        } finally {
            // 隐藏加载动画卡片
            // hideLoadingCard();
            // 恢复按钮状态
            createBtn.disabled = false;
            createBtn.textContent = '创建问卷';
        }
    });

    // 获取当前用户ID的函数
    function getCurrentUserId() {
        // 使用UTILS获取用户信息
        const userInfo = UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
        if (userInfo && userInfo.id) {
            return userInfo.id;
        }
        return 1; // 默认用户ID
    }



    // 初始化用户信息显示和退出逻辑
    UTILS.initUserInfo();

    // 启动自动校验（每5秒检查一次）
    UTILS.startAutoAuthCheck();

    // 加载动画卡片相关函数
    function showLoadingCard() {
        // 创建加载卡片
        const loadingCard = document.createElement('div');
        loadingCard.id = 'loading-card';
        loadingCard.className = 'loading-card';
        loadingCard.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <div class="loading-text">
                    <h3>正在创建问卷...</h3>
                    <p>请稍候，正在处理您的请求</p>
                </div>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">0%</div>
                </div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .loading-card {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }
            
            .loading-content {
                background: white;
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .loading-spinner {
                position: relative;
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
            }
            
            .spinner-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 4px solid transparent;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                animation: spin 1.2s linear infinite;
            }
            
            .spinner-ring:nth-child(2) {
                width: 60px;
                height: 60px;
                top: 10px;
                left: 10px;
                border-top-color: #28a745;
                animation-delay: -0.4s;
            }
            
            .spinner-ring:nth-child(3) {
                width: 40px;
                height: 40px;
                top: 20px;
                left: 20px;
                border-top-color: #ffc107;
                animation-delay: -0.8s;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-text h3 {
                margin: 0 0 10px 0;
                color: #333;
                font-size: 18px;
                font-weight: 600;
            }
            
            .loading-text p {
                margin: 0 0 20px 0;
                color: #666;
                font-size: 14px;
            }
            
            .loading-progress {
                margin-top: 20px;
            }
            
            .progress-bar {
                width: 100%;
                height: 6px;
                background: #e9ecef;
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #007bff, #28a745);
                border-radius: 3px;
                width: 0%;
                animation: progress 2s ease-in-out infinite;
            }
            
            @keyframes progress {
                0% { width: 0%; }
                50% { width: 70%; }
                100% { width: 100%; }
            }
            
            .progress-text {
                font-size: 12px;
                color: #666;
                font-weight: 500;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(loadingCard);

        // 模拟进度更新
        simulateProgress();
    }

    function hideLoadingCard() {
        const loadingCard = document.getElementById('loading-card');
        if (loadingCard) {
            loadingCard.style.animation = 'slideOut 0.3s ease-in forwards';

            // 添加滑出动画
            const slideOutStyle = document.createElement('style');
            slideOutStyle.textContent = `
                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(20px) scale(0.9);
                    }
                }
            `;
            document.head.appendChild(slideOutStyle);

            setTimeout(() => {
                if (loadingCard.parentNode) {
                    loadingCard.parentNode.removeChild(loadingCard);
                }
            }, 300);
        }
    }

    function simulateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        if (!progressFill || !progressText) return;

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90; // 最多到90%，等待实际完成

            progressFill.style.width = progress + '%';
            progressText.textContent = Math.round(progress) + '%';

            // 如果加载卡片被移除，停止进度更新
            if (!document.getElementById('loading-card')) {
                clearInterval(interval);
            }
        }, 200);
    }

    function simulateAsyncSteps() {
        const steps = [
            { name: '验证表单数据...', duration: 800 },
            { name: '生成问卷ID...', duration: 1200 },
            { name: '保存到数据库...', duration: 1500 }
        ];

        let currentStep = 0;

        const stepInterval = setInterval(() => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                updateLoadingText(step.name);
                currentStep++;
            } else {
                clearInterval(stepInterval);
            }
        }, 1000); // 每秒更新一次步骤
    }
    
    function updateLoadingText(text) {
        const loadingText = document.querySelector('.loading-text h3');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    function updateProgressText(text) {
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = text;
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 路由跳转工具函数 (类似Vue Router)
    function routerPush(options) {
        const { path, query = {}, params = {}, relative = false } = options;

        let targetUrl;

        if (relative) {
            // 相对路径跳转 (同文件夹)
            const queryString = new URLSearchParams(query).toString();
            targetUrl = queryString ? `${path}?${queryString}` : path;
        } else {
            // 绝对路径跳转 (不同文件夹)
            const baseUrl = window.location.origin;
            const queryString = new URLSearchParams(query).toString();

            // 处理路径参数
            let finalPath = path;
            Object.keys(params).forEach(key => {
                finalPath = finalPath.replace(`:${key}`, params[key]);
            });

            targetUrl = queryString
                ? `${baseUrl}${finalPath}?${queryString}`
                : `${baseUrl}${finalPath}`;
        }

        console.log('路由跳转:', {
            path,
            query,
            params,
            relative,
            targetUrl
        });

        // 对于静态HTML页面，直接使用页面跳转
        console.log('执行页面跳转:', targetUrl);

        // 直接使用window.location.href进行页面跳转
        window.location.href = targetUrl;
    }
});