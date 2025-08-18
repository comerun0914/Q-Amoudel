package com.shz.quick_qa_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shz.quick_qa_system.dao.QuestionMapper;
import com.shz.quick_qa_system.dao.SingleChoiceOptionMapper;
import com.shz.quick_qa_system.dao.MultipleChoiceOptionMapper;
import com.shz.quick_qa_system.dao.TextQuestionMapper;
import com.shz.quick_qa_system.dao.RatingQuestionMapper;
import com.shz.quick_qa_system.dao.MatrixQuestionMapper;
import com.shz.quick_qa_system.dao.MatrixRowMapper;
import com.shz.quick_qa_system.dao.MatrixColumnMapper;
import com.shz.quick_qa_system.dao.QuestionCreateMapper;
import com.shz.quick_qa_system.dto.QuestionDto;
import com.shz.quick_qa_system.dto.QuestionOptionDto;
import com.shz.quick_qa_system.dto.QuestionOrderUpdateDto;
import com.shz.quick_qa_system.dto.QuestionnairePreviewDto;
import com.shz.quick_qa_system.entity.Question;
import com.shz.quick_qa_system.entity.SingleChoiceOption;
import com.shz.quick_qa_system.entity.MultipleChoiceOption;
import com.shz.quick_qa_system.entity.TextQuestion;
import com.shz.quick_qa_system.entity.RatingQuestion;
import com.shz.quick_qa_system.entity.MatrixQuestion;
import com.shz.quick_qa_system.entity.MatrixRow;
import com.shz.quick_qa_system.entity.MatrixColumn;
import com.shz.quick_qa_system.entity.QuestionCreate;
import com.shz.quick_qa_system.service.QuestionService;
import com.shz.quick_qa_system.utils.CodeGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

/**
 * <p>
 * 问题服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-08-03
 */
@Service
public class QuestionServiceImpl extends ServiceImpl<QuestionMapper, Question> implements QuestionService {

    private static final Logger logger = LoggerFactory.getLogger(QuestionServiceImpl.class);

    @Resource
    private SingleChoiceOptionMapper singleChoiceOptionMapper;

    @Resource
    private QuestionMapper questionMapper;
    
    @Resource
    private MultipleChoiceOptionMapper multipleChoiceOptionMapper;
    
    @Resource
    private TextQuestionMapper textQuestionMapper;
    
    @Resource
    private RatingQuestionMapper ratingQuestionMapper;
    
    @Resource
    private MatrixQuestionMapper matrixQuestionMapper;
    
    @Resource
    private MatrixRowMapper matrixRowMapper;
    
    @Resource
    private MatrixColumnMapper matrixColumnMapper;

    @Resource
    private QuestionCreateMapper questionCreateMapper;

    @Override
    public List<QuestionDto> getQuestionsByQuestionnaireId(Integer questionnaireId) {
        // 查询问题列表
        QueryWrapper<Question> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("questionnaire_id", questionnaireId);
        queryWrapper.orderByAsc("sort_num");
        List<Question> questions = list(queryWrapper);

        // 转换为DTO
        return questions.stream().map(question -> {
            QuestionDto questionDto = new QuestionDto();
            BeanUtils.copyProperties(question, questionDto);

            // 如果是单选题，获取选项
            if (question.getQuestionType() == 1) {
                QueryWrapper<SingleChoiceOption> optionWrapper = new QueryWrapper<>();
                optionWrapper.eq("question_id", question.getId());
                optionWrapper.orderByAsc("sort_num");
                List<SingleChoiceOption> options = singleChoiceOptionMapper.selectList(optionWrapper);

                List<QuestionOptionDto> optionDtos = options.stream().map(option -> {
                    QuestionOptionDto optionDto = new QuestionOptionDto();
                    BeanUtils.copyProperties(option, optionDto);
                    return optionDto;
                }).collect(Collectors.toList());

                questionDto.setOptions(optionDtos);
            }

            return questionDto;
        }).collect(Collectors.toList());
    }

    @Override
    public Integer saveQuestion(QuestionDto questionDto) {
        try {
            // 生成唯一ID
            int id = CodeGenerator.generateFormId();
            while(questionMapper.exists(new QueryWrapper<Question>().eq("id",id))) {
                id = CodeGenerator.generateFormId();
            }
            
            // 设置ID和时间
            questionDto.setId(id);
            
            // 转换为实体
            Question question = new Question();
            BeanUtils.copyProperties(questionDto, question);
            
            // 设置创建和更新时间
            question.setCreatedTime(LocalDateTime.now());
            question.setUpdatedTime(LocalDateTime.now());
            
            // 保存到数据库
            int insertResult = questionMapper.insert(question);
            
            if (insertResult > 0) {
                return id; // 返回生成的ID
            } else {
                return 0; // 保存失败
            }
        } catch (Exception e) {
            e.printStackTrace();
            return 0; // 异常时返回0
        }
    }

