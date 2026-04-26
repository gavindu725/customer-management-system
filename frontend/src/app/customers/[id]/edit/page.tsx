"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerForm from "@/components/customers/CustomerForm";
import { useCustomer, useUpdateCustomer } from "@/hooks/useCustomer";
import type { CustomerRequest } from "@/types";

export default function EditCustomerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const customerId = Number(id);
    const router = useRouter();

    const { data: customer, isLoading, isError } = useCustomer(customerId);
    const { mutateAsync, isPending } = useUpdateCustomer(customerId);

    const handleSubmit = async (data: CustomerRequest) => {
        try {
            await mutateAsync(data);
            toast.success("Customer updated successfully");
            router.push(`/customers/${customerId}`);
        } catch {
            toast.error("Failed to update customer. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
            </div>
        );
    }

    if (isError || !customer) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                <p>Customer not found.</p>
                <Button
                    variant="outline"
                    onClick={() => router.push("/customers")}
                >
                    Back to Customers
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Edit — {customer.name}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Update the customer&apos;s information
                    </p>
                </div>
            </div>

            <CustomerForm
                defaultValues={{
                    name: customer.name,
                    dateOfBirth: customer.dateOfBirth,
                    nicNumber: customer.nicNumber,
                    phoneNumbers: customer.phoneNumbers.length
                        ? customer.phoneNumbers.map((v) => ({ value: v }))
                        : [{ value: "" }],
                    addresses: customer.addresses.map((a) => ({
                        addressLine1: a.addressLine1,
                        addressLine2: a.addressLine2 ?? "",
                        countryId: a.countryId ? String(a.countryId) : "",
                        cityId: a.cityId ? String(a.cityId) : "",
                    })),
                    familyMemberIds: customer.familyMembers.map((m) => m.id),
                }}
                initialFamilyMembers={customer.familyMembers}
                currentCustomerId={customerId}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
                submitLabel="Update Customer"
            />
        </div>
    );
}
