package Drivon.backend.repository;

import Drivon.backend.entity.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, Long> {

    @Query("{$or: [ {user1_id: ?0, user2_id: ?1}, {user1_id: ?1, user2_id: ?0} ]}")
    Optional<Conversation> findConversationBetweenUsers(Long userId1, Long userId2);

    @Query("{$or: [ {user1_id: ?0}, {user2_id: ?0} ]}")
    List<Conversation> findConversationsByUserId(Long userId);

    default Optional<Conversation> findConversationBetweenUsersNative(Long userId1, Long userId2) {
        return findConversationBetweenUsers(userId1, userId2);
    }
}