package gvk.projects.cms.controller;

import gvk.projects.cms.entity.City;
import gvk.projects.cms.entity.Country;
import gvk.projects.cms.service.MasterDataService;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/master")
@RequiredArgsConstructor
public class MasterDataController {
    
    private final MasterDataService masterDataService;

    @GetMapping("/countries")
    public ResponseEntity<List<Country>> getCountries() {
        return ResponseEntity.ok(masterDataService.getAllCountries());
    }

    @GetMapping("/countries/{countryId}/cities")
    public ResponseEntity<List<City>> getCitiesByCountry(@PathVariable Long countryId) {
        return ResponseEntity.ok(masterDataService.getCitiesByCountry(countryId));
    }

    @GetMapping("/cities")
    public ResponseEntity<List<City>> getAllCities() {
        return ResponseEntity.ok(masterDataService.getAllCities());
    }
}
