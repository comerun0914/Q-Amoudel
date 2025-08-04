package com.shz.quick_qa_system.service;

import com.shz.quick_qa_system.entity.QuestionCreate;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;
import java.util.Map;
import com.shz.quick_qa_system.dto.QuestionDto;

/**
 * <p>
 * 问卷管理 服务类
 * </p>
 *
 * @author comerun
 * @since 2025-08-02
 */
public interface QuestionCreateService extends IService<QuestionCreate> {

    /**
     * 创建问卷
     *
     * @param questionCreate
     * @return 创建的问卷对象，失败返回null
     */
    public QuestionCreate CreateQuestion(QuestionCreate questionCreate);

    /**
     * 获取问卷列表
     * @param page 页码
     * @param size 每页大小
     * @param keyword 关键词
     * @param status 状态
     * @param dateFilter 日期筛选
     * @param creatorId 创建者ID
     * @return
     */
    public Map<String, Object> getQuestionnaireList(Integer page, Integer size, String keyword, Integer status, String dateFilter, Integer creatorId);

    /**
     * 获取问卷详情
     * @param id 问卷ID
     * @return
     */
    public QuestionCreate getQuestionnaireDetail(Integer id);

    /**
     * 更新问卷
     * @param request 更新请求数据
     * @return
     */
    public QuestionCreate updateQuestionnaire(Map<String, Object> request);

    /**
     * 获取问卷问题列表
     * @param questionnaireId 问卷ID
     * @return
     */
    public List<QuestionDto> getQuestionnaireQuestions(Integer questionnaireId);

    /**
     * 删除问卷
     * @param id 问卷ID
     * @return
     */
    public Boolean deleteQuestionnaire(Integer id);

    /**
     * 批量删除问卷
     * @param ids 问卷ID列表
     * @return
     */
    public Boolean batchDeleteQuestionnaire(List<Integer> ids);

    /**
     * 切换问卷状态
     * @param id 问卷ID
     * @param status 状态
     * @return
     */
    public Boolean toggleQuestionnaireStatus(Integer id, Boolean status);

    /**
     * 批量切换问卷状态
     * @param ids 问卷ID列表
     * @param status 状态
     * @return
     */
    public Boolean batchToggleQuestionnaireStatus(List<Integer> ids, Boolean status);

    /**
     * 复制问卷
     * @param id 问卷ID
     * @return
     */
    public QuestionCreate copyQuestionnaire(Integer id);

    /**
     * 导入问卷
     * @param questionnaireData 问卷数据
     * @return
     */
    public QuestionCreate importQuestionnaire(Map<String, Object> questionnaireData);

    /**
     * 获取问卷统计信息
     * @param creatorId 创建者ID
     * @return
     */
    public Map<String, Object> getQuestionnaireStatistics(Integer creatorId);
}
