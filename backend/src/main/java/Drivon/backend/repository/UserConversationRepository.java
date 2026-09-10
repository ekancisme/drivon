package Drivon.backend.repository;

import Drivon.backend.entity.UserConversation;
import Drivon.backend.entity.UserConversationId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserConversationRepository extends MongoRepository<UserConversation, UserConversationId> {

    @Query("{ 'id.user_id': ?0, 'is_deleted': false }")
    List<UserConversation> findActiveConversationsByUserId(Long userId);

    @Query("{ 'id.conversation_id': ?0, 'is_deleted': false }")
    List<UserConversation> findActiveUsersByConversationId(Long conversationId);

    @Query("{ 'id.user_id': ?0, 'id.conversation_id': ?1 }")
    Optional<UserConversation> findByUserIdAndConversationId(Long userId, Long conversationId);

    default void updateLastSeenMessage(Long userId, Long conversationId, Long messageId) {
        findByUserIdAndConversationId(userId, conversationId).ifPresent(uc -> {
            uc.setLast_seen_message_id(messageId);
            save(uc);
        });
    }

    default void markAsDeleted(Long userId, Long conversationId) {
        findByUserIdAndConversationId(userId, conversationId).ifPresent(uc -> {
            uc.setIs_deleted(true);
            save(uc);
        });
    }
}