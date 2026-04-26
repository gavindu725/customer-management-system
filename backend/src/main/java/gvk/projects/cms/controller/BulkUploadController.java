package gvk.projects.cms.controller;

import gvk.projects.cms.dto.BulkUploadResultDto;
import gvk.projects.cms.service.BulkUploadService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/customers/bulk")
@RequiredArgsConstructor
public class BulkUploadController {
    
    private final BulkUploadService bulkUploadService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BulkUploadResultDto> uploadCustomers(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".xlsx")) {
            return ResponseEntity.badRequest().build();
        }

        BulkUploadResultDto result = bulkUploadService.processUpload(file);

        return ResponseEntity.ok(result);
    }
}
