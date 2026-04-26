package gvk.projects.cms.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CustomerResponseDto {
    private Long id;
    private String name;
    private LocalDate dateOfBirth;
    private String nicNumber;
    private List<String> phoneNumbers;
    private List<AddressResponseDto> addresses;
    private List<CustomerSummaryDto> familyMembers;
}