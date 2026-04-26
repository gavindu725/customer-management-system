package gvk.projects.cms.service;

import gvk.projects.cms.entity.City;
import gvk.projects.cms.entity.Country;
import gvk.projects.cms.repository.CityRepository;
import gvk.projects.cms.repository.CountryRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MasterDataService {
    
    private final CountryRepository countryRepository;
    private final CityRepository cityRepository;

    public List<Country> getAllCountries() {
        return countryRepository.findAll();
    }

    public List<City> getCitiesByCountry(Long countryId) {
        return cityRepository.findByCountryId(countryId);
    }

    public List<City> getAllCities() {
        return cityRepository.findAllWithCountry();
    }
}
