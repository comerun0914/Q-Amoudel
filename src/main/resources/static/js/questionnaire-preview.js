/**
 * 问卷预览页面功能
 */

// 问卷数据结构
let questionnaireData = {
  title: '',
  description: '',
  questions: []
};

/**
 * 初始化预览页面
 */
function initPreview() {
  // 从URL参数或localStorage获取问卷数据
  loadQuestionnaireData();
  
  // 渲染问卷内容
  renderQuestionnaire();
  
  // 绑定事件
  bindEvents();
}

/**
 * 加载问卷数据
 */
function loadQuestionnaireData() {
  // 尝试从URL参数获取数据
  const urlParams = new URLSearchParams(window.location.search);
  const dataParam = urlParams.get('data');
  
  if (dataParam) {
    try {
      questionnaireData = JSON.parse(decodeURIComponent(dataParam));
    } catch (error) {
      console.error('解析URL参数数据失败:', error);
    }
  }
  
  // 如果没有URL参数，尝试从localStorage获取
  if (!questionnaireData.title && !questionnaireData.questions.length) {
    const storedData = localStorage.getItem('questionnaireData');
    if (storedData) {
      try {
        questionnaireData = JSON.parse(storedData);
      } catch (error) {
        console.error('解析localStorage数据失败:', error);
      }
    }
  }
  
  // 如果仍然没有数据，使用默认数据
  if (!questionnaireData.title) {
    questionnaireData = {
      title: '示例问卷',
      description: '这是一个示例问卷，用于演示预览功能',
      questions: [
        {
          type: 'single',
          text: '您的性别是？',
          options: ['男', '女', '其他'],
          required: true
        },
        {
          type: 'multiple',
          text: '您喜欢哪些运动？（可多选）',
          options: ['跑步', '游泳', '篮球', '足球', '网球'],
          required: false
        },
        {
          type: 'text',
          text: '请简要描述您对问卷系统的建议：',
          required: false
        }
      ]
    };
  }
}

/**
 * 渲染问卷内容
 */
function renderQuestionnaire() {
  // 设置问卷标题和描述
  document.getElementById('questionnaireTitle').textContent = questionnaireData.title;
  document.getElementById('questionnaireDescription').textContent = questionnaireData.description;
  
  // 渲染问题列表
  const questionsContainer = document.getElementById('questionsContainer');
  questionsContainer.innerHTML = '';
  
  questionnaireData.questions.forEach((question, index) => {
    const questionElement = createQuestionElement(question, index + 1);
    questionsContainer.appendChild(questionElement);
  });
}

/**
 * 创建问题元素
 */
function createQuestionElement(question, questionNumber) {
  const questionDiv = document.createElement('div');
  questionDiv.className = 'question-item';
  
  // 问题头部
  const headerDiv = document.createElement('div');
  headerDiv.className = 'question-header';
  
  const numberDiv = document.createElement('div');
  numberDiv.className = 'question-number';
  numberDiv.textContent = questionNumber;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'question-content';
  
  const textDiv = document.createElement('div');
  textDiv.className = 'question-text';
  textDiv.textContent = question.text;
  
  const typeSpan = document.createElement('span');
  typeSpan.className = 'question-type';
  typeSpan.textContent = getQuestionTypeText(question.type);
  
  contentDiv.appendChild(textDiv);
  contentDiv.appendChild(typeSpan);
  
  headerDiv.appendChild(numberDiv);
  headerDiv.appendChild(contentDiv);
  
  questionDiv.appendChild(headerDiv);
  
  // 根据问题类型创建不同的输入控件
  const inputElement = createInputElement(question);
  if (inputElement) {
    questionDiv.appendChild(inputElement);
  }
  
  return questionDiv;
}

/**
 * 获取问题类型文本
 */
function getQuestionTypeText(type) {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'text': '文本题',
    'rating': '评分题',
    'matrix': '矩阵题',
    'date': '日期题',
    'time': '时间题',
    'file': '文件上传',
    'location': '位置选择',
    'signature': '签名',
    'user-info': '填写人信息'
  };
  
  return typeMap[type] || '未知类型';
}

/**
 * 创建输入控件
 */
