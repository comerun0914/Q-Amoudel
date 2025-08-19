# 问卷API使用示例 - 创建问卷界面

## 概述
本文档展示如何在创建问卷界面中使用完整的问卷API，包括问卷类型、创建、验证、草稿管理等功能。

## 1. 导入API模块

```javascript
import { questionnaireAPI, questionnaireTypeUtils, questionnaireUtils } from '@/api/questionnaire.js';
```

## 2. 问卷类型管理

### 2.1 获取问卷类型选项
```javascript
// 在组件setup中
const questionnaireTypes = ref([]);

onMounted(async () => {
  try {
    const response = await questionnaireAPI.getQuestionnaireTypes();
    if (response.code === 200) {
      questionnaireTypes.value = response.data;
    }
  } catch (error) {
    console.error('获取问卷类型失败:', error);
  }
});

// 或者使用工具函数获取预定义类型
const typeOptions = questionnaireTypeUtils.getTypeOptions();
const defaultType = questionnaireTypeUtils.getDefaultType();
```

### 2.2 问卷类型选择组件
```vue
<template>
  <a-form-item label="问卷类型" name="type">
    <a-select
      v-model:value="questionnaireInfo.type"
      placeholder="请选择问卷类型"
      :options="typeOptions"
      @change="handleTypeChange"
    />
  </a-form-item>
</template>

<script setup>
const typeOptions = computed(() => questionnaireTypeUtils.getTypeOptions());
const defaultType = questionnaireTypeUtils.getDefaultType();

// 初始化默认类型
questionnaireInfo.type = defaultType;

const handleTypeChange = (value) => {
  // 验证类型是否有效
  if (questionnaireTypeUtils.validateType(value)) {
    questionnaireInfo.type = value;
  } else {
    message.error('无效的问卷类型');
  }
};
</script>
```

## 3. 问卷创建流程

### 3.1 问卷数据结构
```javascript
const questionnaireInfo = reactive({
  title: '',
  description: '',
  type: '调查问卷', // 使用问卷类型
  startDate: '',
  endDate: '',
  status: 1,
  creatorId: null,
  submissionLimit: 1,
  questions: []
});
```

### 3.2 创建问卷
```javascript
const createQuestionnaire = async () => {
  try {
    // 1. 验证问卷数据
    const validation = questionnaireUtils.validateQuestionnaire(questionnaireInfo);
    if (!validation.isValid) {
      message.error(validation.errors.join('\n'));
      return;
    }

    // 2. 格式化数据用于API提交
    const apiData = questionnaireUtils.formatQuestionnaireForAPI(questionnaireInfo);
    
    // 3. 调用创建API
    const response = await questionnaireAPI.createQuestionnaire(apiData);
    
    if (response.code === 200) {
      message.success('问卷创建成功！');
      // 跳转到成功页面
      router.push({
        path: '/questionnaire/success',
        query: {
          id: response.data.id,
          title: questionnaireInfo.title,
          questionnaireType: questionnaireInfo.type
        }
      });
    } else {
      message.error(response.message || '创建失败');
    }
  } catch (error) {
    console.error('创建问卷失败:', error);
    message.error('创建问卷失败，请重试');
  }
};
```

### 3.3 更新问卷
```javascript
const updateQuestionnaire = async () => {
  try {
    const apiData = questionnaireUtils.formatQuestionnaireForAPI(questionnaireInfo);
    apiData.id = questionnaireId; // 添加问卷ID
    
    const response = await questionnaireAPI.updateQuestionnaire(apiData);
    
    if (response.code === 200) {
      message.success('问卷更新成功！');
    } else {
      message.error(response.message || '更新失败');
    }
  } catch (error) {
    console.error('更新问卷失败:', error);
    message.error('更新问卷失败，请重试');
  }
};
```

## 4. 草稿管理

### 4.1 保存草稿
```javascript
const saveAsDraft = async () => {
  try {
    const draftData = {
      questionnaireId: questionnaireId || null,
      userId: userInfo?.id,
      sessionId: sessionId,
      draftData: {
        ...questionnaireInfo,
        lastSaved: new Date().toISOString()
      }
    };
    
    const response = await questionnaireAPI.saveDraft(draftData);
    
    if (response.code === 200) {
      message.success('草稿保存成功');
      // 更新本地草稿ID
      draftId = response.data.draftId;
    }
  } catch (error) {
    console.error('保存草稿失败:', error);
    message.error('保存草稿失败');
  }
};
```

