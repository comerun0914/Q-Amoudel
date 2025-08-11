/**
 * 问卷预览页面功能
 * 
 * 使用说明：
 * 1. 必须通过URL参数传入questionnaireId
 * 2. 正确的URL格式：questionnaire-preview.html?questionnaireId=123
 * 3. 页面会自动调用后端API获取问卷数据
 * 4. 不再支持本地数据加载功能
 * 
 * 示例：
 * http://localhost:7070/questionnaire-preview.html?questionnaireId=98284723
 */

// 问卷数据结构
let questionnaireData = {
  title: '',
  description: '',
  questions: [],
  startDate: '',
  endDate: '',
  createdTime: ''
};

// 用户答案数据
let userAnswers = {};

// 提交时间
let submitTime = '';

// 填写时长
let duration = 0;

/**
 * 初始化预览页面
 */
function initPreview() {
  // console.log('=== 开始初始化预览页面 ===');
  // console.log('当前页面URL:', window.location.href);
  // console.log('当前页面search:', window.location.search);
  
  // 显示调试信息
  displayDebugInfo();
  
  // 使用你的样例代码方式获取参数
  var receiveData = decodeURI(window.location.search);
  console.log('解码后的search:', receiveData);
  
  var questionnaireId = null;
  
  if (receiveData && receiveData.includes("?")) {
    // 去掉开头的?号
    receiveData = receiveData.substr(receiveData.indexOf("?") + 1);
    console.log('去掉?后的数据:', receiveData);
    
    // 查找questionnaireId参数
    if (receiveData.includes("questionnaireId=")) {
      let keyStart = receiveData.indexOf("questionnaireId=");
      let valueStart = keyStart + "questionnaireId=".length;
      let valueEnd = receiveData.indexOf("&", valueStart);
      
      if (valueEnd === -1) {
        // 如果没有&号，说明是最后一个参数
        valueEnd = receiveData.length;
      }
      
      questionnaireId = receiveData.substring(valueStart, valueEnd);
      console.log('提取到的questionnaireId:', questionnaireId);
    }
  }
  
  if (questionnaireId) {
    // 如果有问卷ID，从后端API加载数据
    console.log('检测到问卷ID，从后端API加载数据:', questionnaireId);
    loadQuestionnaireFromAPI(questionnaireId);
  } else {
    // 如果没有问卷ID，显示错误信息
    console.error('未检测到问卷ID，无法加载问卷数据');
    console.log('完整URL:', window.location.href);
    console.log('Search部分:', window.location.search);
    showErrorMessage('缺少问卷ID参数，请检查URL');
  }
  
  // 绑定事件
  bindEvents();
}

/**
 * 渲染问卷时间信息
 */
function renderQuestionnaireTimeInfo() {
  console.log('渲染问卷时间信息:', {
    startDate: questionnaireData.startDate,
    endDate: questionnaireData.endDate,
    createdTime: questionnaireData.createdTime
  });
  
  // 格式化并显示开始时间
  const startDateElement = document.getElementById('startDate');
  if (startDateElement) {
    if (questionnaireData.startDate) {
      const startDate = new Date(questionnaireData.startDate);
      if (!isNaN(startDate.getTime())) {
        startDateElement.textContent = startDate.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } else {
        startDateElement.textContent = questionnaireData.startDate;
      }
    } else {
      startDateElement.textContent = '未设置';
    }
  }
  
  // 格式化并显示结束时间
  const endDateElement = document.getElementById('endDate');
  if (endDateElement) {
    if (questionnaireData.endDate) {
      const endDate = new Date(questionnaireData.endDate);
      if (!isNaN(endDate.getTime())) {
        endDateElement.textContent = endDate.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } else {
        endDateElement.textContent = questionnaireData.endDate;
      }
    } else {
      endDateElement.textContent = '未设置';
    }
  }
  
  // 格式化并显示创建时间
  const createdTimeElement = document.getElementById('createdTime');
  if (createdTimeElement) {
    if (questionnaireData.createdTime) {
      const createdTime = new Date(questionnaireData.createdTime);
      if (!isNaN(createdTime.getTime())) {
        createdTimeElement.textContent = createdTime.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        createdTimeElement.textContent = questionnaireData.createdTime;
      }
    } else {
      createdTimeElement.textContent = '未知';
    }
  }
}

