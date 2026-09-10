package Drivon.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "payments")
public class Payment {
    @Id
    private Long id;

    private String paymentId;
    private String orderCode;
    private Double amount;
    private String status;
    private String paymentMethod;
    private LocalDateTime paymentDate;
    private Long userId;
    private String carId;
    private String additionalRequirements;
    private LocalDateTime rentalStartDate;
    private LocalDateTime rentalEndDate;
    private LocalDateTime createdAt = LocalDateTime.now();
    private String promotionCode;
    private Integer discountPercent;
    private Integer bookingId;
}