package Drivon.backend.repository;

import Drivon.backend.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, Long> {
    
    // Lấy tất cả thông báo
    List<Notification> findAllByOrderByCreatedAtDesc();
    
    // Lấy thông báo cho user cụ thể (dựa trên target_type và role của user)
    default List<Notification> findNotificationsForUser(Long userId, String userRole) {
        return findAllByOrderByCreatedAtDesc().stream()
                .filter(n -> {
                    if (n.getTargetType() == null || n.getTargetType() == Notification.TargetType.ALL_USERS) {
                        return true;
                    }
                    if (n.getTargetType() == Notification.TargetType.OWNER_ONLY && "owner".equalsIgnoreCase(userRole)) {
                        return true;
                    }
                    if (n.getTargetType() == Notification.TargetType.ADMIN_ONLY && "admin".equalsIgnoreCase(userRole)) {
                        return true;
                    }
                    if (n.getTargetType() == Notification.TargetType.USER_SPECIFIC && userId != null && userId.equals(n.getTargetUserId())) {
                        return true;
                    }
                    return false;
                })
                .collect(Collectors.toList());
    }
    
    // Lấy tất cả thông báo cho user (không phân biệt target_type hay role)
    default List<Notification> findAllNotificationsForUser() {
        return findAllByOrderByCreatedAtDesc();
    }
} 