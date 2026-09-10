package Drivon.backend.repository;

import Drivon.backend.model.UserImage;
import Drivon.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserImageRepository extends MongoRepository<UserImage, Long> {
    List<UserImage> findByUser(User user);
    List<UserImage> findByDocumentTypeAndVerified(UserImage.DocumentType documentType, boolean verified);
    List<UserImage> findByVerified(boolean verified);
    List<UserImage> findByUserUserId(Long userId);
} 