/**
 * 显示调试信息
 */
function displayDebugInfo() {
  const pageUrlElement = document.getElementById('pageUrl');
  const searchParamsElement = document.getElementById('searchParams');
  const debugQuestionnaireIdElement = document.getElementById('debugQuestionnaireId');
  
  if (pageUrlElement) {
    pageUrlElement.textContent = window.location.href;
  }
  
  if (searchParamsElement) {
    searchParamsElement.textContent = window.location.search;
  }
  
  if (debugQuestionnaireIdElement) {
    // 尝试多种方式获取问卷ID
    const urlParams = new URLSearchParams(window.location.search);
    const urlParamId = urlParams.get('questionnaireId');
    
    // 使用你的样例代码方式
    var receiveData = decodeURI(window.location.search);
    var manualId = null;
    
    if (receiveData && receiveData.includes("?")) {
      receiveData = receiveData.substr(receiveData.indexOf("?") + 1);
      if (receiveData.includes("questionnaireId=")) {
        let keyStart = receiveData.indexOf("questionnaireId=");
        let valueStart = keyStart + "questionnaireId=".length;
        let valueEnd = receiveData.indexOf("&", valueStart);
        if (valueEnd === -1) {
          valueEnd = receiveData.length;
        }
        manualId = receiveData.substring(valueStart, valueEnd);
      }
    }
    
    debugQuestionnaireIdElement.textContent = `URLSearchParams: ${urlParamId || 'null'}, 手动解析: ${manualId || 'null'}`;
  }
}

/**
 * 显示错误信息
 */
function showErrorMessage(message) {
  const container = document.getElementById('questionnaireContainer') || document.getElementById('questionsContainer');
  if (container) {
    container.innerHTML = `
      <div class="error-message">
        <h3>参数错误</h3>
        <p>${message}</p>
        <p>正确的URL格式应该是：questionnaire-preview.html?questionnaireId=123</p>
        <button onclick="location.reload()">重试</button>
      </div>
    `;
  }
}

/**
 * 加载问卷数据（已废弃，仅保留用于兼容）
 * 注意：此函数已被废弃，现在只从后端API获取数据
 */
function loadQuestionnaireData() {
  console.warn('loadQuestionnaireData 函数已被废弃，请使用 loadQuestionnaireFromAPI 函数');
  
  // 显示提示信息
  showErrorMessage('本地数据加载功能已被废弃，请使用正确的URL参数从后端获取数据');
  
  // 以下代码已被注释，不再使用
  /*
  // 首先尝试从localStorage获取预览数据（从编辑器传递的数据）
  const previewData = localStorage.getItem('questionnaire_preview_data');
  if (previewData) {
    try {
      const data = JSON.parse(previewData);
      questionnaireData = data.questionnaire;
      console.log('加载编辑器预览数据:', data);
      return;
    } catch (error) {
      console.error('解析预览数据失败:', error);
    }
  }
  
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
          type: 'single-choice',
          text: '您的性别是？',
          options: [
            { text: '男', isDefault: false, order: 1 },
            { text: '女', isDefault: false, order: 2 },
            { text: '其他', isDefault: false, order: 3 }
          ],
          required: true
        },
        {
          type: 'multiple-choice',
          text: '您喜欢哪些运动？（可多选）',
          options: [
            { text: '跑步', isDefault: false, order: 1 },
            { text: '游泳', isDefault: false, order: 2 },
            { text: '篮球', isDefault: false, order: 3 },
            { text: '足球', isDefault: false, order: 4 },
            { text: '网球', isDefault: false, order: 5 }
        ],
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
  */
}

/**
 * 从后端API加载问卷数据
 */
