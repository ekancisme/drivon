package Drivon.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import Drivon.backend.model.PasswordResetToken;
import Drivon.backend.model.User;

@Repository
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, Long> {
    PasswordResetToken findByToken(String token);
    PasswordResetToken findByUser(User user);
    void deleteByUser(User user);
} 