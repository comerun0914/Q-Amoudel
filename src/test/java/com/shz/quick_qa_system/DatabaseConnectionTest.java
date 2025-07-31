package com.shz.quick_qa_system;

import com.shz.quick_qa_system.entity.Users;
import com.shz.quick_qa_system.service.UsersService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.annotation.Resource;

@SpringBootTest
@ActiveProfiles("dev")
public class DatabaseConnectionTest {

    @Resource
    private UsersService usersService;

    @Test
    public void testDatabaseConnection() {
        System.out.println("开始测试数据库连接...");
        
        // 测试查询所有用户
        System.out.println("查询所有用户:");
        usersService.list().forEach(user -> {
            System.out.println("用户ID: " + user.getId() + 
                             ", 用户名: " + user.getUsername() + 
                             ", 角色: " + user.getRole());
        });
        
        // 测试根据用户名查询
        System.out.println("\n测试根据用户名查询:");
        Users adminUser = usersService.getUserByuserName("admin");
        if (adminUser != null) {
            System.out.println("找到admin用户: " + adminUser.getUsername());
        } else {
            System.out.println("未找到admin用户");
        }
        
        System.out.println("数据库连接测试完成");
    }
} 