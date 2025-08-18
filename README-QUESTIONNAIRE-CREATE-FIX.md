# 问卷创建功能修复总结

## 问题描述

在创建问卷时出现以下错误：
```
创建问卷失败: 创建问卷失败: ### Error updating database. Cause: java.sql.SQLException: Field 'option_content' doesn't have a default value ### The error may exist in com/shz/quick_qa_system/dao/MultipleChoiceOptionMapper.java (best guess) ### The error may involve com.shz.quick_qa_system.dao.MultipleChoiceOptionMapper.insert-Inline ### The error occurred while setting parameters ### SQL: INSERT INTO multiple_choice_option ( id, question_id ) VALUES ( ?, ? ) ### Cause: java.sql.SQLException: Field 'option_content' doesn't have a default value ; Field 'option_content' doesn't have a default value; nested exception is java.sql.SQLException: Field 'option_content' doesn't have a default value
```

## 问题分析

### 根本原因
前端和后端之间的字段映射不一致：
- **前端数据结构**: 选项内容字段为 `text`
- **后端期望字段**: 选项内容字段为 `optionContent`
- **数据库表结构**: `multiple_choice_option` 表的 `option_content` 字段为 `NOT NULL`，没有默认值

### 具体问题
1. 前端构建选项数据时使用 `opt.text` 作为选项内容
2. 后端代码期望 `optionData.get("optionContent")` 获取选项内容
3. 由于字段名不匹配，`optionContent` 为 `null`，导致数据库插入失败

## 修复方案

### 1. 前端修复 (QuestionnaireCreate.vue)

**修复前:**
```javascript
options: q.options || [],
```

**修复后:**
```javascript
options: (q.options || []).map((opt, optIndex) => {
  const mappedOption = {
    optionContent: opt.text,           // 将 text 映射为 optionContent
    sortNum: optIndex + 1,            // 自动生成排序号
    isDefault: opt.isDefault || 0     // 处理默认选项
  };
  console.log(`问题 ${index + 1} 选项 ${optIndex + 1} 映射:`, {
    original: opt,
    mapped: mappedOption
  });
  return mappedOption;
}),
```

### 2. 后端修复 (QuestionCreateServiceImpl.java)

**添加数据验证和调试日志:**
```java
private void saveOptions(Integer questionId, Integer questionType, List<Map<String, Object>> options) {
    System.out.println("=== 开始保存选项数据 ===");
    System.out.println("问题ID: " + questionId);
    System.out.println("问题类型: " + questionType);
    System.out.println("选项数量: " + options.size());
    System.out.println("选项数据: " + options);
    
    for (int i = 0; i < options.size(); i++) {
        Map<String, Object> optionData = options.get(i);
        System.out.println("处理第 " + (i + 1) + " 个选项，数据: " + optionData);

        if (questionType == 2) { // 多选题
            MultipleChoiceOption option = new MultipleChoiceOption();
            // ... ID 生成逻辑 ...
            
            String optionContent = (String) optionData.get("optionContent");
            System.out.println("多选题选项内容: " + optionContent);
            if (optionContent == null || optionContent.trim().isEmpty()) {
                throw new IllegalArgumentException("多选题选项内容不能为空，选项数据: " + optionData);
            }
            option.setOptionContent(optionContent);
            
            Integer sortNum = (Integer) optionData.get("sortNum");
            System.out.println("多选题选项排序号: " + sortNum);
            option.setSortNum(sortNum != null ? sortNum : i + 1);
            
            System.out.println("准备插入多选题选项: " + option);
            multipleChoiceOptionMapper.insert(option);
            System.out.println("多选题选项插入成功");
        }
    }
}
```

## 修复效果

### 修复前
- 前端发送: `{ text: "选项内容", ... }`
- 后端接收: `optionData.get("optionContent")` → `null`
- 数据库插入: `INSERT INTO multiple_choice_option (id, question_id) VALUES (?, ?)` → 失败

### 修复后
- 前端发送: `{ optionContent: "选项内容", sortNum: 1, ... }`
- 后端接收: `optionData.get("optionContent")` → "选项内容"
- 数据库插入: `INSERT INTO multiple_choice_option (id, question_id, option_content, sort_num) VALUES (?, ?, ?, ?)` → 成功

## 测试验证

### 测试页面
创建了 `test-questionnaire-create-fix.html` 测试页面，用于验证修复效果。

### 测试步骤
1. 添加单选题、多选题、问答题
2. 编辑选项内容
3. 预览数据，检查字段映射
4. 模拟创建问卷，验证数据完整性

### 预期结果
- 所有选项的 `optionContent` 字段正确映射
- 所有选项的 `sortNum` 字段自动生成
- 数据库插入成功，不再出现 `option_content` 字段错误

## 相关文件

### 前端文件
- `vue3-questionnaire-system/src/views/QuestionnaireCreate.vue` - 问卷创建页面
- `vue3-questionnaire-system/src/components/Questionnaire/QuestionModal.vue` - 问题编辑模态框

### 后端文件
- `src/main/java/com/shz/quick_qa_system/service/impl/QuestionCreateServiceImpl.java` - 问卷创建服务实现

### 测试文件
- `test-questionnaire-create-fix.html` - 修复验证测试页面

## 注意事项

1. **字段映射一致性**: 确保前端和后端使用相同的字段名
2. **数据验证**: 后端应验证关键字段不为空
3. **错误处理**: 提供清晰的错误信息，便于调试
4. **日志记录**: 添加详细的调试日志，便于问题排查

## 总结

通过修复前端字段映射问题，问卷创建功能现在能够正确地将选项内容从 `text` 字段映射到 `optionContent` 字段，并自动生成排序号。这解决了数据库插入时 `option_content` 字段为空的问题，使问卷创建功能能够正常工作。
