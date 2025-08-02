package com.shz.quick_qa_system.utils;

import java.util.Random;

/**
 * 表单ID生成器
 * 生成8位整数ID，确保在数据库中不可重复
 * 
 * @Author comerun
 * @Create 2025/8/2
 */
public class CodeGenerator {
    
    private static final Random random = new Random();
    
    /**
     * 生成8位数字表单ID
     * 范围：10000000-99999999
     * @return 8位整数ID
     */
    public static Integer generateFormId() {
        return 10000000 + random.nextInt(90000000);
    }
    
    /**
     * 验证是否为有效的8位数字ID
     * @param id 待验证的ID
     * @return true表示有效，false表示无效
     */
    public static boolean isValidFormId(Integer id) {
        if (id == null) {
            return false;
        }
        return id >= 10000000 && id <= 99999999;
    }
    
    /**
     * 将字符串转换为8位数字ID
     * @param idStr ID字符串
     * @return 8位整数ID，如果转换失败返回null
     */
    public static Integer parseFormId(String idStr) {
        try {
            Integer id = Integer.parseInt(idStr);
            return isValidFormId(id) ? id : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }
} 