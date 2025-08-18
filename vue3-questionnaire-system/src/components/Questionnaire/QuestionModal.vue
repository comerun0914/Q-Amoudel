<template>
  <a-modal
    :open="open"
    :title="isEdit ? '编辑问题' : '添加问题'"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
    @update:open="handleOpenChange"
  >
    <a-form
      :model="formData"
      :rules="formRules"
      layout="vertical"
      ref="formRef"
      @finish="handleSave"
    >
      <!-- 问题基本信息 -->
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="问题类型" name="type">
            <a-select
              v-model:value="formData.type"
              placeholder="请选择问题类型"
              size="large"
              @change="handleTypeChange"
            >
              <a-select-option value="single">单选题</a-select-option>
              <a-select-option value="multiple">多选题</a-select-option>
              <a-select-option value="text">问答题</a-select-option>
              <a-select-option value="rating">评分题</a-select-option>
              <a-select-option value="matrix">矩阵题</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否必填" name="required">
            <a-switch
              v-model:checked="formData.required"
              checked-children="必填"
              un-checked-children="选填"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="问题标题" name="title">
        <a-input
          v-model:value="formData.title"
          placeholder="请输入问题标题"
          size="large"
        />
      </a-form-item>

      <!-- 选项配置区域 -->
      <div v-if="showOptionsSection" class="options-section">
        <div class="section-header">
          <h4>选项配置</h4>
          <a-button type="dashed" @click="addOption">
            <plus-outlined />
            添加选项
          </a-button>
        </div>

        <div class="options-list">
          <div
            v-for="(option, index) in formData.options"
            :key="option.id"
            class="option-item"
            draggable="true"
            @dragstart="handleDragStart(index, $event)"
            @dragover.prevent
            @drop="handleDrop(index, $event)"
            @dragenter.prevent
          >
            <div class="drag-handle">
              <drag-outlined />
            </div>
            <div class="option-content">
              <a-input
                v-model:value="option.text"
                :placeholder="`选项 ${index + 1}`"
                size="large"
              />
              <a-input
                v-if="formData.type === 'rating'"
                v-model:value="option.value"
                placeholder="分值"
                type="number"
                style="width: 100px"
              />
            </div>
            <div class="option-actions">
              <a-button
                type="text"
                @click="removeOption(index)"
                :disabled="formData.options.length <= 2"
                danger
              >
                <delete-outlined />
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 评分题特殊配置 -->
      <div v-if="formData.type === 'rating'" class="rating-config">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="最小分值" name="minScore">
              <a-input-number
                v-model:value="formData.minScore"
                :min="0"
                :max="formData.maxScore - 1"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="最大分值" name="maxScore">
              <a-input-number
                v-model:value="formData.maxScore"
                :min="formData.minScore + 1"
                :max="10"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="步长" name="step">
              <a-input-number
                v-model:value="formData.step"
                :min="0.5"
                :max="2"
                :step="0.5"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <!-- 矩阵题特殊配置 -->
      <div v-if="formData.type === 'matrix'" class="matrix-config">
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="matrix-section">
              <div class="section-header">
                <h4>行标题</h4>
                <a-button type="dashed" size="small" @click="addMatrixRow">
                  <plus-outlined />
                  添加行
                </a-button>
              </div>
              <div class="matrix-rows">
                <div
                  v-for="(row, index) in formData.matrixRows"
                  :key="row.id"
                  class="matrix-row"
                >
                  <a-input
                    v-model:value="row.text"
                    :placeholder="`行 ${index + 1}`"
                  />
                  <a-button
                    type="text"
                    @click="removeMatrixRow(index)"
                    :disabled="formData.matrixRows.length <= 1"
                    danger
                  >
                    <delete-outlined />
                  </a-button>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="matrix-section">
              <div class="section-header">
                <h4>列标题</h4>
                <a-button type="dashed" size="small" @click="addMatrixColumn">
                  <plus-outlined />
                  添加列
                </a-button>
              </div>
              <div class="matrix-columns">
                <div
                  v-for="(column, index) in formData.matrixColumns"
                  :key="column.id"
                  class="matrix-column"
                >
                  <a-input
                    v-model:value="column.text"
                    :placeholder="`列 ${index + 1}`"
                  />
                  <a-button
                    type="text"
                    @click="removeMatrixColumn(index)"
                    :disabled="formData.matrixColumns.length <= 1"
                    danger
                  >
                    <delete-outlined />
                  </a-button>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 验证规则配置 -->
      <div class="validation-section">
        <h4>验证规则</h4>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="最小长度" name="minLength">
              <a-input-number
                v-model:value="formData.minLength"
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="最大长度" name="maxLength">
              <a-input-number
                v-model:value="formData.maxLength"
                :min="formData.minLength || 0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="正则验证" name="pattern">
              <a-input
                v-model:value="formData.pattern"
                placeholder="正则表达式（可选）"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleSave" :loading="saving">
          {{ isEdit ? '更新' : '添加' }}
        </a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons-vue'

