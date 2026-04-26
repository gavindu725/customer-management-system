package gvk.projects.cms.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class BulkUploadResultDto {
    private int totalRows;
    private int successCount;
    private int failureCount;
    private List<String> errors = new ArrayList<>();

    public void incrementTotal() { totalRows++; }
    public void incrementSuccess() { successCount++; }
    public void incrementFailure() { failureCount++; }

    public void addError(int rowNum, String message) {
        failureCount++;
        // Cap stored error messages to avoid huge response payloads
        if (errors.size() < 200) {
            errors.add("Row " + rowNum + ": " + message);
        }
    }
}