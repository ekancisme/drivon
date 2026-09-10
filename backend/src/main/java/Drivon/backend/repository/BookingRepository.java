package Drivon.backend.repository;

import Drivon.backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, Integer> {
    List<Booking> findByCarLicensePlate(String licensePlate);
    List<Booking> findByCarOwnerId(Integer ownerId);
}