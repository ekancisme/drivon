package Drivon.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "owner_wallet")
public class OwnerWallet {
    @Id
    private Long ownerId; // user_id của chủ xe

    private Double totalProfit = 0.0;
    private Double totalDebt = 0.0;
    private Double balance = 0.0;
    private String accountNumber;
    private String bankName;
    private LocalDateTime updatedAt = LocalDateTime.now();
} 