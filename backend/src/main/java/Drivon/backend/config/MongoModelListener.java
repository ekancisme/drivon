package Drivon.backend.config;

import Drivon.backend.model.*;
import Drivon.backend.entity.*;
import Drivon.backend.service.SequenceGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.stereotype.Component;

@Component
public class MongoModelListener extends AbstractMongoEventListener<Object> {

    @Autowired
    private SequenceGeneratorService sequenceGenerator;

    @Override
    public void onBeforeConvert(BeforeConvertEvent<Object> event) {
        Object source = event.getSource();
        if (source instanceof User) {
            User user = (User) source;
            if (user.getUserId() == null || user.getUserId() <= 0) {
                user.setUserId(sequenceGenerator.generateSequence("users_sequence"));
            }
        } else if (source instanceof Booking) {
            Booking booking = (Booking) source;
            if (booking.getId() <= 0) {
                booking.setId((int) sequenceGenerator.generateSequence("bookings_sequence"));
            }
        } else if (source instanceof Contract) {
            Contract contract = (Contract) source;
            if (contract.getId() == null || contract.getId() <= 0) {
                contract.setId(sequenceGenerator.generateSequence("contracts_sequence"));
            }
        } else if (source instanceof Review) {
            Review review = (Review) source;
            if (review.getId() == null || review.getId() <= 0) {
                review.setId(sequenceGenerator.generateSequence("reviews_sequence"));
            }
        } else if (source instanceof Payment) {
            Payment payment = (Payment) source;
            if (payment.getId() == null || payment.getId() <= 0) {
                payment.setId(sequenceGenerator.generateSequence("payments_sequence"));
            }
        } else if (source instanceof Notification) {
            Notification n = (Notification) source;
            if (n.getNotificationId() == null || n.getNotificationId() <= 0) {
                n.setNotificationId(sequenceGenerator.generateSequence("notifications_sequence"));
            }
        } else if (source instanceof Message) {
            Message m = (Message) source;
            if (m.getMessage_id() == null || m.getMessage_id() <= 0) {
                m.setMessage_id(sequenceGenerator.generateSequence("messages_sequence"));
            }
        } else if (source instanceof Conversation) {
            Conversation c = (Conversation) source;
            if (c.getConversation_id() == null || c.getConversation_id() <= 0) {
                c.setConversation_id(sequenceGenerator.generateSequence("conversations_sequence"));
            }
        } else if (source instanceof UserImage) {
            UserImage img = (UserImage) source;
            if (img.getImageId() == null || img.getImageId() <= 0) {
                img.setImageId(sequenceGenerator.generateSequence("user_images_sequence"));
            }
        } else if (source instanceof CarImage) {
            CarImage img = (CarImage) source;
            if (img.getImageId() == null || img.getImageId() <= 0) {
                img.setImageId(sequenceGenerator.generateSequence("car_images_sequence"));
            }
        } else if (source instanceof Promotion) {
            Promotion p = (Promotion) source;
            if (p.getPromo_id() == null || p.getPromo_id() <= 0) {
                p.setPromo_id(sequenceGenerator.generateSequence("promotions_sequence"));
            }
        } else if (source instanceof CancelRequest) {
            CancelRequest cr = (CancelRequest) source;
            if (cr.getId() == null || cr.getId() <= 0) {
                cr.setId(sequenceGenerator.generateSequence("cancel_requests_sequence"));
            }
        } else if (source instanceof OwnerWithdrawRequest) {
            OwnerWithdrawRequest owr = (OwnerWithdrawRequest) source;
            if (owr.getRequestId() == null || owr.getRequestId() <= 0) {
                owr.setRequestId(sequenceGenerator.generateSequence("owner_withdraw_requests_sequence"));
            }
        } else if (source instanceof SystemRevenue) {
            SystemRevenue sr = (SystemRevenue) source;
            if (sr.getId() == null || sr.getId() <= 0) {
                sr.setId(sequenceGenerator.generateSequence("system_revenues_sequence"));
            }
        } else if (source instanceof EmailVerificationToken) {
            EmailVerificationToken evt = (EmailVerificationToken) source;
            if (evt.getId() == null || evt.getId() <= 0) {
                evt.setId(sequenceGenerator.generateSequence("email_verification_tokens_sequence"));
            }
        } else if (source instanceof PasswordResetToken) {
            PasswordResetToken prt = (PasswordResetToken) source;
            if (prt.getId() == null || prt.getId() <= 0) {
                prt.setId(sequenceGenerator.generateSequence("password_reset_tokens_sequence"));
            }
        }
    }
}