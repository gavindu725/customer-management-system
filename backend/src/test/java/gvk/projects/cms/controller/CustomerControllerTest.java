package gvk.projects.cms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import gvk.projects.cms.dto.CustomerRequestDto;
import gvk.projects.cms.dto.CustomerResponseDto;
import gvk.projects.cms.exception.GlobalExceptionHandler;
import gvk.projects.cms.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {

    @Mock private CustomerService customerService;
    @InjectMocks private CustomerController customerController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        mockMvc = MockMvcBuilders.standaloneSetup(customerController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createCustomer_Returns201() throws Exception {
        CustomerRequestDto request = new CustomerRequestDto();
        request.setName("Alice");
        request.setDateOfBirth(LocalDate.of(1992, 3, 10));
        request.setNicNumber("NIC999");

        CustomerResponseDto response = new CustomerResponseDto();
        response.setId(1L);
        response.setName("Alice");
        response.setNicNumber("NIC999");

        when(customerService.createCustomer(any())).thenReturn(response);

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Alice"));
    }

    @Test
    void createCustomer_Returns400_WhenNameMissing() throws Exception {
        CustomerRequestDto request = new CustomerRequestDto();
        request.setDateOfBirth(LocalDate.of(1992, 3, 10));
        request.setNicNumber("NIC999");
        // name is missing

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getById_Returns200() throws Exception {
        CustomerResponseDto response = new CustomerResponseDto();
        response.setId(5L);
        response.setName("Bob");

        when(customerService.getCustomer(5L)).thenReturn(response);

        mockMvc.perform(get("/api/customers/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Bob"));
    }
}