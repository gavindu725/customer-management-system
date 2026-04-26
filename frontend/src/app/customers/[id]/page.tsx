"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Phone, MapPin, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomer } from "@/hooks/useCustomer";

export default function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: customer, isLoading, isError } = useCustomer(Number(id));

    if (isLoading) {
        return (
            <div className="max-w-3xl space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
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
            {/* Header */}
            <div className="flex items-center justify-between">
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
                            {customer.name}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Customer detail
                        </p>
                    </div>
                </div>
                <Button onClick={() => router.push(`/customers/${id}/edit`)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                </Button>
            </div>

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Full Name</p>
                        <p className="font-medium mt-0.5">{customer.name}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Date of Birth</p>
                        <p className="font-medium mt-0.5">
                            {format(
                                parseISO(customer.dateOfBirth),
                                "dd MMM yyyy",
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">NIC Number</p>
                        <Badge
                            variant="outline"
                            className="mt-0.5"
                        >
                            {customer.nicNumber}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Phone Numbers */}
            {customer.phoneNumbers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="h-4 w-4" /> Phone Numbers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {customer.phoneNumbers.map((phone, i) => (
                            <Badge
                                key={i}
                                variant="secondary"
                            >
                                {phone}
                            </Badge>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Addresses */}
            {customer.addresses.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Addresses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {customer.addresses.map((address) => (
                            <div
                                key={address.id}
                                className="border rounded-lg p-3 text-sm space-y-1"
                            >
                                <p className="font-medium">
                                    {address.addressLine1}
                                </p>
                                {address.addressLine2 && (
                                    <p className="text-muted-foreground">
                                        {address.addressLine2}
                                    </p>
                                )}
                                {(address.cityName || address.countryName) && (
                                    <p className="text-muted-foreground">
                                        {[address.cityName, address.countryName]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </p>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Family Members */}
            {customer.familyMembers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-4 w-4" /> Family Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        {customer.familyMembers.map((member) => (
                            <div
                                key={member.id}
                                className="py-2 flex items-center justify-between text-sm cursor-pointer hover:text-foreground/80 transition-colors"
                                onClick={() =>
                                    router.push(`/customers/${member.id}`)
                                }
                            >
                                <span className="font-medium">
                                    {member.name}
                                </span>
                                <Badge variant="outline">
                                    {member.nicNumber}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
