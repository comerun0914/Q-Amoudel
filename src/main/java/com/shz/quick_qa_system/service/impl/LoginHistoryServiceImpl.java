package com.shz.quick_qa_system.service.impl;

import com.shz.quick_qa_system.entity.LoginHistory;
import com.shz.quick_qa_system.dao.LoginHistoryMapper;
import com.shz.quick_qa_system.service.LoginHistoryService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 用户登录历史记录表 服务实现类
 * </p>
 *
 * @author comerun
 * @since 2025-07-30
 */
@Service
public class LoginHistoryServiceImpl extends ServiceImpl<LoginHistoryMapper, LoginHistory> implements LoginHistoryService {

}
