package Drivon.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Document(collection = "messages")
@Data
public class Message {
    @Id
    private Long message_id;

    private Long conversation_id;
    private Long sender_id;
    private String content;
    private LocalDateTime sent_at = LocalDateTime.now();
}