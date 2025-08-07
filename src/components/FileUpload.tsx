import { useState, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const processStatement = useAction(api.transactions.processStatement);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    console.log("File upload started:", file.name, file.type, file.size);
    
    const allowedTypes = ['.csv', '.pdf', '.xlsx', '.xls', '.png', '.jpg', '.jpeg'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    console.log("File extension:", fileExtension);
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error("Please upload a CSV, PDF, Excel file, or image (PNG/JPG)");
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    console.log("Starting file processing...");
    
    try {
      // Convert file to ArrayBuffer
      console.log("Converting file to ArrayBuffer...");
      const fileData = await file.arrayBuffer();
      
      console.log("File converted, size:", fileData.byteLength);

      // Process the statement directly
      console.log("Processing statement with AI...");
      const processResult = await processStatement({
        fileData,
        fileName: file.name,
        mediaType: file.type || "application/octet-stream",
      });

      console.log("Processing result:", processResult);
      toast.success(`Successfully processed ${processResult.transactionCount} transactions`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to process statement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Upload Bank Statement
        </h2>
        <p className="text-gray-600">
          Drag and drop your bank statement (CSV, PDF, Excel, or image), or click to browse
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? "border-primary bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf,.xlsx,.xls,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg font-medium text-gray-900">Processing statement...</p>
            <p className="text-sm text-gray-600">
              Our AI is parsing your transactions. This may take a moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your bank statement here
              </p>
              <p className="text-sm text-gray-600 mt-1">
                or <span className="text-primary font-medium">click to browse</span>
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Supports CSV, PDF, Excel, and image files up to 10MB
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Upload your bank statement in any supported format (CSV, PDF, Excel, or image)</li>
          <li>Our AI automatically detects and parses transaction data from the file</li>
          <li>Review and categorize your transactions</li>
          <li>Get insights into your spending patterns</li>
        </ol>
      </div>
    </div>
  );
}
