package Drivon.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Document(collection = "conversations")
@Data
public class Conversation {
    @Id
    private Long conversation_id;

    private Long user1_id;
    private Long user2_id;
    private LocalDateTime created_at = LocalDateTime.now();
}