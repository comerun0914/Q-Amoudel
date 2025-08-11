document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('testDbBtn');
    const resultDiv = document.getElementById('dbTestResult');

    function setResult(text, isOk = false) {
        resultDiv.style.color = isOk ? '#2e7d32' : '#c62828';
        resultDiv.textContent = text;
    }

    btn.addEventListener('click', function() {
        setResult('正在测试数据库连接...');

        // 使用已有分页列表接口作为数据库连通性测试
        const baseUrl = (window.CONFIG && window.UTILS)
          ? window.UTILS.getApiUrl(window.CONFIG.API_ENDPOINTS.QUESTIONNAIRE_LIST, false)
          : '/api/questionCreate/list';
        // 默认用 creatorId=1，最小分页
        const url = `${baseUrl}?creatorId=1&page=1&size=1`;

        const headers = { 'Content-Type': 'application/json' };
        try {
            const token = window.UTILS && window.UTILS.getStorage && window.CONFIG ? window.UTILS.getStorage(window.CONFIG.STORAGE_KEYS.USER_TOKEN) : null;
            if (token) headers['Authorization'] = token;
        } catch (_) {}

        fetch(url, { method: 'GET', headers, credentials: 'include' })
            .then(async res => {
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    return res.json();
                }
                const text = await res.text();
                throw new Error(`非JSON响应: 状态${res.status}. 内容片段: ${text.substring(0, 200)}`);
            })
            .then(data => {
                if (data && data.code === 200) {
                    setResult('数据库连接成功！', true);
                } else {
                    setResult('数据库连接失败：' + (data && (data.message || data.msg) || '未知错误'));
                }
            })
            .catch(err => {
                setResult('请求失败：' + err.message);
            });
    });
});
