// 全局配置文件
const CONFIG = {
    // 后台服务配置
    BACKEND_BASE_URL: 'http://localhost:7070/api',
    
    // API端点配置
    API_ENDPOINTS: {
        // 用户相关
        LOGIN: '/api/users/login',
        REGISTER: '/api/users/register',
        LOGOUT: '/api/users/logout',
        USER_PROFILE: '/api/users/profile',
        
        // 问卷相关
        QUESTIONNAIRE_LIST: '/questionCreate/list',
        QUESTIONNAIRE_DETAIL: '/questionCreate/detail',
        QUESTIONNAIRE_GETINFOBYID: '/questionCreate/getInfoById',
        QUESTIONNAIRE_QUESTIONS: '/questionCreate/questions',
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

        // 登录历史
        LOGIN_HISTORY: '/api/login-history',
        
        // 文件上传
        UPLOAD_FILE: '/api/upload/file'
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
    QUESTION_TYPES: {
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
        CURRENT_QUESTIONNAIRE_ID: 'current_questionnaire_id'
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
        // 清除本地存储
        this.clearStorage();
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
    }
};

// 导出到全局作用域
window.CONFIG = CONFIG;
window.UTILS = UTILS; 