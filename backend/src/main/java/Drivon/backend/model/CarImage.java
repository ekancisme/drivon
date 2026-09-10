package Drivon.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Document(collection = "car_images")
@Data
@Getter
@Setter
public class CarImage {
    @Id
    private Long imageId;

    private String carId;
    private String imageUrl;
    private String type; // car_image, cavet

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
} 