### 4.2 加载草稿
```javascript
const loadDraft = async () => {
  try {
    const response = await questionnaireAPI.getDraft(
      questionnaireId,
      userInfo?.id,
      sessionId
    );
    
    if (response.code === 200 && response.data) {
      const draftData = response.data.draftData;
      
      // 恢复问卷信息
      Object.assign(questionnaireInfo, {
        title: draftData.title || '',
        description: draftData.description || '',
        type: draftData.type || draftData.questionnaireType || '调查问卷',
        startDate: draftData.startDate || '',
        endDate: draftData.endDate || '',
        questions: draftData.questions || []
      });
      
      message.success('草稿加载成功');
    }
  } catch (error) {
    console.error('加载草稿失败:', error);
  }
};
```

## 5. 问卷验证

### 5.1 实时验证
```javascript
const validateForm = () => {
  const validation = questionnaireUtils.validateQuestionnaire(questionnaireInfo);
  
  if (!validation.isValid) {
    // 显示错误信息
    validation.errors.forEach(error => {
      message.error(error);
    });
    return false;
  }
  
  return true;
};

// 在表单提交前验证
const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }
  
  // 继续提交逻辑
  createQuestionnaire();
};
```

### 5.2 字段级验证
```javascript
const validateField = (fieldName, value) => {
  switch (fieldName) {
    case 'title':
      if (!value || value.trim() === '') {
        return '问卷标题不能为空';
      }
      if (value.length > 100) {
        return '标题长度不能超过100个字符';
      }
      break;
      
    case 'type':
      if (!questionnaireTypeUtils.validateType(value)) {
        return '请选择有效的问卷类型';
      }
      break;
      
    case 'startDate':
      if (!value) {
        return '请选择开始日期';
      }
      break;
      
    case 'endDate':
      if (!value) {
        return '请选择结束日期';
      }
      if (questionnaireInfo.startDate && value <= questionnaireInfo.startDate) {
        return '结束日期必须晚于开始日期';
      }
      break;
  }
  
  return '';
};
```

## 6. 问卷管理功能

### 6.1 获取问卷列表
```javascript
const loadQuestionnaires = async (params = {}) => {
  try {
    const response = await questionnaireAPI.getQuestionnaireList({
      page: currentPage.value,
      size: pageSize.value,
      ...params
    });
    
    if (response.code === 200) {
      questionnaireList.value = response.data.records;
      total.value = response.data.total;
    }
  } catch (error) {
    console.error('获取问卷列表失败:', error);
  }
};
```

### 6.2 按类型筛选
```javascript
const filterByType = async (type) => {
  if (type) {
    await loadQuestionnaires({ questionnaireType: type });
  } else {
    await loadQuestionnaires();
  }
};
```

### 6.3 删除问卷
```javascript
const deleteQuestionnaire = async (id) => {
  try {
    const response = await questionnaireAPI.deleteQuestionnaire(id);
    
    if (response.code === 200) {
      message.success('删除成功');
      await loadQuestionnaires(); // 重新加载列表
    } else {
      message.error(response.message || '删除失败');
    }
  } catch (error) {
    console.error('删除问卷失败:', error);
    message.error('删除失败');
  }
};
```

## 7. 完整组件示例

