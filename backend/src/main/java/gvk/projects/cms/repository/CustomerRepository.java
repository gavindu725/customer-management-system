package gvk.projects.cms.repository;

import gvk.projects.cms.dto.CustomerSummaryDto;
import gvk.projects.cms.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    boolean existsByNicNumber(String nicNumber);

    boolean existsByNicNumberAndIdNot(String nicNumber, Long id);

    Optional<Customer> findByNicNumber(String nicNumber);

    // Fetch full details in one query — avoids N+1
    @EntityGraph("Customer.withDetails")
    @Query("SELECT c FROM Customer c WHERE c.id = :id")
    Optional<Customer> findWithDetailsById(@Param("id") Long id);

    // Lightweight DTO projection for table view — no collections loaded
    @Query("SELECT new gvk.projects.cms.dto.CustomerSummaryDto(c.id, c.name, c.dateOfBirth, c.nicNumber) " +
           "FROM Customer c " +
           "WHERE (:search IS NULL OR :search = '' OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.nicNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<CustomerSummaryDto> findAllSummary(@Param("search") String search, Pageable pageable);

    // Used in bulk upload to check duplicates in one query
    @Query("SELECT c.nicNumber FROM Customer c WHERE c.nicNumber IN :nics")
    Set<String> findExistingNicNumbers(@Param("nics") Set<String> nics);
}