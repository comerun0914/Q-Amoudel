// 使用全局配置
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
    // 使用工具函数进行身份校验，要求普通用户权限
    const userInfo = UTILS.checkAuth(0);
    if (userInfo) {
        // 显示用户信息
        UTILS.displayUserInfo(userInfo);
    }
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
    // 绑定用户下拉菜单事件
    UTILS.bindUserDropdown();
    
    // 填写问卷按钮
    const fillQuestionnaireBtn = document.getElementById('fillQuestionnaireBtn');
    if (fillQuestionnaireBtn) {
        fillQuestionnaireBtn.addEventListener('click', handleFillQuestionnaire);
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
    window.location.href = CONFIG.ROUTES.ASK_USER;
} 