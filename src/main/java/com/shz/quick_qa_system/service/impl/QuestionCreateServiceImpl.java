package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shz.quick_qa_system.entity.QuestionCreate;
import com.shz.quick_qa_system.entity.Question;
import com.shz.quick_qa_system.entity.SingleChoiceOption;
import com.shz.quick_qa_system.entity.MultipleChoiceOption;
import com.shz.quick_qa_system.entity.RatingQuestion;
import com.shz.quick_qa_system.entity.TextQuestion;
import com.shz.quick_qa_system.entity.MatrixQuestion;
import com.shz.quick_qa_system.entity.MatrixRow;
import com.shz.quick_qa_system.entity.MatrixColumn;
import com.shz.quick_qa_system.dao.QuestionCreateMapper;
import com.shz.quick_qa_system.dao.QuestionMapper;
import com.shz.quick_qa_system.dao.SingleChoiceOptionMapper;
import com.shz.quick_qa_system.dao.MultipleChoiceOptionMapper;
import com.shz.quick_qa_system.dao.RatingQuestionMapper;
import com.shz.quick_qa_system.dao.TextQuestionMapper;
import com.shz.quick_qa_system.dao.MatrixQuestionMapper;
import com.shz.quick_qa_system.dao.MatrixRowMapper;
import com.shz.quick_qa_system.dao.MatrixColumnMapper;
import com.shz.quick_qa_system.service.QuestionCreateService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import com.shz.quick_qa_system.dto.QuestionDto;
import com.shz.quick_qa_system.dto.QuestionOptionDto;
import com.shz.quick_qa_system.dto.QuestionnairePreviewDto;
import com.shz.quick_qa_system.entity.Users;
import com.shz.quick_qa_system.service.UsersService;

/**
 * <p>
 * 问卷管理 服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-08-02
 */
@Service
public class QuestionCreateServiceImpl extends ServiceImpl<QuestionCreateMapper, QuestionCreate> implements QuestionCreateService {
    @Resource
    private QuestionCreateMapper questionCreateMapper;

    @Resource
    private QuestionMapper questionMapper;

    @Resource
    private SingleChoiceOptionMapper singleChoiceOptionMapper;

    @Resource
    private MultipleChoiceOptionMapper multipleChoiceOptionMapper;
    
    @Resource
    private RatingQuestionMapper ratingQuestionMapper;
    
    @Resource
    private TextQuestionMapper textQuestionMapper;
    
    @Resource
    private MatrixQuestionMapper matrixQuestionMapper;
    
    @Resource
    private MatrixRowMapper matrixRowMapper;
    
    @Resource
    private MatrixColumnMapper matrixColumnMapper;

    @Resource
    private UsersService usersService;

    public QuestionCreate CreateQuestion(QuestionCreate questionCreate) {
        // 设置表单ID
        Integer formId = CodeGenerator.generateFormId();
        while (questionCreateMapper.exists(new QueryWrapper<QuestionCreate>().eq("id", formId))) {
            formId = CodeGenerator.generateFormId();
        }
        questionCreate.setId(formId);
        // 创建时间
        // 更新时间
        questionCreate.setCreatedTime(LocalDateTime.now());
        questionCreate.setUpdatedTime(LocalDateTime.now());
        boolean result = save(questionCreate);

        if (result) {
            // 返回创建的问卷信息
            return questionCreate;
        }
        return null;
    }
//    public Boolean CreateQuestion(QuestionCreate questionCreate) {
//        try {
//            // 设置表单ID
//            Integer formId = CodeGenerator.generateFormId();
//            // 检查ID是否已存在，如果存在则重新生成
//            while (count(new QueryWrapper<QuestionCreate>().eq("id", formId)) > 0) {
//                formId = CodeGenerator.generateFormId();
//            }
//            questionCreate.setId(formId);
//
//            // 设置创建时间和更新时间
//            questionCreate.setCreatedTime(LocalDateTime.now());
//            questionCreate.setUpdatedTime(LocalDateTime.now());
//
//            // 确保状态不为空
//            if (questionCreate.getStatus() == null) {
//                questionCreate.setStatus(true);
//            }
//
//            // 确保提交限制不为空
//            if (questionCreate.getSubmissionLimit() == null) {
//                questionCreate.setSubmissionLimit(1);
//            }
//
//            return save(questionCreate);
//        } catch (Exception e) {
//            e.printStackTrace();
//            throw new RuntimeException("创建问卷失败: " + e.getMessage());
//        }
//    }

