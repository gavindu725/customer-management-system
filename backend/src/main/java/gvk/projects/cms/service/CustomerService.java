package gvk.projects.cms.service;


import gvk.projects.cms.dto.AddressResponseDto;
import gvk.projects.cms.dto.CustomerRequestDto;
import gvk.projects.cms.dto.CustomerResponseDto;
import gvk.projects.cms.dto.CustomerSummaryDto;
import gvk.projects.cms.entity.Address;
import gvk.projects.cms.entity.Customer;
import gvk.projects.cms.entity.PhoneNumber;
import gvk.projects.cms.exception.BusinessException;
import gvk.projects.cms.exception.ResourceNotFoundException;
import gvk.projects.cms.repository.CityRepository;
import gvk.projects.cms.repository.CountryRepository;
import gvk.projects.cms.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private final CityRepository cityRepository;
    private final CountryRepository countryRepository;

    public CustomerResponseDto createCustomer(CustomerRequestDto dto) {
        if (customerRepository.existsByNicNumber(dto.getNicNumber())) {
            throw new BusinessException("NIC number already exists: " + dto.getNicNumber());
        }

        Customer customer = new Customer();
        mapDtoToEntity(dto, customer);
        return mapToResponse(customerRepository.save(customer));
    }

    public CustomerResponseDto updateCustomer(Long id, CustomerRequestDto dto) {
        Customer customer = customerRepository.findWithDetailsById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        if (customerRepository.existsByNicNumberAndIdNot(dto.getNicNumber(), id)) {
            throw new BusinessException("NIC number already exists: " + dto.getNicNumber());
        }

        customer.setName(dto.getName());
        customer.setDateOfBirth(dto.getDateOfBirth());
        customer.setNicNumber(dto.getNicNumber());

        if (dto.getPhoneNumbers() != null) {
            customer.getPhoneNumbers().clear();
            dto.getPhoneNumbers().stream()
                    .filter(num -> num != null && !num.trim().isEmpty())
                    .forEach(num -> {
                        PhoneNumber phone = new PhoneNumber();
                        phone.setNumber(num.trim());
                        phone.setCustomer(customer);
                        customer.getPhoneNumbers().add(phone);
                    });
        }

        if (dto.getAddresses() != null) {
            customer.getAddresses().clear();
            dto.getAddresses().forEach(addrDto -> {
                Address address = new Address();
                address.setAddressLine1(addrDto.getAddressLine1());
                address.setAddressLine2(addrDto.getAddressLine2());
                if (addrDto.getCityId() != null) {
                    address.setCity(cityRepository.findById(addrDto.getCityId())
                            .orElseThrow(() -> new ResourceNotFoundException("City not found: " + addrDto.getCityId())));
                }
                if (addrDto.getCountryId() != null) {
                    address.setCountry(countryRepository.findById(addrDto.getCountryId())
                            .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + addrDto.getCountryId())));
                }
                address.setCustomer(customer);
                customer.getAddresses().add(address);
            });
        }

        if (dto.getFamilyMemberIds() != null) {
            customer.getFamilyMembers().clear();
            if (!dto.getFamilyMemberIds().isEmpty()) {
                List<Customer> members = customerRepository.findAllById(dto.getFamilyMemberIds());
                if (members.size() != dto.getFamilyMemberIds().size()) {
                    throw new ResourceNotFoundException("One or more family member IDs not found");
                }
                members.stream()
                        .filter(m -> !m.getId().equals(customer.getId()))
                        .forEach(customer.getFamilyMembers()::add);
            }
        }

        return mapToResponse(customerRepository.save(customer));
    }

    @Transactional(readOnly = true)
    public CustomerResponseDto getCustomer(Long id) {
        Customer customer = customerRepository.findWithDetailsById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToResponse(customer);
    }

    @Transactional(readOnly = true)
    public Page<CustomerSummaryDto> getAllCustomers(String search, Pageable pageable) {
        return customerRepository.findAllSummary(search, pageable);
    }


    // Mapping Helper Methods
    private void mapDtoToEntity(CustomerRequestDto dto, Customer customer) {
        customer.setName(dto.getName());
        customer.setDateOfBirth(dto.getDateOfBirth());
        customer.setNicNumber(dto.getNicNumber());

        // Phone numbers
        if (dto.getPhoneNumbers() != null) {
            dto.getPhoneNumbers().stream()
                .filter(num -> num != null && !num.trim().isEmpty())
                .forEach(num -> {
                    PhoneNumber phone = new PhoneNumber();
                    phone.setNumber(num.trim());
                    phone.setCustomer(customer);
                    customer.getPhoneNumbers().add(phone);
                });
        }

        // Addresses
        if (dto.getAddresses() != null) {
            dto.getAddresses().forEach(addrDto -> {
                Address address = new Address();
                address.setAddressLine1(addrDto.getAddressLine1());
                address.setAddressLine2(addrDto.getAddressLine2());

                if (addrDto.getCityId() != null) {
                    address.setCity(cityRepository.findById(addrDto.getCityId())
                        .orElseThrow(() -> new ResourceNotFoundException("City not found: " + addrDto.getCityId())));
                }
                if (addrDto.getCountryId() != null) {
                    address.setCountry(countryRepository.findById(addrDto.getCountryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + addrDto.getCountryId())));
                }
                address.setCustomer(customer);
                customer.getAddresses().add(address);
            });
        }

        // Family members — look up existing customers by ID
        if (dto.getFamilyMemberIds() != null && !dto.getFamilyMemberIds().isEmpty()) {
            List<Customer> members = customerRepository.findAllById(dto.getFamilyMemberIds());
            if (members.size() != dto.getFamilyMemberIds().size()) {
                throw new ResourceNotFoundException("One or more family member IDs not found");
            }
            // Prevent self-referential loop
            members.stream()
                .filter(m -> !m.getId().equals(customer.getId()))
                .forEach(customer.getFamilyMembers()::add);
        }
    }

    private CustomerResponseDto mapToResponse(Customer customer) {
        CustomerResponseDto dto = new CustomerResponseDto();
        dto.setId(customer.getId());
        dto.setName(customer.getName());
        dto.setDateOfBirth(customer.getDateOfBirth());
        dto.setNicNumber(customer.getNicNumber());

        dto.setPhoneNumbers(
            customer.getPhoneNumbers().stream()
                .map(PhoneNumber::getNumber)
                .collect(Collectors.toList())
        );

        dto.setAddresses(
            customer.getAddresses().stream()
                .map(this::mapAddressToResponse)
                .collect(Collectors.toList())
        );

        dto.setFamilyMembers(
            customer.getFamilyMembers().stream()
                .map(m -> new CustomerSummaryDto(m.getId(), m.getName(), m.getDateOfBirth(), m.getNicNumber()))
                .collect(Collectors.toList())
        );

        return dto;
    }

    private AddressResponseDto mapAddressToResponse(Address address) {
        AddressResponseDto dto = new AddressResponseDto();
        dto.setId(address.getId());
        dto.setAddressLine1(address.getAddressLine1());
        dto.setAddressLine2(address.getAddressLine2());
        if (address.getCity() != null) {
            dto.setCityId(address.getCity().getId());
            dto.setCityName(address.getCity().getName());
        }
        if (address.getCountry() != null) {
            dto.setCountryId(address.getCountry().getId());
            dto.setCountryName(address.getCountry().getName());
        }
        return dto;
    }
}
