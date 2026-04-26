package gvk.projects.cms.service;

import gvk.projects.cms.dto.BulkUploadResultDto;
import gvk.projects.cms.entity.Customer;
import gvk.projects.cms.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.util.XMLHelper;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler;
import org.apache.poi.xssf.model.SharedStringsTable;
import org.apache.poi.xssf.usermodel.XSSFComment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BulkUploadService {

    private static final int BATCH_SIZE = 500;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final CustomerRepository customerRepository;

    public BulkUploadResultDto processUpload(MultipartFile file) {
        BulkUploadResultDto result = new BulkUploadResultDto();
        List<Customer> batch = new ArrayList<>(BATCH_SIZE);

        try (InputStream inputStream = file.getInputStream()) {  // fixed: getInputStrem -> getInputStream
            OPCPackage pkg = OPCPackage.open(inputStream);       // fixed: OPCPPackage -> OPCPackage

            XSSFReader xssfReader = new XSSFReader(pkg);
            SharedStringsTable sst = (SharedStringsTable) xssfReader.getSharedStringsTable();
            XMLReader xmlReader = XMLHelper.newXMLReader();

            CustomerRowHandler rowHandler = new CustomerRowHandler(batch, result);

            XSSFSheetXMLHandler sheetHandler = new XSSFSheetXMLHandler(
                    xssfReader.getStylesTable(), null, sst, rowHandler,
                    new org.apache.poi.ss.usermodel.DataFormatter(), false);
            xmlReader.setContentHandler(sheetHandler);

            Iterator<InputStream> sheets = xssfReader.getSheetsData();
            if (sheets.hasNext()) {
                try (InputStream sheet = sheets.next()) {
                    xmlReader.parse(new InputSource(sheet));
                }
            }

            if (!batch.isEmpty()) {
                saveBatch(batch, result);
            }
        } catch (Exception e) {
            log.error("Bulk upload failed", e);
            result.addError(-1, "File processing failed: " + e.getMessage());
        }

        return result;
    }

    @Transactional
    public void saveBatch(List<Customer> batch, BulkUploadResultDto result) {
        Set<String> nicsInBatch = batch.stream()
                .map(Customer::getNicNumber)
                .collect(Collectors.toSet());  // fixed: added Collectors import

        Set<String> existingNics = customerRepository.findExistingNicNumbers(nicsInBatch);

        List<Customer> toSave = new ArrayList<>();
        for (Customer c : batch) {
            if (existingNics.contains(c.getNicNumber())) {
                result.addError(-1, "Duplicate NIC skipped: " + c.getNicNumber());
            } else {
                toSave.add(c);
            }
        }

        customerRepository.saveAll(toSave);
        result.setSuccessCount(result.getSuccessCount() + toSave.size());
        batch.clear();
    }

    // fixed: SheetcontentsHandler -> SheetContentsHandler
    private class CustomerRowHandler implements XSSFSheetXMLHandler.SheetContentsHandler {
        private final List<Customer> batch;
        private final BulkUploadResultDto result;
        private final Map<Integer, String> currentRowData = new HashMap<>();
        private boolean isHeaderRow = true;

        CustomerRowHandler(List<Customer> batch, BulkUploadResultDto result) {
            this.batch = batch;
            this.result = result;
        }

        @Override
        public void startRow(int rowNum) {
            currentRowData.clear();
        }

        @Override
        public void endRow(int rowNum) {
            if (isHeaderRow) {
                isHeaderRow = false;
                return;
            }

            result.incrementTotal();
            int displayRow = rowNum + 1;

            String name = currentRowData.getOrDefault(0, "").trim();
            String dobStr = currentRowData.getOrDefault(1, "").trim();
            String nic = currentRowData.getOrDefault(2, "").trim();

            if (name.isEmpty() || dobStr.isEmpty() || nic.isEmpty()) {
                result.addError(displayRow, "missing mandatory fields (Name, DOB, NIC)");
                return;
            }

            LocalDate dob;  // fixed: added java.time.LocalDate import
            try {
                dob = LocalDate.parse(dobStr, DATE_FORMATTER);
            } catch (DateTimeParseException e) {
                result.addError(displayRow, "Invalid date format '" + dobStr + "' - expected yyyy-MM-dd");
                return;
            }

            Customer customer = new Customer();
            customer.setName(name);
            customer.setDateOfBirth(dob);
            customer.setNicNumber(nic);
            batch.add(customer);

            if (batch.size() >= BATCH_SIZE) {
                saveBatch(batch, result);
            }
        }

        @Override
        public void cell(String cellReference, String formattedValue, XSSFComment comment) {
            if (cellReference == null) return;
            String colStr = cellReference.replaceAll("[0-9]", "");  // fixed: string -> String
            int colIndex = CellReference.convertColStringToIndex(colStr);
            if (formattedValue != null && !formattedValue.isEmpty()) {
                currentRowData.put(colIndex, formattedValue);
            }
        }
    }
}