"use client";

import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerSummary, Page } from "@/types";

interface CustomerTableProps {
    data: Page<CustomerSummary> | undefined;
    isLoading: boolean;
    page: number;
    onPageChange: (page: number) => void;
}

export default function CustomerTable({
    data,
    isLoading,
    page,
    onPageChange,
}: CustomerTableProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="h-12 w-full rounded-lg"
                    />
                ))}
            </div>
        );
    }

    if (!data || data.content.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p className="text-base">No customers found.</p>
                <p className="text-sm mt-1">
                    Try adjusting your search or add a new customer.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>NIC Number</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.content.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium">
                                {customer.name}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">
                                    {customer.nicNumber}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {format(
                                    parseISO(customer.dateOfBirth),
                                    "dd MMM yyyy",
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            router.push(
                                                `/customers/${customer.id}`,
                                            )
                                        }
                                        title="View"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            router.push(
                                                `/customers/${customer.id}/edit`,
                                            )
                                        }
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            {data.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                    <span>
                        Showing {data.number * data.size + 1}–
                        {Math.min(
                            (data.number + 1) * data.size,
                            data.totalElements,
                        )}{" "}
                        of {data.totalElements} customers
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={data.first}
                        >
                            Previous
                        </Button>
                        <span className="px-2">
                            Page {data.number + 1} of {data.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={data.last}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
