package Drivon.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notification_reads")
public class NotificationRead {
    
    @Id
    private String id;
    
    private Long notificationId;
    private Long userId;
    private LocalDateTime readAt;
    
    // Constructors
    public NotificationRead() {
        this.readAt = LocalDateTime.now();
    }
    
    public NotificationRead(Long notificationId, Long userId) {
        this.id = notificationId + "_" + userId;
        this.notificationId = notificationId;
        this.userId = userId;
        this.readAt = LocalDateTime.now();
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    // Getters and setters
    public Long getNotificationId() { return notificationId; }
    public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
} 