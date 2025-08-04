// 使用全局配置
// 问卷编辑器JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    checkUserLoginStatus();
    
    // 延迟加载问卷信息，确保URL完全加载
    setTimeout(() => {
        loadQuestionnaireInfo();
    }, 100);

    let questionCount = 0;
    
    // 获取DOM元素
    const formatButtons = document.querySelectorAll('.format-btn');
    const questionContainer = document.getElementById('question-container');
    const questionCountElement = document.getElementById('question-count');
    const estimatedTimeElement = document.getElementById('estimated-time');
    
    // 为每个格式按钮添加点击事件
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            addQuestion(type);
        });
    });
    
    // 添加问题函数
    function addQuestion(type) {
        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        questionElement.setAttribute('draggable', 'true');
        questionElement.setAttribute('data-type', type);
        questionElement.innerHTML = getQuestionTemplate(type);
        
        questionContainer.appendChild(questionElement);
        
        // 绑定事件
        attachQuestionEvents(questionElement, type);
        
        // 绑定拖拽事件
        attachDragEvents(questionElement);
        
        // 更新计数（填写人信息不算作问题）
        if (type !== 'user-info') {
            questionCount++;
        }
        updateQuestionCount();
        updateEstimatedTime();
        updateQuestionNumbers(); // 更新题目序号
    }
    
    // 获取问题模板
    function getQuestionTemplate(type) {
        switch(type) {
            case 'single':
                return createSingleChoiceTemplate();
            case 'multiple':
                return createMultipleChoiceTemplate();
            case 'text':
                return createTextQuestionTemplate();
            case 'rating':
                return createRatingQuestionTemplate();
            case 'matrix':
                return createMatrixQuestionTemplate();
            case 'date':
                return createDateQuestionTemplate();
            case 'time':
                return createTimeQuestionTemplate();
            case 'file':
                return createFileUploadTemplate();
            case 'location':
                return createLocationTemplate();
            case 'signature':
                return createSignatureTemplate();
            case 'user-info':
                return createUserInfoTemplate();
            default:
                return createSingleChoiceTemplate();
        }
    }
    
    // 单选题模板
    function createSingleChoiceTemplate() {
        return `
            <div class="question-header">
                <span class="question-type-badge">
                    <i class="iconfont icon-radio"></i> 单选题
                </span>
                <div class="header-actions">
                    <div class="drag-handle" title="拖拽移动">
                        <i class="iconfont icon-move"></i>
                    </div>
                    <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
                        <i class="iconfont icon-delete"></i> 删除
                    </button>
                </div>
            </div>
            <div class="question-content-container">
                <input type="text" placeholder="请输入问题内容" class="question-content">
            </div>
            <div class="options">
                <div class="option-item">
                    <input type="radio" name="single_${questionCount}" disabled>
                    <input type="text" placeholder="选项1" class="option-content">
                </div>
                <div class="option-item">
                    <input type="radio" name="single_${questionCount}" disabled>
                    <input type="text" placeholder="选项2" class="option-content">
                </div>
            </div>
            <button class="add-option" onclick="addOption(this, 'radio')">
                <i class="iconfont icon-add"></i> 添加选项
            </button>
        `;
    }
    
    // 多选题模板
    function createMultipleChoiceTemplate() {
        return `
            <div class="question-header">
                <span class="question-type-badge">
                    <i class="iconfont icon-checkbox"></i> 多选题
                </span>
                <div class="header-actions">
                    <div class="drag-handle" title="拖拽移动">
                        <i class="iconfont icon-move"></i>
                    </div>
                    <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
                        <i class="iconfont icon-delete"></i> 删除
                    </button>
                </div>
            </div>
            <div class="question-content-container">
                <input type="text" placeholder="请输入问题内容" class="question-content">
            </div>
            <div class="options">
                <div class="option-item">
                    <input type="checkbox" name="multiple" disabled>
                    <input type="text" placeholder="选项1" class="option-content">
                </div>
                <div class="option-item">
                    <input type="checkbox" name="multiple" disabled>
                    <input type="text" placeholder="选项2" class="option-content">
                </div>
            </div>
            <button class="add-option" onclick="addOption(this, 'checkbox')">
                <i class="iconfont icon-add"></i> 添加选项
            </button>
        `;
    }
    
    // 文本题模板
    function createTextQuestionTemplate() {
        return `
            <div class="question-header">
                <span class="question-type-badge">
                    <i class="iconfont icon-text"></i> 文本题
                </span>
                <div class="header-actions">
                    <div class="drag-handle" title="拖拽移动">
                        <i class="iconfont icon-move"></i>
                    </div>
                    <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
                        <i class="iconfont icon-delete"></i> 删除
                    </button>
                </div>
            </div>
            <div class="question-content-container">
                <input type="text" placeholder="请输入问题内容" class="question-content">
            </div>
            <div class="text-answer-preview">
                <textarea placeholder="请输入答案" class="text-answer" disabled></textarea>
            </div>
        `;
    }
    
    // 评分题模板
    function createRatingQuestionTemplate() {
        return `
            <div class="question-header">
                <span class="question-type-badge">
                    <i class="iconfont icon-star"></i> 评分题
                </span>
                <div class="header-actions">
                    <div class="drag-handle" title="拖拽移动">
                        <i class="iconfont icon-move"></i>
                    </div>
                    <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
                        <i class="iconfont icon-delete"></i> 删除
                    </button>
                </div>
            </div>
            <div class="question-content-container">
                <input type="text" placeholder="请输入问题内容" class="question-content">
            </div>
            <div class="rating-preview">
                <div class="rating-scale">
                    <input type="radio" name="rating_${questionCount}" disabled>
                    <input type="radio" name="rating_${questionCount}" disabled>
                    <input type="radio" name="rating_${questionCount}" disabled>
                    <input type="radio" name="rating_${questionCount}" disabled>
                    <input type="radio" name="rating_${questionCount}" disabled>
                </div>
                <div class="rating-labels">
                    <span>非常不满意</span>
                    <span>不满意</span>
                    <span>一般</span>
                    <span>满意</span>
                    <span>非常满意</span>
                </div>
            </div>
        `;
    }
    
    // 矩阵题模板
    function createMatrixQuestionTemplate() {
        return `
            <div class="question-header">
                <span class="question-type-badge">
                    <i class="iconfont icon-table"></i> 矩阵题
                </span>
                <div class="header-actions">
                    <div class="drag-handle" title="拖拽移动">
                        <i class="iconfont icon-move"></i>
                    </div>
                    <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
                        <i class="iconfont icon-delete"></i> 删除
                    </button>
                </div>
            </div>
            <div class="question-content-container">
                <input type="text" placeholder="请输入问题内容" class="question-content">
            </div>
            <div class="matrix-preview">
                <div class="matrix-columns">
                    <span>选项</span>
                    <span>非常满意</span>
                    <span>满意</span>
                    <span>一般</span>
                    <span>不满意</span>
                    <span>非常不满意</span>
                </div>
                <div class="matrix-row">
                    <div class="matrix-label">教学质量</div>
                    <div class="matrix-options">
                        <input type="radio" name="matrix_${questionCount}_1" disabled>
                        <input type="radio" name="matrix_${questionCount}_1" disabled>
                        <input type="radio" name="matrix_${questionCount}_1" disabled>
                        <input type="radio" name="matrix_${questionCount}_1" disabled>
                        <input type="radio" name="matrix_${questionCount}_1" disabled>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 日期题模板
    function createDateQuestionTemplate() {
        return `
            <div class="question-header">
                <span class="question-type-badge">
                    <i class="iconfont icon-calendar"></i> 日期题
                </span>
                <div class="header-actions">
                    <div class="drag-handle" title="拖拽移动">
                        <i class="iconfont icon-move"></i>
                    </div>
                    <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
                        <i class="iconfont icon-delete"></i> 删除
                    </button>
                </div>
            </div>
            <div class="question-content-container">
                <input type="text" placeholder="请输入问题内容" class="question-content">
            </div>
            <div class="date-preview">
                <input type="date" disabled>
            </div>
        `;
    }
    
    // 时间题模板
    function createTimeQuestionTemplate() {
        return `
            <div class="question-header">
                <span class="question-type-badge">
                    <i class="iconfont icon-clock"></i> 时间题
                </span>
                <div class="header-actions">
                    <div class="drag-handle" title="拖拽移动">
                        <i class="iconfont icon-move"></i>
                    </div>
                    <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
                        <i class="iconfont icon-delete"></i> 删除
                    </button>
                </div>
            </div>
            <div class="question-content-container">
                <input type="text" placeholder="请输入问题内容" class="question-content">
            </div>
            <div class="time-preview">
                <input type="time" disabled>
            </div>
        `;
    }
    
    // 文件上传组件模板
    function createFileUploadTemplate() {
        return `
            <div class="question-header">
                <span class="question-type-badge">
                    <i class="iconfont icon-upload"></i> 文件上传组件
                </span>
                <div class="header-actions">
                    <div class="drag-handle" title="拖拽移动">
                        <i class="iconfont icon-move"></i>
                    </div>
                    <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
                        <i class="iconfont icon-delete"></i> 删除
                    </button>
                </div>
            </div>
            <div class="component-description">
                <textarea placeholder="请输入组件说明（可选）" class="description-input"></textarea>
            </div>
            <div class="component-preview">
                <div class="file-upload-widget">
                    <div class="upload-area">
                        <i class="iconfont icon-upload"></i>
                        <p>点击或拖拽文件到此处上传</p>
                        <span class="file-types">支持格式：JPG, PNG, PDF, DOC</span>
                    </div>
                    <div class="uploaded-files">
                        <div class="file-item">
                            <i class="iconfont icon-file"></i>
                            <span class="file-name">示例文件.pdf</span>
                            <button class="remove-file">
                                <i class="iconfont icon-delete"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 位置选择组件模板
    function createLocationTemplate() {
        return `
            <div class="question-header">
                <span class="question-type-badge">
                    <i class="iconfont icon-location"></i> 位置选择组件
                </span>
                <div class="header-actions">
                    <div class="drag-handle" title="拖拽移动">
                        <i class="iconfont icon-move"></i>
                    </div>
                    <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
                        <i class="iconfont icon-delete"></i> 删除
                    </button>
                </div>
            </div>
            <div class="component-description">
                <textarea placeholder="请输入组件说明（可选）" class="description-input"></textarea>
            </div>
            <div class="component-preview">
                <div class="location-widget">
                    <div class="location-display">
                        <i class="iconfont icon-location"></i>
                        <span class="location-text">点击选择位置</span>
                    </div>
                    <div class="location-map">
                        <div class="map-placeholder">
                            <i class="iconfont icon-map"></i>
                            <p>地图将在此处显示</p>
                        </div>
                    </div>
                    <div class="location-coordinates">
                        <span>纬度: 39.9042° N</span>
                        <span>经度: 116.4074° E</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 签名组件模板
    function createSignatureTemplate() {
        return `
            <div class="question-header">
                <span class="question-type-badge">
                    <i class="iconfont icon-signature"></i> 签名组件
                </span>
                <div class="header-actions">
                    <div class="drag-handle" title="拖拽移动">
                        <i class="iconfont icon-move"></i>
                    </div>
                    <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
                        <i class="iconfont icon-delete"></i> 删除
                    </button>
                </div>
            </div>
            <div class="component-description">
                <textarea placeholder="请输入组件说明（可选）" class="description-input"></textarea>
            </div>
            <div class="component-preview">
                <div class="signature-widget">
                    <div class="signature-header">
                        <span class="signature-label">请在下方区域签名</span>
                        <button class="clear-signature-btn">
                            <i class="iconfont icon-refresh"></i> 重新签名
                        </button>
                    </div>
                    <div class="signature-area">
                        <canvas class="signature-canvas" width="400" height="150"></canvas>
                        <div class="signature-hint">
                            <i class="iconfont icon-pen"></i>
                            <span>使用鼠标或触摸设备进行签名</span>
                        </div>
                    </div>
                    <div class="signature-actions">
                        <button class="save-signature">
                            <i class="iconfont icon-save"></i> 保存签名
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 填写人信息模板
    function createUserInfoTemplate() {
        return `
            <div class="question-header">
                <span class="question-type-badge">
                    <i class="iconfont icon-user"></i> 填写人信息
                </span>
                <div class="header-actions">
                    <div class="drag-handle" title="拖拽移动">
                        <i class="iconfont icon-move"></i>
                    </div>
                    <button class="delete-question" onclick="this.closest('.question-item').remove(); updateQuestionCount(); updateEstimatedTime(); updateQuestionNumbers();">
                        <i class="iconfont icon-delete"></i> 删除
                    </button>
                </div>
            </div>
            <div class="component-description">
                <textarea placeholder="请输入组件说明（可选）" class="description-input"></textarea>
            </div>
            <div class="user-info-preview">
                <div class="user-info-display">
                    <div class="info-item">
                        <label>姓名：</label>
                        <span class="user-name">[填写人姓名]</span>
                    </div>
                    <div class="info-item">
                        <label>填写时间：</label>
                        <span class="fill-time">[自动获取]</span>
                    </div>
                    <div class="info-item">
                        <label>联系方式：</label>
                        <span class="contact-info">[手机/邮箱]</span>
                    </div>
                    <div class="info-item">
                        <label>部门：</label>
                        <span class="department">[所属部门]</span>
                    </div>
                </div>
                <div class="user-info-actions">
                    <button class="edit-info-btn">
                        <i class="iconfont icon-pen"></i> 编辑字段
                    </button>
                </div>
            </div>
        `;
    }
    
    // 绑定问题事件
    function attachQuestionEvents(questionElement, type) {
        // 添加选项按钮事件
        const addOptionBtn = questionElement.querySelector('.add-option');
        if (addOptionBtn) {
            addOptionBtn.addEventListener('click', function() {
                addOption(this, type === 'single' ? 'radio' : 'checkbox');
            });
        }
        
        // 绑定组件特定事件
        if (type === 'file') {
            attachFileUploadEvents(questionElement);
        } else if (type === 'location') {
            attachLocationEvents(questionElement);
        } else if (type === 'signature') {
            attachSignatureEvents(questionElement);
        } else if (type === 'user-info') {
            attachUserInfoEvents(questionElement);
        }
    }
    
    // 绑定文件上传组件事件
    function attachFileUploadEvents(questionElement) {
        const uploadArea = questionElement.querySelector('.upload-area');
        const uploadedFiles = questionElement.querySelector('.uploaded-files');
        const descriptionInput = questionElement.querySelector('.description-input');
        
        if (uploadArea) {
            // 点击上传
            uploadArea.addEventListener('click', function() {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.txt';
                input.style.display = 'none';
                document.body.appendChild(input);
                
                input.addEventListener('change', function(e) {
                    handleFiles(e.target.files);
                    document.body.removeChild(input);
                });
                
                input.click();
            });
            
            // 拖拽上传
            uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                uploadArea.style.borderColor = '#3b82f6';
                uploadArea.style.background = 'rgba(59, 130, 246, 0.1)';
            });
            
            uploadArea.addEventListener('dragleave', function(e) {
                e.preventDefault();
                uploadArea.style.borderColor = '#d1d5db';
                uploadArea.style.background = '#f3f4f6';
            });
            
            uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                uploadArea.style.borderColor = '#d1d5db';
                uploadArea.style.background = '#f3f4f6';
                
                const files = e.dataTransfer.files;
                handleFiles(files);
            });
        }
        
        // 处理文件
        function handleFiles(files) {
            Array.from(files).forEach(file => {
                // 验证文件类型
                const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
                if (!allowedTypes.includes(file.type)) {
                    showNotification('不支持的文件类型: ' + file.name, 'error');
                    return;
                }
                
                // 验证文件大小 (5MB)
                if (file.size > 20 * 1024 * 1024) {
                    showNotification('文件过大: ' + file.name + ' (最大20MB)', 'error');
                    return;
                }
                
                addFileItem(file);
            });
        }
        
        // 添加文件项
        function addFileItem(file) {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="iconfont icon-file"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
                <button class="remove-file">
                    <i class="iconfont icon-delete"></i>
                </button>
            `;
            
            // 绑定删除事件
            const removeBtn = fileItem.querySelector('.remove-file');
            removeBtn.addEventListener('click', function() {
                fileItem.remove();
                showNotification('文件已删除: ' + file.name, 'success');
            });
            
            uploadedFiles.appendChild(fileItem);
            showNotification('文件已添加: ' + file.name, 'success');
        }
        
        // 格式化文件大小
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        // 显示通知
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                background: ${type === 'error' ? '#dc3545' : '#10b981'};
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    }
    
    // 绑定位置选择组件事件
    function attachLocationEvents(questionElement) {
        const locationDisplay = questionElement.querySelector('.location-display');
        const locationText = questionElement.querySelector('.location-text');
        const mapPlaceholder = questionElement.querySelector('.map-placeholder');
        const coordinates = questionElement.querySelector('.location-coordinates');
        const descriptionInput = questionElement.querySelector('.description-input');
        
        let selectedLocation = null;
        
        if (locationDisplay) {
            locationDisplay.addEventListener('click', function() {
                showLocationPicker();
            });
        }
        
        // 显示位置选择器
        function showLocationPicker() {
            const modal = document.createElement('div');
            modal.className = 'location-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            `;
            
            modalContent.innerHTML = `
                <h3 style="margin-bottom: 1rem; color: #374151;">选择位置</h3>
                <div style="margin-bottom: 1rem;">
                    <input type="text" id="location-search" placeholder="搜索地址..." 
                           style="width: 100%; padding: 0.8rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">预设位置</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <button class="preset-location" data-lat="39.9042" data-lng="116.4074" data-name="北京天安门">北京天安门</button>
                        <button class="preset-location" data-lat="31.2304" data-lng="121.4737" data-name="上海外滩">上海外滩</button>
                        <button class="preset-location" data-lat="23.1291" data-lng="113.2644" data-name="广州塔">广州塔</button>
                        <button class="preset-location" data-lat="22.3193" data-lng="114.1694" data-name="香港维多利亚港">香港维多利亚港</button>
                    </div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">手动输入坐标</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="number" id="manual-lat" placeholder="纬度" step="0.0001" 
                               style="flex: 1; padding: 0.8rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                        <input type="number" id="manual-lng" placeholder="经度" step="0.0001" 
                               style="flex: 1; padding: 0.8rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button id="cancel-location" style="padding: 0.8rem 1.5rem; border: 2px solid #e5e7eb; background: white; border-radius: 8px; cursor: pointer;">取消</button>
                    <button id="confirm-location" style="padding: 0.8rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">确认</button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // 绑定事件
            const presetButtons = modal.querySelectorAll('.preset-location');
            const cancelBtn = modal.querySelector('#cancel-location');
            const confirmBtn = modal.querySelector('#confirm-location');
            const searchInput = modal.querySelector('#location-search');
            const manualLat = modal.querySelector('#manual-lat');
            const manualLng = modal.querySelector('#manual-lng');
            
            presetButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const lat = parseFloat(this.dataset.lat);
                    const lng = parseFloat(this.dataset.lng);
                    const name = this.dataset.name;
                    
                    selectedLocation = { lat, lng, name };
                    updateLocationPreview();
                    
                    // 高亮选中的按钮
                    presetButtons.forEach(b => b.style.background = '#f3f4f6');
                    this.style.background = '#3b82f6';
                    this.style.color = 'white';
                });
            });
            
            cancelBtn.addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            confirmBtn.addEventListener('click', function() {
                if (selectedLocation) {
                    updateLocation(selectedLocation);
                    document.body.removeChild(modal);
                    showNotification('位置已选择: ' + selectedLocation.name, 'success');
                } else {
                    showNotification('请先选择一个位置', 'error');
                }
            });
            
            // 搜索功能
            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase();
                presetButtons.forEach(btn => {
                    const name = btn.textContent.toLowerCase();
                    if (name.includes(query)) {
                        btn.style.display = 'block';
                    } else {
                        btn.style.display = 'none';
                    }
                });
            });
            
            // 手动输入坐标
            function handleManualInput() {
                const lat = parseFloat(manualLat.value);
                const lng = parseFloat(manualLng.value);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    selectedLocation = { lat, lng, name: `自定义位置 (${lat.toFixed(4)}, ${lng.toFixed(4)})` };
                    updateLocationPreview();
                }
            }
            
            manualLat.addEventListener('input', handleManualInput);
            manualLng.addEventListener('input', handleManualInput);
            
            function updateLocationPreview() {
                if (selectedLocation) {
                    confirmBtn.style.background = '#10b981';
                    confirmBtn.textContent = `确认选择: ${selectedLocation.name}`;
                }
            }
        }
        
        // 更新位置显示
        function updateLocation(location) {
            selectedLocation = location;
            
            // 更新显示文本
            locationText.textContent = location.name;
            
            // 更新坐标显示
            coordinates.innerHTML = `
                <span>纬度: ${location.lat.toFixed(4)}° N</span>
                <span>经度: ${location.lng.toFixed(4)}° E</span>
            `;
            
            // 更新地图占位符
            mapPlaceholder.innerHTML = `
                <i class="iconfont icon-map"></i>
                <p>${location.name}</p>
                <small>纬度: ${location.lat.toFixed(4)}°, 经度: ${location.lng.toFixed(4)}°</small>
            `;
            
            // 添加选中状态样式
            locationDisplay.style.background = '#dbeafe';
            locationDisplay.style.border = '2px solid #3b82f6';
        }
        
        // 显示通知
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                background: ${type === 'error' ? '#dc3545' : '#10b981'};
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    }
    
    // 绑定签名组件事件
    function attachSignatureEvents(questionElement) {
        const canvas = questionElement.querySelector('.signature-canvas');
        const clearBtn = questionElement.querySelector('.clear-signature-btn');
        const saveBtn = questionElement.querySelector('.save-signature');
        const signatureHint = questionElement.querySelector('.signature-hint');
        const descriptionInput = questionElement.querySelector('.description-input');
        
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;
            let drawingHistory = [];
            let currentStep = -1;
            
            // 设置画布样式
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // 创建工具栏
            createToolbar();
            
            // 鼠标事件
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            // 触摸事件（移动设备）
            canvas.addEventListener('touchstart', handleTouch);
            canvas.addEventListener('touchmove', handleTouch);
            canvas.addEventListener('touchend', stopDrawing);
            
            function createToolbar() {
                const toolbar = document.createElement('div');
                toolbar.className = 'signature-toolbar';
                toolbar.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    padding: 0.8rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                `;
                
                toolbar.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <label style="font-size: 0.9rem; font-weight: 500;">颜色:</label>
                        <input type="color" id="pen-color" value="#000000" style="width: 40px; height: 30px; border: none; border-radius: 4px; cursor: pointer;">
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <label style="font-size: 0.9rem; font-weight: 500;">粗细:</label>
                        <input type="range" id="pen-width" min="1" max="10" value="2" style="width: 80px;">
                        <span id="pen-width-value" style="font-size: 0.8rem; color: #6b7280;">2px</span>
                    </div>
                    <button id="undo-btn" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">撤销</button>
                    <button id="redo-btn" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">重做</button>
                `;
                
                // 插入到画布前面
                canvas.parentNode.insertBefore(toolbar, canvas);
                
                // 绑定工具栏事件
                const colorPicker = toolbar.querySelector('#pen-color');
                const widthSlider = toolbar.querySelector('#pen-width');
                const widthValue = toolbar.querySelector('#pen-width-value');
                const undoBtn = toolbar.querySelector('#undo-btn');
                const redoBtn = toolbar.querySelector('#redo-btn');
                
                colorPicker.addEventListener('change', function() {
                    ctx.strokeStyle = this.value;
                });
                
                widthSlider.addEventListener('input', function() {
                    ctx.lineWidth = this.value;
                    widthValue.textContent = this.value + 'px';
                });
                
                undoBtn.addEventListener('click', undo);
                redoBtn.addEventListener('click', redo);
            }
            
            function startDrawing(e) {
                isDrawing = true;
                const rect = canvas.getBoundingClientRect();
                lastX = e.clientX - rect.left;
                lastY = e.clientY - rect.top;
                
                // 隐藏提示
                if (signatureHint) {
                    signatureHint.style.display = 'none';
                }
            }
            
            function draw(e) {
                if (!isDrawing) return;
                e.preventDefault();
                
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                // 保存绘制历史
                saveToHistory();
                
                lastX = x;
                lastY = y;
            }
            
            function handleTouch(e) {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                                e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                canvas.dispatchEvent(mouseEvent);
            }
            
            function stopDrawing() {
                isDrawing = false;
            }
            
            // 保存绘制历史
            function saveToHistory() {
                // 清除当前步骤之后的历史
                drawingHistory = drawingHistory.slice(0, currentStep + 1);
                
                // 保存当前画布状态
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                drawingHistory.push(imageData);
                currentStep++;
                
                // 限制历史记录数量
                if (drawingHistory.length > 20) {
                    drawingHistory.shift();
                    currentStep--;
                }
                
                updateUndoRedoButtons();
            }
            
            // 撤销功能
            function undo() {
                if (currentStep > 0) {
                    currentStep--;
                    ctx.putImageData(drawingHistory[currentStep], 0, 0);
                    updateUndoRedoButtons();
                }
            }
            
            // 重做功能
            function redo() {
                if (currentStep < drawingHistory.length - 1) {
                    currentStep++;
                    ctx.putImageData(drawingHistory[currentStep], 0, 0);
                    updateUndoRedoButtons();
                }
            }
            
            // 更新撤销重做按钮状态
            function updateUndoRedoButtons() {
                const undoBtn = document.querySelector('#undo-btn');
                const redoBtn = document.querySelector('#redo-btn');
                
                if (undoBtn) {
                    undoBtn.disabled = currentStep <= 0;
                    undoBtn.style.opacity = currentStep <= 0 ? '0.5' : '1';
                }
                
                if (redoBtn) {
                    redoBtn.disabled = currentStep >= drawingHistory.length - 1;
                    redoBtn.style.opacity = currentStep >= drawingHistory.length - 1 ? '0.5' : '1';
                }
            }
            
            // 清除画布
            if (clearBtn) {
                clearBtn.addEventListener('click', function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawingHistory = [];
                    currentStep = -1;
                    updateUndoRedoButtons();
                    
                    // 显示提示
                    if (signatureHint) {
                        signatureHint.style.display = 'flex';
                    }
                    
                    showNotification('签名已清除', 'success');
                });
            }
            
            // 保存签名
            if (saveBtn) {
                saveBtn.addEventListener('click', function() {
                    // 检查是否有签名内容
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const hasContent = imageData.data.some(pixel => pixel !== 0);
                    
                    if (!hasContent) {
                        showNotification('请先进行签名', 'error');
                        return;
                    }
                    
                    // 创建下载链接
                    const link = document.createElement('a');
                    link.download = 'signature.png';
                    link.href = canvas.toDataURL();
                    link.click();
                    
                    showNotification('签名已保存为图片', 'success');
                });
            }
        }
        
        // 显示通知
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                background: ${type === 'error' ? '#dc3545' : '#10b981'};
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    }
    
    // 绑定用户信息组件事件
    function attachUserInfoEvents(questionElement) {
        const editBtn = questionElement.querySelector('.edit-info-btn');
        const userInfoDisplay = questionElement.querySelector('.user-info-display');
        const descriptionInput = questionElement.querySelector('.description-input');
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                showUserInfoEditor();
            });
        }
        
        // 显示用户信息编辑器
        function showUserInfoEditor() {
            const modal = document.createElement('div');
            modal.className = 'user-info-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            `;
            
            modalContent.innerHTML = `
                <h3 style="margin-bottom: 1.5rem; color: #374151;">编辑填写人信息字段</h3>
                <div style="margin-bottom: 1.5rem;">
                    <p style="color: #6b7280; margin-bottom: 1rem;">选择要显示的填写人信息字段：</p>
                    <div class="field-checkboxes">
                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem; cursor: pointer;">
                            <input type="checkbox" id="field-name" checked> 姓名
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem; cursor: pointer;">
                            <input type="checkbox" id="field-time" checked> 填写时间
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem; cursor: pointer;">
                            <input type="checkbox" id="field-contact"> 联系方式
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem; cursor: pointer;">
                            <input type="checkbox" id="field-department"> 部门
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem; cursor: pointer;">
                            <input type="checkbox" id="field-position"> 职位
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem; cursor: pointer;">
                            <input type="checkbox" id="field-id"> 工号
                        </label>
                    </div>
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">自定义字段</label>
                    <div id="custom-fields">
                        <div class="custom-field" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <input type="text" placeholder="字段名称" style="flex: 1; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 4px;">
                            <button class="remove-custom-field" style="padding: 0.5rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">删除</button>
                        </div>
                    </div>
                    <button id="add-custom-field" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">添加自定义字段</button>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button id="cancel-user-info" style="padding: 0.8rem 1.5rem; border: 2px solid #e5e7eb; background: white; border-radius: 8px; cursor: pointer;">取消</button>
                    <button id="save-user-info" style="padding: 0.8rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">保存</button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // 绑定事件
            const addCustomFieldBtn = modal.querySelector('#add-custom-field');
            const cancelBtn = modal.querySelector('#cancel-user-info');
            const saveBtn = modal.querySelector('#save-user-info');
            const customFieldsContainer = modal.querySelector('#custom-fields');
            
            addCustomFieldBtn.addEventListener('click', function() {
                const customField = document.createElement('div');
                customField.className = 'custom-field';
                customField.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';
                customField.innerHTML = `
                    <input type="text" placeholder="字段名称" style="flex: 1; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 4px;">
                    <button class="remove-custom-field" style="padding: 0.5rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">删除</button>
                `;
                
                customField.querySelector('.remove-custom-field').addEventListener('click', function() {
                    customField.remove();
                });
                
                customFieldsContainer.appendChild(customField);
            });
            
            // 绑定删除自定义字段事件
            modal.querySelectorAll('.remove-custom-field').forEach(btn => {
                btn.addEventListener('click', function() {
                    this.closest('.custom-field').remove();
                });
            });
            
            cancelBtn.addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            saveBtn.addEventListener('click', function() {
                updateUserInfoFields();
                document.body.removeChild(modal);
                showNotification('用户信息字段已更新', 'success');
            });
        }
        
        // 更新用户信息字段
        function updateUserInfoFields() {
            const modal = document.querySelector('.user-info-modal');
            if (!modal) return;
            
            const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
            const customFields = modal.querySelectorAll('.custom-field input[type="text"]');
            
            let newHTML = '';
            
            // 添加选中的标准字段
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const fieldName = checkbox.id.replace('field-', '');
                    const label = checkbox.parentElement.textContent.trim();
                    newHTML += `
                        <div class="info-item">
                            <label>${label}：</label>
                            <span class="${fieldName}-value">[${getFieldPlaceholder(fieldName)}]</span>
                        </div>
                    `;
                }
            });
            
            // 添加自定义字段
            customFields.forEach(field => {
                if (field.value.trim()) {
                    newHTML += `
                        <div class="info-item">
                            <label>${field.value.trim()}：</label>
                            <span class="custom-value">[待填写]</span>
                        </div>
                    `;
                }
            });
            
            userInfoDisplay.innerHTML = newHTML;
        }
        
        // 获取字段占位符
        function getFieldPlaceholder(fieldName) {
            const placeholders = {
                'name': '填写人姓名',
                'time': '自动获取',
                'contact': '手机/邮箱',
                'department': '所属部门',
                'position': '职位',
                'id': '工号'
            };
            return placeholders[fieldName] || '待填写';
        }
        
        // 显示通知
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                background: ${type === 'error' ? '#dc3545' : '#10b981'};
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    }
    
    // 绑定拖拽事件
    function attachDragEvents(questionElement) {
        questionElement.addEventListener('dragstart', handleDragStart);
        questionElement.addEventListener('dragover', handleDragOver);
        questionElement.addEventListener('drop', handleDrop);
        questionElement.addEventListener('dragenter', handleDragEnter);
        questionElement.addEventListener('dragleave', handleDragLeave);
        questionElement.addEventListener('dragend', handleDragEnd);
    }

    // 拖拽开始
    function handleDragStart(e) {
        // 如果点击的是组件内部的交互元素，不启动拖拽
        if (e.target.closest('.signature-canvas') || 
            e.target.closest('.upload-area') || 
            e.target.closest('.location-display') ||
            e.target.closest('.description-input') ||
            e.target.closest('.signature-toolbar') ||
            e.target.closest('.edit-info-btn') ||
            e.target.closest('.clear-signature-btn') ||
            e.target.closest('.save-signature') ||
            e.target.closest('.remove-file') ||
            e.target.closest('.delete-question')) {
            return;
        }
        
        // 如果点击的是拖拽手柄，确保拖拽的是整个问题项
        const questionItem = e.target.closest('.question-item');
        if (e.target.closest('.drag-handle')) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', questionItem.outerHTML);
            questionItem.classList.add('dragging');
        } else {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.outerHTML);
            e.target.classList.add('dragging');
        }
    }

    // 拖拽悬停
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    // 拖拽进入
    function handleDragEnter(e) {
        e.preventDefault();
        e.target.closest('.question-item')?.classList.add('drag-over');
    }

    // 拖拽离开
    function handleDragLeave(e) {
        e.target.closest('.question-item')?.classList.remove('drag-over');
    }

    // 拖拽结束
    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.question-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    }

    // 拖拽放置
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const draggedElement = document.querySelector('.dragging');
        const targetElement = e.target.closest('.question-item');
        
        if (draggedElement && targetElement && draggedElement !== targetElement) {
            const draggedType = draggedElement.getAttribute('data-type');
            const targetType = targetElement.getAttribute('data-type');
            
            // 检查是否可以放置（填写人信息可以放在任何位置）
            if (draggedType === 'user-info' || targetType === 'user-info' || 
                (draggedType !== 'user-info' && targetType !== 'user-info')) {
                
                // 获取位置信息
                const container = questionContainer;
                const draggedRect = draggedElement.getBoundingClientRect();
                const targetRect = targetElement.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                
                // 判断放置位置
                const draggedCenter = draggedRect.top + draggedRect.height / 2;
                const targetCenter = targetRect.top + targetRect.height / 2;
                
                if (draggedCenter < targetCenter) {
                    // 放在目标元素之前
                    container.insertBefore(draggedElement, targetElement);
                } else {
                    // 放在目标元素之后
                    container.insertBefore(draggedElement, targetElement.nextSibling);
                }
            }
        }
        
        // 清理样式
        document.querySelectorAll('.question-item').forEach(item => {
            item.classList.remove('drag-over');
        });
        
        // 更新题目序号
        updateQuestionNumbers();
    }
    
    // 添加选项函数
    function addOption(button, inputType) {
        const optionsContainer = button.previousElementSibling;
        const optionCount = optionsContainer.children.length + 1;
        const name = inputType === 'radio' ? `single_${questionCount}` : 'multiple';
        
        const optionElement = document.createElement('div');
        optionElement.className = 'option-item';
        optionElement.innerHTML = `
            <input type="${inputType}" name="${name}" disabled>
            <input type="text" placeholder="选项${optionCount}" class="option-content">
        `;
        
        optionsContainer.appendChild(optionElement);
    }
    
    // 更新问题计数
    function updateQuestionCount() {
        const questions = document.querySelectorAll('.question-item');
        // 排除填写人信息卡片
        const actualQuestions = Array.from(questions).filter(q => 
            q.getAttribute('data-type') !== 'user-info'
        );
        questionCount = actualQuestions.length;
        if (questionCountElement) {
            questionCountElement.textContent = questionCount;
        }
    }
    
    // 更新预计时间
    function updateEstimatedTime() {
        const baseTime = 2; // 基础时间2分钟
        const timePerQuestion = 0.5; // 每个问题0.5分钟
        const estimatedMinutes = Math.ceil(baseTime + questionCount * timePerQuestion);
        
        if (estimatedTimeElement) {
            estimatedTimeElement.textContent = `约 ${estimatedMinutes} 分钟`;
        }
    }
    
    // 更新题目序号
    function updateQuestionNumbers() {
        const questions = document.querySelectorAll('.question-item');
        let questionNumber = 1;
        
        questions.forEach(question => {
            const type = question.getAttribute('data-type');
            // 排除特殊类型和功能卡片
            if (type !== 'user-info' && type !== 'signature' && type !== 'file' && type !== 'location') {
                const questionHeader = question.querySelector('.question-header');
                if (questionHeader) {
                    // 查找或创建题目序号元素
                    let numberElement = questionHeader.querySelector('.question-number');
                    if (!numberElement) {
                        numberElement = document.createElement('span');
                        numberElement.className = 'question-number';
                        questionHeader.insertBefore(numberElement, questionHeader.firstChild);
                    }
                    numberElement.textContent = `Q${questionNumber}`;
                    questionNumber++;
                }
            } else {
                // 移除特殊类型和功能卡片的序号
                const numberElement = question.querySelector('.question-number');
                if (numberElement) {
                    numberElement.remove();
                }
            }
        });
    }
    
    // 保存草稿
    document.getElementById('save-draft').addEventListener('click', function() {
        alert('草稿已保存！');
    });
    
    // 预览问卷
    document.getElementById('preview-questionnaire').addEventListener('click', function() {
        openPreview();
    });
    
    // 发布问卷
    document.getElementById('publish-questionnaire').addEventListener('click', function() {
        if (questionCount === 0) {
            alert('请至少添加一个问题！');
            return;
        }
        alert('问卷发布成功！');
    });
    
    // 初始化计数
    updateQuestionCount();
    updateEstimatedTime();
    updateQuestionNumbers(); // 初始化题目序号
});

// 全局函数，供HTML中的onclick调用
function updateQuestionCount() {
    const questions = document.querySelectorAll('.question-item');
    // 排除填写人信息卡片
    const actualQuestions = Array.from(questions).filter(q => 
        q.getAttribute('data-type') !== 'user-info'
    );
    const questionCountElement = document.getElementById('question-count');
    if (questionCountElement) {
        questionCountElement.textContent = actualQuestions.length;
    }
}

function updateEstimatedTime() {
    const questions = document.querySelectorAll('.question-item');
    // 排除填写人信息卡片
    const actualQuestions = Array.from(questions).filter(q => 
        q.getAttribute('data-type') !== 'user-info'
    );
    const questionCount = actualQuestions.length;
    const baseTime = 2;
    const timePerQuestion = 0.5;
    const estimatedMinutes = Math.ceil(baseTime + questionCount * timePerQuestion);
    
    const estimatedTimeElement = document.getElementById('estimated-time');
    if (estimatedTimeElement) {
        estimatedTimeElement.textContent = `约 ${estimatedMinutes} 分钟`;
    }
}

// 全局函数，供HTML中的onclick调用
function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-item');
    let questionNumber = 1;
    
    questions.forEach(question => {
        const type = question.getAttribute('data-type');
        // 排除特殊类型和功能卡片
        if (type !== 'user-info' && type !== 'signature' && type !== 'file' && type !== 'location') {
            const questionHeader = question.querySelector('.question-header');
            if (questionHeader) {
                // 查找或创建题目序号元素
                let numberElement = questionHeader.querySelector('.question-number');
                if (!numberElement) {
                    numberElement = document.createElement('span');
                    numberElement.className = 'question-number';
                    questionHeader.insertBefore(numberElement, questionHeader.firstChild);
                }
                numberElement.textContent = `Q${questionNumber}`;
                questionNumber++;
            }
        } else {
            // 移除特殊类型和功能卡片的序号
            const numberElement = question.querySelector('.question-number');
            if (numberElement) {
                numberElement.remove();
            }
        }
    });
}

            /**
             * 打开问卷预览
             */
            function openPreview() {
                // 收集当前问卷数据
                const questionnaireData = collectQuestionnaireData();
                
                // 将数据编码并添加到URL参数
                const encodedData = encodeURIComponent(JSON.stringify(questionnaireData));
                const previewUrl = `${CONFIG.ROUTES.QUESTIONNAIRE_PREVIEW}?data=${encodedData}`;
                
                // 在新标签页中打开预览
                window.open(previewUrl, '_blank');
            }

/**
 * 收集问卷数据
 */
function collectQuestionnaireData() {
    const title = document.getElementById('questionnaire-title')?.textContent || '问卷标题';
    const description = document.getElementById('questionnaire-description-display')?.textContent || '问卷描述';
    
    const questions = [];
    const questionElements = document.querySelectorAll('.question-item');
    
    questionElements.forEach((element, index) => {
        const questionData = extractQuestionData(element, index + 1);
        if (questionData) {
            questions.push(questionData);
        }
    });
    
    return {
        title: title,
        description: description,
        questions: questions
    };
}

/**
 * 提取问题数据
 */
function extractQuestionData(element, questionNumber) {
    const questionText = element.querySelector('.question-content')?.value || 
                        element.querySelector('.question-text')?.textContent || '';
    const questionType = element.getAttribute('data-type') || '';
    
    if (!questionText || !questionType) {
        return null;
    }
    
    const questionData = {
        id: questionNumber,
        type: questionType,
        text: questionText,
        required: false
    };
    
    // 根据问题类型提取特定数据
    switch (questionType) {
        case 'single':
        case 'multiple':
            const options = [];
            element.querySelectorAll('.option-content').forEach(option => {
                const optionText = option.value || option.textContent || '';
                if (optionText.trim()) {
                    options.push(optionText.trim());
                }
            });
            questionData.options = options;
            break;
            
        case 'rating':
            questionData.maxRating = 5;
            break;
            
        case 'matrix':
            const rows = [];
            const columns = [];
            element.querySelectorAll('.matrix-row').forEach(row => {
                rows.push(row.textContent.trim());
            });
            element.querySelectorAll('.matrix-column').forEach(col => {
                columns.push(col.textContent.trim());
            });
            questionData.rows = rows;
            questionData.columns = columns;
            break;
    }
    
    return questionData;
}

/**
 * 检查用户登录状态
 */
function checkUserLoginStatus() {
    // 使用工具函数进行身份校验，要求管理员权限
    const userInfo = UTILS.checkAuth(1);
    if (userInfo) {
        // 显示用户信息
        UTILS.displayUserInfo(userInfo);
        // 绑定用户下拉菜单事件
        UTILS.bindUserDropdown();
    }
}

/**
 * 加载问卷信息
 */
function loadQuestionnaireInfo() {
    console.log('=== 开始加载问卷信息 ===');
    console.log('当前页面URL:', window.location.href);
    console.log('当前页面search:', window.location.search);

    // 优先从本地存储获取问卷ID
    let questionnaireId = localStorage.getItem('current_questionnaire_id');

    if (questionnaireId) {
        console.log('从本地存储获取到问卷ID:', questionnaireId);
    } else {
        // 如果本地存储没有，尝试从URL参数获取
        console.log('本地存储中没有问卷ID，尝试从URL参数获取');

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const encodedQuestionnaireId = urlParams.get('id');

            if (encodedQuestionnaireId) {
                questionnaireId = decodeURIComponent(encodedQuestionnaireId);
                console.log('成功从URL参数解析问卷ID:', questionnaireId);
            } else {
                console.log('URL中也没有找到id参数');
            }
        } catch (error) {
            console.error('URL参数解析失败:', error);
            // 尝试手动解析
            const search = window.location.search;
            const match = search.match(/[?&]id=([^&]*)/);
            if (match) {
                questionnaireId = decodeURIComponent(match[1]);
                console.log('手动解析成功:', questionnaireId);
            }
        }
    }

    console.log('最终获取的问卷ID:', questionnaireId);
    console.log('问卷ID类型:', typeof questionnaireId);

    if (questionnaireId) {
        // 如果有问卷ID，从后端获取问卷信息
        console.log('调用后端接口获取问卷信息');
        fetchQuestionnaireFromBackend(questionnaireId);
    } else {
        // 如果没有问卷ID，显示错误信息并跳转
        showErrorMessage('缺少问卷ID，请从正确的入口访问问卷编辑器');
        // 可以选择跳转到问卷列表页面或创建页面
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
}

/**
 * 从后端获取问卷信息
 */
async function fetchQuestionnaireFromBackend(questionnaireId) {
    try {
        console.log('正在获取问卷信息，ID:', questionnaireId);
        const baseUrl = UTILS.getApiUrl(CONFIG.API_ENDPOINTS.QUESTIONNAIRE_GETINFOBYID);
        const separator = baseUrl.includes('?') ? '&' : '?';
        const apiUrl = baseUrl + separator + `id=${questionnaireId}`;
        console.log('API URL:', apiUrl);

        const response = await fetch(apiUrl);
        const result = await response.json();

        console.log('API响应结果:', result);

        if (result.code === 200 && result.data) {
            const questionnaire = result.data; // 问卷数据
            const creatorName = result.userInfo;   // 创建人用户名

            // 合并数据
            const fullQuestionnaire = {
                ...questionnaire,
                creatorName: creatorName
            };
            displayQuestionnaireInfo(fullQuestionnaire);
        } else {
            console.error('获取问卷信息失败:', result.message);
            console.error('响应数据:', result);
            // 如果后端获取失败，显示错误信息
            showErrorMessage('网络问题，。请检查网络连接');
        }
    } catch (error) {
        console.error('获取问卷信息时发生错误:', error);
        console.error('错误详情:', error.message);
        // 如果网络错误，显示错误信息
        showErrorMessage('网络连接错误，请检查网络连接后重试');
    }
}



/**
 * 显示问卷信息
 */
function displayQuestionnaireInfo(questionnaire) {
    // 更新问卷标题
    const titleElement = document.getElementById('questionnaire-title');
    if (titleElement && questionnaire.title) {
        titleElement.textContent = questionnaire.title;
    }

    // 更新问卷描述
    const descriptionElement = document.getElementById('questionnaire-description-display');
    if (descriptionElement && questionnaire.description) {
        descriptionElement.textContent = questionnaire.description;
    }

    // 更新开始日期
    const startDateElement = document.getElementById('start-date');
    if (startDateElement && questionnaire.startDate) {
        startDateElement.textContent = questionnaire.startDate;
    }

    // 更新结束日期
    const endDateElement = document.getElementById('end-date');
    if (endDateElement && questionnaire.endDate) {
        endDateElement.textContent = questionnaire.endDate;
    }

    // 更新创建人信息
    const creatorElement = document.getElementById('creator-name-display');
    if (creatorElement) {
        if (questionnaire.creatorName) {
            creatorElement.textContent = questionnaire.creatorName;
        } else {
            creatorElement.textContent = '未知用户';
        }
    }

    // 清除本地存储中的问卷ID，避免影响后续使用
    localStorage.removeItem('current_questionnaire_id');
    console.log('已清除本地存储中的问卷ID');

    console.log('问卷信息已加载:', questionnaire);
}

/**
 * 显示错误信息
 */
function showErrorMessage(message) {
    // 创建错误提示元素
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #dc3545;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(220, 53, 69, 0.3);
        z-index: 10000;
        text-align: center;
        max-width: 400px;
        font-weight: 500;
    `;

    errorContainer.innerHTML = `
        <div style="margin-bottom: 10px;">
            <i style="font-size: 24px;">⚠️</i>
        </div>
        <div style="margin-bottom: 15px;">${message}</div>
        <div style="font-size: 14px; opacity: 0.8;">页面将在3秒后自动跳转...</div>
    `;

    document.body.appendChild(errorContainer);

    // 3秒后自动移除
    setTimeout(() => {
        if (errorContainer.parentNode) {
            errorContainer.parentNode.removeChild(errorContainer);
        }
    }, 3000);
}