function createInputElement(question) {
  switch (question.type) {
    case 'single':
      return createRadioOptions(question);
    case 'multiple':
      return createCheckboxOptions(question);
    case 'text':
      return createTextInput(question);
    case 'rating':
      return createRatingInput(question);
    case 'matrix':
      return createMatrixInput(question);
    case 'date':
      return createDateInput(question);
    case 'time':
      return createTimeInput(question);
    case 'file':
    case 'location':
    case 'signature':
    case 'user-info':
      return createComponentPreview(question);
    default:
      return null;
  }
}

/**
 * 创建单选选项
 */
function createRadioOptions(question) {
  const container = document.createElement('div');
  container.className = 'options-container';
  
  question.options.forEach((option) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-item';
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `question_${question.id || Math.random()}`;
    radio.value = option;
    radio.disabled = true;
    
    const label = document.createElement('span');
    label.className = 'option-text';
    label.textContent = option;
    
    optionDiv.appendChild(radio);
    optionDiv.appendChild(label);
    container.appendChild(optionDiv);
  });
  
  return container;
}

/**
 * 创建多选选项
 */
function createCheckboxOptions(question) {
  const container = document.createElement('div');
  container.className = 'options-container';
  
  question.options.forEach((option) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = option;
    checkbox.disabled = true;
    
    const label = document.createElement('span');
    label.className = 'option-text';
    label.textContent = option;
    
    optionDiv.appendChild(checkbox);
    optionDiv.appendChild(label);
    container.appendChild(optionDiv);
  });
  
  return container;
}

/**
 * 创建文本输入
 */
function createTextInput(question) {
  const container = document.createElement('div');
  container.style.marginTop = '1rem';
  
  const textarea = document.createElement('textarea');
  textarea.className = 'text-input';
  textarea.rows = 4;
  textarea.placeholder = '请输入您的答案...';
  textarea.disabled = true;
  
  container.appendChild(textarea);
  return container;
}

/**
 * 创建评分输入
 */
function createRatingInput(question) {
  const container = document.createElement('div');
  container.className = 'rating-container';
  
  const maxRating = question.maxRating || 5;
  
  for (let i = 1; i <= maxRating; i++) {
    const star = document.createElement('span');
    star.className = 'rating-star';
    star.textContent = '★';
    star.style.cursor = 'default';
    container.appendChild(star);
  }
  
  return container;
}

/**
 * 创建矩阵输入
 */
function createMatrixInput(question) {
  const container = document.createElement('div');
  container.className = 'matrix-container';
  
  const table = document.createElement('table');
  table.className = 'matrix-table';
  
  // 创建表头
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const emptyCell = document.createElement('th');
  headerRow.appendChild(emptyCell);
  
  question.columns.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // 创建表体
  const tbody = document.createElement('tbody');
  
  question.rows.forEach(row => {
    const tr = document.createElement('tr');
    
    const rowHeader = document.createElement('td');
    rowHeader.textContent = row;
    rowHeader.style.fontWeight = '600';
    tr.appendChild(rowHeader);
    
    question.columns.forEach(column => {
      const td = document.createElement('td');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `matrix_${row}`;
      radio.disabled = true;
      td.appendChild(radio);
      tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
  
  return container;
}

/**
 * 创建日期输入
 */
function createDateInput(question) {
  const container = document.createElement('div');
  container.style.marginTop = '1rem';
  
  const input = document.createElement('input');
  input.type = 'date';
  input.className = 'text-input';
  input.disabled = true;
  
  container.appendChild(input);
  return container;
}

/**
 * 创建时间输入
 */
function createTimeInput(question) {
  const container = document.createElement('div');
  container.style.marginTop = '1rem';
  
  const input = document.createElement('input');
  input.type = 'time';
  input.className = 'text-input';
  input.disabled = true;
  
  container.appendChild(input);
  return container;
}

/**
 * 创建组件预览
 */
function createComponentPreview(question) {
  const container = document.createElement('div');
  container.className = 'component-preview';
  
  const title = document.createElement('h4');
  title.textContent = getQuestionTypeText(question.type);
  
  const description = document.createElement('p');
  description.textContent = '此组件在预览模式下仅作展示';
  
  container.appendChild(title);
  container.appendChild(description);
  
  return container;
}

/**
 * 绑定事件
 */
function bindEvents() {
  // 预览模式下不需要绑定太多事件，因为都是禁用状态
  console.log('问卷预览页面已加载');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPreview); 