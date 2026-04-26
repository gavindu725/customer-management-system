package gvk.projects.cms.repository;

import gvk.projects.cms.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {

    @Query("SELECT c FROM City c JOIN FETCH c.country WHERE c.country.id = :countryId")
    List<City> findByCountryId(Long countryId);

    @Query("SELECT c FROM City c JOIN FETCH c.country")
    List<City> findAllWithCountry();
}