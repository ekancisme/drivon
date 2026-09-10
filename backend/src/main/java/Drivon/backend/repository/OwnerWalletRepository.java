package Drivon.backend.repository;

import Drivon.backend.model.OwnerWallet;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OwnerWalletRepository extends MongoRepository<OwnerWallet, Long> {
    Optional<OwnerWallet> findByOwnerId(Long ownerId);
} 