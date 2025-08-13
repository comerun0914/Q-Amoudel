package com.shz.quick_qa_system.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 添加跨域访问请求
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000", "http://127.0.0.1:8080")  // 明确指定允许的源
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Cache-Control",
                        "X-File-Name", "X-Forwarded-For", "X-Real-IP", "User-Agent", "Referer",
                        "Accept-Language", "Accept-Encoding", "Connection", "Host", "Pragma",
                        "If-Modified-Since", "If-None-Match", "ETag", "Last-Modified")
                .exposedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    // 创建CORS配置源，用于更细粒度的控制
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 明确指定允许的来源（开发环境）
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:8080",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:8080"
        ));

        // 允许的HTTP方法
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));

        // 明确指定允许的请求头部，包含所有常用头部
        configuration.setAllowedHeaders(Arrays.asList(
                "Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Cache-Control",
                "X-File-Name", "X-Forwarded-For", "X-Real-IP", "User-Agent", "Referer",
                "Accept-Language", "Accept-Encoding", "Connection", "Host", "Pragma",
                "If-Modified-Since", "If-None-Match", "ETag", "Last-Modified"
        ));

        // 暴露的响应头
        configuration.setExposedHeaders(Arrays.asList("*"));

        // 允许发送凭证
        configuration.setAllowCredentials(true);

        // 预检请求的缓存时间
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
