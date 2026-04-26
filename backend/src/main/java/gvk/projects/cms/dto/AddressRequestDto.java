package gvk.projects.cms.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class AddressRequestDto {

    @NotBlank(message = "Address line 1 is required")
    private String addressLine1;

    private String addressLine2;

    private Long cityId;

    private Long countryId;
}