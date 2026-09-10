package Drivon.backend.repository;

import Drivon.backend.model.OwnerWithdrawRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OwnerWithdrawRequestRepository extends MongoRepository<OwnerWithdrawRequest, Long> {
    List<OwnerWithdrawRequest> findByOwnerIdOrderByRequestedAtDesc(Long ownerId);
} 