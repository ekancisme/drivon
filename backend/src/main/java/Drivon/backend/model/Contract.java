package Drivon.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Data
@Getter
@Setter
@Document(collection = "contract_partners")
public class Contract {
    @Id
    private Long id;

    private String contractNumber;
    private String carId;
    private String customerId;
    private Double deposit;
    private String status;
    private String name;
    private String phone;
    private String email;
    private Double pricePerDay;
    private LocalDateTime createdAt = LocalDateTime.now();
}