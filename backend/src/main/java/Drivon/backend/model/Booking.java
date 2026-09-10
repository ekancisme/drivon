package Drivon.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    private int id;

    private User renter;
    private Car car;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String pickupLocation;
    private String dropoffLocation;
    private BookingStatus status;
    private double totalPrice;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    @JsonIgnore
    private String paymentStatus;

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public int getId() {
        return id;
    }
    public Car getCar() {
        return car;
    }

    public User getRenter() {
        return renter;
    }

    @Override
    public String toString() {
        return "Booking{" +
                "id=" + id +
                ", status=" + status +
                ", renterId=" + (renter != null ? renter.getUserId() : null) +
                ", carId=" + (car != null ? car.getLicensePlate() : null) +
                '}';
    }

    public enum BookingStatus {
        pending,
        approved,
        cancelled,
        ongoing,
        completed
    }
}