```vue
<template>
  <div class="questionnaire-create">
    <a-form :model="questionnaireInfo" :rules="rules" ref="formRef">
      <!-- 基本信息 -->
      <a-form-item label="问卷标题" name="title">
        <a-input v-model:value="questionnaireInfo.title" placeholder="请输入问卷标题" />
      </a-form-item>
      
      <a-form-item label="问卷描述" name="description">
        <a-textarea v-model:value="questionnaireInfo.description" placeholder="请输入问卷描述" />
      </a-form-item>
      
      <a-form-item label="问卷类型" name="type">
        <a-select
          v-model:value="questionnaireInfo.type"
          placeholder="请选择问卷类型"
          :options="typeOptions"
        />
      </a-form-item>
      
      <a-form-item label="开始日期" name="startDate">
        <a-date-picker v-model:value="questionnaireInfo.startDate" />
      </a-form-item>
      
      <a-form-item label="结束日期" name="endDate">
        <a-date-picker v-model:value="questionnaireInfo.endDate" />
      </a-form-item>
      
      <!-- 问题列表 -->
      <div class="questions-section">
        <h3>问题列表</h3>
        <div v-for="(question, index) in questionnaireInfo.questions" :key="index">
          <!-- 问题编辑组件 -->
        </div>
        <a-button @click="addQuestion">添加问题</a-button>
      </div>
      
      <!-- 操作按钮 -->
      <div class="actions">
        <a-button @click="saveAsDraft">保存草稿</a-button>
        <a-button @click="previewQuestionnaire">预览</a-button>
        <a-button type="primary" @click="createQuestionnaire">发布问卷</a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { questionnaireAPI, questionnaireTypeUtils, questionnaireUtils } from '@/api/questionnaire.js';

const router = useRouter();
const formRef = ref();

// 问卷信息
const questionnaireInfo = reactive({
  title: '',
  description: '',
  type: '调查问卷',
  startDate: '',
  endDate: '',
  status: 1,
  creatorId: null,
  submissionLimit: 1,
  questions: []
});

// 问卷类型选项
const typeOptions = computed(() => questionnaireTypeUtils.getTypeOptions());

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入问卷标题', trigger: 'blur' },
    { max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入问卷描述', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择问卷类型', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ]
};

// 创建问卷
const createQuestionnaire = async () => {
  try {
    // 验证表单
    await formRef.value.validate();
    
    // 验证问卷数据完整性
    const validation = questionnaireUtils.validateQuestionnaire(questionnaireInfo);
    if (!validation.isValid) {
      message.error(validation.errors.join('\n'));
      return;
    }
    
    // 格式化数据
    const apiData = questionnaireUtils.formatQuestionnaireForAPI(questionnaireInfo);
    
    // 调用API
    const response = await questionnaireAPI.createQuestionnaire(apiData);
    
    if (response.code === 200) {
      message.success('问卷创建成功！');
      router.push({
        path: '/questionnaire/success',
        query: {
          id: response.data.id,
          title: questionnaireInfo.title,
          questionnaireType: questionnaireInfo.type
        }
      });
    }
  } catch (error) {
    console.error('创建问卷失败:', error);
    message.error('创建失败，请检查表单');
  }
};

// 保存草稿
const saveAsDraft = async () => {
  try {
    const draftData = {
      questionnaireId: null,
      userId: null,
      sessionId: Date.now().toString(),
      draftData: {
        ...questionnaireInfo,
        lastSaved: new Date().toISOString()
      }
    };
    
    await questionnaireAPI.saveDraft(draftData);
    message.success('草稿保存成功');
  } catch (error) {
    console.error('保存草稿失败:', error);
    message.error('保存草稿失败');
  }
};

// 添加问题
const addQuestion = () => {
  questionnaireInfo.questions.push({
    content: '',
    questionType: 1,
    sortNum: questionnaireInfo.questions.length + 1,
    isRequired: 1,
    options: []
  });
};

// 预览问卷
const previewQuestionnaire = () => {
  if (questionnaireInfo.questions.length === 0) {
    message.warning('请先添加问题');
    return;
  }
  
  // 跳转到预览页面
  router.push({
    path: '/questionnaire/preview',
    query: { preview: 'true' }
  });
};

onMounted(() => {
  // 初始化默认值
  questionnaireInfo.type = questionnaireTypeUtils.getDefaultType();
});
</script>
```

## 8. 总结

通过使用完整的问卷API，创建问卷界面现在具备：

✅ **完整的问卷类型支持** - 四种类型选项和验证  
✅ **全面的CRUD操作** - 创建、读取、更新、删除问卷  
✅ **智能数据验证** - 前端和后端双重验证  
✅ **草稿管理** - 自动保存和恢复功能  
✅ **类型筛选** - 按问卷类型查询和管理  
✅ **错误处理** - 友好的错误提示和异常处理  
✅ **数据格式化** - 自动处理字段映射和转换  

这个API设计确保了创建问卷界面的完整性和用户体验，同时保持了代码的可维护性和扩展性。
