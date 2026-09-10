package Drivon.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;

@Data
@Document(collection = "owner_withdraw_requests")
public class OwnerWithdrawRequest {
    @Id
    private Long requestId;

    private Long ownerId;
    private Double amount;
    private String status; // pending, approved, rejected, completed
    private Date requestedAt;
    private Date processedAt;
    private String note;
    private Boolean sign = false;
} 