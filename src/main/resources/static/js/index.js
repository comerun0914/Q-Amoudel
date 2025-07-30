// 创建问卷按钮点击事件
document.addEventListener('DOMContentLoaded', function() {
  const createBtn = document.getElementById('createBtn');
  if (createBtn) {
    createBtn.addEventListener('click', function() {
      alert('即将跳转到问卷创建页面');
      // window.location.href = '/create-questionnaire.html';
    });
  }
});