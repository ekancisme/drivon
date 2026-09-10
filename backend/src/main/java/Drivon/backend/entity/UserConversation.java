package Drivon.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Document(collection = "user_conversations")
@Data
public class UserConversation {
    @Id
    private UserConversationId id;

    private Long last_seen_message_id;
    private Boolean is_deleted = false;
    private LocalDateTime joined_at = LocalDateTime.now();
}