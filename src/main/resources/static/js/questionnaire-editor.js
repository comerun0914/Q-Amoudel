document.addEventListener('DOMContentLoaded', function() {
    // 添加问题
    const addQuestionBtn = document.querySelector('.add-question');
    const questionSection = document.querySelector('.question-section');
    const questionTemplate = document.querySelector('.question-item');

    addQuestionBtn.addEventListener('click', function() {
        if (questionTemplate) {
            const newQuestion = questionTemplate.cloneNode(true);
            newQuestion.querySelector('.question-content').value = '';
            
            // 清空选项
            const options = newQuestion.querySelectorAll('.option');
            options.forEach(option => {
                option.value = '';
            });
            
            questionSection.insertBefore(newQuestion, addQuestionBtn);
            attachQuestionEvents(newQuestion);
        }
    });

    // 添加选项
    function attachQuestionEvents(questionElement) {
        const addOptionBtn = questionElement.querySelector('.add-option');
        const deleteBtn = questionElement.querySelector('.delete-question');
        const optionsContainer = questionElement.querySelector('.options');
        const optionTemplate = optionsContainer ? optionsContainer.querySelector('.option') : null;

        if (addOptionBtn && optionsContainer && optionTemplate) {
            addOptionBtn.addEventListener('click', function() {
                const newOption = optionTemplate.cloneNode(true);
                newOption.value = '';
                optionsContainer.insertBefore(newOption, addOptionBtn);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                questionElement.remove();
            });
        }
    }

    // 初始化现有问题事件
    document.querySelectorAll('.question-item').forEach(attachQuestionEvents);

    // 保存草稿
    const saveDraftBtn = document.querySelector('.save-draft');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            alert('草稿已保存');
        });
    }

    // 发布问卷
    const publishBtn = document.querySelector('.publish');
    if (publishBtn) {
        publishBtn.addEventListener('click', function() {
            alert('问卷已发布');
        });
    }

    // 侧边栏显示/隐藏控制
    const sidebarToggle = document.getElementById('toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    let sidebarVisible = false;
    let sidebarTop = 120; // 侧边栏初始顶部位置
    let taskbarHeight = 48; // 通常Windows任务栏高度

    // 计算最大滚动高度函数
    function calculateMaxScrollTop() {
        if (!sidebar) return 0;
        const sidebarHeight = sidebar.offsetHeight;
        return document.body.scrollHeight - window.innerHeight - sidebarHeight;
    }

    // 切换侧边栏显示/隐藏
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebarVisible = !sidebarVisible;
            if (sidebarVisible) {
                sidebar.classList.add('visible');
                sidebarToggle.textContent = '隐藏问题类型';
                // 确保可见时计算最大滚动高度
                handleScroll();
            } else {
                sidebar.classList.remove('visible');
                sidebarToggle.textContent = '显示问题类型';
            }
        });
    }

    // 处理滚动事件
    function handleScroll() {
        if (!sidebarVisible || !sidebar) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const sidebarHeight = sidebar.offsetHeight;
        const maxScrollTop = calculateMaxScrollTop();

        // 新滚动逻辑：
        // - 向上滚动到顶部区域时，固定在视口底部
        // - 滚动到中间区域时，恢复到初始位置
        // - 向下滚动到底部区域时，固定在视口顶部
        if (scrollTop <= sidebarTop) {
            // 顶部区域：固定在视口底部
            sidebar.style.top = (windowHeight - sidebarHeight - taskbarHeight) + 'px';
        } else if (scrollTop >= maxScrollTop) {
            // 底部区域：固定在视口顶部
            sidebar.style.top = '0';
        } else {
            // 中间区域：恢复到初始位置
            sidebar.style.top = sidebarTop + 'px';
        }
    }

    // 使用requestAnimationFrame优化滚动处理
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    // 确保初始位置正确
    if (sidebar) {
        sidebar.style.top = sidebarTop + 'px';
    }

    // 添加滚动监听
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', function() {
        if (sidebarVisible && sidebar) {
            handleScroll(); // 调整窗口大小时重新计算位置
        }
    });

    // 问题类型按钮点击事件
    const formatButtons = document.querySelectorAll('.format-btn');
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            addQuestion(type);
        });
    });

    // 添加问题函数
    function addQuestion(type) {
        const questionSection = document.querySelector('.question-section');
        if (!questionSection) return;

        // 创建新问题元素
        const newQuestion = document.createElement('div');
        newQuestion.className = 'question-item';
        
        // 根据问题类型设置不同的HTML结构
        let optionsHtml = '';
        if (type === 'single' || type === 'multiple') {
            optionsHtml = `
                <input type="text" class="option" placeholder="选项1">
                <button class="add-option">添加选项</button>
            `;
        } else if (type === 'text') {
            optionsHtml = `
                <textarea class="text-answer" placeholder="受访者将在此输入回答"></textarea>
            `;
        } else if (type === 'rating') {
            optionsHtml = `
                <div class="rating-options">
                    <span>1</span><input type="radio" name="rating-${Date.now()}"><span>2</span><input type="radio" name="rating-${Date.now()}"><span>3</span><input type="radio" name="rating-${Date.now()}"><span>4</span><input type="radio" name="rating-${Date.now()}"><span>5</span><input type="radio" name="rating-${Date.now()}">
                </div>
            `;
        }

        newQuestion.innerHTML = `
            <button class="delete-question">删除问题</button>
            <div class="question-content-container">
                <input type="text" class="question-content" placeholder="输入问题内容">
                <div class="options">
                    ${optionsHtml}
                </div>
            </div>
        `;

        // 添加到问题区域
        const addButton = questionSection.querySelector('.add-question');
        if (addButton) {
            questionSection.insertBefore(newQuestion, addButton);
        } else {
            questionSection.appendChild(newQuestion);
        }
        
        // 为新问题元素附加事件监听器
        attachQuestionEvents(newQuestion);
    }
});