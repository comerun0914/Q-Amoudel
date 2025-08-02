// 使用全局配置
document.addEventListener('DOMContentLoaded', function() {
    // 创建问卷按钮点击事件
    document.querySelector('.btn-create').addEventListener('click', function() {
        window.location.href = CONFIG.ROUTES.CREATE_QUESTIONNAIRE;
    });
});