    /**
     * 创建问卷（包含问题数据）
     */
    public QuestionCreate createQuestionnaireWithQuestions(Map<String, Object> request) {
        try {
            System.out.println("收到创建问卷请求数据: " + request);

            // 创建问卷基本信息
            QuestionCreate questionCreate = new QuestionCreate();

            // 设置基本信息
            questionCreate.setTitle((String) request.get("title"));
            questionCreate.setDescription((String) request.get("description"));

            // 处理日期格式
            String startDateStr = (String) request.get("startDate");
            String endDateStr = (String) request.get("endDate");

            if (startDateStr != null && !startDateStr.isEmpty()) {
                questionCreate.setStartDate(LocalDate.parse(startDateStr));
            }
            if (endDateStr != null && !endDateStr.isEmpty()) {
                questionCreate.setEndDate(LocalDate.parse(endDateStr));
            }

            questionCreate.setSubmissionLimit((Integer) request.get("submissionLimit"));
            questionCreate.setStatus((Integer) request.get("status"));
            questionCreate.setCreatorId((Integer) request.get("creatorId"));
            
            // 设置问卷类型
            Object questionnaireTypeObj = request.get("questionnaire_type");
            if (questionnaireTypeObj != null) {
                Integer questionnaireType;
                if (questionnaireTypeObj instanceof Integer) {
                    questionnaireType = (Integer) questionnaireTypeObj;
                } else if (questionnaireTypeObj instanceof String) {
                    questionnaireType = Integer.parseInt((String) questionnaireTypeObj);
                } else {
                    questionnaireType = (Integer) questionnaireTypeObj;
                }
                questionCreate.setQuestionnaireType(questionnaireType);
                System.out.println("设置问卷类型: " + questionnaireType);
            } else {
                questionCreate.setQuestionnaireType(0); // 默认调查问卷
                System.out.println("未设置问卷类型，使用默认值: 0");
            }

            // 生成问卷ID
            Integer formId = CodeGenerator.generateFormId();
            while (count(new QueryWrapper<QuestionCreate>().eq("id", formId)) > 0) {
                formId = CodeGenerator.generateFormId();
            }
            questionCreate.setId(formId);

            // 设置时间
            questionCreate.setCreatedTime(LocalDateTime.now());
            questionCreate.setUpdatedTime(LocalDateTime.now());

            // 保存问卷基本信息
            boolean saveResult = save(questionCreate);
            if (!saveResult) {
                throw new RuntimeException("保存问卷基本信息失败");
            }

            // 处理问题数据
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> questions = (List<Map<String, Object>>) request.get("questions");
            System.out.println("收到问题数据: " + questions);
            if (questions != null && !questions.isEmpty()) {
                saveQuestions(questionCreate.getId(), questions);
            }

            return questionCreate;
        } catch (Exception e) {
            throw new RuntimeException("创建问卷失败: " + e.getMessage());
        }
    }

    /**
     * 保存问题数据
     */
    private void saveQuestions(Integer questionnaireId, List<Map<String, Object>> questions) {
        System.out.println("开始保存问题，问卷ID: " + questionnaireId + ", 问题数量: " + questions.size());

        for (int i = 0; i < questions.size(); i++) {
            Map<String, Object> questionData = questions.get(i);
            System.out.println("处理问题 " + (i + 1) + ": " + questionData);

            // 创建问题
            Question question = new Question();
            question.setQuestionnaireId(questionnaireId);
            question.setContent((String) questionData.get("content"));
            question.setQuestionType((Integer) questionData.get("questionType"));
            question.setSortNum((Integer) questionData.get("sortNum"));
            question.setIsRequired((Integer) questionData.get("isRequired"));
            question.setCreatedTime(LocalDateTime.now());
            question.setUpdatedTime(LocalDateTime.now());

            // 生成唯一问题ID
            Integer qid = CodeGenerator.generateFormId();
            while (questionMapper.exists(new QueryWrapper<Question>().eq("id", qid))) {
                qid = CodeGenerator.generateFormId();
            }
            question.setId(qid);
            // 保存问题
            int insertResult = questionMapper.insert(question);
            System.out.println("问题保存结果: " + insertResult + ", 问题ID: " + question.getId());

            // 处理选项和配置（根据题型）
            Integer questionType = question.getQuestionType();
            if (questionType == 1 || questionType == 2) { // 单选题或多选题
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> options = (List<Map<String, Object>>) questionData.get("options");
                System.out.println("问题 " + (i + 1) + " 的选项: " + options);
                if (options != null && !options.isEmpty()) {
                    saveOptions(question.getId(), questionType, options);
                }
            } else if (questionType == 3) { // 问答题
                saveTextQuestionConfig(question.getId(), questionData);
            } else if (questionType == 4) { // 评分题
                saveRatingQuestionConfig(question.getId(), questionData);
            } else if (questionType == 5) { // 矩阵题
                System.out.println("=== 检测到矩阵题 ===");
                System.out.println("问题数据: " + questionData);
                System.out.println("矩阵行数据: " + questionData.get("rows"));
                System.out.println("矩阵列数据: " + questionData.get("columns"));
                System.out.println("矩阵题类型: " + questionData.get("subQuestionType"));
                saveMatrixQuestionConfig(question.getId(), questionData);
            }
        }
    }

