"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCountries, useCitiesByCountry } from "@/hooks/useMasterData";
import { useCustomers } from "@/hooks/useCustomer";
import type { CustomerRequest, CustomerSummary } from "@/types";

// ── Zod schema ────────────────────────────────────────────────────────────────

const addressSchema = z.object({
    addressLine1: z.string().min(1, "Address line 1 is required"),
    addressLine2: z.string().optional(),
    countryId: z.string().optional(),
    cityId: z.string().optional(),
});

const customerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    nicNumber: z.string().min(1, "NIC number is required"),
    phoneNumbers: z.array(z.object({ value: z.string() })),
    addresses: z.array(addressSchema),
    familyMemberIds: z.array(z.number()),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

// ── Address row sub-component ────────────────────────────────────────────────

interface AddressRowProps {
    index: number;
    control: ReturnType<typeof useForm<CustomerFormValues>>["control"];
    register: ReturnType<typeof useForm<CustomerFormValues>>["register"];
    setValue: ReturnType<typeof useForm<CustomerFormValues>>["setValue"];
    errors: ReturnType<
        typeof useForm<CustomerFormValues>
    >["formState"]["errors"];
    onRemove: () => void;
}

function AddressRow({
    index,
    control,
    register,
    setValue,
    errors,
    onRemove,
}: AddressRowProps) {
    const { data: countries } = useCountries();
    const countryId = useWatch({
        control,
        name: `addresses.${index}.countryId`,
    });
    const { data: cities } = useCitiesByCountry(
        countryId ? Number(countryId) : undefined,
    );

    return (
        <div className="border rounded-lg p-4 space-y-3 relative">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={onRemove}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                {/* Address Line 1 */}
                <div className="sm:col-span-2 space-y-1">
                    <Label>Address Line 1 *</Label>
                    <Input
                        {...register(`addresses.${index}.addressLine1`)}
                        placeholder="123 Main Street"
                    />
                    {errors.addresses?.[index]?.addressLine1 && (
                        <p className="text-xs text-destructive">
                            {errors.addresses[index].addressLine1?.message}
                        </p>
                    )}
                </div>

                {/* Address Line 2 */}
                <div className="sm:col-span-2 space-y-1">
                    <Label>Address Line 2</Label>
                    <Input
                        {...register(`addresses.${index}.addressLine2`)}
                        placeholder="Apartment, suite, etc."
                    />
                </div>

                {/* Country */}
                <div className="space-y-1">
                    <Label>Country</Label>
                    <Controller
                        control={control}
                        name={`addresses.${index}.countryId`}
                        render={({ field }) => (
                            <Select
                                value={field.value ?? ""}
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    setValue(`addresses.${index}.cityId`, "");
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries?.map((country) => (
                                        <SelectItem
                                            key={country.id}
                                            value={String(country.id)}
                                        >
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                {/* City */}
                <div className="space-y-1">
                    <Label>City</Label>
                    <Controller
                        control={control}
                        name={`addresses.${index}.cityId`}
                        render={({ field }) => (
                            <Select
                                value={field.value ?? ""}
                                onValueChange={field.onChange}
                                disabled={!countryId}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            countryId
                                                ? "Select city"
                                                : "Select country first"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {cities?.map((city) => (
                                        <SelectItem
                                            key={city.id}
                                            value={String(city.id)}
                                        >
                                            {city.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Main form component ───────────────────────────────────────────────────────

export interface CustomerFormProps {
    defaultValues?: Partial<CustomerFormValues>;
    initialFamilyMembers?: CustomerSummary[];
    currentCustomerId?: number;
    onSubmit: (data: CustomerRequest) => void | Promise<void>;
    isSubmitting?: boolean;
    submitLabel?: string;
}

export default function CustomerForm({
    defaultValues,
    initialFamilyMembers = [],
    currentCustomerId,
    onSubmit,
    isSubmitting = false,
    submitLabel = "Save",
}: CustomerFormProps) {
    // Family member search state
    const [familySearch, setFamilySearch] = useState("");
    const [debouncedFamilySearch, setDebouncedFamilySearch] = useState("");
    const [selectedFamilyMembers, setSelectedFamilyMembers] =
        useState<CustomerSummary[]>(initialFamilyMembers);

    useEffect(() => {
        const timer = setTimeout(
            () => setDebouncedFamilySearch(familySearch),
            400,
        );
        return () => clearTimeout(timer);
    }, [familySearch]);

    const { data: familySearchResults } = useCustomers({
        search: debouncedFamilySearch,
        size: 5,
    });

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            dateOfBirth: "",
            nicNumber: "",
            phoneNumbers: [{ value: "" }],
            addresses: [],
            familyMemberIds: [],
            ...defaultValues,
        },
    });

    const {
        fields: phoneFields,
        append: appendPhone,
        remove: removePhone,
    } = useFieldArray({ control, name: "phoneNumbers" });

    const {
        fields: addressFields,
        append: appendAddress,
        remove: removeAddress,
    } = useFieldArray({ control, name: "addresses" });

    const familyMemberIds = useWatch({ control, name: "familyMemberIds" });

    const addFamilyMember = (customer: CustomerSummary) => {
        if (familyMemberIds.includes(customer.id)) return;
        setValue("familyMemberIds", [...familyMemberIds, customer.id]);
        setSelectedFamilyMembers((prev) => [...prev, customer]);
        setFamilySearch("");
        setDebouncedFamilySearch("");
    };

    const removeFamilyMember = (id: number) => {
        setValue(
            "familyMemberIds",
            familyMemberIds.filter((fid) => fid !== id),
        );
        setSelectedFamilyMembers((prev) => prev.filter((m) => m.id !== id));
    };

    const handleFormSubmit = async (values: CustomerFormValues) => {
        const payload: CustomerRequest = {
            name: values.name,
            dateOfBirth: values.dateOfBirth,
            nicNumber: values.nicNumber,
            phoneNumbers: values.phoneNumbers
                .map((p) => p.value)
                .filter(Boolean),
            addresses: values.addresses.map((a) => ({
                addressLine1: a.addressLine1,
                addressLine2: a.addressLine2 || undefined,
                countryId: a.countryId ? Number(a.countryId) : undefined,
                cityId: a.cityId ? Number(a.cityId) : undefined,
            })),
            familyMemberIds: values.familyMemberIds,
        };
        await onSubmit(payload);
    };

    // Filter search results: exclude already-selected and the customer being edited
    const filteredSearchResults = familySearchResults?.content.filter(
        (c) => !familyMemberIds.includes(c.id) && c.id !== currentCustomerId,
    );

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-6"
        >
            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="sm:col-span-2 space-y-1">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="John Doe"
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1">
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                            id="dateOfBirth"
                            type="date"
                            {...register("dateOfBirth")}
                        />
                        {errors.dateOfBirth && (
                            <p className="text-xs text-destructive">
                                {errors.dateOfBirth.message}
                            </p>
                        )}
                    </div>

                    {/* NIC Number */}
                    <div className="space-y-1">
                        <Label htmlFor="nicNumber">NIC Number *</Label>
                        <Input
                            id="nicNumber"
                            {...register("nicNumber")}
                            placeholder="NIC123456"
                        />
                        {errors.nicNumber && (
                            <p className="text-xs text-destructive">
                                {errors.nicNumber.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Phone Numbers */}
            <Card>
                <CardHeader>
                    <CardTitle>Phone Numbers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {phoneFields.map((field, index) => (
                        <div
                            key={field.id}
                            className="flex gap-2"
                        >
                            <Input
                                {...register(`phoneNumbers.${index}.value`)}
                                placeholder="07XXXXXXXX"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removePhone(index)}
                                disabled={phoneFields.length === 1}
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendPhone({ value: "" })}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Phone
                    </Button>
                </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
                <CardHeader>
                    <CardTitle>Addresses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {addressFields.map((field, index) => (
                        <AddressRow
                            key={field.id}
                            index={index}
                            control={control}
                            register={register}
                            setValue={setValue}
                            errors={errors}
                            onRemove={() => removeAddress(index)}
                        />
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            appendAddress({
                                addressLine1: "",
                                addressLine2: "",
                                countryId: "",
                                cityId: "",
                            })
                        }
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                    </Button>
                </CardContent>
            </Card>

            {/* Family Members */}
            <Card>
                <CardHeader>
                    <CardTitle>Family Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Selected members */}
                    {selectedFamilyMembers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedFamilyMembers.map((member) => (
                                <Badge
                                    key={member.id}
                                    variant="secondary"
                                    className="gap-1 pr-1"
                                >
                                    {member.name}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeFamilyMember(member.id)
                                        }
                                        className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Search input */}
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customers to add..."
                            value={familySearch}
                            onChange={(e) => setFamilySearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Search results dropdown */}
                    {debouncedFamilySearch &&
                        filteredSearchResults &&
                        filteredSearchResults.length > 0 && (
                            <div className="border rounded-lg divide-y max-w-sm">
                                {filteredSearchResults.map((customer) => (
                                    <button
                                        key={customer.id}
                                        type="button"
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex justify-between items-center"
                                        onClick={() =>
                                            addFamilyMember(customer)
                                        }
                                    >
                                        <span className="font-medium">
                                            {customer.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {customer.nicNumber}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                    {debouncedFamilySearch &&
                        filteredSearchResults?.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No matching customers found.
                            </p>
                        )}
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
