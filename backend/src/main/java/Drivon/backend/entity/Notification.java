package Drivon.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {
    @Id
    private Long notificationId;

    private String content;
    private NotificationType type;
    private TargetType targetType;
    private Long targetUserId;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NotificationType {
        SYSTEM,     // Thông báo hệ thống
        PROMO       // Khuyến mãi
    }

    public enum TargetType {
        ALL_USERS,      // Tất cả người dùng
        OWNER_ONLY,     // Chỉ chủ xe
        USER_SPECIFIC,  // Người dùng cụ thể
        ADMIN_ONLY      // Chỉ admin
    }

    // Constructors
    public Notification() {
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String content, NotificationType type, TargetType targetType) {
        this.content = content;
        this.type = type;
        this.targetType = targetType;
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String content, NotificationType type, TargetType targetType, Long targetUserId) {
        this.content = content;
        this.type = type;
        this.targetType = targetType;
        this.targetUserId = targetUserId;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getNotificationId() { return notificationId; }
    public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    
    public TargetType getTargetType() { return targetType; }
    public void setTargetType(TargetType targetType) { this.targetType = targetType; }
    
    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 