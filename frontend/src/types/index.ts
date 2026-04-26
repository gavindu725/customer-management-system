export interface Country {
    id: number;
    name: string;
}

export interface City {
    id: number;
    name: string;
    country: Country;
}

export interface AddressResponse {
    id: number;
    addressLine1: string;
    addressLine2?: string;
    cityId: number;
    cityName: string;
    countryId: number;
    countryName: string;
}

export interface AddressRequest {
    addressLine1: string;
    addressLine2?: string;
    cityId?: number;
    countryId?: number;
}

export interface CustomerSummary {
    id: number;
    name: string;
    dateOfBirth: string;
    nicNumber: string;
}

export interface CustomerResponse {
    id: number;
    name: string;
    dateOfBirth: string;
    nicNumber: string;
    phoneNumbers: string[];
    addresses: AddressResponse[];
    familyMembers: CustomerSummary[];
}

export interface CustomerRequest {
    name: string;
    dateOfBirth: string;
    nicNumber: string;
    phoneNumbers?: string[];
    addresses?: AddressRequest[];
    familyMemberIds?: number[];
}

export interface BulkUploadResult {
    totalRows: number;
    successCount: number;
    failureCount: number;
    errors: string[];
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}