    /**
     * 保存选项数据
     */
    private void saveOptions(Integer questionId, Integer questionType, List<Map<String, Object>> options) {
        System.out.println("=== 开始保存选项数据 ===");
        System.out.println("问题ID: " + questionId);
        System.out.println("问题类型: " + questionType);
        System.out.println("选项数量: " + options.size());
        System.out.println("选项数据: " + options);
        
        for (int i = 0; i < options.size(); i++) {
            Map<String, Object> optionData = options.get(i);
            System.out.println("处理第 " + (i + 1) + " 个选项，数据: " + optionData);

            if (questionType == 1) { // 单选题
                SingleChoiceOption option = new SingleChoiceOption();
                // 生成唯一ID
                Integer sid = CodeGenerator.generateFormId();
                while (singleChoiceOptionMapper.exists(new QueryWrapper<SingleChoiceOption>().eq("id", sid))) {
                    sid = CodeGenerator.generateFormId();
                }
                option.setId(sid);
                option.setQuestionId(questionId);
                
                String optionContent = (String) optionData.get("optionContent");
                System.out.println("单选题选项内容: " + optionContent);
                if (optionContent == null || optionContent.trim().isEmpty()) {
                    throw new IllegalArgumentException("单选题选项内容不能为空，选项数据: " + optionData);
                }
                option.setOptionContent(optionContent);
                
                Integer sortNum = (Integer) optionData.get("sortNum");
                System.out.println("单选题选项排序号: " + sortNum);
                option.setSortNum(sortNum != null ? sortNum : i + 1);
                
                Integer isDefault = (Integer) optionData.get("isDefault");
                System.out.println("单选题选项是否默认: " + isDefault);
                option.setIsDefault(isDefault != null ? isDefault : 0);
                
                System.out.println("准备插入单选题选项: " + option);
                singleChoiceOptionMapper.insert(option);
                System.out.println("单选题选项插入成功");
                
            } else if (questionType == 2) { // 多选题
                MultipleChoiceOption option = new MultipleChoiceOption();
                // 生成唯一ID
                Integer mid = CodeGenerator.generateFormId();
                while (multipleChoiceOptionMapper.exists(new QueryWrapper<MultipleChoiceOption>().eq("id", mid))) {
                    mid = CodeGenerator.generateFormId();
                }
                option.setId(mid);
                option.setQuestionId(questionId);
                
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
        System.out.println("=== 选项数据保存完成 ===");
    }

    /**
     * 保存问答题配置
     */
    private void saveTextQuestionConfig(Integer questionId, Map<String, Object> questionData) {
        TextQuestion textQuestion = new TextQuestion();
        textQuestion.setQuestionId(questionId);
        
        // 设置默认值
        textQuestion.setHintText((String) questionData.get("hintText"));
        textQuestion.setMaxLength((Integer) questionData.get("maxLength"));
        if (textQuestion.getMaxLength() == null) {
            textQuestion.setMaxLength(500); // 默认最大长度
        }
        textQuestion.setInputType((Integer) questionData.get("inputType"));
        if (textQuestion.getInputType() == null) {
            textQuestion.setInputType(1); // 默认单行输入
        }
        // 生成唯一ID
        Integer tid = CodeGenerator.generateFormId();
        while (textQuestionMapper.exists(new QueryWrapper<TextQuestion>().eq("id", tid))) {
            tid = CodeGenerator.generateFormId();
        }
        textQuestion.setId(tid);
        textQuestionMapper.insert(textQuestion);
        System.out.println("问答题配置保存成功，问题ID: " + questionId);
    }

    /**
     * 保存评分题配置
     */
    private void saveRatingQuestionConfig(Integer questionId, Map<String, Object> questionData) {
        RatingQuestion ratingQuestion = new RatingQuestion();
        ratingQuestion.setQuestionId(questionId);
        
        // 设置默认值
        ratingQuestion.setMinScore((Integer) questionData.get("minScore"));
        if (ratingQuestion.getMinScore() == null) {
            ratingQuestion.setMinScore(1); // 默认最低分
        }
        ratingQuestion.setMaxScore((Integer) questionData.get("maxScore"));
        if (ratingQuestion.getMaxScore() == null) {
            ratingQuestion.setMaxScore(5); // 默认最高分
        }
        ratingQuestion.setMinLabel((String) questionData.get("minLabel"));
        if (ratingQuestion.getMinLabel() == null) {
            ratingQuestion.setMinLabel("非常不满意");
        }
        ratingQuestion.setMaxLabel((String) questionData.get("maxLabel"));
        if (ratingQuestion.getMaxLabel() == null) {
            ratingQuestion.setMaxLabel("非常满意");
        }
        ratingQuestion.setStep((Integer) questionData.get("step"));
        if (ratingQuestion.getStep() == null) {
            ratingQuestion.setStep(1); // 默认步长
        }
        // 生成唯一ID
        Integer rid = CodeGenerator.generateFormId();
        while (ratingQuestionMapper.exists(new QueryWrapper<RatingQuestion>().eq("id", rid))) {
            rid = CodeGenerator.generateFormId();
        }
        ratingQuestion.setId(rid);
        ratingQuestionMapper.insert(ratingQuestion);
        System.out.println("评分题配置保存成功，问题ID: " + questionId);
    }

    /**
     * 保存矩阵题配置
     */
    private void saveMatrixQuestionConfig(Integer questionId, Map<String, Object> questionData) {
        System.out.println("=== 开始保存矩阵题配置 ===");
        System.out.println("问题ID: " + questionId);
        System.out.println("接收到的数据: " + questionData);
        
        // 创建矩阵题主体
        MatrixQuestion matrixQuestion = new MatrixQuestion();
        matrixQuestion.setQuestionId(questionId);
        matrixQuestion.setSubQuestionType((Integer) questionData.get("subQuestionType"));
        if (matrixQuestion.getSubQuestionType() == null) {
            matrixQuestion.setSubQuestionType(1); // 默认单选矩阵
        }
        matrixQuestion.setDescription((String) questionData.get("description"));
        
        // 生成唯一矩阵题ID
        Integer mid = CodeGenerator.generateFormId();
        while (matrixQuestionMapper.exists(new QueryWrapper<MatrixQuestion>().eq("id", mid))) {
            mid = CodeGenerator.generateFormId();
        }
        matrixQuestion.setId(mid);
        matrixQuestionMapper.insert(matrixQuestion);
        System.out.println("矩阵题主体保存成功，问题ID: " + questionId + ", 矩阵ID: " + matrixQuestion.getId());
        
        // 保存矩阵行
        @SuppressWarnings("unchecked")
        List<String> rows = (List<String>) questionData.get("rows");
        System.out.println("矩阵行数据: " + rows);
        if (rows != null && !rows.isEmpty()) {
            for (int i = 0; i < rows.size(); i++) {
                MatrixRow matrixRow = new MatrixRow();
                matrixRow.setMatrixId(matrixQuestion.getId());
                matrixRow.setRowContent(rows.get(i));
                matrixRow.setSortNum(i + 1);
                // 生成唯一ID
                Integer rowId = CodeGenerator.generateFormId();
                while (matrixRowMapper.exists(new QueryWrapper<MatrixRow>().eq("id", rowId))) {
                    rowId = CodeGenerator.generateFormId();
                }
                matrixRow.setId(rowId);
                matrixRowMapper.insert(matrixRow);
                System.out.println("保存矩阵行: " + rows.get(i) + ", ID: " + rowId);
            }
            System.out.println("矩阵行保存成功，共 " + rows.size() + " 行");
        } else {
            System.out.println("警告：矩阵行数据为空或null");
        }
        
        // 保存矩阵列
        @SuppressWarnings("unchecked")
        List<String> columns = (List<String>) questionData.get("columns");
        System.out.println("矩阵列数据: " + columns);
        if (columns != null && !columns.isEmpty()) {
            for (int i = 0; i < columns.size(); i++) {
                MatrixColumn matrixColumn = new MatrixColumn();
                matrixColumn.setMatrixId(matrixQuestion.getId());
                matrixColumn.setColumnContent(columns.get(i));
                matrixColumn.setSortNum(i + 1);
                matrixColumn.setScore((Integer) questionData.get("score"));
                // 生成唯一ID
                Integer colId = CodeGenerator.generateFormId();
                while (matrixColumnMapper.exists(new QueryWrapper<MatrixColumn>().eq("id", colId))) {
                    colId = CodeGenerator.generateFormId();
                }
                matrixColumn.setId(colId);
                matrixColumnMapper.insert(matrixColumn);
                System.out.println("保存矩阵列: " + columns.get(i) + ", ID: " + colId);
            }
            System.out.println("矩阵列保存成功，共 " + columns.size() + " 列");
        } else {
            System.out.println("警告：矩阵列数据为空或null");
        }
        
        System.out.println("=== 矩阵题配置保存完成 ===");
    }

    @Override
    public Map<String, Object> getQuestionnaireList(Integer page, Integer size, String keyword, Integer status, String dateFilter, Integer creatorId) {
        // 创建分页对象
        Page<QuestionCreate> pageParam = new Page<>(page, size);

        // 构建查询条件
        QueryWrapper<QuestionCreate> queryWrapper = new QueryWrapper<>();

        // 关键词搜索
        if (StringUtils.hasText(keyword)) {
            queryWrapper.and(wrapper -> wrapper
                .like("title", keyword)
                .or()
                .like("description", keyword)
            );
        }

        // 状态筛选
        if (status != null) {
            queryWrapper.eq("status", status);
        }

        // 创建者筛选
        if (creatorId != null) {
            queryWrapper.eq("creator_id", creatorId);
        }

        // 日期筛选
        if (StringUtils.hasText(dateFilter)) {
            LocalDate today = LocalDate.now();
            switch (dateFilter) {
                case "today":
                    queryWrapper.eq("DATE(created_time)", today);
                    break;
                case "week":
                    queryWrapper.ge("created_time", today.minusWeeks(1));
                    break;
                case "month":
                    queryWrapper.ge("created_time", today.minusMonths(1));
                    break;
                case "year":
                    queryWrapper.ge("created_time", today.minusYears(1));
                    break;
            }
        }

        // 按创建时间倒序排列
        queryWrapper.orderByDesc("created_time");

        // 执行分页查询
        IPage<QuestionCreate> result = page(pageParam, queryWrapper);

        // 为每个问卷添加创建者信息
        List<Map<String, Object>> enrichedList = new ArrayList<>();
        for (QuestionCreate questionnaire : result.getRecords()) {
            Map<String, Object> enrichedItem = new HashMap<>();
            enrichedItem.put("id", questionnaire.getId());
            enrichedItem.put("title", questionnaire.getTitle());
            enrichedItem.put("description", questionnaire.getDescription());
            enrichedItem.put("status", questionnaire.getStatus());
            enrichedItem.put("start_date", questionnaire.getStartDate());
            enrichedItem.put("end_date", questionnaire.getEndDate());
            enrichedItem.put("creator_id", questionnaire.getCreatorId());
            enrichedItem.put("created_time", questionnaire.getCreatedTime());
            enrichedItem.put("updated_time", questionnaire.getUpdatedTime());
            enrichedItem.put("submission_limit", questionnaire.getSubmissionLimit());
            enrichedItem.put("questionnaire_type", questionnaire.getQuestionnaireType());
            
            // 获取创建者用户名
            String creatorName = "匿名用户";
            if (questionnaire.getCreatorId() != null) {
                try {
                    Users creator = usersService.getById(questionnaire.getCreatorId());
                    if (creator != null) {
                        creatorName = creator.getUsername();
                    }
                } catch (Exception e) {
                    // 如果获取用户信息失败，使用默认值
                    creatorName = "用户" + questionnaire.getCreatorId();
                }
            }
            enrichedItem.put("creatorName", creatorName);
            
            enrichedList.add(enrichedItem);
        }

        // 构建返回结果 - 使用与前端一致的字段名
        Map<String, Object> response = new HashMap<>();
        response.put("list", enrichedList);
        response.put("current", (int) result.getCurrent());
        response.put("pageSize", (int) result.getSize());
        response.put("total", (int) result.getTotal());
        response.put("pages", (int) result.getPages());

        return response;
    }

    public Map<String, Object> getQuestionnaireListWithPagination(Integer creatorId, Integer page, Integer size, String keyword, Integer status, String dateFilter) {
        // 添加调试日志
//        System.out.println("=== 分页查询开始 ===");
//        System.out.println("接收到的参数：");
//        System.out.println("  creatorId: " + creatorId);
//        System.out.println("  page: " + page);
//        System.out.println("  size: " + size);
//        System.out.println("  keyword: " + keyword);
//        System.out.println("  status: " + status);
//        System.out.println("  dateFilter: " + dateFilter);
        
        Page<QuestionCreate> pageParam = new Page<>(page, size);
//        System.out.println("创建的分页对象：");
//        System.out.println("  pageParam.current: " + pageParam.getCurrent());
//        System.out.println("  pageParam.size: " + pageParam.getSize());
        
        QueryWrapper<QuestionCreate> queryWrapper = new QueryWrapper<>();
        if (creatorId != null) {
            queryWrapper.eq("creator_id", creatorId);
        }
        if (keyword != null && !keyword.isEmpty()) {
            queryWrapper.and(wrapper -> wrapper.like("title", keyword).or().like("description", keyword));
        }
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        if (dateFilter != null && !dateFilter.isEmpty()) {
            LocalDate today = LocalDate.now();
            switch (dateFilter) {
                case "today":
                    queryWrapper.eq("DATE(created_time)", today);
                    break;
                case "week":
                    queryWrapper.ge("created_time", today.minusWeeks(1));
                    break;
                case "month":
                    queryWrapper.ge("created_time", today.minusMonths(1));
                    break;
                case "year":
                    queryWrapper.ge("created_time", today.minusYears(1));
                    break;
            }
        }
        queryWrapper.orderByDesc("created_time");
//
//        System.out.println("执行分页查询...");
        IPage<QuestionCreate> result = page(pageParam, queryWrapper);
//
//        System.out.println("分页查询结果：");
//        System.out.println("  result.getRecords().size(): " + result.getRecords().size());
//        System.out.println("  result.getCurrent(): " + result.getCurrent());
//        System.out.println("  result.getSize(): " + result.getSize());
//        System.out.println("  result.getTotal(): " + result.getTotal());
//        System.out.println("  result.getPages(): " + result.getPages());
        
        Map<String, Object> response = new HashMap<>();
        response.put("list", result.getRecords());
        response.put("currentPage", (int) result.getCurrent());
        response.put("pageSize", (int) result.getSize());
        response.put("totalCount", (int) result.getTotal());
        response.put("totalPages", (int) result.getPages());
        
//        System.out.println("返回的响应：");
//        System.out.println("  list.size(): " + ((List<?>) response.get("list")).size());
//        System.out.println("  currentPage: " + response.get("currentPage"));
//        System.out.println("  pageSize: " + response.get("pageSize"));
//        System.out.println("  totalCount: " + response.get("totalCount"));
//        System.out.println("  totalPages: " + response.get("totalPages"));
//        System.out.println("=== 分页查询结束 ===");
        
        return response;
    }

    @Override
    public QuestionCreate getQuestionnaireDetail(Integer id) {
        try {
            QuestionCreate questionnaire = getById(id);
            if (questionnaire == null) {
                throw new RuntimeException("问卷不存在");
            }
            return questionnaire;
        } catch (Exception e) {
            throw new RuntimeException("获取问卷详情失败: " + e.getMessage());
        }
    }

    /**
     * 获取问卷详情（包含创建者信息和问题列表）
     */
    public Map<String, Object> getQuestionnaireDetailWithCreator(Integer id) {
        try {
            QuestionCreate questionnaire = getById(id);
            if (questionnaire == null) {
                throw new RuntimeException("问卷不存在");
            }

            // 获取问题列表
            List<QuestionDto> questions = getQuestionnaireQuestions(id);

            // 获取创建者信息
            String creatorName = "未知用户";
            if (questionnaire.getCreatorId() != null) {
                // 这里可以通过用户服务获取创建者姓名
                // 暂时使用默认值
                creatorName = "用户" + questionnaire.getCreatorId();
            }

            Map<String, Object> result = new HashMap<>();
            result.put("questionnaire", questionnaire);
            result.put("questions", questions);
            result.put("creatorName", creatorName);

            return result;
        } catch (Exception e) {
            throw new RuntimeException("获取问卷详情失败: " + e.getMessage());
        }
    }

    @Override
    public List<QuestionDto> getQuestionnaireQuestions(Integer questionnaireId) {
        try {
            System.out.println("查询问卷问题，问卷ID: " + questionnaireId);

            // 查询问题列表
            QueryWrapper<Question> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("questionnaire_id", questionnaireId);
            queryWrapper.orderByAsc("sort_num");

            List<Question> questions = questionMapper.selectList(queryWrapper);
            System.out.println("查询到问题数量: " + questions.size());

            List<QuestionDto> questionDtos = new ArrayList<>();

            for (Question question : questions) {
                System.out.println("处理问题: " + question);

                QuestionDto questionDto = new QuestionDto();
                questionDto.setId(question.getId());
                questionDto.setQuestionnaireId(question.getQuestionnaireId());
                questionDto.setContent(question.getContent());
                questionDto.setQuestionType(question.getQuestionType());
                questionDto.setSortNum(question.getSortNum());
                questionDto.setIsRequired(question.getIsRequired());
                questionDto.setCreatedTime(question.getCreatedTime());
                questionDto.setUpdatedTime(question.getUpdatedTime());

                // 如果是选择题，查询选项
                if (question.getQuestionType() == 1 || question.getQuestionType() == 2) {
                    List<QuestionOptionDto> options = new ArrayList<>();

                    if (question.getQuestionType() == 1) {
                        // 单选题选项
                        QueryWrapper<SingleChoiceOption> optionWrapper = new QueryWrapper<>();
                        optionWrapper.eq("question_id", question.getId());
                        optionWrapper.orderByAsc("sort_num");

                        List<SingleChoiceOption> singleOptions = singleChoiceOptionMapper.selectList(optionWrapper);
                        for (SingleChoiceOption option : singleOptions) {
                            QuestionOptionDto optionDto = new QuestionOptionDto();
                            optionDto.setId(option.getId());
                            optionDto.setQuestionId(option.getQuestionId());
                            optionDto.setOptionContent(option.getOptionContent());
                            optionDto.setSortNum(option.getSortNum());
                            optionDto.setIsDefault(option.getIsDefault());
                            options.add(optionDto);
                        }
                    } else if (question.getQuestionType() == 2) {
                        // 多选题选项
                        QueryWrapper<MultipleChoiceOption> optionWrapper = new QueryWrapper<>();
                        optionWrapper.eq("question_id", question.getId());
                        optionWrapper.orderByAsc("sort_num");

                        List<MultipleChoiceOption> multipleOptions = multipleChoiceOptionMapper.selectList(optionWrapper);
                        for (MultipleChoiceOption option : multipleOptions) {
                            QuestionOptionDto optionDto = new QuestionOptionDto();
                            optionDto.setId(option.getId());
                            optionDto.setQuestionId(option.getQuestionId());
                            optionDto.setOptionContent(option.getOptionContent());
                            optionDto.setSortNum(option.getSortNum());
                            options.add(optionDto);
                        }
                    }

                    questionDto.setOptions(options);
                }
                
                // 如果是问答题，查询问答题配置
                if (question.getQuestionType() == 3) {
                    QueryWrapper<TextQuestion> textWrapper = new QueryWrapper<>();
                    textWrapper.eq("question_id", question.getId());
                    TextQuestion textQuestion = textQuestionMapper.selectOne(textWrapper);
                    QuestionnairePreviewDto.TextQuestionInfo config = new QuestionnairePreviewDto.TextQuestionInfo();
                    BeanUtils.copyProperties(textQuestion, config);
                    if (textQuestion != null) {
                        questionDto.setTextQuestionConfig(config);
                    }
                }
                
                // 如果是评分题，查询评分题配置
                if (question.getQuestionType() == 4) {
                    QueryWrapper<RatingQuestion> ratingWrapper = new QueryWrapper<>();
                    ratingWrapper.eq("question_id", question.getId());
                    RatingQuestion ratingQuestion = ratingQuestionMapper.selectOne(ratingWrapper);
                    QuestionnairePreviewDto.RatingQuestionInfo config = new QuestionnairePreviewDto.RatingQuestionInfo();
                    BeanUtils.copyProperties(ratingQuestion, config);
                    if (ratingQuestion != null) {
                        questionDto.setRatingQuestionConfig(config);
                    }
                }
                
                // 如果是矩阵题，查询矩阵题配置
                if (question.getQuestionType() == 5) {
                    // 先查询矩阵题主体
                    QueryWrapper<MatrixQuestion> matrixWrapper = new QueryWrapper<>();
                    matrixWrapper.eq("question_id", question.getId());
                    MatrixQuestion matrixQuestion = matrixQuestionMapper.selectOne(matrixWrapper);
                    
                    if (matrixQuestion != null) {
                        // 查询矩阵行数据
                        QueryWrapper<MatrixRow> rowWrapper = new QueryWrapper<>();
                        rowWrapper.eq("matrix_id", matrixQuestion.getId());
                        rowWrapper.orderByAsc("sort_num");
                        List<MatrixRow> rows = matrixRowMapper.selectList(rowWrapper);
                        
                        // 查询矩阵列数据
                        QueryWrapper<MatrixColumn> columnWrapper = new QueryWrapper<>();
                        columnWrapper.eq("matrix_id", matrixQuestion.getId());
                        columnWrapper.orderByAsc("sort_num");
                        List<MatrixColumn> columns = matrixColumnMapper.selectList(columnWrapper);
                    
                        // 创建矩阵题配置信息
                        QuestionnairePreviewDto.MatrixQuestionInfo matrixQuestionInfo = new QuestionnairePreviewDto.MatrixQuestionInfo();
                        
                        // 设置行数据
                        List<QuestionnairePreviewDto.MatrixRowInfo> rowInfos = new ArrayList<>();
                        for (MatrixRow row : rows) {
                            QuestionnairePreviewDto.MatrixRowInfo rowInfo = new QuestionnairePreviewDto.MatrixRowInfo();
                            rowInfo.setId(row.getId());
                            rowInfo.setRowContent(row.getRowContent());
                            rowInfo.setSortNum(row.getSortNum());
                            rowInfos.add(rowInfo);
                        }
                        matrixQuestionInfo.setRows(rowInfos);
                        
                        // 设置列数据
                        List<QuestionnairePreviewDto.MatrixColumnInfo> columnInfos = new ArrayList<>();
                        for (MatrixColumn column : columns) {
                            QuestionnairePreviewDto.MatrixColumnInfo columnInfo = new QuestionnairePreviewDto.MatrixColumnInfo();
                            columnInfo.setId(column.getId());
                            columnInfo.setColumnContent(column.getColumnContent());
                            columnInfo.setSortNum(column.getSortNum());
                            columnInfos.add(columnInfo);
                        }
                        matrixQuestionInfo.setColumns(columnInfos);
                        
                        questionDto.setMatrixQuestionConfig(matrixQuestionInfo);
                    }
                }

                questionDtos.add(questionDto);
            }

            System.out.println("返回问题DTO数量: " + questionDtos.size());
            return questionDtos;
        } catch (Exception e) {
            throw new RuntimeException("获取问卷问题失败: " + e.getMessage());
        }
    }

    @Override
    public QuestionCreate updateQuestionnaire(Map<String, Object> request) {
        return updateQuestionnaireWithQuestions(request);
    }

    /**
     * 更新问卷（包含问题数据）
     */
    public QuestionCreate updateQuestionnaireWithQuestions(Map<String, Object> request) {
        try {
            System.out.println("收到更新问卷请求数据: " + request);

            Integer id = (Integer) request.get("id");
            if (id == null) {
                throw new RuntimeException("问卷ID不能为空");
            }

            // 获取现有问卷
            QuestionCreate existingQuestionnaire = getById(id);
            if (existingQuestionnaire == null) {
                throw new RuntimeException("问卷不存在");
            }

            // 更新基本信息
            if (request.containsKey("title")) {
                existingQuestionnaire.setTitle((String) request.get("title"));
            }
            if (request.containsKey("description")) {
                existingQuestionnaire.setDescription((String) request.get("description"));
            }
            if (request.containsKey("startDate")) {
                String startDateStr = (String) request.get("startDate");
                if (startDateStr != null && !startDateStr.isEmpty()) {
                    existingQuestionnaire.setStartDate(LocalDate.parse(startDateStr));
                }
            }
            if (request.containsKey("endDate")) {
                String endDateStr = (String) request.get("endDate");
                if (endDateStr != null && !endDateStr.isEmpty()) {
                    existingQuestionnaire.setEndDate(LocalDate.parse(endDateStr));
                }
            }
            if (request.containsKey("submissionLimit")) {
                existingQuestionnaire.setSubmissionLimit((Integer) request.get("submissionLimit"));
            }
            if (request.containsKey("status")) {
                existingQuestionnaire.setStatus((Integer) request.get("status"));
            }
            if (request.containsKey("questionnaire_type")) {
                Object questionnaireTypeObj = request.get("questionnaire_type");
                if (questionnaireTypeObj != null) {
                    Integer questionnaireType;
                    if (questionnaireTypeObj instanceof Integer) {
                        questionnaireType = (Integer) questionnaireTypeObj;
                    } else if (questionnaireTypeObj instanceof String) {
                        questionnaireType = Integer.parseInt((String) questionnaireTypeObj);
                    } else {
                        questionnaireType = (Integer) questionnaireTypeObj;
                    }
                    existingQuestionnaire.setQuestionnaireType(questionnaireType);
                    System.out.println("更新问卷类型: " + questionnaireType);
                }
            }

            // 设置更新时间
            existingQuestionnaire.setUpdatedTime(LocalDateTime.now());

            // 保存更新
            boolean updateResult = updateById(existingQuestionnaire);
            if (!updateResult) {
                throw new RuntimeException("更新问卷失败");
            }

            // 处理问题数据更新
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> questions = (List<Map<String, Object>>) request.get("questions");
            System.out.println("收到更新问题数据: " + questions);
            if (questions != null && !questions.isEmpty()) {
                updateQuestions(id, questions);
            }

            return existingQuestionnaire;
        } catch (Exception e) {
            throw new RuntimeException("更新问卷失败: " + e.getMessage());
        }
    }

    /**
     * 更新问题数据
     */
    private void updateQuestions(Integer questionnaireId, List<Map<String, Object>> questions) {
        // 先删除现有问题
        questionMapper.delete(new QueryWrapper<Question>().eq("questionnaire_id", questionnaireId));

        // 重新创建问题
        saveQuestions(questionnaireId, questions);
    }

    @Override
    public Boolean deleteQuestionnaire(Integer id) {
        return removeById(id);
    }

    @Override
    public Boolean batchDeleteQuestionnaire(List<Integer> ids) {
        return removeByIds(ids);
    }

    @Override
    public Boolean toggleQuestionnaireStatus(Integer id, Integer status) {
        QuestionCreate questionnaire = getById(id);
        if (questionnaire == null) {
            return false;
        }

        questionnaire.setStatus(status);
        questionnaire.setUpdatedTime(LocalDateTime.now());
        return updateById(questionnaire);
    }

    @Override
    public Boolean batchToggleQuestionnaireStatus(List<Integer> ids, Integer status) {
        List<QuestionCreate> questionnaires = listByIds(ids);
        for (QuestionCreate questionnaire : questionnaires) {
            questionnaire.setStatus(status);
            questionnaire.setUpdatedTime(LocalDateTime.now());
        }
        return updateBatchById(questionnaires);
    }

    @Override
    public QuestionCreate copyQuestionnaire(Integer id) {
        QuestionCreate original = getById(id);
        if (original == null) {
            return null;
        }

        // 创建副本
        QuestionCreate copy = new QuestionCreate();
        copy.setTitle(original.getTitle() + " (副本)");
        copy.setDescription(original.getDescription());
        copy.setStartDate(original.getStartDate());
        copy.setEndDate(original.getEndDate());
        copy.setSubmissionLimit(original.getSubmissionLimit());
        copy.setStatus(0); // 副本默认为禁用状态
        copy.setCreatorId(original.getCreatorId());
        copy.setCreatedTime(LocalDateTime.now());
        copy.setUpdatedTime(LocalDateTime.now());

        // 保存副本
        if (save(copy)) {
            return copy;
        }
        return null;
    }

    @Override
    public QuestionCreate importQuestionnaire(Map<String, Object> questionnaireData) {
        try {
            QuestionCreate questionnaire = new QuestionCreate();

            // 从导入数据中提取信息
            questionnaire.setTitle((String) questionnaireData.get("title"));
            questionnaire.setDescription((String) questionnaireData.get("description"));

            // 处理日期
            if (questionnaireData.get("startDate") != null) {
                String startDateStr = questionnaireData.get("startDate").toString();
                questionnaire.setStartDate(LocalDate.parse(startDateStr));
            }

            if (questionnaireData.get("endDate") != null) {
                String endDateStr = questionnaireData.get("endDate").toString();
                questionnaire.setEndDate(LocalDate.parse(endDateStr));
            }

            // 设置其他字段
            questionnaire.setSubmissionLimit((Integer) questionnaireData.get("submissionLimit"));
            questionnaire.setStatus(0); // 导入的问卷默认为禁用状态
            questionnaire.setCreatorId((Integer) questionnaireData.get("creatorId"));
            questionnaire.setCreatedTime(LocalDateTime.now());
            questionnaire.setUpdatedTime(LocalDateTime.now());

            // 保存问卷
            if (save(questionnaire)) {
                return questionnaire;
            }
            return null;
        } catch (Exception e) {
            throw new RuntimeException("导入问卷失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getQuestionnaireStatistics(Integer creatorId) {
        QueryWrapper<QuestionCreate> queryWrapper = new QueryWrapper<>();
        if (creatorId != null) {
            queryWrapper.eq("creator_id", creatorId);
        }

        // 统计总数
        long total = count(queryWrapper);

        // 统计已发布状态 (status = 1)
        QueryWrapper<QuestionCreate> publishedWrapper = new QueryWrapper<>();
        publishedWrapper.eq("status", 1);
        if (creatorId != null) {
            publishedWrapper.eq("creator_id", creatorId);
        }
        long published = count(publishedWrapper);

        // 统计草稿状态 (status = 2)
        QueryWrapper<QuestionCreate> draftWrapper = new QueryWrapper<>();
        draftWrapper.eq("status", 2);
        if (creatorId != null) {
            draftWrapper.eq("creator_id", creatorId);
        }
        long draft = count(draftWrapper);

        // 统计禁用状态 (status = 0)
        QueryWrapper<QuestionCreate> disabledWrapper = new QueryWrapper<>();
        disabledWrapper.eq("status", 0);
        if (creatorId != null) {
            disabledWrapper.eq("creator_id", creatorId);
        }
        long disabled = count(disabledWrapper);

        // 统计过期问卷
        QueryWrapper<QuestionCreate> expiredWrapper = new QueryWrapper<>();
        expiredWrapper.lt("end_date", LocalDate.now());
        if (creatorId != null) {
            expiredWrapper.eq("creator_id", creatorId);
        }
        long expired = count(expiredWrapper);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("total", total);
        statistics.put("published", published);  // 已发布
        statistics.put("draft", draft);         // 草稿
        statistics.put("disabled", disabled);   // 已禁用
        statistics.put("expired", expired);     // 已过期

        return statistics;
    }
}
