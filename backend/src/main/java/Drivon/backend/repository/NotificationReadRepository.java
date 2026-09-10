package Drivon.backend.repository;

import Drivon.backend.entity.NotificationRead;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public interface NotificationReadRepository extends MongoRepository<NotificationRead, String> {
    
    Optional<NotificationRead> findByNotificationIdAndUserId(Long notificationId, Long userId);
    
    List<NotificationRead> findByUserId(Long userId);
    
    default List<Long> findReadNotificationIdsByUserId(Long userId) {
        return findByUserId(userId).stream()
                .map(NotificationRead::getNotificationId)
                .collect(Collectors.toList());
    }
    
    default Long countReadNotificationsByUserId(Long userId) {
        return (long) findByUserId(userId).size();
    }
    
    void deleteByUserId(Long userId);
    
    void deleteByNotificationId(Long notificationId);
} 