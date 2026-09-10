package Drivon.backend.repository;

import Drivon.backend.model.Promotion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PromotionRepository extends MongoRepository<Promotion, Long> {
    Optional<Promotion> findByCode(String code);
} 