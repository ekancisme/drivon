package Drivon.backend.repository;

import Drivon.backend.model.CarImage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarImageRepository extends MongoRepository<CarImage, Long> {
    List<CarImage> findByCarId(String carId);
    List<CarImage> findByCarIdAndType(String carId, String type);
    void deleteByCarId(String carId);
} 