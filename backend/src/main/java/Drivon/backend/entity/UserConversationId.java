package Drivon.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserConversationId implements Serializable {
    private Long user_id;
    private Long conversation_id;
}