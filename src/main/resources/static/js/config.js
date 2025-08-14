// 全局配置文件
const CONFIG = {
    // 后台服务配置
    BACKEND_BASE_URL: 'http://93d7k45123.goho.co:48134/api',
    // 测试专用
    // BACKEND_BASE_URL: 'http://localhost:7070/api',
    // API端点配置
    API_ENDPOINTS: {
        // 用户相关
        LOGIN: '/users/login',
        REGISTER: '/users/register',
        LOGOUT: '/users/logout',
        USER_PROFILE: '/users/profile',

        // 问卷相关
        QUESTIONNAIRE_LIST: '/questionCreate/list',
        QUESTIONNAIRE_DETAIL: '/questionCreate/detail',
        QUESTIONNAIRE_GETINFOBYID: '/questionCreate/getInfoById',
        QUESTIONNAIRE_QUESTIONS: '/questionCreate/questions',
        QUESTIONNAIRE_ALL: '/questionCreate/all',
        QUESTIONNAIRE_CREATE: '/questionCreate/create',
        QUESTIONNAIRE_UPDATE: '/questionCreate/update',
        QUESTIONNAIRE_DELETE: '/questionCreate/delete',
        QUESTIONNAIRE_BATCH_DELETE: '/questionCreate/batchDelete',
        QUESTIONNAIRE_TOGGLE_STATUS: '/questionCreate/toggleStatus',
        QUESTIONNAIRE_BATCH_TOGGLE_STATUS: '/questionCreate/batchToggleStatus',
        QUESTIONNAIRE_COPY: '/questionCreate/copy',
        QUESTIONNAIRE_IMPORT: '/questionCreate/import',
        QUESTIONNAIRE_STATISTICS: '/questionCreate/statistics',
        QUESTIONNAIRE_FILL: '/questionCreate/fill',
        QUESTIONNAIRE_SUBMIT: '/questionCreate/submit',
        QUESTIONNAIRE_RESULT: '/questionCreate/result',
		QUESTIONNAIRE_RESULTS: '/questionCreate/results',

		// 问卷提交与草稿（前端基础地址已含 /api，这里不再重复 /api 前缀）
		SUBMISSION_SUBMIT: '/submission/submit',
		SUBMISSION_SAVE_DRAFT: '/submission/saveDraft',
		SUBMISSION_GET_DRAFT: '/submission/getDraft',
		SUBMISSION_CHECK: '/submission/checkSubmission',
		SUBMISSION_USER_SUBMITTED: '/submission/userSubmitted',
		
		// 统计相关
		STATISTICS_DASHBOARD: '/statistics/dashboard',
		STATISTICS_COMPLETION_RATE: '/statistics/completion-rate',
		STATISTICS_UNIQUE_USERS: '/statistics/unique-users',

        // 题目相关
        QUESTION_SAVE: '/question/save',
        QUESTION_UPDATE: '/question/update',
        QUESTION_DELETE: '/question/delete',
        QUESTION_UPDATE_ORDER: '/question/updateOrder',
        QUESTION_PREVIEW: '/question/preview',
        QUESTION_TYPES: '/question/types',
        QUESTION_BY_ID: '/question/question',

        // 选项相关
        SINGLE_CHOICE_OPTION_SAVE: '/singleChoiceOption/save',
        SINGLE_CHOICE_OPTION_BATCH_SAVE: '/singleChoiceOption/batchSave',
        SINGLE_CHOICE_OPTION_LIST: '/singleChoiceOption/listByQuestionId',
        SINGLE_CHOICE_OPTION_UPDATE: '/singleChoiceOption/update',
        SINGLE_CHOICE_OPTION_DELETE: '/singleChoiceOption/delete',
        SINGLE_CHOICE_OPTION_DELETE_BY_QUESTION: '/singleChoiceOption/deleteByQuestionId',

        MULTIPLE_CHOICE_OPTION_SAVE: '/multipleChoiceOption/save',
        MULTIPLE_CHOICE_OPTION_BATCH_SAVE: '/multipleChoiceOption/batchSave',
        MULTIPLE_CHOICE_OPTION_LIST: '/multipleChoiceOption/listByQuestionId',
        MULTIPLE_CHOICE_OPTION_UPDATE: '/multipleChoiceOption/update',
        MULTIPLE_CHOICE_OPTION_DELETE: '/multipleChoiceOption/delete',
        MULTIPLE_CHOICE_OPTION_DELETE_BY_QUESTION: '/multipleChoiceOption/deleteByQuestionId',

        // 登录历史
        LOGIN_HISTORY: '/login-history',

        // 文件上传
        UPLOAD_FILE: '/upload/file',

        // 二维码相关
        QRCODE_GENERATE: '/code/generateQRcode'
    },

    // 题目类型配置
    QUESTION_TYPES: {
        // 题目类型ID映射
        TYPE_IDS: {
            SINGLE: 1,      // 单选题
            MULTIPLE: 2,    // 多选题
            TEXT: 3,        // 问答题
            RATING: 4,      // 评分题
            MATRIX: 5       // 矩阵题
        },

        // 题目类型名称映射
        TYPE_NAMES: {
            single: '单选题',
            multiple: '多选题',
            text: '问答题',
            rating: '评分题',
            matrix: '矩阵题'
        },

        // 题目类型接口映射
        TYPE_ENDPOINTS: {
            single: {
                save: '/singleChoiceOption/batchSave',
                list: '/singleChoiceOption/listByQuestionId',
                update: '/singleChoiceOption/update',
                delete: '/singleChoiceOption/delete'
            },
            multiple: {
                save: '/multipleChoiceOption/batchSave',
                list: '/multipleChoiceOption/listByQuestionId',
                update: '/multipleChoiceOption/update',
                delete: '/multipleChoiceOption/delete'
            },
            text: {
                save: '/textQuestion/save',
                list: '/textQuestion/listByQuestionId',
                update: '/textQuestion/update',
                delete: '/textQuestion/delete'
            },
            rating: {
                save: '/ratingQuestion/save',
                list: '/ratingQuestion/listByQuestionId',
                update: '/ratingQuestion/update',
                delete: '/ratingQuestion/delete'
            },
            matrix: {
                // 使用新的聚合保存/查询接口
                save: '/matrixQuestion/saveAll',
                list: '/matrixQuestion/getDetailByQuestionId',
                update: '/matrixQuestion/update',
                delete: '/matrixQuestion/deleteByQuestionId'
            }
        }
    },

    // 页面路由配置
    ROUTES: {
        LOGIN: 'login.html',
        INDEX: 'index.html',
        INDEX_USER: 'index-user.html',
        QUESTIONNAIRE_EDITOR: 'questionnaire-editor.html',
        QUESTIONNAIRE_FILL: 'questionnaire-fill.html',
        QUESTIONNAIRE_RESULT: 'questionnaire-result.html',
        QUESTIONNAIRE_PREVIEW: 'questionnaire-preview.html',
        QUESTIONNAIRE_TEST: 'questionnaire-test.html',
        ASK_USER: 'ask-user.html',
        CREATE_QUESTIONNAIRE: 'create-questionnaire.html',
        MANUAL_CREATE: 'manual-create-questionnaire.html'
    },

    // 问题类型配置
    QUESTION_TYPES_OLD: {
        RADIO: 'radio',
        CHECKBOX: 'checkbox',
        TEXT: 'text',
        TEXTAREA: 'textarea',
        RATING: 'rating',
        MATRIX: 'matrix',
        DATE: 'date',
        TIME: 'time',
        EMAIL: 'email',
        PHONE: 'phone',
        NUMBER: 'number'
    },

    // 问题类型显示名称
    QUESTION_TYPE_NAMES: {
        radio: '单选题',
        checkbox: '多选题',
        text: '填空题',
        textarea: '长文本',
        rating: '评分题',
        matrix: '矩阵题',
        date: '日期题',
        time: '时间题',
        email: '邮箱题',
        phone: '电话题',
        number: '数字题'
    },

    // 状态配置
    STATUS: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },

    // 本地存储键名
    STORAGE_KEYS: {
        USER_TOKEN: 'user_token',
        USER_INFO: 'user_info',
        QUESTIONNAIRE_DRAFT: 'questionnaire_draft',
        FILL_PROGRESS: 'fill_progress',
        CURRENT_QUESTIONNAIRE_ID: 'current_questionnaire_id',
        ORIGINAL_URL: 'original_url'
    },

    // 默认配置
    DEFAULTS: {
        PAGE_SIZE: 10,
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30分钟
        TOAST_DURATION: 3000 // 3秒
    }
};

