package Drivon.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "user_image")
public class UserImage {
    @Id
    private Long imageId;

    private User user;
    private String imageUrl;
    private DocumentType documentType;
    private String description;
    private LocalDateTime uploadedAt = LocalDateTime.now();
    private boolean verified = false;

    public DocumentType getDocumentType() {
        return documentType;
    }

    public enum DocumentType {
        cccd, license, passport, other
    }
} 