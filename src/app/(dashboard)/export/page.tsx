"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "@/lib/export-utils";

const exportTypes = [
  { id: "inventory", name: "Inventory Items", icon: FileText },
  { id: "consumables", name: "Consumable Items", icon: FileSpreadsheet },
  { id: "requests", name: "Request History", icon: FileText },
  { id: "users", name: "Users List", icon: FileSpreadsheet },
  { id: "audit-logs", name: "Audit Logs", icon: FileJson },
];

const formats = [
  { id: "excel", name: "Excel (.xlsx)", icon: FileSpreadsheet },
  { id: "pdf", name: "PDF (.pdf)", icon: FileText },
  { id: "json", name: "JSON (.json)", icon: FileJson },
];

export default function ExportPage() {
  const [selectedType, setSelectedType] = useState("inventory");
  const [selectedFormat, setSelectedFormat] = useState("excel");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["export", selectedType, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("type", selectedType);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/reports?${params}`);
      if (!res.ok) throw new Error("Failed to fetch data");
      return res.json();
    },
  });

  const handleExport = async () => {
    if (!reportData) {
      toast.error("No data available to export");
      return;
    }

    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${selectedType}-export-${timestamp}`;

      if (selectedFormat === "excel") {
        let data: any[] = [];
        if (selectedType === "inventory") data = reportData.items || [];
        else if (selectedType === "consumables") data = reportData.items || [];
        else if (selectedType === "requests") data = reportData.requests || [];
        else if (selectedType === "users") data = reportData.users || [];
        else if (selectedType === "audit-logs") data = reportData.logs || [];

        if (data.length > 0) {
          exportToExcel(data, filename);
          toast.success("Excel file downloaded");
        } else {
          toast.error("No data to export");
        }
      } else if (selectedFormat === "pdf") {
        let headers: string[] = [];
        let rows: any[][] = [];

        if (selectedType === "inventory" && reportData.items) {
          headers = ["Property #", "Name", "Category", "Status", "Department", "Purchase Date"];
          rows = reportData.items.map((item: any) => [
            item.propertyNumber,
            item.itemName,
            item.category,
            item.status,
            item.department,
            item.purchaseDate,
          ]);
        } else if (selectedType === "consumables" && reportData.items) {
          headers = ["Property #", "Name", "Category", "Qty", "Unit", "Department"];
          rows = reportData.items.map((item: any) => [
            item.propertyNumber,
            item.itemName,
            item.category,
            item.quantity,
            item.unitType,
            item.department,
          ]);
        } else if (selectedType === "requests" && reportData.requests) {
          headers = ["Request #", "Item", "Requester", "Qty", "Status", "Date"];
          rows = reportData.requests.map((req: any) => [
            req.requestNumber,
            req.itemName,
            req.requester,
            req.quantity,
            req.status,
            req.createdAt,
          ]);
        }

        if (rows.length > 0) {
          exportToPDF(reportData.title || "Export", headers, rows, filename);
          toast.success("PDF file downloaded");
        } else {
          toast.error("No data to export");
        }
      } else if (selectedFormat === "json") {
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("JSON file downloaded");
      }
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
        <p className="text-gray-500 mt-1">Export your data in various formats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Select Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedType === type.id
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <type.icon className={`h-5 w-5 ${selectedType === type.id ? "text-blue-600" : "text-gray-400"}`} />
                <span className="font-medium">{type.name}</span>
                {selectedType === type.id && (
                  <Badge className="ml-auto bg-blue-100 text-blue-800">Selected</Badge>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Choose Format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedFormat === format.id
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <format.icon className={`h-5 w-5 ${selectedFormat === format.id ? "text-blue-600" : "text-gray-400"}`} />
                <span className="font-medium">{format.name}</span>
                {selectedFormat === format.id && (
                  <Badge className="ml-auto bg-blue-100 text-blue-800">Selected</Badge>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Apply Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                End Date
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {reportData && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>{reportData.totalItems || reportData.totalRequests || reportData.total || 0}</strong> records found
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleExport}
              disabled={isExporting || isLoading}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}