import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { BulkUploadResult } from "@/types";
import { customerKeys } from "./useCustomer";

export function useBulkUpload() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            const { data } = await api.post<BulkUploadResult>(
                "/customers/bulk/upload",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        },
    });
}
