"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CustomerForm from "@/components/customers/CustomerForm";
import { useCreateCustomer } from "@/hooks/useCustomer";
import type { CustomerRequest } from "@/types";

export default function NewCustomerPage() {
    const router = useRouter();
    const { mutateAsync, isPending } = useCreateCustomer();

    const handleSubmit = async (data: CustomerRequest) => {
        try {
            await mutateAsync(data);
            toast.success("Customer created successfully");
            router.push("/customers");
        } catch {
            toast.error("Failed to create customer. Please try again.");
        }
    };

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
                        New Customer
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Fill in the details to create a new customer record
                    </p>
                </div>
            </div>

            <CustomerForm
                onSubmit={handleSubmit}
                isSubmitting={isPending}
                submitLabel="Create Customer"
            />
        </div>
    );
}
