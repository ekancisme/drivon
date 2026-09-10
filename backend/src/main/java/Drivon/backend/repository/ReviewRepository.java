package Drivon.backend.repository;

import Drivon.backend.model.Booking;
import Drivon.backend.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, Long> {
    List<Review> findByBookingIn(List<Booking> bookings);
    List<Review> findByBookingCarLicensePlate(String licensePlate);
    List<Review> findByBookingCarOwnerId(Integer ownerId);
    List<Review> findByReviewerUserId(Long reviewerId);

    default List<Review> findByCarOwnerId(Integer ownerId) {
        return findByBookingCarOwnerId(ownerId);
    }

    default List<Review> findByReviewerId(Long reviewerId) {
        return findByReviewerUserId(reviewerId);
    }
} 