// 工具函数
const UTILS = {
    // 获取完整的API URL，自动添加userid参数
    getApiUrl: function(endpoint, addUserId = true) {
        const userInfo = this.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
        let url = CONFIG.BACKEND_BASE_URL + endpoint;

        // 如果用户已登录且需要添加userId参数，在URL中添加userid参数
        if (addUserId && userInfo && userInfo.id) {
            const separator = endpoint.includes('?') ? '&' : '?';
            url += separator + 'userId=' + userInfo.id;
        }

        return url;
    },

    // 获取本地存储
    getStorage: function(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (error) {
            console.error('获取本地存储失败:', error);
            return null;
        }
    },

    // 设置本地存储
    setStorage: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('设置本地存储失败:', error);
        }
    },

    // 删除本地存储
    removeStorage: function(key) {
        localStorage.removeItem(key);
    },

    // 清除所有本地存储
    clearStorage: function() {
        localStorage.clear();
    },

    // 获取URL参数
    getUrlParam: function(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    // 设置URL参数
    setUrlParam: function(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    },

    // 显示提示信息
    showToast: function(message, type = 'info', duration = CONFIG.DEFAULTS.TOAST_DURATION) {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => toast.classList.add('show'), 100);

        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, duration);
    },

    // 格式化日期
    formatDate: function(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    // 防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 身份校验函数
    checkAuth: function(requiredRole = null) {
        const userInfo = this.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);

        if (!userInfo || !userInfo.username) {
            // 未登录，跳转到登录页面
            window.location.href = CONFIG.ROUTES.LOGIN;
            return false;
        }

        if (requiredRole !== null && userInfo.role !== requiredRole) {
            // 权限不足，跳转到对应页面
            if (userInfo.role === 1) {
                window.location.href = CONFIG.ROUTES.INDEX;
            } else {
                window.location.href = CONFIG.ROUTES.INDEX_USER;
            }
            return false;
        }

        return userInfo;
    },

    // 显示用户信息
    displayUserInfo: function(userInfo, containerId = 'userInfo') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const userNameElement = container.querySelector('.user-name') || container.querySelector('#userName');
        const userAvatarElement = container.querySelector('.user-avatar') || container.querySelector('#userAvatar');

        if (userNameElement) {
            userNameElement.textContent = userInfo.username || '用户';
        }

        if (userAvatarElement) {
            if (userInfo.avatar) {
                userAvatarElement.src = userInfo.avatar;
            } else {
                // 使用默认头像
                userAvatarElement.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NjZFRkEiLz4KPHBhdGggZD0iTTE2IDhDMTguMjA5MSA4IDIwIDkuNzkwODYgMjAgMTJDMjAgMTQuMjA5MSAxOC4yMDkxIDE2IDE2IDE2QzEzLjc5MDkgMTYgMTIgMTQuMjA5MSAxMiAxMkMxMiA5Ljc5MDg2IDEzLjc5MDkgOCAxNiA4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTI0IDI0QzI0IDIwLjY4NjMgMjAuNDE0MiAxOCAxNiAxOEMxMS41ODU4IDE4IDggMjAuNjg2MyA4IDI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K";
            }
        }
    },

    // 绑定用户下拉菜单事件
    bindUserDropdown: function(containerId = 'userInfo') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const dropdown = container.querySelector('.user-dropdown') || container.querySelector('#userDropdown');
        const userCenterBtn = container.querySelector('#userCenter');
        const logoutBtn = container.querySelector('#logoutBtn');

        // 点击用户信息显示/隐藏下拉菜单
        container.addEventListener('click', function(e) {
            e.stopPropagation();
            if (dropdown) {
                dropdown.classList.toggle('show');
            }
        });

        // 点击其他地方隐藏下拉菜单
        document.addEventListener('click', function() {
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        });

        // 用户中心按钮
        if (userCenterBtn) {
            userCenterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const userInfo = UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
                if (userInfo && userInfo.role === 1) {
                    window.location.href = CONFIG.ROUTES.INDEX;
                } else {
                    window.location.href = CONFIG.ROUTES.INDEX_USER;
                }
            });
        }

        // 退出登录按钮
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('确定要退出登录吗？')) {
                    const userInfo = UTILS.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
                    console.log('退出登录的用户信息:', userInfo);
                    // 向后端发送退出登录请求
                    fetch(UTILS.getApiUrl(CONFIG.API_ENDPOINTS.LOGOUT), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then(response => response.json()).then(data => {
                        if (data.code === 200) {
                            UTILS.clearStorage();
                            window.location.href = CONFIG.ROUTES.LOGIN;
                        } else {
                            UTILS.showToast(data.message || '退出登录失败', 'error');
                        }
                    }).catch(error => {
                        console.error('退出登录请求失败:', error);
                        UTILS.showToast('退出登录失败，请稍后重试', 'error');
                    });
                }
            });
        }
    },

    // 全局用户信息初始化函数
    initUserInfo: function() {
        const userInfo = this.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
        const userInfoElement = document.getElementById('userInfo');
        const loginBtn = document.getElementById('loginBtn');

        if (userInfo && userInfo.username) {
            // 用户已登录，显示用户信息
            this.displayUserInfo(userInfo);
            if (userInfoElement) {
                userInfoElement.style.display = 'flex';
            }
            if (loginBtn) {
                loginBtn.style.display = 'none';
            }
        } else {
            // 用户未登录，显示登录按钮
            if (userInfoElement) {
                userInfoElement.style.display = 'none';
            }
            if (loginBtn) {
                loginBtn.style.display = 'block';
            }
        }

        // 绑定用户相关事件
        this.bindUserDropdown();
    },

    // 校验用户登录状态
    checkUserAuth: function() {
        const userInfo = this.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
        if (!userInfo || !userInfo.username) {
            this.showReLoginModal();
            return false;
        }
        return true;
    },

    // 自动校验用户登录状态（每5秒检查一次）
    startAutoAuthCheck: function(interval = 5000, excludePages = ['login.html']) {
        // 检查当前页面是否在排除列表中
        const currentPage = window.location.pathname;
        const shouldExclude = excludePages.some(page => currentPage.includes(page));

        if (shouldExclude) {
            return;
        }

        // 立即检查一次
        this.checkUserAuth();

        // 定时检查
        setInterval(() => {
            // 再次检查当前页面是否在排除列表中
            const currentPage = window.location.pathname;
            const shouldExclude = excludePages.some(page => currentPage.includes(page));

            if (shouldExclude) {
                return;
            }

            this.checkUserAuth();
        }, interval);
    },

    // 显示重新登录弹窗
    showReLoginModal: function() {
        // 保存当前页面URL，以便登录成功后跳转回来
        const currentUrl = window.location.href;
        console.log('显示重新登录弹窗，保存当前访问URL:', currentUrl);
        this.setStorage(CONFIG.STORAGE_KEYS.ORIGINAL_URL, currentUrl);
        
        // 创建弹窗样式
        const style = document.createElement('style');
        style.textContent = `
            .re-login-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }
            
            .re-login-modal-content {
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                padding: 40px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                position: relative;
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .re-login-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                color: white;
            }
            
            .re-login-title {
                font-size: 24px;
                font-weight: 600;
                color: #333;
                margin-bottom: 15px;
            }
            
            .re-login-message {
                color: #666;
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 30px;
            }
            
            .re-login-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
            
            .re-login-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            
            .re-login-btn:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);

        // 创建弹窗HTML
        const modal = document.createElement('div');
        modal.className = 're-login-modal';
        modal.innerHTML = `
            <div class="re-login-modal-content">
                <div class="re-login-icon">🔐</div>
                <h2 class="re-login-title">需要重新登录</h2>
                <p class="re-login-message">您的登录信息已过期，请重新登录以继续使用系统功能。</p>
                <button class="re-login-btn" onclick="UTILS.goToLogin()">立即登录</button>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(modal);

        // 3秒后自动跳转
        setTimeout(() => {
            this.goToLogin();
        }, 3000);
    },

    // 跳转到登录页面
    goToLogin: function() {
        // 保存当前页面URL，以便登录成功后跳转回来
        const currentUrl = window.location.href;
        console.log('准备跳转登录，保存当前访问URL:', currentUrl);
        this.setStorage(CONFIG.STORAGE_KEYS.ORIGINAL_URL, currentUrl);
        
        // 清除其他本地存储，但保留ORIGINAL_URL
        const originalUrl = this.getStorage(CONFIG.STORAGE_KEYS.ORIGINAL_URL);
        this.clearStorage();
        if (originalUrl) {
            this.setStorage(CONFIG.STORAGE_KEYS.ORIGINAL_URL, originalUrl);
        }
        
        // 跳转到登录页面
        window.location.href = CONFIG.ROUTES.LOGIN;
    },

    // 页面保护函数 - 用于需要登录的页面
    protectPage: function() {
        // 校验用户登录状态
        if (!this.checkUserAuth()) {
            return false;
        }

        // 初始化用户信息显示和退出逻辑
        this.initUserInfo();
        return true;
    },

    // 获取用户信息
    getUserInfo: function() {
        return this.getStorage(CONFIG.STORAGE_KEYS.USER_INFO);
    },

    // 题目类型相关工具函数
    // 根据题目类型获取类型ID
    getQuestionTypeId: function(questionType) {
        const typeMap = {
            'single': CONFIG.QUESTION_TYPES.TYPE_IDS.SINGLE,
            'multiple': CONFIG.QUESTION_TYPES.TYPE_IDS.MULTIPLE,
            'text': CONFIG.QUESTION_TYPES.TYPE_IDS.TEXT,
            'rating': CONFIG.QUESTION_TYPES.TYPE_IDS.RATING,
            'matrix': CONFIG.QUESTION_TYPES.TYPE_IDS.MATRIX
        };
        return typeMap[questionType] || CONFIG.QUESTION_TYPES.TYPE_IDS.SINGLE;
    },

    // 根据类型ID获取题目类型
    getQuestionTypeById: function(typeId) {
        const idMap = {
            [CONFIG.QUESTION_TYPES.TYPE_IDS.SINGLE]: 'single',
            [CONFIG.QUESTION_TYPES.TYPE_IDS.MULTIPLE]: 'multiple',
            [CONFIG.QUESTION_TYPES.TYPE_IDS.TEXT]: 'text',
            [CONFIG.QUESTION_TYPES.TYPE_IDS.RATING]: 'rating',
            [CONFIG.QUESTION_TYPES.TYPE_IDS.MATRIX]: 'matrix'
        };
        return idMap[typeId] || 'single';
    },

    // 获取题目类型名称
    getQuestionTypeName: function(questionType) {
        return CONFIG.QUESTION_TYPES.TYPE_NAMES[questionType] || '未知类型';
    },

    // 获取题目类型对应的接口端点
    getQuestionTypeEndpoint: function(questionType, operation) {
        const endpoints = CONFIG.QUESTION_TYPES.TYPE_ENDPOINTS[questionType];
        return endpoints ? endpoints[operation] : null;
    },

    // 根据题目类型调用对应的保存接口
    saveQuestionByType: async function(questionType, questionId, data) {
        const endpoint = this.getQuestionTypeEndpoint(questionType, 'save');
        if (!endpoint) {
            throw new Error(`未找到题目类型 ${questionType} 的保存接口`);
        }

        const url = this.getApiUrl(endpoint);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                questionId: questionId,
                ...data
            })
        });

        return await response.json();
    },

    // 根据题目类型调用对应的查询接口
    getQuestionByType: async function(questionType, questionId) {
        const endpoint = this.getQuestionTypeEndpoint(questionType, 'list');
        if (!endpoint) {
            throw new Error(`未找到题目类型 ${questionType} 的查询接口`);
        }

        const url = this.getApiUrl(endpoint) + `&questionId=${questionId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return await response.json();
    },

    // 二维码生成相关工具函数
    // 生成二维码并返回图片URL
    generateQRCode: async function(content, options = {}) {
        try {
            // 默认配置
            const defaultOptions = {
                width: 200,
                height: 200,
                format: 'png',
                quality: 0.8
            };

            const config = { ...defaultOptions, ...options };

            // 创建表单数据
            const formData = new FormData();
            formData.append('content', content);

            // 调用后端接口生成二维码
            const response = await fetch(CONFIG.BACKEND_BASE_URL + CONFIG.API_ENDPOINTS.QRCODE_GENERATE, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`二维码生成失败: HTTP ${response.status}`);
            }

            // 将响应转换为Blob
            const blob = await response.blob();

            // 创建图片URL
            const imageUrl = URL.createObjectURL(blob);

            return {
                success: true,
                imageUrl: imageUrl,
                blob: blob,
                size: blob.size,
                content: content
            };

        } catch (error) {
            console.error('生成二维码失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // 生成问卷分享二维码
    generateQuestionnaireQRCode: async function(questionnaireId, baseUrl = window.location.origin) {
        try {
            // 构建问卷分享链接
            const shareUrl = `${baseUrl}/questionnaire-fill.html?id=${questionnaireId}`;

            // 生成二维码
            const result = await this.generateQRCode(shareUrl, {
                width: 300,
                height: 300
            });

            if (result.success) {
                return {
                    ...result,
                    shareUrl: shareUrl,
                    questionnaireId: questionnaireId
                };
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('生成问卷分享二维码失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // 下载二维码图片
    downloadQRCode: function(imageUrl, filename = 'qrcode.png') {
        try {
            // 创建一个临时的a标签来下载
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('下载二维码失败:', error);
            this.showToast('下载失败，请稍后重试', 'error');
        }
    },

    // 复制文本到剪贴板（统一接口）
    copyToClipboard: async function(text) {
        try {
            // 优先使用现代 Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);

                // 验证复制是否成功（如果支持读取剪贴板）
                if (navigator.clipboard && navigator.clipboard.readText) {
                    try {
                        const clipboardText = await navigator.clipboard.readText();
                        return clipboardText === text;
                    } catch (readError) {
                        // 无法读取剪贴板，但 writeText 没有抛出错误，通常表示复制成功
                        console.warn('无法验证剪贴板内容，但复制操作未报错:', readError);
                        return true;
                    }
                }
                // 如果浏览器不支持读取剪贴板，但 writeText 成功执行，通常表示复制成功
                return true;
            } else {
                // 使用备用方法
                return this.fallbackCopyTextToClipboard(text);
            }
        } catch (error) {
            console.warn('Clipboard API 失败，尝试备用方法:', error);
            return this.fallbackCopyTextToClipboard(text);
        }
    },

    // 备用复制方法（兼容旧浏览器）
    fallbackCopyTextToClipboard: function(text) {
        try {
            // 创建临时文本区域
            const textArea = document.createElement('textarea');
            textArea.value = text;

            // 设置样式，使其不可见
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            textArea.style.pointerEvents = 'none';
            textArea.style.zIndex = '-1';

            document.body.appendChild(textArea);

            // 选择文本并复制
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');

            // 移除临时元素
            document.body.removeChild(textArea);

            if (successful) {
                return true;
            } else {
                // 如果 execCommand 也失败，显示手动复制提示
                this.showManualCopyPrompt(text);
                return false;
            }
        } catch (err) {
            console.error('备用复制方法失败:', err);
            // 显示手动复制提示
            this.showManualCopyPrompt(text);
            return false;
        }
    },

    // 显示手动复制提示
    showManualCopyPrompt: function(text) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>手动复制链接</h3>
                    <button class="btn-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>由于浏览器限制，无法自动复制链接。请手动复制以下链接：</p>
                    <div class="copy-input-group">
                        <input type="text" value="${text}" id="manualCopyInput" readonly>
                        <button class="btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">关闭</button>
                    </div>
                    <p class="copy-tip">💡 提示：点击输入框，按 Ctrl+C (Windows) 或 Cmd+C (Mac) 复制</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // 显示二维码弹窗
    showQRCodeModal: function(qrCodeData, title = '二维码') {
        // 创建弹窗样式
        const style = document.createElement('style');
        style.textContent = `
            .qrcode-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }
            
            .qrcode-modal-content {
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                padding: 30px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                position: relative;
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .qrcode-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .qrcode-modal-title {
                font-size: 20px;
                font-weight: 600;
                color: #333;
                margin: 0;
            }
            
            .qrcode-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .qrcode-modal-close:hover {
                background: #f5f5f5;
                color: #666;
            }
            
            .qrcode-image-container {
                margin: 20px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                border: 2px dashed #dee2e6;
            }
            
            .qrcode-image {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            
            .qrcode-info {
                margin: 15px 0;
                text-align: left;
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #007bff;
            }
            
            .qrcode-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            
            .qrcode-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .qrcode-btn-primary {
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
            }
            
            .qrcode-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
            }
            
            .qrcode-btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .qrcode-btn-secondary:hover {
                background: #5a6268;
                transform: translateY(-2px);
            }
            
            .qrcode-btn-success {
                background: #28a745;
                color: white;
            }
            
            .qrcode-btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            
            /* 手动复制提示样式 */
            .modal.show {
                display: flex !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .copy-input-group {
                display: flex;
                gap: 0.5rem;
                margin: 1rem 0;
            }
            
            .copy-input-group input {
                flex: 1;
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 0.5rem;
                font-size: 0.9rem;
                background-color: #f8f9fa;
                color: #495057;
            }
            
            .copy-tip {
                font-size: 0.85rem;
                color: #6c757d;
                margin-top: 0.5rem;
                text-align: center;
                background-color: #e9ecef;
                padding: 0.75rem;
                border-radius: 0.5rem;
                border-left: 3px solid #667eea;
            }
        `;
        document.head.appendChild(style);

        // 创建弹窗HTML
        const modal = document.createElement('div');
        modal.className = 'qrcode-modal';
        modal.innerHTML = `
            <div class="qrcode-modal-content">
                <div class="qrcode-modal-header">
                    <h3 class="qrcode-modal-title">${title}</h3>
                    <button class="qrcode-modal-close" onclick="this.closest('.qrcode-modal').remove()">&times;</button>
                </div>
                
                <div class="qrcode-image-container">
                    <img src="${qrCodeData.imageUrl}" alt="二维码" class="qrcode-image">
                </div>
                
                ${qrCodeData.shareUrl ? `
                    <div class="qrcode-info">
                        <strong>分享链接：</strong><br>
                        <code style="word-break: break-all; background: #e9ecef; padding: 5px; border-radius: 3px;">${qrCodeData.shareUrl}</code>
                    </div>
                ` : ''}
                
                <div class="qrcode-actions">
                    <button class="qrcode-btn qrcode-btn-success" onclick="UTILS.downloadQRCode('${qrCodeData.imageUrl}', 'qrcode_${Date.now()}.png')">
                        📥 下载二维码
                    </button>
                    ${qrCodeData.shareUrl ? `
                        <button class="qrcode-btn qrcode-btn-primary" id="copyLinkBtn" onclick="handleCopyLink('${qrCodeData.shareUrl}', this)">
                            📋 复制链接
                        </button>
                        <a href="${qrCodeData.shareUrl}" target="_blank" class="qrcode-btn qrcode-btn-secondary">
                            🔗 打开链接
                        </a>
                    ` : ''}
                </div>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(modal);

        // 点击背景关闭弹窗
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // 定义复制链接处理函数
        window.handleCopyLink = async function(url, button) {
            if (!button) return;

            // 保存原始按钮状态
            const originalText = button.innerHTML;
            const originalClass = button.className;

            // 显示复制中状态
            button.innerHTML = '⏳ 复制中...';
            button.disabled = true;
            button.style.opacity = '0.7';

            try {
                // 尝试复制
                const success = await UTILS.copyToClipboard(url);

                if (success) {
                    // 复制成功
                    button.innerHTML = '✅ 已复制';
                    button.className = originalClass.replace('qrcode-btn-primary', 'qrcode-btn-success');
                    UTILS.showToast('链接已复制到剪贴板！', 'success');

                    // 2秒后恢复原始状态
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.className = originalClass;
                        button.disabled = false;
                        button.style.opacity = '1';
                    }, 2000);
                } else {
                    // 复制失败
                    button.innerHTML = '❌ 复制失败';
                    button.className = originalClass.replace('qrcode-btn-primary', 'qrcode-btn-secondary');
                    UTILS.showToast('复制失败，请手动复制', 'error');

                    // 3秒后恢复原始状态
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.className = originalClass;
                        button.disabled = false;
                        button.style.opacity = '1';
                    }, 3000);
                }
            } catch (error) {
                console.error('复制过程中发生错误:', error);
                // 发生错误
                button.innerHTML = '❌ 复制失败';
                button.className = originalClass.replace('qrcode-btn-primary', 'qrcode-btn-secondary');
                UTILS.showToast('复制失败，请手动复制', 'error');

                // 3秒后恢复原始状态
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.className = originalClass;
                    button.disabled = false;
                    button.style.opacity = '1';
                }, 3000);
            }
        };
    }
};