function loadQuestionnaireFromAPI(questionnaireId) {
  console.log('=== 开始从后端API加载问卷数据 ===');
  console.log('传入的问卷ID:', questionnaireId);
  console.log('问卷ID类型:', typeof questionnaireId);
  console.log('CONFIG.BACKEND_BASE_URL:', CONFIG.BACKEND_BASE_URL);
  console.log('CONFIG.API_ENDPOINTS.QUESTION_PREVIEW:', CONFIG.API_ENDPOINTS.QUESTION_PREVIEW);
  
  const apiUrl = `${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTION_PREVIEW}?questionnaireId=${questionnaireId}`;
  console.log('完整API地址:', apiUrl);
  
  // 显示加载状态
  const container = document.getElementById('questionnaireContainer') || document.getElementById('questionsContainer');
  if (container) {
    container.innerHTML = `
      <div class="loading">
        <h3>正在加载问卷数据...</h3>
        <p>问卷ID: ${questionnaireId}</p>
        <p>数据来源: 后端API</p>
        <p>API地址: ${apiUrl}</p>
        <div class="loading-spinner"></div>
      </div>
    `;
  }
  
  // 调用后端API
  fetch(`${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTION_PREVIEW}?questionnaireId=${questionnaireId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('API返回数据:', data);
      
      if (data.code === 200 && data.data) {
        // 转换后端数据格式为前端格式
        const apiData = data.data;
        questionnaireData = {
          title: apiData.questionnaireInfo?.title || '问卷预览',
          description: apiData.questionnaireInfo?.description || '问卷描述',
          questions: convertApiQuestionsToFrontend(apiData.questions || []),
          startDate: apiData.questionnaireInfo?.startDate || '',
          endDate: apiData.questionnaireInfo?.endDate || '',
          createdTime: apiData.questionnaireInfo?.createDate || ''
        };
        
        // 渲染问卷
        renderQuestionnaire();
      } else {
        throw new Error(data.message || '获取数据失败');
      }
    })
    .catch(error => {
      console.error('加载问卷数据失败:', error);
      const container = document.getElementById('questionnaireContainer') || document.getElementById('questionsContainer');
      if (container) {
        container.innerHTML = `
          <div class="error-message">
            <h3>加载失败</h3>
            <p>无法从后端API加载问卷数据：${error.message}</p>
            <p>问卷ID: ${questionnaireId}</p>
            <p>API地址: ${CONFIG.BACKEND_BASE_URL}${CONFIG.API_ENDPOINTS.QUESTION_PREVIEW}</p>
            <button onclick="location.reload()">重试</button>
            <button onclick="window.history.back()">返回上一页</button>
          </div>
        `;
      }
    });
}

/**
 * 将后端API的问题数据转换为前端格式
 */
function convertApiQuestionsToFrontend(apiQuestions) {
  console.log('开始转换API问题数据:', apiQuestions);
  
  return apiQuestions.map(question => {
    const frontendQuestion = {
      id: question.id,
      type: getQuestionTypeFromId(question.questionType),
      text: question.content,
      required: question.isRequired === 1,
      sortNum: question.sortNum
    };
    
    console.log(`转换问题 ${question.id} (类型: ${question.questionType}):`, question);
    
            // 根据问题类型转换数据
        switch (question.questionType) {
          case 1: // 单选题
            if (question.singleChoiceOptions && Array.isArray(question.singleChoiceOptions)) {
              frontendQuestion.options = question.singleChoiceOptions.map(option => ({
                text: option.optionContent,
                isDefault: option.isDefault === 1,
                order: option.sortNum
              }));
            } else {
              frontendQuestion.options = [];
            }
            break;
            
          case 2: // 多选题
            if (question.multipleChoiceOptions && Array.isArray(question.multipleChoiceOptions)) {
              frontendQuestion.options = question.multipleChoiceOptions.map(option => ({
                text: option.optionContent,
                isDefault: option.isDefault === 1,
                order: option.sortNum
              }));
            } else {
              frontendQuestion.options = [];
            }
            break;
            
          case 3: // 文本题
            if (question.textQuestion) {
              frontendQuestion.maxLength = question.textQuestion.maxLength;
              frontendQuestion.placeholder = question.textQuestion.hintText;
            } else {
              frontendQuestion.maxLength = 500;
              frontendQuestion.placeholder = '';
            }
            break;
            
          case 4: // 评分题
            if (question.ratingQuestion) {
              frontendQuestion.minScore = question.ratingQuestion.minScore;
              frontendQuestion.maxScore = question.ratingQuestion.maxScore;
              frontendQuestion.minLabel = question.ratingQuestion.minLabel;
              frontendQuestion.maxLabel = question.ratingQuestion.maxLabel;
              frontendQuestion.ratingLabels = question.ratingQuestion.ratingLabels;
            } else {
              frontendQuestion.minScore = 1;
              frontendQuestion.maxScore = 5;
              frontendQuestion.minLabel = '';
              frontendQuestion.maxLabel = '';
              frontendQuestion.ratingLabels = [];
            }
            break;
            
          case 5: // 矩阵题
            if (question.matrixQuestion) {
              frontendQuestion.rows = question.matrixQuestion.rows?.map(row => ({
                text: row.rowContent,
                order: row.sortNum
              })) || [];
              frontendQuestion.columns = question.matrixQuestion.columns?.map(column => ({
                text: column.columnContent,
                order: column.sortNum
              })) || [];
            } else {
              frontendQuestion.rows = [];
              frontendQuestion.columns = [];
            }
            break;
        
      case 6: // 日期题
        if (question.dateQuestion) {
          frontendQuestion.dateFormat = question.dateQuestion.dateFormat;
        }
        break;
        
      case 7: // 时间题
        if (question.timeQuestion) {
          frontendQuestion.timeFormat = question.timeQuestion.timeFormat;
        }
        break;
        
      case 8: // 文件上传题
        if (question.fileUploadQuestion) {
          frontendQuestion.maxFileSize = question.fileUploadQuestion.maxFileSize;
          frontendQuestion.allowedTypes = question.fileUploadQuestion.allowedTypes;
        }
        break;
        
      case 9: // 位置题
        if (question.locationQuestion) {
          frontendQuestion.locationType = question.locationQuestion.locationType;
        }
        break;
        
      case 10: // 签名题
        if (question.signatureQuestion) {
          frontendQuestion.width = question.signatureQuestion.width;
          frontendQuestion.height = question.signatureQuestion.height;
        }
        break;
        
      case 11: // 用户信息题
        if (question.userInfoQuestion) {
          frontendQuestion.userInfoFields = question.userInfoQuestion.fields?.map(field => ({
            type: field.fieldType,
            label: field.label,
            required: field.isRequired === 1
          })) || [];
        }
        break;
            }
        
        console.log(`问题 ${question.id} 转换完成:`, frontendQuestion);
        return frontendQuestion;
      });
}

/**
 * 根据问题类型ID获取前端类型字符串
 */
function getQuestionTypeFromId(typeId) {
  const typeMap = {
    1: 'single-choice',
    2: 'multiple-choice',
    3: 'text',
    4: 'rating',
    5: 'matrix',
    6: 'date',
    7: 'time',
    8: 'file-upload',
    9: 'location',
    10: 'signature',
    11: 'user-info'
  };
  return typeMap[typeId] || 'text';
}

/**
 * 渲染问卷内容
 */
function renderQuestionnaire() {
  // 设置问卷标题和描述
  document.getElementById('questionnaireTitle').textContent = questionnaireData.title;
  document.getElementById('questionnaireDescription').textContent = questionnaireData.description;
  
  // 设置问卷时间信息
  renderQuestionnaireTimeInfo();
  
  // 如果有提交信息，更新页面标题和描述
  if (submitTime) {
    const header = document.querySelector('.preview-header .preview-title');
    if (header) {
      const title = header.querySelector('h1');
      const subtitle = header.querySelector('.preview-subtitle');
      if (title) title.textContent = '问卷填写结果预览';
      if (subtitle) subtitle.textContent = `提交时间: ${new Date(submitTime).toLocaleString()} | 填写时长: ${Math.floor(duration / 60)}分${duration % 60}秒`;
    }
  }
  
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
    'single-choice': '单选题',
    'multiple': '多选题',
    'multiple-choice': '多选题',
    'text': '文本题',
    'rating': '评分题',
    'matrix': '矩阵题',
    'date': '日期题',
    'time': '时间题',
    'file': '文件上传',
    'file-upload': '文件上传',
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
    case 'single-choice':
      return createRadioOptions(question);
    case 'multiple':
    case 'multiple-choice':
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
    case 'file-upload':
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
  
  // 安全检查：确保options存在且是数组
  if (!question.options || !Array.isArray(question.options)) {
    console.warn('单选题缺少选项数据:', question);
    return container;
  }
  
  // 获取用户答案 - 尝试多种可能的键名
  const userAnswer = userAnswers[question.id] || userAnswers[question.content] || userAnswers[question.text];
  
  question.options.forEach((option) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-item';
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `question_${question.id || Math.random()}`;
    
    // 处理新的选项数据结构
    if (typeof option === 'object' && option.text) {
      radio.value = option.text;
      radio.disabled = true;
      
      // 如果这是用户选择的答案，则选中
      if (userAnswer === option.text) {
        radio.checked = true;
        optionDiv.classList.add('selected-answer');
      }
      
      const label = document.createElement('span');
      label.className = 'option-text';
      label.textContent = option.text;
      
      optionDiv.appendChild(radio);
      optionDiv.appendChild(label);
    } else {
      // 兼容旧的选项数据结构
      radio.value = option;
      radio.disabled = true;
      
      // 如果这是用户选择的答案，则选中
      if (userAnswer === option) {
        radio.checked = true;
        optionDiv.classList.add('selected-answer');
      }
      
      const label = document.createElement('span');
      label.className = 'option-text';
      label.textContent = option;
      
      optionDiv.appendChild(radio);
      optionDiv.appendChild(label);
    }
    
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
  
  // 安全检查：确保options存在且是数组
  if (!question.options || !Array.isArray(question.options)) {
    console.warn('多选题缺少选项数据:', question);
    return container;
  }
  
  // 获取用户答案 - 尝试多种可能的键名
  const userAnswer = userAnswers[question.id] || userAnswers[question.content] || userAnswers[question.text];
  const selectedOptions = Array.isArray(userAnswer) ? userAnswer : [];
  
  question.options.forEach((option) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    
    // 处理新的选项数据结构
    if (typeof option === 'object' && option.text) {
      checkbox.value = option.text;
      checkbox.disabled = true;
      
      // 如果这是用户选择的答案，则选中
      if (selectedOptions.includes(option.text)) {
        checkbox.checked = true;
        optionDiv.classList.add('selected-answer');
      }
      
      const label = document.createElement('span');
      label.className = 'option-text';
      label.textContent = option.text;
      
      optionDiv.appendChild(checkbox);
      optionDiv.appendChild(label);
    } else {
      // 兼容旧的选项数据结构
      checkbox.value = option;
      checkbox.disabled = true;
      
      // 如果这是用户选择的答案，则选中
      if (selectedOptions.includes(option)) {
        checkbox.checked = true;
        optionDiv.classList.add('selected-answer');
      }
      
      const label = document.createElement('span');
      label.className = 'option-text';
      label.textContent = option;
      
      optionDiv.appendChild(checkbox);
      optionDiv.appendChild(label);
    }
    
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
  
  // 使用问题中定义的占位符，如果没有则使用默认值
  textarea.placeholder = question.placeholder || '请输入您的答案...';
  textarea.disabled = true;
  
  // 设置最大长度（如果有的话）
  if (question.maxLength) {
    textarea.maxLength = question.maxLength;
  }
  
  // 获取用户答案 - 尝试多种可能的键名
  const userAnswer = userAnswers[question.id] || userAnswers[question.content] || userAnswers[question.text];
  if (userAnswer) {
    textarea.value = userAnswer;
    textarea.classList.add('has-answer');
  }
  
  container.appendChild(textarea);
  return container;
}

/**
 * 创建评分输入
 */
function createRatingInput(question) {
  const container = document.createElement('div');
  container.className = 'rating-container';
  
  const maxRating = question.maxScore || 5;
  const minRating = question.minScore || 1;
  
  // 获取用户答案 - 尝试多种可能的键名
  const userAnswer = userAnswers[question.id] || userAnswers[question.content] || userAnswers[question.text];
  const rating = userAnswer ? parseInt(userAnswer) : 0;
  
  for (let i = minRating; i <= maxRating; i++) {
    const star = document.createElement('span');
    star.className = 'rating-star';
    star.textContent = '★';
    star.style.cursor = 'default';
    
    // 如果这是用户选择的评分，则高亮显示
    if (i <= rating) {
      star.style.color = '#ffd700';
      star.classList.add('selected-rating');
    }
    
    container.appendChild(star);
  }
  
  // 添加评分标签（如果有的话）
  if (question.minLabel && question.maxLabel) {
    const labelsContainer = document.createElement('div');
    labelsContainer.style.marginTop = '0.5rem';
    labelsContainer.style.fontSize = '0.875rem';
    labelsContainer.style.color = 'var(--text-secondary)';
    
    const minLabelSpan = document.createElement('span');
    minLabelSpan.textContent = `${question.minScore || 1}: ${question.minLabel}`;
    minLabelSpan.style.marginRight = '1rem';
    labelsContainer.appendChild(minLabelSpan);
    
    const maxLabelSpan = document.createElement('span');
    maxLabelSpan.textContent = `${question.maxScore || 5}: ${question.maxLabel}`;
    maxLabelSpan.style.marginRight = '1rem';
    labelsContainer.appendChild(maxLabelSpan);
    
    container.appendChild(labelsContainer);
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
  
  // 处理列数据
  if (question.columns && Array.isArray(question.columns)) {
    question.columns.forEach(column => {
      const th = document.createElement('th');
      // 处理新的列数据结构
      if (typeof column === 'object' && column.text) {
        th.textContent = column.text;
      } else {
        th.textContent = column;
      }
      headerRow.appendChild(th);
    });
  }
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // 创建表体
  const tbody = document.createElement('tbody');
  
  // 获取用户答案 - 尝试多种可能的键名
  const userAnswer = userAnswers[question.id] || userAnswers[question.content] || userAnswers[question.text];
  
  // 处理行数据
  if (question.rows && Array.isArray(question.rows)) {
    question.rows.forEach(row => {
      const tr = document.createElement('tr');
      
      const rowHeader = document.createElement('td');
      // 处理新的行数据结构
      if (typeof row === 'object' && row.text) {
        rowHeader.textContent = row.text;
      } else {
        rowHeader.textContent = row;
      }
      rowHeader.style.fontWeight = '600';
      tr.appendChild(rowHeader);
      
      // 处理列数据
      if (question.columns && Array.isArray(question.columns)) {
        question.columns.forEach(column => {
          const td = document.createElement('td');
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = `matrix_${typeof row === 'object' ? row.text : row}`;
          
          // 处理新的列数据结构
          if (typeof column === 'object' && column.text) {
            radio.value = column.text;
          } else {
            radio.value = column;
          }
          
          radio.disabled = true;
          
          // 如果这是用户选择的答案，则选中
          if (userAnswer && userAnswer[typeof row === 'object' ? row.text : row] === (typeof column === 'object' ? column.text : column)) {
            radio.checked = true;
            td.classList.add('selected-answer');
          }
          
          td.appendChild(radio);
          tr.appendChild(td);
        });
      }
      
      tbody.appendChild(tr);
    });
  }
  
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
  
  // 设置日期格式提示（如果有的话）
  if (question.dateFormat) {
    const formatHint = document.createElement('div');
    formatHint.style.fontSize = '0.75rem';
    formatHint.style.color = 'var(--text-secondary)';
    formatHint.style.marginTop = '0.25rem';
    formatHint.textContent = `格式: ${question.dateFormat}`;
    container.appendChild(formatHint);
  }
  
  // 获取用户答案 - 尝试多种可能的键名
  const userAnswer = userAnswers[question.id] || userAnswers[question.content] || userAnswers[question.text];
  if (userAnswer) {
    input.value = userAnswer;
    input.classList.add('has-answer');
  }
  
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
  
  // 设置时间格式提示（如果有的话）
  if (question.timeFormat) {
    const formatHint = document.createElement('div');
    formatHint.style.fontSize = '0.75rem';
    formatHint.style.color = 'var(--text-secondary)';
    formatHint.style.marginTop = '0.25rem';
    formatHint.textContent = `格式: ${question.timeFormat}`;
    container.appendChild(formatHint);
  }
  
  // 获取用户答案 - 尝试多种可能的键名
  const userAnswer = userAnswers[question.id] || userAnswers[question.content] || userAnswers[question.text];
  if (userAnswer) {
    input.value = userAnswer;
    input.classList.add('has-answer');
  }
  
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
  
  // 根据问题类型添加特定的预览信息
  switch (question.type) {
    case 'file-upload':
      if (question.maxFileSize) {
        const sizeInfo = document.createElement('p');
        sizeInfo.style.fontSize = '0.875rem';
        sizeInfo.style.color = 'var(--text-secondary)';
        sizeInfo.textContent = `最大文件大小: ${question.maxFileSize}MB`;
        container.appendChild(sizeInfo);
      }
      if (question.allowedTypes) {
        const typeInfo = document.createElement('p');
        typeInfo.style.fontSize = '0.875rem';
        typeInfo.style.color = 'var(--text-secondary)';
        typeInfo.textContent = `允许的文件类型: ${question.allowedTypes}`;
        container.appendChild(typeInfo);
      }
      break;
      
    case 'location':
      if (question.locationType) {
        const locationInfo = document.createElement('p');
        locationInfo.style.fontSize = '0.875rem';
        locationInfo.style.color = 'var(--text-secondary)';
        locationInfo.textContent = `位置类型: ${question.locationType}`;
        container.appendChild(locationInfo);
      }
      break;
      
    case 'signature':
      if (question.signatureWidth && question.signatureHeight) {
        const sizeInfo = document.createElement('p');
        sizeInfo.style.fontSize = '0.875rem';
        sizeInfo.style.color = 'var(--text-secondary)';
        sizeInfo.textContent = `签名区域: ${question.signatureWidth} × ${question.signatureHeight} 像素`;
        container.appendChild(sizeInfo);
      }
      break;
      
    case 'user-info':
      if (question.fields && Array.isArray(question.fields)) {
        const fieldsInfo = document.createElement('div');
        fieldsInfo.style.marginTop = '0.5rem';
        
        question.fields.forEach(field => {
          const fieldInfo = document.createElement('p');
          fieldInfo.style.fontSize = '0.875rem';
          fieldInfo.style.color = 'var(--text-secondary)';
          fieldInfo.style.margin = '0.25rem 0';
          fieldInfo.textContent = `${field.label} (${field.type})${field.required ? ' *' : ''}`;
          fieldsInfo.appendChild(fieldInfo);
        });
        
        container.appendChild(fieldsInfo);
      }
      break;
  }
  
  return container;
}

/**
 * 绑定事件
 */
function bindEvents() {
  // 绑定返回编辑器按钮事件
  const backToEditorButton = document.getElementById('btnBackToEditor');
  if (backToEditorButton) {
    backToEditorButton.addEventListener('click', () => {
      console.log('点击返回编辑器按钮');
      
      // 尝试返回上一页（问卷编辑器）
      if (window.history.length > 1) {
        console.log('返回上一页');
        window.history.back();
      } else {
        // 如果没有历史记录，跳转到问卷编辑器
        console.log('跳转到问卷编辑器页面');
        window.location.href = 'questionnaire-editor.html';
      }
    });
  }
  
  // 绑定返回问卷管理按钮事件
  const backButton = document.getElementById('btnBackToManagement');
  if (backButton) {
    backButton.addEventListener('click', () => {
      console.log('点击返回问卷管理按钮');
      // 清除预览数据
      localStorage.removeItem('questionnaire_preview_data');
      // 跳转到问卷管理页面
      window.location.href = 'questionnaire-management.html';
    });
  }
  
  console.log('问卷预览页面事件已绑定');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPreview); 