package com.shz.quick_qa_system.controller;

import com.shz.quick_qa_system.utils.QRCodeUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * ClassName: QrCodeController
 * Package: com.shz.quick_qa_system.controller
 * Description: 二维码生成控制器
 *
 * @Author comerrun
 * @Create 2025/8/13 10:14
 */

@Controller
@RequestMapping("/code")
public class QrCodeController {

    // 生成二维码图片并直接输出到响应流
    @PostMapping("/generateQRcode")
    public void generateQRcode(@RequestParam(value = "content") String content, 
                              HttpServletResponse httpServletResponse) throws IOException {
        try {
            // 设置响应头，告诉浏览器这是图片
            httpServletResponse.setContentType("image/png");
            httpServletResponse.setHeader("Cache-Control", "no-cache");
            
            // 生成二维码并输出到响应流
            QRCodeUtil.createCodeToOutputStream(content, httpServletResponse.getOutputStream());
        } catch (Exception e) {
            // 如果生成失败，返回错误信息
            httpServletResponse.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            httpServletResponse.getWriter().write("二维码生成失败: " + e.getMessage());
        }
    }
    
    // 添加一个GET方法用于测试
    @PostMapping("/generateQRcodeGet")
    @ResponseBody
    public String generateQRcodeGet(@RequestParam(value = "content") String content) {
        return "二维码内容: " + content;
    }
}
