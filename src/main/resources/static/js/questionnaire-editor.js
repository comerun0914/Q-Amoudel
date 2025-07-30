document.addEventListener('DOMContentLoaded', function() {
    // 添加问题
    const addQuestionBtn = document.querySelector('.add-question');
    const questionSection = document.querySelector('.question-section');
    const questionTemplate = document.querySelector('.question-item');

    addQuestionBtn.addEventListener('click', function() {
        const newQuestion = questionTemplate.cloneNode(true);
        newQuestion.querySelector('.question-content').value = '';
        newQuestion.querySelector('.option').value = '';
        questionSection.insertBefore(newQuestion, addQuestionBtn);
        attachQuestionEvents(newQuestion);
    });

    // 添加选项
    function attachQuestionEvents(questionElement) {
        const addOptionBtn = questionElement.querySelector('.add-option');
        const deleteBtn = questionElement.querySelector('.delete-question');
        const optionsContainer = questionElement.querySelector('.options');
        const optionTemplate = optionsContainer.querySelector('.option');

        addOptionBtn.addEventListener('click', function() {
            const newOption = optionTemplate.cloneNode(true);
            newOption.value = '';
            optionsContainer.insertBefore(newOption, addOptionBtn);
        });

        deleteBtn.addEventListener('click', function() {
            questionElement.remove();
        });
    }

    // 初始化现有问题事件
    document.querySelectorAll('.question-item').forEach(attachQuestionEvents);

    // 保存草稿
    document.querySelector('.save-draft').addEventListener('click', function() {
        alert('草稿已保存');
    });

    // 发布问卷
    document.querySelector('.publish').addEventListener('click', function() {
        alert('问卷已发布');
    });
});