// 定义props和emits
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  question: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'save'])

// 响应式数据
const formRef = ref()
const saving = ref(false)

// 计算属性
const isEdit = computed(() => !!props.question)

const showOptionsSection = computed(() => {
  return ['single', 'multiple', 'rating'].includes(formData.type)
})

// 表单数据
const formData = reactive({
  id: null,
  type: 'single',
  title: '',
  required: false,
  options: [],
  minScore: 1,
  maxScore: 5,
  step: 1,
  matrixRows: [],
  matrixColumns: [],
  minLength: 0,
  maxLength: 1000,
  pattern: ''
})

// 表单验证规则
const formRules = {
  type: [
    { required: true, message: '请选择问题类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入问题标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度在2-200个字符之间', trigger: 'blur' }
  ]
}

// 监听弹窗打开状态
watch(() => props.open, (newVal) => {
  if (newVal) {
    initFormData()
  }
})

// 初始化表单数据
const initFormData = () => {
  if (props.question) {
    // 编辑模式：加载现有问题数据
    console.log('QuestionModal - 编辑模式，加载现有问题数据:', props.question)
    Object.assign(formData, { ...props.question })
  } else {
    // 新增模式：重置为默认值
    console.log('QuestionModal - 新增模式，设置默认值')
    Object.assign(formData, {
      id: null,
      type: 'single',
      title: '',
      required: false,
      options: [
        { id: Date.now(), text: '选项1' },
        { id: Date.now() + 1, text: '选项2' }
      ],
      minScore: 1,
      maxScore: 5,
      step: 1,
      matrixRows: [
        { id: Date.now(), text: '行1' }
      ],
      matrixColumns: [
        { id: Date.now(), text: '列1' }
      ],
      minLength: 0,
      maxLength: 1000,
      pattern: ''
    })
  }

  // 调试信息：显示当前表单数据
  console.log('QuestionModal - 表单数据初始化完成:', {
    type: formData.type,
    matrixRows: formData.matrixRows,
    matrixColumns: formData.matrixColumns,
    matrixRowsLength: formData.matrixRows?.length,
    matrixColumnsLength: formData.matrixColumns?.length
  })
}

// 处理问题类型变化
const handleTypeChange = (type) => {
  console.log('QuestionModal - 问题类型变化:', type)

  // 根据类型初始化选项
  if (['single', 'multiple'].includes(type)) {
    formData.options = [
      { id: Date.now(), text: '选项1' },
      { id: Date.now() + 1, text: '选项2' }
    ]
  } else if (type === 'rating') {
    formData.options = [
      { id: Date.now(), text: '1分', value: 1 },
      { id: Date.now() + 1, text: '2分', value: 2 },
      { id: Date.now() + 2, text: '3分', value: 3 },
      { id: Date.now() + 3, text: '4分', value: 4 },
      { id: Date.now() + 4, text: '5分', value: 5 }
    ]
  } else if (type === 'matrix') {
    console.log('QuestionModal - 设置矩阵题默认行列数据')
    formData.matrixRows = [{ id: Date.now(), text: '行1' }]
    formData.matrixColumns = [{ id: Date.now(), text: '列1' }]

    // 调试信息：显示矩阵题数据设置
    console.log('QuestionModal - 矩阵题数据设置完成:', {
      matrixRows: formData.matrixRows,
      matrixColumns: formData.matrixColumns
    })
  }
}

// 选项管理
const addOption = () => {
  const newOption = {
    id: Date.now(),
    text: `选项${formData.options.length + 1}`,
    value: formData.type === 'rating' ? formData.options.length + 1 : undefined
  }
  formData.options.push(newOption)
}

const removeOption = (index) => {
  if (formData.options.length > 2) {
    formData.options.splice(index, 1)
  }
}

// 矩阵行管理
const addMatrixRow = () => {
  const newRow = {
    id: Date.now(),
    text: `行${formData.matrixRows.length + 1}`
  }
  formData.matrixRows.push(newRow)
  console.log('QuestionModal - 添加矩阵行:', newRow, '当前行数:', formData.matrixRows.length)
}

const removeMatrixRow = (index) => {
  if (formData.matrixRows.length > 1) {
    const removedRow = formData.matrixRows.splice(index, 1)[0]
    console.log('QuestionModal - 删除矩阵行:', removedRow, '当前行数:', formData.matrixRows.length)
  }
}

// 矩阵列管理
const addMatrixColumn = () => {
  const newColumn = {
    id: Date.now(),
    text: `列${formData.matrixColumns.length + 1}`
  }
  formData.matrixColumns.push(newColumn)
  console.log('QuestionModal - 添加矩阵列:', newColumn, '当前列数:', formData.matrixColumns.length)
}

const removeMatrixColumn = (index) => {
  if (formData.matrixColumns.length > 1) {
    const removedColumn = formData.matrixColumns.splice(index, 1)[0]
    console.log('QuestionModal - 删除矩阵列:', removedColumn, '当前列数:', formData.matrixColumns.length)
  }
}