// 导出到全局作用域
window.CONFIG = CONFIG;
window.UTILS = UTILS;

/*
 * API使用示例：
 *
 * // 获取问卷预览数据
 * fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTION_PREVIEW}?questionnaireId=123`)
 *   .then(response => response.json())
 *   .then(data => console.log(data));
 *
 * // 获取题目类型列表
 * fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTION_TYPES}`)
 *   .then(response => response.json())
 *   .then(data => console.log(data));
 *
 * // 使用工具函数获取完整API URL（自动添加userId）
 * const url = UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTION_SAVE);
 * fetch(url, { method: 'POST', body: JSON.stringify(data) });
 *
 * // 二维码生成使用示例：
 *
 * // 生成普通二维码
 * UTILS.generateQRCode('https://www.example.com').then(result => {
 *   if (result.success) {
 *     console.log('二维码生成成功:', result.imageUrl);
 *     // 显示二维码弹窗
 *     UTILS.showQRCodeModal(result, '示例二维码');
 *   }
 * });
 *
 * // 生成问卷分享二维码
 * UTILS.generateQuestionnaireQRCode('123').then(result => {
 *   if (result.success) {
 *     console.log('问卷二维码生成成功:', result.shareUrl);
 *     // 显示二维码弹窗
 *     UTILS.showQRCodeModal(result, '问卷分享二维码');
 *   }
 * });
 *
 * // 下载二维码
 * UTILS.downloadQRCode(imageUrl, 'my_qrcode.png');
 */
