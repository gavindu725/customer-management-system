import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
    CustomerRequest,
    CustomerResponse,
    CustomerSummary,
    Page,
} from "@/types";

// ── Query keys ────────────────────────────────────────────────────────────────

export const customerKeys = {
    all: ["customers"] as const,
    lists: () => [...customerKeys.all, "list"] as const,
    list: (params: { search?: string; page?: number; size?: number }) =>
        [...customerKeys.lists(), params] as const,
    details: () => [...customerKeys.all, "detail"] as const,
    detail: (id: number) => [...customerKeys.details(), id] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useCustomers(
    params: { search?: string; page?: number; size?: number } = {},
) {
    const { search, page = 0, size = 20 } = params;
    return useQuery({
        queryKey: customerKeys.list({ search, page, size }),
        queryFn: async () => {
            const { data } = await api.get<Page<CustomerSummary>>(
                "/customers",
                {
                    params: {
                        search: search || undefined,
                        page,
                        size,
                        sort: "name",
                    },
                },
            );
            return data;
        },
    });
}

export function useCustomer(id: number) {
    return useQuery({
        queryKey: customerKeys.detail(id),
        queryFn: async () => {
            const { data } = await api.get<CustomerResponse>(
                `/customers/${id}`,
            );
            return data;
        },
        enabled: !!id,
    });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CustomerRequest) => {
            const { data } = await api.post<CustomerResponse>(
                "/customers",
                payload,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        },
    });
}

export function useUpdateCustomer(id: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CustomerRequest) => {
            const { data } = await api.put<CustomerResponse>(
                `/customers/${id}`,
                payload,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: customerKeys.detail(id),
            });
        },
    });
}
