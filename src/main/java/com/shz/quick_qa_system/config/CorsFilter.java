package com.shz.quick_qa_system.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * CORS过滤器，确保跨域请求能够正确处理
 * 优先级设置为最高，确保在其他过滤器之前执行
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter implements Filter {

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:8080,http://127.0.0.1:3000,http://127.0.0.1:8080}")
    private String allowedOrigins;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        // 获取请求的Origin
        String origin = request.getHeader("Origin");

        // 设置CORS响应头
        if (isOriginAllowed(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        } else if ("dev".equals(activeProfile)) {
            // 开发环境默认允许localhost
            response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        }

        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");

        // 明确指定允许的请求头部，包含所有常用头部
        response.setHeader("Access-Control-Allow-Headers",
                "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, " +
                        "X-File-Name, X-Forwarded-For, X-Real-IP, User-Agent, Referer, " +
                        "Accept-Language, Accept-Encoding, Connection, Host, Pragma, " +
                        "If-Modified-Since, If-None-Match, ETag, Last-Modified");

        response.setHeader("Access-Control-Expose-Headers", "*");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");

        // 对于OPTIONS预检请求，直接返回200状态码
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // 继续执行过滤器链
        chain.doFilter(req, res);
    }

    /**
     * 检查请求的Origin是否在允许列表中
     */
    private boolean isOriginAllowed(String origin) {
        if (origin == null) {
            return false;
        }

        List<String> allowedOriginsList = Arrays.asList(allowedOrigins.split(","));
        return allowedOriginsList.stream()
                .anyMatch(allowed -> origin.equals(allowed.trim()) ||
                        (allowed.trim().startsWith("http://localhost") && origin.contains("localhost")) ||
                        (allowed.trim().startsWith("http://127.0.0.1") && origin.contains("127.0.0.1")));
    }

    @Override
    public void init(FilterConfig filterConfig) {
        // 初始化方法，不需要特殊处理
    }

    @Override
    public void destroy() {
        // 销毁方法，不需要特殊处理
    }
}
