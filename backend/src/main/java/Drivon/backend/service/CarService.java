package Drivon.backend.service;

import Drivon.backend.model.Car;
import Drivon.backend.model.Contract;
import Drivon.backend.repository.CarRepository;
import Drivon.backend.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private ContractRepository contractRepository;

    public Car getCarById(String carId) {
        return carRepository.findById(carId).orElse(null);
    }

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    public List<Car> getCarsByOwnerId(Long ownerId) {
        List<Contract> activeContracts = contractRepository.findByStatus("ACTIVE_LEASE");
        List<String> activeCarIds = activeContracts.stream().map(Contract::getCarId).collect(Collectors.toList());
        List<Car> ownerCars = carRepository.findByOwnerId(ownerId);
        if (ownerCars.isEmpty() && ownerId != null) {
            ownerCars = carRepository.findByOwnerId(ownerId.intValue());
        }
        List<Car> cars = ownerCars.stream()
                .filter(c -> activeCarIds.contains(c.getLicensePlate()))
                .collect(Collectors.toList());
        if (cars.isEmpty()) {
            cars = ownerCars;
        }
        System.out.println("Cars found for owner " + ownerId + ": " + cars);
        return cars;
    }

    public List<Car> getActiveLeaseCars() {
        List<Contract> activeContracts = contractRepository.findByStatus("ACTIVE_LEASE");
        List<String> activeCarIds = activeContracts.stream().map(Contract::getCarId).collect(Collectors.toList());
        List<Car> activeCars = carRepository.findByLicensePlateIn(activeCarIds);
        if (activeCars.isEmpty()) {
            return carRepository.findAll();
        }
        return activeCars;
    }

    public Car updateCar(Car car) {
        return carRepository.save(car);
    }

    public List<Car> getCarsByStatus(String status) {
        return carRepository.findByStatus(status);
    }
}