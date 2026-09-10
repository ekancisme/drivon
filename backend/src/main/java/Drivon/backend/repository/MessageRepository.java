package Drivon.backend.repository;

import Drivon.backend.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, Long> {

    @Query(value = "{conversation_id: ?0}", sort = "{sent_at: 1}")
    List<Message> findMessagesByConversationId(Long conversationId);

    @Query(value = "{conversation_id: ?0}", sort = "{sent_at: -1}")
    List<Message> findLatestMessagesByConversationId(Long conversationId, Pageable pageable);

    @Query(value = "{conversation_id: ?0, sender_id: {$ne: ?1}, message_id: {$gt: ?2}}", count = true)
    Long countUnreadMessagesInConversation(Long conversationId, Long userId, Long lastSeenMessageId);
}