// 拖拽相关
const draggedOptionIndex = ref(null)
const draggedOverOptionIndex = ref(null)

const handleDragStart = (index, event) => {
  draggedOptionIndex.value = index
  event.dataTransfer.setData('text/plain', index)
}

const handleDrop = (index, event) => {
  draggedOverOptionIndex.value = index
  const draggedIndex = draggedOptionIndex.value
  const overIndex = draggedOverOptionIndex.value

  if (draggedIndex !== overIndex) {
    const [movedOption] = formData.options.splice(draggedIndex, 1)
    formData.options.splice(overIndex, 0, movedOption)
  }

  draggedOptionIndex.value = null
  draggedOverOptionIndex.value = null
}

// 保存问题
const handleSave = async () => {
  try {
    saving.value = true

    console.log('QuestionModal - 开始保存问题，当前表单数据:', {
      type: formData.type,
      title: formData.title,
      matrixRows: formData.matrixRows,
      matrixColumns: formData.matrixColumns,
      matrixRowsLength: formData.matrixRows?.length,
      matrixColumnsLength: formData.matrixColumns?.length
    })

    // 验证表单
    await formRef.value?.validate()

    // 验证选项数量
    if (showOptionsSection.value && formData.options.length < 2) {
      message.error('至少需要2个选项')
      return
    }

    // 验证矩阵配置
    if (formData.type === 'matrix') {
      console.log('QuestionModal - 验证矩阵题配置:', {
        matrixRows: formData.matrixRows,
        matrixColumns: formData.matrixColumns
      })

      if (formData.matrixRows.length < 1 || formData.matrixColumns.length < 1) {
        message.error('矩阵题至少需要1行1列')
        return
      }
    }

    // 构建保存数据，确保矩阵题数据正确包含
    const saveData = { ...formData }

    // 特别处理矩阵题数据，确保行列数据正确传递
    if (formData.type === 'matrix') {
      console.log('QuestionModal - 处理矩阵题数据保存')

      // 确保矩阵题有默认的行列数据
      if (!saveData.matrixRows || saveData.matrixRows.length === 0) {
        console.log('QuestionModal - 警告：矩阵行数据为空，设置默认值')
        saveData.matrixRows = [{ id: Date.now(), text: '行1' }]
      }
      if (!saveData.matrixColumns || saveData.matrixColumns.length === 0) {
        console.log('QuestionModal - 警告：矩阵列数据为空，设置默认值')
        saveData.matrixColumns = [{ id: Date.now(), text: '列1' }]
      }

      // 添加调试信息
      console.log('QuestionModal - 矩阵题最终保存数据:', {
        type: saveData.type,
        matrixRows: saveData.matrixRows,
        matrixColumns: saveData.matrixColumns,
        matrixRowsLength: saveData.matrixRows?.length,
        matrixColumnsLength: saveData.matrixColumns?.length
      })
    }

    // 最终保存数据的完整信息
    console.log('QuestionModal - 最终保存数据:', saveData)

    // 触发保存事件
    emit('save', saveData)

    console.log('QuestionModal - 保存事件已触发')

  } catch (error) {
    console.error('QuestionModal - 保存问题失败:', error)
    message.error('请检查表单信息')
  } finally {
    saving.value = false
  }
}

  // 取消操作
  const handleCancel = () => {
    emit('update:open', false)
    // 重置表单
    nextTick(() => {
      formRef.value?.resetFields()
    })
  }

  // 处理弹窗打开状态变化
  const handleOpenChange = (newVal) => {
    emit('update:open', newVal)
  }
</script>

<style scoped>
.options-section,
.rating-config,
.matrix-config,
.validation-section {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 500;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fff;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.option-content {
  flex: 1;
  display: flex;
  gap: 12px;
  align-items: center;
}

.option-actions {
  flex-shrink: 0;
}

.drag-handle {
  cursor: grab;
  color: #999;
  font-size: 16px;
  padding: 0 8px;
  user-select: none;
  display: flex;
  align-items: center;
}

.drag-handle:active {
  cursor: grabbing;
}

.rating-config .ant-row {
  margin-bottom: 0;
}

.matrix-section {
  margin-bottom: 16px;
}

.matrix-rows,
.matrix-columns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.matrix-row,
.matrix-column {
  display: flex;
  align-items: center;
  gap: 8px;
}

.matrix-row .ant-input,
.matrix-column .ant-input {
  flex: 1;
}

.validation-section {
  margin-top: 24px;
}

.validation-section h4 {
  margin: 0 0 16px 0;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .option-content {
    flex-direction: column;
    align-items: stretch;
  }

  .matrix-config .ant-row {
    flex-direction: column;
  }

  .matrix-config .ant-col {
    width: 100% !important;
    margin-bottom: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .ant-btn {
    width: 100%;
  }
}
</style>
