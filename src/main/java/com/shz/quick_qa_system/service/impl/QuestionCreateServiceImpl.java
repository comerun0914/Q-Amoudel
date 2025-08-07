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
            e.printStackTrace();
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
                saveMatrixQuestionConfig(question.getId(), questionData);
            }
        }
    }

    /**
     * 保存选项数据
     */
    private void saveOptions(Integer questionId, Integer questionType, List<Map<String, Object>> options) {
        for (int i = 0; i < options.size(); i++) {
            Map<String, Object> optionData = options.get(i);

            if (questionType == 1) { // 单选题
                SingleChoiceOption option = new SingleChoiceOption();
                option.setQuestionId(questionId);
                option.setOptionContent((String) optionData.get("optionContent"));
                option.setSortNum((Integer) optionData.get("sortNum"));
                option.setIsDefault((Integer) optionData.get("isDefault"));
                singleChoiceOptionMapper.insert(option);
            } else if (questionType == 2) { // 多选题
                MultipleChoiceOption option = new MultipleChoiceOption();
                option.setQuestionId(questionId);
                option.setOptionContent((String) optionData.get("optionContent"));
                option.setSortNum((Integer) optionData.get("sortNum"));
                // MultipleChoiceOption doesn't have isDefault field, so we skip it
                multipleChoiceOptionMapper.insert(option);
            }
        }
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
        
        ratingQuestionMapper.insert(ratingQuestion);
        System.out.println("评分题配置保存成功，问题ID: " + questionId);
    }

    /**
     * 保存矩阵题配置
     */
    private void saveMatrixQuestionConfig(Integer questionId, Map<String, Object> questionData) {
        // 创建矩阵题主体
        MatrixQuestion matrixQuestion = new MatrixQuestion();
        matrixQuestion.setQuestionId(questionId);
        matrixQuestion.setSubQuestionType((Integer) questionData.get("subQuestionType"));
        if (matrixQuestion.getSubQuestionType() == null) {
            matrixQuestion.setSubQuestionType(1); // 默认单选矩阵
        }
        matrixQuestion.setDescription((String) questionData.get("description"));
        
        matrixQuestionMapper.insert(matrixQuestion);
        System.out.println("矩阵题主体保存成功，问题ID: " + questionId + ", 矩阵ID: " + matrixQuestion.getId());
        
        // 保存矩阵行
        @SuppressWarnings("unchecked")
        List<String> rows = (List<String>) questionData.get("rows");
        if (rows != null && !rows.isEmpty()) {
            for (int i = 0; i < rows.size(); i++) {
                MatrixRow matrixRow = new MatrixRow();
                matrixRow.setMatrixId(matrixQuestion.getId());
                matrixRow.setRowContent(rows.get(i));
                matrixRow.setSortNum(i + 1);
                matrixRowMapper.insert(matrixRow);
            }
            System.out.println("矩阵行保存成功，共 " + rows.size() + " 行");
        }
        
        // 保存矩阵列
        @SuppressWarnings("unchecked")
        List<String> columns = (List<String>) questionData.get("columns");
        if (columns != null && !columns.isEmpty()) {
            for (int i = 0; i < columns.size(); i++) {
                MatrixColumn matrixColumn = new MatrixColumn();
                matrixColumn.setMatrixId(matrixQuestion.getId());
                matrixColumn.setColumnContent(columns.get(i));
                matrixColumn.setSortNum(i + 1);
                matrixColumn.setScore((Integer) questionData.get("score"));
                matrixColumnMapper.insert(matrixColumn);
            }
            System.out.println("矩阵列保存成功，共 " + columns.size() + " 列");
        }
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

        // 构建返回结果
        Map<String, Object> response = new HashMap<>();
        response.put("list", result.getRecords());
        response.put("total", result.getTotal());
        response.put("pages", result.getPages());
        response.put("current", result.getCurrent());
        response.put("size", result.getSize());

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
            e.printStackTrace();
            throw new RuntimeException("获取问卷详情失败: " + e.getMessage());
        }
    }

    /**
     * 获取问卷详情（包含创建者信息）
     */
    public Map<String, Object> getQuestionnaireDetailWithCreator(Integer id) {
        try {
            QuestionCreate questionnaire = getById(id);
            if (questionnaire == null) {
                throw new RuntimeException("问卷不存在");
            }

            // 获取创建者信息
            String creatorName = "未知用户";
            if (questionnaire.getCreatorId() != null) {
                // 这里可以通过用户服务获取创建者姓名
                // 暂时使用默认值
                creatorName = "用户" + questionnaire.getCreatorId();
            }

            Map<String, Object> result = new HashMap<>();
            result.put("data", questionnaire);
            result.put("userInfo", creatorName);

            return result;
        } catch (Exception e) {
            e.printStackTrace();
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

                questionDtos.add(questionDto);
            }

            System.out.println("返回问题DTO数量: " + questionDtos.size());
            return questionDtos;
        } catch (Exception e) {
            e.printStackTrace();
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
            e.printStackTrace();
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

        // 统计启用状态
        QueryWrapper<QuestionCreate> activeWrapper = new QueryWrapper<>();
        activeWrapper.eq("status", true);
        if (creatorId != null) {
            activeWrapper.eq("creator_id", creatorId);
        }
        long active = count(activeWrapper);

        // 统计禁用状态
        QueryWrapper<QuestionCreate> inactiveWrapper = new QueryWrapper<>();
        inactiveWrapper.eq("status", false);
        if (creatorId != null) {
            inactiveWrapper.eq("creator_id", creatorId);
        }
        long inactive = count(inactiveWrapper);

        // 统计过期问卷
        QueryWrapper<QuestionCreate> expiredWrapper = new QueryWrapper<>();
        expiredWrapper.lt("end_date", LocalDate.now());
        if (creatorId != null) {
            expiredWrapper.eq("creator_id", creatorId);
        }
        long expired = count(expiredWrapper);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("total", total);
        statistics.put("active", active);
        statistics.put("inactive", inactive);
        statistics.put("expired", expired);

        return statistics;
    }
}
