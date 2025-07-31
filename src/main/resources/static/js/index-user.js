// 用户端页面功能
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    checkUserLoginStatus();
    
    // 绑定事件监听器
    bindEventListeners();
});

/**
 * 检查用户登录状态
 */
function checkUserLoginStatus() {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
        // 如果未登录，跳转到登录页面
        window.location.href = './login.html';
        return;
    }
    
    try {
        const user = JSON.parse(userInfo);
        if (!user || !user.username) {
            // 用户信息无效，跳转到登录页面
            window.location.href = './login.html';
            return;
        }
        
        // 显示用户信息（可选）
        console.log('当前用户:', user.username);
        
    } catch (error) {
        console.error('解析用户信息失败:', error);
        window.location.href = './login.html';
    }
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
    // 退出登录按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 填写问卷按钮
    const fillQuestionnaireBtn = document.getElementById('fillQuestionnaireBtn');
    if (fillQuestionnaireBtn) {
        fillQuestionnaireBtn.addEventListener('click', handleFillQuestionnaire);
    }
}

/**
 * 处理退出登录
 */
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除本地存储的用户信息
        localStorage.removeItem('userInfo');
        
        // 跳转到登录页面
        window.location.href = './login.html';
    }
}

/**
 * 处理填写问卷
 */
function handleFillQuestionnaire() {
    // 这里可以跳转到问卷填写页面
    // 目前先跳转到问卷编辑器页面（后续可以改为专门的问卷填写页面）
    // alert('问卷填写功能开发中...');
    
    // 如果后续有专门的问卷填写页面，可以改为：
    // window.location.href = './questionnaire-fill.html';
    
    // 目前暂时跳转到问卷编辑器页面
    window.location.href = './ask-user.html';
} 