    @Override
    public Integer updateQuestion(QuestionDto questionDto) {
        try {
            if (questionDto.getId() == null) {
                return 0;
            }
            
            Question question = new Question();
            BeanUtils.copyProperties(questionDto, question);
            
            // 设置更新时间
            question.setUpdatedTime(LocalDateTime.now());
            
            // 更新数据库
            int updateResult = questionMapper.updateById(question);
            
            return updateResult > 0 ? 1 : 0;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public Integer deleteQuestion(Integer id) {
        try {
            if (id == null) {
                return 0;
            }
            
            // 删除数据库记录
            int deleteResult = questionMapper.deleteById(id);
            
            return deleteResult > 0 ? 1 : 0;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public boolean updateQuestionOrder(QuestionOrderUpdateDto request) {
        if (request == null || request.getQuestionOrder() == null || request.getQuestionOrder().isEmpty()) {
            return false;
        }
        for (QuestionOrderUpdateDto.OrderItem item : request.getQuestionOrder()) {
            if (item.getId() == null) continue;
            Question q = new Question();
            q.setId(item.getId());
            q.setSortNum(item.getSortNum());
            questionMapper.updateById(q);
        }
        return true;
    }
    
    @Override
    public QuestionnairePreviewDto getQuestionnairePreview(Integer questionnaireId) {
        try {
            QuestionnairePreviewDto previewDto = new QuestionnairePreviewDto();
            
            // 获取问卷基本信息
            QuestionCreate questionnaire = questionCreateMapper.selectById(questionnaireId);
            if (questionnaire == null) {
                return null;
            }
            
            QuestionnairePreviewDto.QuestionnaireInfo questionnaireInfo = new QuestionnairePreviewDto.QuestionnaireInfo();
            BeanUtils.copyProperties(questionnaire, questionnaireInfo);
            
            // 格式化日期
            if (questionnaire.getStartDate() != null) {
                questionnaireInfo.setStartDate(questionnaire.getStartDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
            }
            if (questionnaire.getEndDate() != null) {
                questionnaireInfo.setEndDate(questionnaire.getEndDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
            }
            if (questionnaire.getCreatedTime() != null) {
                questionnaireInfo.setCreateDate(questionnaire.getCreatedTime().format(DateTimeFormatter.ISO_LOCAL_DATE));
            }

            
            previewDto.setQuestionnaireInfo(questionnaireInfo);
            
            // 获取问题列表
            QueryWrapper<Question> questionWrapper = new QueryWrapper<>();
            questionWrapper.eq("questionnaire_id", questionnaireId);
            questionWrapper.orderByAsc("sort_num");
            List<Question> questions = list(questionWrapper);
            
            List<QuestionnairePreviewDto.QuestionPreviewInfo> questionInfos = new ArrayList<>();
            
            for (Question question : questions) {
                QuestionnairePreviewDto.QuestionPreviewInfo questionInfo = new QuestionnairePreviewDto.QuestionPreviewInfo();
                BeanUtils.copyProperties(question, questionInfo);
                
                // 根据问题类型获取具体配置
                switch (question.getQuestionType()) {
                    case 1: // 单选题
                        questionInfo.setSingleChoiceOptions(getSingleChoiceOptions(question.getId()));
                        break;
                    case 2: // 多选题
                        questionInfo.setMultipleChoiceOptions(getMultipleChoiceOptions(question.getId()));
                        break;
                    case 3: // 文本题
                        questionInfo.setTextQuestion(getTextQuestionConfig(question.getId()));
                        break;
                    case 4: // 评分题
                        questionInfo.setRatingQuestion(getRatingQuestionConfig(question.getId()));
                        break;
                    case 5: // 矩阵题
                        questionInfo.setMatrixQuestion(getMatrixQuestionConfig(question.getId()));
                        break;
                }
                
                questionInfos.add(questionInfo);
            }
            
            previewDto.setQuestions(questionInfos);
            return previewDto;
            
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * 获取单选题选项
     */
    private List<QuestionnairePreviewDto.SingleChoiceOptionInfo> getSingleChoiceOptions(Integer questionId) {
        QueryWrapper<SingleChoiceOption> wrapper = new QueryWrapper<>();
        wrapper.eq("question_id", questionId);
        wrapper.orderByAsc("sort_num");
        List<SingleChoiceOption> options = singleChoiceOptionMapper.selectList(wrapper);
        
        return options.stream().map(option -> {
            QuestionnairePreviewDto.SingleChoiceOptionInfo optionInfo = new QuestionnairePreviewDto.SingleChoiceOptionInfo();
            BeanUtils.copyProperties(option, optionInfo);
            return optionInfo;
        }).collect(Collectors.toList());
    }
    
    /**
     * 获取多选题选项
     */
    private List<QuestionnairePreviewDto.MultipleChoiceOptionInfo> getMultipleChoiceOptions(Integer questionId) {
        QueryWrapper<MultipleChoiceOption> wrapper = new QueryWrapper<>();
        wrapper.eq("question_id", questionId);
        wrapper.orderByAsc("sort_num");
        List<MultipleChoiceOption> options = multipleChoiceOptionMapper.selectList(wrapper);
        
        return options.stream().map(option -> {
            QuestionnairePreviewDto.MultipleChoiceOptionInfo optionInfo = new QuestionnairePreviewDto.MultipleChoiceOptionInfo();
            BeanUtils.copyProperties(option, optionInfo);
            return optionInfo;
        }).collect(Collectors.toList());
    }
    
    /**
     * 获取文本题配置
     */
    private QuestionnairePreviewDto.TextQuestionInfo getTextQuestionConfig(Integer questionId) {
        try {
            QueryWrapper<TextQuestion> wrapper = new QueryWrapper<>();
            wrapper.eq("question_id", questionId);
            List<TextQuestion> textQuestions = textQuestionMapper.selectList(wrapper);
            
            if (textQuestions != null && !textQuestions.isEmpty()) {
                // 如果有多条记录，取第一条（或者根据业务逻辑选择）
                TextQuestion textQuestion = textQuestions.get(0);
                if (textQuestions.size() > 1) {
                    logger.warn("问题ID {} 存在多条文本题配置记录，使用第一条", questionId);
                }
                
                QuestionnairePreviewDto.TextQuestionInfo config = new QuestionnairePreviewDto.TextQuestionInfo();
                BeanUtils.copyProperties(textQuestion, config);
                return config;
            }
            return null;
        } catch (Exception e) {
            logger.error("获取文本题配置时发生异常，问题ID: {}", questionId, e);
            return null;
        }
    }
    
    /**
     * 获取评分题配置
     */
    private QuestionnairePreviewDto.RatingQuestionInfo getRatingQuestionConfig(Integer questionId) {
        try {
            QueryWrapper<RatingQuestion> wrapper = new QueryWrapper<>();
            wrapper.eq("question_id", questionId);
            List<RatingQuestion> ratingQuestions = ratingQuestionMapper.selectList(wrapper);
            
            if (ratingQuestions != null && !ratingQuestions.isEmpty()) {
                // 如果有多条记录，取第一条（或者根据业务逻辑选择）
                RatingQuestion ratingQuestion = ratingQuestions.get(0);
                if (ratingQuestions.size() > 1) {
                    logger.warn("问题ID {} 存在多条评分题配置记录，使用第一条", questionId);
                }
                
                QuestionnairePreviewDto.RatingQuestionInfo config = new QuestionnairePreviewDto.RatingQuestionInfo();
                BeanUtils.copyProperties(ratingQuestion, config);
                
                // 获取评分标签
                // 这里需要根据实际的评分标签存储方式来实现
                config.setRatingLabels(new ArrayList<>());
                
                return config;
            }
            return null;
        } catch (Exception e) {
            logger.error("获取评分题配置时发生异常，问题ID: {}", questionId, e);
            return null;
        }
    }
    
    /**
     * 获取矩阵题配置
     */
    private QuestionnairePreviewDto.MatrixQuestionInfo getMatrixQuestionConfig(Integer questionId) {
        try {
            QueryWrapper<MatrixQuestion> wrapper = new QueryWrapper<>();
            wrapper.eq("question_id", questionId);
            List<MatrixQuestion> matrixQuestions = matrixQuestionMapper.selectList(wrapper);
            
            if (matrixQuestions != null && !matrixQuestions.isEmpty()) {
                // 如果有多条记录，取第一条（或者根据业务逻辑选择）
                MatrixQuestion matrixQuestion = matrixQuestions.get(0);
                Integer matrixId = matrixQuestion.getId();
                if (matrixQuestions.size() > 1) {
                    logger.warn("问题ID {} 存在多条矩阵题配置记录，使用第一条", questionId);
                }
                
                QuestionnairePreviewDto.MatrixQuestionInfo config = new QuestionnairePreviewDto.MatrixQuestionInfo();
                
                // 获取矩阵行
                QueryWrapper<MatrixRow> rowWrapper = new QueryWrapper<>();
                rowWrapper.eq("matrix_id", matrixId);
                rowWrapper.orderByAsc("sort_num");
                List<MatrixRow> rows = matrixRowMapper.selectList(rowWrapper);
                
                List<QuestionnairePreviewDto.MatrixRowInfo> rowInfos = rows.stream().map(row -> {
                    QuestionnairePreviewDto.MatrixRowInfo rowInfo = new QuestionnairePreviewDto.MatrixRowInfo();
                    BeanUtils.copyProperties(row, rowInfo);
                    return rowInfo;
                }).collect(Collectors.toList());
                
                // 获取矩阵列
                QueryWrapper<MatrixColumn> columnWrapper = new QueryWrapper<>();
                columnWrapper.eq("matrix_id", matrixId);
                columnWrapper.orderByAsc("sort_num");
                List<MatrixColumn> columns = matrixColumnMapper.selectList(columnWrapper);
                
                List<QuestionnairePreviewDto.MatrixColumnInfo> columnInfos = columns.stream().map(column -> {
                    QuestionnairePreviewDto.MatrixColumnInfo columnInfo = new QuestionnairePreviewDto.MatrixColumnInfo();
                    BeanUtils.copyProperties(column, columnInfo);
                    return columnInfo;
                }).collect(Collectors.toList());
                
                config.setRows(rowInfos);
                config.setColumns(columnInfos);
                
                return config;
            }
            return null;
        } catch (Exception e) {
            logger.error("获取矩阵题配置时发生异常，问题ID: {}", questionId, e);
            return null;
        }
    }
    

    

    
    @Override
    public QuestionDto getQuestionById(Integer questionId) {
        try {
            // 查询问题基本信息
            Question question = getById(questionId);
            if (question == null) {
                return null;
            }
            
            // 转换为DTO
            QuestionDto questionDto = new QuestionDto();
            BeanUtils.copyProperties(question, questionDto);
            
            // 根据问题类型获取相应的选项和配置
            switch (question.getQuestionType()) {
                case 1: // 单选题
                    questionDto.setOptions(getSingleChoiceOptionsForQuestion(questionId));
                    break;
                case 2: // 多选题
                    questionDto.setOptions(getMultipleChoiceOptionsForQuestion(questionId));
                    break;
                case 3: // 文本题
                    questionDto.setTextQuestionConfig(getTextQuestionConfig(questionId));
                    break;
                case 4: // 评分题
                    questionDto.setRatingQuestionConfig(getRatingQuestionConfig(questionId));
                    break;
                case 5: // 矩阵题
                    questionDto.setMatrixQuestionConfig(getMatrixQuestionConfig(questionId));
                    break;
                default:
                    logger.warn("未知的问题类型: {}", question.getQuestionType());
                    break;
            }
            
            return questionDto;
            
        } catch (Exception e) {
            logger.error("获取问题数据时发生异常，问题ID: {}", questionId, e);
            return null;
        }
    }
    
    /**
     * 获取单选题选项（转换为QuestionOptionDto格式）
     */
    private List<QuestionOptionDto> getSingleChoiceOptionsForQuestion(Integer questionId) {
        QueryWrapper<SingleChoiceOption> optionWrapper = new QueryWrapper<>();
        optionWrapper.eq("question_id", questionId);
        optionWrapper.orderByAsc("sort_num");
        List<SingleChoiceOption> options = singleChoiceOptionMapper.selectList(optionWrapper);
        
        return options.stream().map(option -> {
            QuestionOptionDto optionDto = new QuestionOptionDto();
            BeanUtils.copyProperties(option, optionDto);
            return optionDto;
        }).collect(Collectors.toList());
    }
    
    /**
     * 获取多选题选项（转换为QuestionOptionDto格式）
     */
    private List<QuestionOptionDto> getMultipleChoiceOptionsForQuestion(Integer questionId) {
        QueryWrapper<MultipleChoiceOption> optionWrapper = new QueryWrapper<>();
        optionWrapper.eq("question_id", questionId);
        optionWrapper.orderByAsc("sort_num");
        List<MultipleChoiceOption> options = multipleChoiceOptionMapper.selectList(optionWrapper);
        
        return options.stream().map(option -> {
            QuestionOptionDto optionDto = new QuestionOptionDto();
            BeanUtils.copyProperties(option, optionDto);
            return optionDto;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getQuestionStatistics(Integer creatorId) {
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            // 获取总问题数
            QueryWrapper<Question> questionWrapper = new QueryWrapper<>();
            if (creatorId != null) {
                // 如果指定了创建者ID，需要关联查询该创建者的问卷中的问题
                // TODO: 实现关联查询逻辑
                statistics.put("totalQuestions", 0L);
                statistics.put("answeredQuestions", 0L);
            } else {
                // 统计所有问题
                long totalQuestions = count(questionWrapper);
                
                // 统计已回答的问题数（通过question_answer表）
                // TODO: 实现关联查询逻辑
                long answeredQuestions = 0L;
                
                statistics.put("totalQuestions", totalQuestions);
                statistics.put("answeredQuestions", answeredQuestions);
            }
        } catch (Exception e) {
            // 如果出错，返回默认值
            statistics.put("totalQuestions", 0L);
            statistics.put("answeredQuestions", 0L);
        }
        
        return statistics;
    }
}
