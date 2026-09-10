package Drivon.backend.repository;

import Drivon.backend.model.User;
import Drivon.backend.model.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByResetPasswordToken(String token);
    List<User> findByRole(UserRole role);
} 