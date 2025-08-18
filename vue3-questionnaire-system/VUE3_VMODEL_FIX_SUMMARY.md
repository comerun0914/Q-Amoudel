# Vue3 v-model 绑定错误修复总结

## 问题描述
在Vue3项目中，多个组件出现了以下错误：
```
v-model cannot be used on a prop, because local prop bindings are not writable.
Use a v-bind binding combined with a v-on listener that emits update:x event instead.
```

## 错误原因
在Vue3中，不能直接在prop上使用v-model，因为props是只读的。需要使用v-bind和v-on的组合来实现双向绑定。

## 修复方案
将 `v-model:open="open"` 替换为：
- `:open="open"` (单向绑定)
- `@update:open="handleOpenChange"` (事件监听)

并在组件中添加相应的事件处理函数来emit `update:open` 事件。

## 已修复的组件

### 1. QuestionModal.vue
- **修复前**: `v-model:open="open"`
- **修复后**: `:open="open"` + `@update:open="handleOpenChange"`
- **添加函数**: `handleOpenChange` 来emit事件

### 2. PreviewAnswersModal.vue
- **修复前**: `v-model:open="open"`
- **修复后**: `:open="open"` + `@update:open="handleOpenChange"`
- **添加函数**: `handleOpenChange` 来emit事件

### 3. ResponseDetailModal.vue
- **修复前**: `v-model:open="open"`
- **修复后**: `:open="open"` + `@update:open="handleOpenChange"`
- **添加函数**: `handleOpenChange` 来emit事件

### 4. RegisterForm.vue
- **修复前**: `v-model:open="showAgreement"` 和 `v-model:open="showPrivacy"`
- **修复后**: `:open="showAgreement"` + `@update:open="showAgreement = $event"`
- **说明**: 直接使用 `$event` 来更新本地状态

### 5. GlobalNotification.vue
- **修复前**: `v-model:open="showDrawer"`
- **修复后**: `:open="showDrawer"` + `@update:open="handleDrawerOpenChange"`
- **添加函数**: `handleDrawerOpenChange` 来调用store方法

### 6. UserCenter.vue
- **修复前**: `v-model:open="showChangePasswordModal"`
- **修复后**: `:open="showChangePasswordModal"` + `@update:open="showChangePasswordModal = $event"`
- **说明**: 直接使用 `$event` 来更新本地状态

## 注意事项

### 合法的v-model:open使用
以下组件中的`v-model:open`是合法的，因为绑定的是本地响应式变量：
- QuestionnaireCreate.vue: `v-model:open="showQuestionModal"`
- QuestionnaireEdit.vue: `v-model:open="showQuestionModal"`
- QuestionnaireManagement.vue: `v-model:open="shareModalVisible"`
- QuestionnaireStatistics.vue: `v-model:open="responseDetailVisible"`
- QuestionnaireFill.vue: `v-model:open="showPreviewModal"`

### 修复原则
1. **组件内部**: 不能对props使用v-model
2. **父组件**: 可以对本地响应式变量使用v-model
3. **替代方案**: 使用`:prop` + `@update:prop` 的组合

## 修复后的效果
- 消除了Vue3编译错误
- 保持了组件的双向绑定功能
- 符合Vue3的响应式设计原则
- 提高了代码的可维护性

## 建议
在开发Vue3组件时，始终注意：
1. props是只读的，不能直接修改
2. 使用emit来向父组件发送更新事件
3. 在父组件中使用v-model绑定本地状态
4. 在子组件中使用计算属性或事件处理来实现双向绑定
