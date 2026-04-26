package gvk.projects.cms.service;

import gvk.projects.cms.dto.BulkUploadResultDto;
import gvk.projects.cms.repository.CustomerRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BulkUploadServiceTest {

    @Mock private CustomerRepository customerRepository;
    @InjectMocks private BulkUploadService bulkUploadService;

    @Test
    void processUpload_ValidFile_ReturnsSuccessCount() throws Exception {
        // Build a minimal valid XLSX in memory
        XSSFWorkbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Customers");

        // Header row
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Name");
        header.createCell(1).setCellValue("Date of Birth");
        header.createCell(2).setCellValue("NIC");

        // Data row
        Row row = sheet.createRow(1);
        row.createCell(0).setCellValue("Test User");
        row.createCell(1).setCellValue("1990-05-15");
        row.createCell(2).setCellValue("NIC001");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "test.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                baos.toByteArray()
        );

        when(customerRepository.findExistingNicNumbers(anySet())).thenReturn(Collections.emptySet());
        when(customerRepository.saveAll(any())).thenAnswer(i -> i.getArgument(0));

        BulkUploadResultDto result = bulkUploadService.processUpload(mockFile);

        assertThat(result.getTotalRows()).isEqualTo(1);
        assertThat(result.getSuccessCount()).isEqualTo(1);
        assertThat(result.getFailureCount()).isEqualTo(0);
    }

    @Test
    void processUpload_MissingMandatoryField_CountsFailure() throws Exception {
        XSSFWorkbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Customers");
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Name");
        header.createCell(1).setCellValue("DOB");
        header.createCell(2).setCellValue("NIC");

        Row row = sheet.createRow(1);
        row.createCell(0).setCellValue("Missing NIC");
        row.createCell(1).setCellValue("1990-05-15");
        // NIC (col 2) intentionally missing

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "test.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                baos.toByteArray()
        );

        BulkUploadResultDto result = bulkUploadService.processUpload(mockFile);

        assertThat(result.getFailureCount()).isGreaterThan(0);
    }
}