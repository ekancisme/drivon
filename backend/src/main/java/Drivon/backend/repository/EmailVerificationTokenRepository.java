package Drivon.backend.repository;

import Drivon.backend.model.EmailVerificationToken;
import Drivon.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailVerificationTokenRepository extends MongoRepository<EmailVerificationToken, Long> {
    EmailVerificationToken findByToken(String token);

    EmailVerificationToken findByUser(User user);
}