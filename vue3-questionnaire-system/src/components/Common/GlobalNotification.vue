<template>
  <div class="global-notification">
    <!-- 通知抽屉 -->
    <a-drawer
      :open="showDrawer"
      title="通知中心"
      placement="right"
      width="400"
      :closable="true"
      @close="closeDrawer"
      @update:open="handleDrawerOpenChange"
    >
      <div class="notification-header">
        <div class="notification-stats">
          <span class="total-count">共 {{ notifications.length }} 条通知</span>
          <span class="unread-count" v-if="unreadCount > 0">
            {{ unreadCount }} 条未读
          </span>
        </div>

        <div class="notification-actions">
          <a-button size="small" @click="markAllAsRead">
            全部已读
          </a-button>
          <a-button size="small" danger @click="clearAll">
            清空
          </a-button>
        </div>
      </div>

      <div class="notification-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read }"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <component :is="getNotificationIcon(notification.type)" />
          </div>

          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">
              {{ formatTime(notification.timestamp) }}
            </div>
          </div>

          <div class="notification-actions">
            <a-button
              type="text"
              size="small"
              @click.stop="removeNotification(notification.id)"
            >
              <close-outlined />
            </a-button>
          </div>
        </div>

        <div v-if="notifications.length === 0" class="empty-notifications">
          <a-empty description="暂无通知" />
        </div>
      </div>
    </a-drawer>

    <!-- 通知图标 -->
    <div class="notification-trigger" @click="openDrawer">
      <a-badge :count="unreadCount" :offset="[-5, 5]">
        <a-button
          type="text"
          shape="circle"
          size="large"
          class="notification-btn"
        >
          <bell-outlined />
        </a-button>
      </a-badge>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  BellOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'

// 使用组合式API
const appStore = useAppStore()

// 计算属性
const notifications = computed(() => appStore.notifications)
const unreadCount = computed(() => appStore.unreadCount)
const showDrawer = computed({
  get: () => appStore.showNotificationDrawer,
  set: (value) => appStore.setNotificationDrawer(value)
})

// 获取通知图标
const getNotificationIcon = (type) => {
  const iconMap = {
    info: InfoCircleOutlined,
    success: CheckCircleOutlined,
    warning: ExclamationCircleOutlined,
    error: ExclamationCircleOutlined
  }
  return iconMap[type] || InfoCircleOutlined
}

// 格式化时间
const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time

  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return time.toLocaleDateString()
  }
}

// 打开抽屉
const openDrawer = () => {
  appStore.setNotificationDrawer(true)
}

// 关闭抽屉
const closeDrawer = () => {
  appStore.setNotificationDrawer(false)
}

// 处理抽屉打开状态变化
const handleDrawerOpenChange = (open) => {
  appStore.setNotificationDrawer(open)
}

// 标记为已读
const markAsRead = (id) => {
  appStore.markNotificationAsRead(id)
}

// 全部标记为已读
const markAllAsRead = () => {
  appStore.markAllNotificationsAsRead()
}

// 删除通知
const removeNotification = (id) => {
  appStore.removeNotification(id)
}

// 清空所有通知
const clearAll = () => {
  appStore.clearNotifications()
}

// 生命周期
onMounted(() => {
  // 可以在这里加载初始通知
})
</script>

<style scoped>
.global-notification {
  position: relative;
}

.notification-trigger {
  cursor: pointer;
}

.notification-btn {
  color: #666;
  transition: all 0.3s ease;
}

.notification-btn:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

/* 通知抽屉样式 */
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 16px;
}

.notification-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.total-count {
  font-size: 14px;
  color: #666;
}

.unread-count {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

/* 通知列表样式 */
.notification-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-item:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.notification-item.unread {
  border-color: #1890ff;
  background: #f0f8ff;
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #1890ff;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
  font-size: 14px;
}

.notification-message {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 8px;
  word-break: break-word;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-actions {
  flex-shrink: 0;
}

.empty-notifications {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .notification-actions {
    width: 100%;
    justify-content: stretch;
  }

  .notification-actions .ant-btn {
    flex: 1;
  }
}
</style>
