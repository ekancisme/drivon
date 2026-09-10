package Drivon.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "cancel_request")
public class CancelRequest {
    @Id
    private Long id;

    private Booking booking;
    private User requester;
    private LocalDateTime requestedAt = LocalDateTime.now();
    private Status status = Status.PENDING;
    private LocalDateTime processedAt;

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED
    }
} 