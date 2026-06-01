"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileBarChart,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  FileText,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const reportTypes = [
  { id: "inventory", name: "Inventory Summary", icon: FileText },
  { id: "consumables", name: "Consumable Usage", icon: FileSpreadsheet },
  { id: "requests", name: "Request History", icon: FileText },
  { id: "low-stock", name: "Low Stock Report", icon: FileSpreadsheet },
  { id: "expiry", name: "Expiration Report", icon: FileText },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentId, setDepartmentId] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["reports", activeTab, startDate, endDate, departmentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("type", activeTab);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (departmentId && departmentId !== "all") {
        params.set("departmentId", departmentId);
      }

      const res = await fetch(`/api/reports?${params}`);
      if (!res.ok) throw new Error("Failed to generate report");
      return res.json();
    },
  });

  const handleExportExcel = () => {
    toast.success("Excel export started");
  };

  const handleExportPDF = () => {
    toast.success("PDF export started");
  };

  const handlePrint = () => {
    window.print();
  };

  const renderReportTable = () => {
    if (!data) return null;

    switch (activeTab) {
      case "inventory":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property #</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items?.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{item.propertyNumber}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.status}</Badge>
                  </TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.assignedTo}</TableCell>
                  <TableCell>{item.purchaseDate}</TableCell>
                  <TableCell>{item.purchaseCost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "consumables":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property #</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Expiry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items?.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{item.propertyNumber}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unitType}</TableCell>
                  <TableCell>{item.reorderLevel}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.expirationDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "requests":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request #</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.requests?.map((req: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{req.requestNumber}</TableCell>
                  <TableCell>{req.itemName}</TableCell>
                  <TableCell>{req.requester}</TableCell>
                  <TableCell>{req.quantity}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{req.status}</Badge>
                  </TableCell>
                  <TableCell>{req.priority}</TableCell>
                  <TableCell>{req.approvedBy}</TableCell>
                  <TableCell>{req.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "low-stock":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property #</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Qty</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Critical Level</TableHead>
                <TableHead>Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items?.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{item.propertyNumber}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-800">{item.quantity}</Badge>
                  </TableCell>
                  <TableCell>{item.reorderLevel}</TableCell>
                  <TableCell>{item.criticalLevel}</TableCell>
                  <TableCell>{item.department}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "expiry":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property #</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Batch #</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items?.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{item.propertyNumber}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.batchNumber}</TableCell>
                  <TableCell>{item.expirationDate}</TableCell>
                  <TableCell>
                    <Badge className={
                      item.daysRemaining < 0 
                        ? "bg-red-100 text-red-800" 
                        : item.daysRemaining <= 7 
                          ? "bg-orange-100 text-orange-800" 
                          : "bg-yellow-100 text-yellow-800"
                    }>
                      {item.daysRemaining < 0 ? "Expired" : `${item.daysRemaining} days`}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.department}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and export inventory reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {reportTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-colors ${
              activeTab === type.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab(type.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <type.icon className={`h-5 w-5 ${activeTab === type.id ? "text-blue-600" : "text-gray-400"}`} />
                <span className={`text-sm font-medium ${activeTab === type.id ? "text-blue-900" : "text-gray-700"}`}>
                  {type.name}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="dept1">IT Department</SelectItem>
                <SelectItem value="dept2">HR Department</SelectItem>
                <SelectItem value="dept3">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {data?.title || "Report"}
            {data?.generatedAt && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                Generated: {new Date(data.generatedAt).toLocaleString()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Generating report...</div>
          ) : data?.totalItems === 0 || data?.totalRequests === 0 ? (
            <div className="text-center py-8 text-gray-500">No data found for the selected criteria</div>
          ) : (
            <div className="overflow-x-auto">
              {renderReportTable()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}