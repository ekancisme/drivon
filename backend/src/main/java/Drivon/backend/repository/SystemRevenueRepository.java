package Drivon.backend.repository;

import Drivon.backend.model.SystemRevenue;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemRevenueRepository extends MongoRepository<SystemRevenue, Long> {
    
    List<SystemRevenue> findByTransactionTypeAndPaymentMethodAndStatus(String transactionType, String paymentMethod, String status);
    
    List<SystemRevenue> findByTransactionTypeAndStatus(String transactionType, String status);
    
    List<SystemRevenue> findByTransactionTypeInAndStatusAndTransactionDateBetween(List<String> types, String status, LocalDateTime start, LocalDateTime end);
    
    List<SystemRevenue> findByOwnerIdOrderByTransactionDateDesc(Long ownerId);
    
    List<SystemRevenue> findByTransactionTypeOrderByTransactionDateDesc(String transactionType);
    
    List<SystemRevenue> findByTransactionDateBetweenOrderByTransactionDateDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    boolean existsByBookingIdAndTransactionType(Integer bookingId, String transactionType);
    
    List<SystemRevenue> findByPaymentId(String paymentId);

    // Default calculation methods using Java streams
    default Double getTotalActualRevenue() {
        return findByTransactionTypeAndPaymentMethodAndStatus("REVENUE_IN", "BANK", "CONFIRMED").stream()
                .mapToDouble(sr -> sr.getAmount() != null ? sr.getAmount() : 0.0)
                .sum();
    }
    
    default Double getTotalUnpaidDebt() {
        return findByTransactionTypeAndStatus("DEBT_CREATED", "CONFIRMED").stream()
                .mapToDouble(sr -> sr.getAmount() != null ? sr.getAmount() : 0.0)
                .sum();
    }
    
    default Double getTotalCollectedDebt() {
        return findByTransactionTypeAndStatus("DEBT_COLLECTED", "CONFIRMED").stream()
                .mapToDouble(sr -> sr.getAmount() != null ? sr.getAmount() : 0.0)
                .sum();
    }
    
    default Double getTotalExpenses() {
        return findByTransactionTypeAndStatus("REVENUE_OUT", "CONFIRMED").stream()
                .mapToDouble(sr -> sr.getAmount() != null ? sr.getAmount() : 0.0)
                .sum();
    }
    
    default Double getMonthlyRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        return findByTransactionTypeInAndStatusAndTransactionDateBetween(List.of("REVENUE_IN", "DEBT_COLLECTED"), "CONFIRMED", startDate, endDate).stream()
                .mapToDouble(sr -> sr.getAmount() != null ? sr.getAmount() : 0.0)
                .sum();
    }

    default List<SystemRevenue> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return findByTransactionDateBetweenOrderByTransactionDateDesc(startDate, endDate);
    }
} 