"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept = {
    "application/pdf": [".pdf"],
    "image/*": [".png", ".jpg", ".jpeg"],
  },
  maxSize = 5 * 1024 * 1024,
  maxFiles = 5,
  className,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 font-medium">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, PNG, JPG up to {maxSize / 1024 / 1024}MB
            </p>
          </>
        )}
      </div>

      {acceptedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected files:</p>
          {acceptedFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              <File className="h-4 w-4 text-gray-400" />
              <span className="text-sm flex-1">{file.name}</span>
              <span className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
        </div>
      )}

      {fileRejections.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-red-600">Rejected files:</p>
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="flex items-center gap-3 p-2 bg-red-50 rounded-lg"
            >
              <X className="h-4 w-4 text-red-400" />
              <span className="text-sm flex-1">{file.name}</span>
              <span className="text-xs text-red-500">
                {errors.map((e) => e.message).join(", ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}