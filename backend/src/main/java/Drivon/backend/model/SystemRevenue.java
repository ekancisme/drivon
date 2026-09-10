package Drivon.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "system_revenue")
public class SystemRevenue {
    
    @Id
    private Long id;
    
    private String transactionType; // REVENUE_IN, REVENUE_OUT, DEBT_CREATED, DEBT_COLLECTED
    private String paymentMethod; // BANK, CASH
    private Double amount;
    private Long ownerId;
    private Integer bookingId;
    private String paymentId;
    private String description;
    private LocalDateTime transactionDate;
    private LocalDateTime createdAt;
    private String status; // CONFIRMED, PENDING, CANCELLED
    
    // Default constructor
    public SystemRevenue() {
        this.createdAt = LocalDateTime.now();
        this.transactionDate = LocalDateTime.now();
        this.status = "CONFIRMED";
    }
    
    // Constructor with required fields
    public SystemRevenue(String transactionType, String paymentMethod, Double amount, Long ownerId, String description) {
        this();
        this.transactionType = transactionType;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.ownerId = ownerId;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public Integer getBookingId() {
        return bookingId;
    }

    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "SystemRevenue{" +
                "id=" + id +
                ", transactionType='" + transactionType + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", amount=" + amount +
                ", ownerId=" + ownerId +
                ", description='" + description + '\'' +
                ", transactionDate=" + transactionDate +
                ", status='" + status + '\'' +
                '}';
    }
} 