package Drivon.backend.config;

import Drivon.backend.model.*;
import Drivon.backend.model.Car.FuelType;
import Drivon.backend.model.Car.Transmission;
import Drivon.backend.repository.*;
import Drivon.backend.service.SequenceGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Component
public class MongoDataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private CarImageRepository carImageRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private OwnerWalletRepository ownerWalletRepository;

    @Autowired
    private SequenceGeneratorService sequenceGeneratorService;

    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            seedData();
            sequenceGeneratorService.initSequenceIfLess("users_sequence", 20L);
            sequenceGeneratorService.initSequenceIfLess("bookings_sequence", 20L);
            sequenceGeneratorService.initSequenceIfLess("contracts_sequence", 20L);
            sequenceGeneratorService.initSequenceIfLess("reviews_sequence", 20L);
            sequenceGeneratorService.initSequenceIfLess("payments_sequence", 20L);
            sequenceGeneratorService.initSequenceIfLess("promotions_sequence", 20L);
            sequenceGeneratorService.initSequenceIfLess("notifications_sequence", 20L);
            sequenceGeneratorService.initSequenceIfLess("messages_sequence", 20L);
            sequenceGeneratorService.initSequenceIfLess("conversations_sequence", 20L);
            sequenceGeneratorService.initSequenceIfLess("user_images_sequence", 20L);
            sequenceGeneratorService.initSequenceIfLess("car_images_sequence", 100L);
        } catch (Exception e) {
            System.err.println("Error during MongoDB data seeding: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void seedData() {
        if (userRepository.count() > 0) {
            System.out.println("MongoDB already contains users. Skipping seed.");
            return;
        }

        System.out.println("Starting MongoDB data seeding from db.sql...");

        String defaultPassHash = ".uXAYvd6UMTmdOdOVsyHTlxt8r9KB1GCMzP9vrUyELMhK"; // default test pass

        // 1. Users
        User u1 = new User();
        u1.setUserId(1L);
        u1.setEmail("lethecuong2k4@gmail.com");
        u1.setPhone("0335247117");
        u1.setPassword(defaultPassHash);
        u1.setFullName("Lê Thế Cường");
        u1.setAvatarUrl("https://res.cloudinary.com/dxhcqas4b/image/upload/v1749884082/cokt9korpzgng9oqpdxm.jpg");
        u1.setAddress("55 Lê Thiện Trị, Ngũ Hành Sơn, Đà Nẵng");
        u1.setRole(UserRole.admin);
        u1.setStatus(UserStatus.active);
        u1.setEmailVerified(true);
        u1.setGoogleId("116249314416777410764");
        userRepository.save(u1);

        User u2 = new User();
        u2.setUserId(2L);
        u2.setEmail("vantdde180061@fpt.edu.vn");
        u2.setPhone("0375277717");
        u2.setPassword(".uM1n.T8Z7Otnzg3i02wePmkyUyVgQb6Kbnu2");
        u2.setFullName("To Dinh Van (K18 DN)");
        u2.setRole(UserRole.admin);
        u2.setStatus(UserStatus.active);
        u2.setEmailVerified(true);
        u2.setGoogleId("103036093340334673905");
        userRepository.save(u2);

        User u3 = new User();
        u3.setUserId(3L);
        u3.setEmail("lethecuong2k4@gmail.com");
        u3.setPassword(defaultPassHash);
        u3.setFullName("Cường");
        u3.setAvatarUrl("https://res.cloudinary.com/dxhcqas4b/image/upload/v1749884082/cokt9korpzgng9oqpdxm.jpg");
        u3.setRole(UserRole.admin);
        u3.setStatus(UserStatus.active);
        u3.setEmailVerified(true);
        u3.setGoogleId("102928243161293663830");
        userRepository.save(u3);

        User u4 = new User();
        u4.setUserId(4L);
        u4.setEmail("cuongltde180006@fpt.edu.vn");
        u4.setPassword(defaultPassHash);
        u4.setFullName("Le The Cuong (K18 DN)");
        u4.setRole(UserRole.renter);
        u4.setStatus(UserStatus.active);
        u4.setEmailVerified(true);
        u4.setGoogleId("114901012144518341837");
        userRepository.save(u4);

        User u5 = new User();
        u5.setUserId(5L);
        u5.setEmail("cuongltfpt2k4@gmail.com");
        u5.setPassword(defaultPassHash);
        u5.setFullName("Thế Lê");
        u5.setRole(UserRole.owner);
        u5.setStatus(UserStatus.active);
        u5.setEmailVerified(true);
        u5.setGoogleId("111904973384188486259");
        userRepository.save(u5);

        User u6 = new User();
        u6.setUserId(6L);
        u6.setEmail("quanhk1402@gmail.com");
        u6.setPassword(defaultPassHash);
        u6.setFullName("Minh Quân Phạm");
        u6.setAvatarUrl("https://res.cloudinary.com/dxhcqas4b/image/upload/v1749917040/fsy4kibujoewhmy8zgxy.jpg");
        u6.setRole(UserRole.owner);
        u6.setStatus(UserStatus.active);
        u6.setEmailVerified(true);
        u6.setGoogleId("112552544055062048391");
        userRepository.save(u6);

        User u7 = new User();
        u7.setUserId(7L);
        u7.setEmail("de180022tranbinhvuong@gmail.com");
        u7.setPassword(defaultPassHash);
        u7.setFullName("TRẦN BÌNH VƯƠNG");
        u7.setRole(UserRole.renter);
        u7.setStatus(UserStatus.active);
        u7.setEmailVerified(true);
        u7.setGoogleId("104228653661157612088");
        userRepository.save(u7);

        User u8 = new User();
        u8.setUserId(8L);
        u8.setEmail("tranbinhvuong123456@gmail.com");
        u8.setPassword(defaultPassHash);
        u8.setFullName("Vương Trần Bình");
        u8.setAvatarUrl("https://res.cloudinary.com/dxhcqas4b/image/upload/v1749966020/tozlrafxdgiwlxtrzvy6.jpg");
        u8.setRole(UserRole.renter);
        u8.setStatus(UserStatus.active);
        u8.setEmailVerified(true);
        u8.setGoogleId("113138118160119322378");
        userRepository.save(u8);

        User u9 = new User();
        u9.setUserId(9L);
        u9.setEmail("binhvuong6868999@gmail.com");
        u9.setPhone("0394672255");
        u9.setPassword(".8BaveDgEVp1dUnxtPMKT6llG");
        u9.setFullName("Trần Bình Vương");
        u9.setAddress("xóm 4, nghi lâm, nghi lộc");
        u9.setRole(UserRole.renter);
        u9.setStatus(UserStatus.active);
        u9.setEmailVerified(true);
        userRepository.save(u9);

        // Owner wallets
        for (Long oId : List.of(1L, 3L, 5L, 6L)) {
            OwnerWallet w = new OwnerWallet();
            w.setOwnerId(oId);
            w.setBalance(5000000.0);
            w.setTotalProfit(5000000.0);
            w.setTotalDebt(0.0);
            w.setAccountNumber("0335247117");
            w.setBankName("MB Bank");
            ownerWalletRepository.save(w);
        }

        // 2. Cars
        saveCar("37A40262", 1, "Kia", "sportage", 2024, 5, "available", "suv", Transmission.automatic, FuelType.gasoline, 8.0, "màu xanh rêu", "Nghệ An", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750004763/gved8wcyporhcyrjeuao.webp");
        saveCar("38A1234", 1, "Toyota", "Camry", 2019, 5, "available", "sedan", Transmission.automatic, FuelType.gasoline, 5.8, "Xe Camry cụ", "Hà Tĩnh", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914635/nqvrsmjhqgdhksrivdln.png");
        saveCar("38A1235", 1, "Kia", "Morning", 2018, 4, "available", "hatchback", Transmission.manual, FuelType.gasoline, 5.0, "Xe Kia Morning", "Hà Tĩnh", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914830/kdrn4tpqtthyrj7t8yt9.jpg");
        saveCar("38A14204", 1, "Toyota", "Vios", 2016, 5, "available", "sedan", Transmission.manual, FuelType.gasoline, 5.8, "Xe Vios G đời 2016", "Hà Tĩnh", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750032835/zocfjex3xv7kho94cnqu.jpg");
        saveCar("43A99900", 1, "Ford", "Raptor", 2024, 4, "available", "pickup", Transmission.automatic, FuelType.diesel, 10.0, "màu đen, độ cản", "TP HCM", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749966332/sn2euer3rd66bb5e92kj.jpg");
        saveCar("43A99995", 1, "BMW", "750i M sport", 2024, 4, "available", "sedan", Transmission.automatic, FuelType.gasoline, 10.0, "màu đen", "TP HCM", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914582/g6dhh5gi1anvcydc22tt.jpg");
        saveCar("43A99997", 1, "VinFast", "Vf9", 2024, 7, "available", "suv", Transmission.automatic, FuelType.electric, 10.0, "màu xám", "Hạ Long", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914214/kltcz77lx55pdpmdhb8w.jpg");
        saveCar("43A99998", 1, "Toyota", "Camry", 2024, 4, "available", "sedan", Transmission.automatic, FuelType.gasoline, 9.9, "màu đen", "Hà Nội", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914025/zpj6asnw0xuqrluyke8c.jpg");
        saveCar("43A99999", 1, "Ford", "Everest", 2024, 7, "available", "suv", Transmission.automatic, FuelType.gasoline, 9.0, "màu đen", "Đà Nẵng", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750038127/lehjtzxzx3d2abrhusdj.png");
        saveCar("79A13334", 1, "Toyota", "Vios", 2022, 5, "available", "sedan", Transmission.automatic, FuelType.gasoline, 5.0, "Màu trắng", "Khánh Hòa", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749922416/jpvagdeke5ofmugmsct8.webp");
        saveCar("79A13337", 1, "Hyundai", "Sonata", 2025, 5, "available", "sedan", Transmission.automatic, FuelType.gasoline, 10.0, "Màu trắng", "Khánh Hòa", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749959652/ryetlxpk1tk9lw4s7tzx.png");

        // 3. Car Images
        saveCarImg(1L, "43A99998", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914037/upxoj1sjldp18097pppy.jpg");
        saveCarImg(2L, "43A99998", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914036/wnypodctmjpquvnesuer.jpg");
        saveCarImg(3L, "43A99998", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914036/cci3vuytvvvhpkgpa0ht.jpg");
        saveCarImg(4L, "43A99997", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914272/anqvwhnnztpmkat7l60y.jpg");
        saveCarImg(5L, "43A99997", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914272/lhhftbt4nmtcqvdlua69.jpg");
        saveCarImg(6L, "43A99997", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914278/a4yglywjnjaqpyhgxfmv.png");
        saveCarImg(7L, "43A99995", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914592/jdsctulayfhtvvppl3vo.jpg");
        saveCarImg(8L, "43A99995", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914592/jgin114aapqy9wgz4xzo.jpg");
        saveCarImg(9L, "43A99995", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914592/czxbn96hskdrly7ai9mk.webp");
        saveCarImg(10L, "38A1235", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914840/zekorazqfu1rurfjvcrb.png");
        saveCarImg(11L, "38A1235", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914850/r35fhdsxg7vsjeodja8s.jpg");
        saveCarImg(12L, "38A1235", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914840/ldvvdwmsjdhusohfyme1.jpg");
        saveCarImg(13L, "79A13334", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749922420/zrdrpsfhdqdkc4vgxd7j.jpg");
        saveCarImg(14L, "79A13334", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749922422/jngfegeq7pz3y9tu0rxo.jpg");
        saveCarImg(15L, "79A13334", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749922425/qgrbaxdkbxuwibmtqpta.jpg");
        saveCarImg(16L, "79A13337", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749959657/bu4q8swrme1ys9vnf9yw.jpg");
        saveCarImg(17L, "79A13337", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749959661/pom1pmotctlbjqouam9u.jpg");
        saveCarImg(18L, "43A99900", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749966338/ql5so35rj9h6has638xd.jpg");
        saveCarImg(19L, "43A99900", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749966338/u86ezut7sa4hpyvco8yw.jpg");
        saveCarImg(20L, "43A99900", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1749966338/vdwaaxjymhmtm9gnmfhp.jpg");
        saveCarImg(21L, "37A40262", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750004971/bu8sibdocnd61aycmfla.png");
        saveCarImg(22L, "37A40262", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750004980/ic09xl9wznagpea4yk4u.jpg");
        saveCarImg(23L, "37A40262", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750004988/iqqer4nx4f50jxtb3mgz.png");
        saveCarImg(24L, "38A14204", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750032835/zocfjex3xv7kho94cnqu.jpg");
        saveCarImg(25L, "38A14204", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750032842/uhry5lej3caqowz8z0zn.jpg");
        saveCarImg(26L, "38A14204", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750032849/mabossmctasiofb9rzaw.jpg");
        saveCarImg(27L, "38A1234", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750034874/txxn4syf8cj7yv48kamd.jpg");
        saveCarImg(28L, "38A1234", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750034880/wladsqabup81eaft5j6t.jpg");
        saveCarImg(29L, "38A1234", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750034891/hmzbqvcui3ty5we9vfi5.jpg");
        saveCarImg(30L, "43A99999", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750037253/h01rrcdxadk3uh0c5qfp.png");
        saveCarImg(31L, "43A99999", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750037264/x9aqgmi1wergnfyum75e.png");
        saveCarImg(32L, "43A99999", "https://res.cloudinary.com/dxhcqas4b/image/upload/v1750038234/k82gfputzkzdaxwrfajl.jpg");

        // 4. Contract Partners
        saveContract(1L, "HD202506140049", "37A40262", "1", 0.0, "ACTIVE_LEASE", "LÊ THẾ CƯỜNG", "0335247117", "lethecuong2k4@gmail.com", 500000.0);
        saveContract(2L, "HD202506146073", "38A1234", "1", 500000.0, "ACTIVE_LEASE", "LÊ THẾ CƯỜNG", "0335247117", "lethecuong2k4@gmail.com", 1000000.0);
        saveContract(3L, "HD202506149104", "38A1235", "1", 500000.0, "ACTIVE_LEASE", "LÊ THẾ CƯỜNG", "0335247117", "lethecuong2k4@gmail.com", 1000000.0);
        saveContract(4L, "HD202506144270", "38A14204", "1", 900000.0, "ACTIVE_LEASE", "LÊ THẾ CƯỜNG", "0335247117", "lethecuong2k4@gmail.com", 1500000.0);
        saveContract(5L, "HD202506147038", "43A99900", "1", 800000.0, "ACTIVE_LEASE", "LÊ THẾ CƯỜNG", "0335247117", "lethecuong2k4@gmail.com", 199999.0);
        saveContract(6L, "HD202506146676", "43A99995", "1", 1000000.0, "ACTIVE_LEASE", "LÊ THẾ CƯỜNG", "0335247117", "lethecuong2k4@gmail.com", 2000000.0);
        saveContract(7L, "HD202506146865", "43A99997", "1", 900000.0, "ACTIVE_LEASE", "LÊ THẾ CƯỜNG", "0335247117", "lethecuong2k4@gmail.com", 500000.0);
        saveContract(8L, "HD202506147807", "43A99998", "1", 350000.0, "ACTIVE_LEASE", "LÊ THẾ CƯỜNG", "0335247117", "lethecuong2k4@gmail.com", 499999.0);
        saveContract(9L, "HD202506157594", "43A99999", "1", 300000.0, "ACTIVE_LEASE", "LÊ THẾ CƯỜNG", "0335247117", "lethecuong2k4@gmail.com", 600000.0);
        saveContract(10L, "HD202506152933", "79A13334", "1", 400000.0, "ACTIVE_LEASE", "LÊ THẾ CƯỜNG", "0335247117", "lethecuong2k4@gmail.com", 699999.0);
        saveContract(11L, "HD202506151517", "79A13337", "1", 800000.0, "ACTIVE_LEASE", "Lê Thế Cường", "0335247117", "lethecuong2k4@gmail.com", 1500000.0);

        // 5. Promotions
        savePromo(1L, "SUMMER25", 25, 100);
        savePromo(2L, "NEWYEAR50", 50, 500);
        savePromo(3L, "WELCOME10", 10, 1000);
        savePromo(4L, "FLASH70", 70, 50);

        System.out.println("MongoDB data seeding completed successfully!");
    }

    private void saveCar(String lp, Integer oId, String brand, String model, Integer yr, Integer seats, String status, String type, Transmission tx, FuelType fuel, Double fc, String desc, String loc, String img) {
        Car c = new Car();
        c.setLicensePlate(lp);
        c.setOwnerId(oId);
        c.setBrand(brand);
        c.setModel(model);
        c.setYear(yr);
        c.setSeats(seats);
        c.setStatus(status);
        c.setType(type);
        c.setTransmission(tx);
        c.setFuelType(fuel);
        c.setFuelConsumption(fc);
        c.setDescription(desc);
        c.setLocation(loc);
        c.setMainImage(img);
        carRepository.save(c);
    }

    private void saveCarImg(Long id, String carId, String url) {
        CarImage img = new CarImage();
        img.setImageId(id);
        img.setCarId(carId);
        img.setImageUrl(url);
        img.setType("car_image");
        carImageRepository.save(img);
    }

    private void saveContract(Long id, String num, String carId, String custId, Double dep, String st, String name, String phone, String email, Double price) {
        Contract c = new Contract();
        c.setId(id);
        c.setContractNumber(num);
        c.setCarId(carId);
        c.setCustomerId(custId);
        c.setDeposit(dep);
        c.setStatus(st);
        c.setName(name);
        c.setPhone(phone);
        c.setEmail(email);
        c.setPricePerDay(price);
        contractRepository.save(c);
    }

    private void savePromo(Long id, String code, Integer pct, Integer max) {
        Promotion p = new Promotion();
        p.setPromo_id(id);
        p.setCode(code);
        p.setDiscount_percent(pct);
        p.setMaxUses(max);
        p.setValid_until(new Date(System.currentTimeMillis() + 365L * 24 * 3600 * 1000));
        promotionRepository.save(p);
    }
}
