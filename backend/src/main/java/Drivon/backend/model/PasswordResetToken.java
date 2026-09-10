package Drivon.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Calendar;
import java.util.Date;

@Document(collection = "password_reset_tokens")
public class PasswordResetToken {
    private static final int EXPIRATION = 60 * 24; // 24 hours
    
    @Id
    private Long id;
    
    private String token;
    private User user;
    private Date expiryDate;

    public PasswordResetToken() {
        this.expiryDate = calculateExpiryDate();
    }
    
    public PasswordResetToken(String token, User user) {
        this.token = token;
        this.user = user;
        this.expiryDate = calculateExpiryDate();
    }

    private Date calculateExpiryDate() {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.MINUTE, EXPIRATION);
        return cal.getTime();
    }

    public boolean isExpired() {
        return new Date().after(this.expiryDate);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Date getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }
} 