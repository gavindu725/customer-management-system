package gvk.projects.cms.service;

import gvk.projects.cms.dto.CustomerRequestDto;
import gvk.projects.cms.dto.CustomerResponseDto;
import gvk.projects.cms.entity.Customer;
import gvk.projects.cms.exception.BusinessException;
import gvk.projects.cms.exception.ResourceNotFoundException;
import gvk.projects.cms.repository.CityRepository;
import gvk.projects.cms.repository.CountryRepository;
import gvk.projects.cms.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock private CustomerRepository customerRepository;
    @Mock private CityRepository cityRepository;
    @Mock private CountryRepository countryRepository;

    @InjectMocks
    private CustomerService customerService;

    private CustomerRequestDto validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new CustomerRequestDto();
        validRequest.setName("John Doe");
        validRequest.setDateOfBirth(LocalDate.of(1990, 1, 15));
        validRequest.setNicNumber("NIC123456");
    }

    @Test
    void createCustomer_Success() {
        when(customerRepository.existsByNicNumber("NIC123456")).thenReturn(false);

        Customer savedCustomer = new Customer();
        savedCustomer.setId(1L);
        savedCustomer.setName("John Doe");
        savedCustomer.setDateOfBirth(LocalDate.of(1990, 1, 15));
        savedCustomer.setNicNumber("NIC123456");

        when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);

        CustomerResponseDto result = customerService.createCustomer(validRequest);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("John Doe");
        assertThat(result.getNicNumber()).isEqualTo("NIC123456");
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void createCustomer_ThrowsWhenNicExists() {
        when(customerRepository.existsByNicNumber("NIC123456")).thenReturn(true);

        assertThatThrownBy(() -> customerService.createCustomer(validRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("NIC number already exists");

        verify(customerRepository, never()).save(any());
    }

    @Test
    void updateCustomer_ThrowsWhenNotFound() {
        when(customerRepository.findWithDetailsById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.updateCustomer(99L, validRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Customer not found");
    }

    @Test
    void getCustomer_ThrowsWhenNotFound() {
        when(customerRepository.findWithDetailsById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.getCustomer(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getCustomer_ReturnsDto() {
        Customer customer = new Customer();
        customer.setId(1L);
        customer.setName("Jane Doe");
        customer.setDateOfBirth(LocalDate.of(1985, 5, 20));
        customer.setNicNumber("NIC654321");

        when(customerRepository.findWithDetailsById(1L)).thenReturn(Optional.of(customer));

        CustomerResponseDto result = customerService.getCustomer(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Jane Doe");
    }
}