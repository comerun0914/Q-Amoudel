// 使用全局配置
document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户信息显示和退出逻辑
    UTILS.initUserInfo();
    
    // 启动自动校验（每5秒检查一次）
    UTILS.startAutoAuthCheck();
    
    // 创建问卷按钮点击事件
    document.querySelector('.btn-create').addEventListener('click', function() {
        window.location.href = CONFIG.ROUTES.MANUAL_CREATE;
    });
});