package Drivon.backend.repository;

import Drivon.backend.model.Contract;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContractRepository extends MongoRepository<Contract, Long> {
    List<Contract> findByCustomerId(String customerId);
    List<Contract> findByCarIdOrderByIdDesc(String carId);
    List<Contract> findByStatus(String status);
}