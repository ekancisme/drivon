package Drivon.backend.repository;

import Drivon.backend.model.Car;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarRepository extends MongoRepository<Car, String> {
    List<Car> findByOwnerId(Integer ownerId);
    List<Car> findByOwnerId(Long ownerId);
    List<Car> findByStatus(String status);
    List<Car> findByLicensePlateIn(List<String> licensePlates);
}