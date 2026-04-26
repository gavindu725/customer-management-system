"use client";

import { useRef, useState } from "react";
import {
    Upload,
    FileSpreadsheet,
    X,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBulkUpload } from "@/hooks/useBulkUpload";
import type { BulkUploadResult } from "@/types";

interface BulkUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function BulkUploadDialog({
    open,
    onOpenChange,
}: BulkUploadDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [result, setResult] = useState<BulkUploadResult | null>(null);

    const { mutateAsync, isPending } = useBulkUpload();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file && !file.name.toLowerCase().endsWith(".xlsx")) {
            toast.error("Only .xlsx files are supported.");
            return;
        }
        setSelectedFile(file);
        setResult(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] ?? null;
        if (file && !file.name.toLowerCase().endsWith(".xlsx")) {
            toast.error("Only .xlsx files are supported.");
            return;
        }
        setSelectedFile(file);
        setResult(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        try {
            const uploadResult = await mutateAsync(selectedFile);
            setResult(uploadResult);
            if (uploadResult.failureCount === 0) {
                toast.success(
                    `${uploadResult.successCount} customers imported successfully.`,
                );
            } else if (uploadResult.successCount > 0) {
                toast.warning(
                    `${uploadResult.successCount} imported, ${uploadResult.failureCount} failed.`,
                );
            } else {
                toast.error(
                    "All rows failed to import. Check the errors below.",
                );
            }
        } catch {
            toast.error("Upload failed. Please check the file and try again.");
        }
    };

    const handleClose = () => {
        if (isPending) return;
        setSelectedFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onOpenChange(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleClose}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Customers</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Drop zone — hidden after a successful upload */}
                    {!result && (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors hover:bg-muted/50 select-none"
                        >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-center">
                                <p className="text-sm font-medium">
                                    {selectedFile
                                        ? "Change file"
                                        : "Drop your file here"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Only{" "}
                                    <span className="font-semibold">.xlsx</span>{" "}
                                    files are accepted
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    )}

                    {/* Selected file indicator */}
                    {selectedFile && !result && (
                        <div className="flex items-center gap-3 border rounded-lg px-3 py-2 bg-muted/40 text-sm">
                            <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
                            <span className="flex-1 truncate font-medium">
                                {selectedFile.name}
                            </span>
                            <span className="text-muted-foreground whitespace-nowrap">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(null);
                                    if (fileInputRef.current)
                                        fileInputRef.current.value = "";
                                }}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="space-y-3">
                            {/* Summary row */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="border rounded-lg p-3">
                                    <p className="text-2xl font-semibold">
                                        {result.totalRows}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Total Rows
                                    </p>
                                </div>
                                <div className="border rounded-lg p-3">
                                    <p className="text-2xl font-semibold text-green-600">
                                        {result.successCount}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Imported
                                    </p>
                                </div>
                                <div className="border rounded-lg p-3">
                                    <p className="text-2xl font-semibold text-destructive">
                                        {result.failureCount}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Failed
                                    </p>
                                </div>
                            </div>

                            {/* Status badge */}
                            <div className="flex items-center gap-2">
                                {result.failureCount === 0 ? (
                                    <Badge
                                        variant="default"
                                        className="gap-1"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        All rows imported successfully
                                    </Badge>
                                ) : result.successCount === 0 ? (
                                    <Badge
                                        variant="destructive"
                                        className="gap-1"
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                        All rows failed
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="gap-1"
                                    >
                                        Partial import — {result.failureCount}{" "}
                                        row(s) failed
                                    </Badge>
                                )}
                            </div>

                            {/* Error list */}
                            {result.errors.length > 0 && (
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
                                        Error Details ({result.errors.length}{" "}
                                        shown)
                                    </div>
                                    <ul className="max-h-40 overflow-y-auto divide-y text-xs">
                                        {result.errors.map((err, i) => (
                                            <li
                                                key={i}
                                                className="px-3 py-2 text-destructive"
                                            >
                                                {err}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Upload another */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    setResult(null);
                                    setSelectedFile(null);
                                    if (fileInputRef.current)
                                        fileInputRef.current.value = "";
                                }}
                            >
                                Upload Another File
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isPending}
                    >
                        {result ? "Close" : "Cancel"}
                    </Button>
                    {!result && (
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isPending}
                        >
                            {isPending ? "Uploading..." : "Upload"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
