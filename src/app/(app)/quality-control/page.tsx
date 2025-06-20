"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Camera,
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  Download,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import QRCodeDisplay from "react-qr-code";

type QualityCheck = {
  id: string;
  operationId: string;
  workOrder: string;
  partNumber: string;
  checkType: string;
  status: string;
  checkedBy: string;
  checkedAt: string | null;
  notes: string;
  measurements: { tolerance: string; actual: string } | null;
  qrCode: string;
  images: { id: string; url: string; caption: string }[];
};

const mockQualityChecks: QualityCheck[] = [
  {
    id: "QC-001",
    operationId: "OP-001",
    workOrder: "WO-2024-001",
    partNumber: "A234-M-01",
    checkType: "Visual",
    status: "passed",
    checkedBy: "John Doe",
    checkedAt: "2024-02-15T10:30:00",
    notes: "All components properly aligned, no visible defects",
    measurements: {
      tolerance: "±0.05mm",
      actual: "0.03mm",
    },
    qrCode: "WO-2024-001-A234-M-01",
    images: [
      { id: "1", url: "/api/placeholder/400/300", caption: "Front view" },
      { id: "2", url: "/api/placeholder/400/300", caption: "Side view" },
    ],
  },
  {
    id: "QC-002",
    operationId: "OP-002",
    workOrder: "WO-2024-002",
    partNumber: "B567-E-03",
    checkType: "Measurement",
    status: "failed",
    checkedBy: "Jane Smith",
    checkedAt: "2024-02-15T11:45:00",
    notes: "Dimensions exceed tolerance on width measurement",
    measurements: {
      tolerance: "±0.1mm",
      actual: "0.15mm",
    },
    qrCode: "WO-2024-002-B567-E-03",
    images: [
      { id: "3", url: "/api/placeholder/400/300", caption: "Measurement point" },
    ],
  },
  {
    id: "QC-003",
    operationId: "OP-003",
    workOrder: "WO-2024-001",
    partNumber: "C890-P-02",
    checkType: "Functional",
    status: "pending",
    checkedBy: "Mike Johnson",
    checkedAt: null,
    notes: "Awaiting electrical test results",
    measurements: null,
    qrCode: "WO-2024-001-C890-P-02",
    images: [],
  },
];

const checkTypeIcons = {
  Visual: Eye,
  Measurement: FileText,
  Functional: CheckCircle,
  Safety: AlertCircle,
};

const statusConfig = {
  passed: { variant: "completed" as const, icon: CheckCircle, color: "text-green-600" },
  failed: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
  pending: { variant: "pending" as const, icon: AlertCircle, color: "text-yellow-600" },
};

export default function QualityControlPage() {
  const [checks, setChecks] = useState<QualityCheck[]>(mockQualityChecks);
  const [selectedCheck, setSelectedCheck] = useState<QualityCheck | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "qr-scanner",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      const onScanSuccess = (decodedText: string) => {
        scanner.clear().then(() => {
          setIsScanning(false);
          const check = checks.find(c => c.qrCode === decodedText);
          if (check) {
            setSelectedCheck(check);
          } else {
            alert(`No quality check found for QR code: ${decodedText}`);
          }
        });
      };

      const onScanError = (error: any) => {
        // console.warn(error);
      };

      scanner.render(onScanSuccess, onScanError);

      return () => {
        if (scanner) {
          scanner.clear().catch(error => {
            console.error("Failed to clear scanner", error);
          });
        }
      };
    }
  }, [isScanning, checks]);

  const handleScan = () => {
    setIsScanning(true);
  };

  const handleImageUpload = (checkId: string) => {
    // In a real app, this would open a file picker and upload to server
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Mock upload - in real app would upload to server
        const newImage = {
          id: Date.now().toString(),
          url: URL.createObjectURL(file),
          caption: "New upload",
        };
        
        setChecks(prev => prev.map(check => 
          check.id === checkId 
            ? { ...check, images: [...check.images, newImage] }
            : check
        ));
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Control</h1>
          <p className="text-muted-foreground">
            Manage quality checks and inspections
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleScan}>
            <QrCode className="h-4 w-4 mr-2" />
            Scan QR Code
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Check
          </Button>
        </div>
      </div>

      {/* QR Scanner */}
      {isScanning && (
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="qr-scanner" />
            <Button 
              variant="outline" 
              className="mt-4 w-full"
              onClick={() => {
                setIsScanning(false);
                const scanner = document.getElementById('qr-scanner');
                if (scanner) scanner.innerHTML = '';
              }}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Checks</p>
                <p className="text-2xl font-bold">{checks.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-green-600">
                  {checks.filter(c => c.status === "passed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {checks.filter(c => c.status === "failed").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {checks.filter(c => c.status === "pending").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Checks List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Quality Checks</h2>
        {checks.map((check) => {
          const TypeIcon = checkTypeIcons[check.checkType as keyof typeof checkTypeIcons] || FileText;
          const statusInfo = statusConfig[check.status as keyof typeof statusConfig];

          return (
            <Card key={check.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {check.workOrder} - {check.partNumber}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {check.checkType} Inspection • {check.checkedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusInfo.variant}>
                      <statusInfo.icon className="h-3 w-3 mr-1" />
                      {check.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowQRCode(check.qrCode)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {check.notes && (
                    <p className="text-sm text-muted-foreground">{check.notes}</p>
                  )}
                  
                  {check.measurements && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">Tolerance:</span>
                      <span>{check.measurements.tolerance}</span>
                      <span className="font-medium">Actual:</span>
                      <span className={check.status === "failed" ? "text-red-600" : ""}>
                        {check.measurements.actual}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {check.images.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {check.images.length} photo(s)
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImageUpload(check.id)}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Add Photo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCheck(check)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* QR Code Display Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <QRCodeDisplay value={showQRCode} size={256} />
              <p className="text-sm text-muted-foreground">{showQRCode}</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowQRCode(null)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Details Modal */}
      {selectedCheck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quality Check Details</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCheck(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Check ID</p>
                  <p className="text-sm text-muted-foreground">{selectedCheck.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Work Order</p>
                  <p className="text-sm text-muted-foreground">{selectedCheck.workOrder}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Part Number</p>
                  <p className="text-sm text-muted-foreground">{selectedCheck.partNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Check Type</p>
                  <p className="text-sm text-muted-foreground">{selectedCheck.checkType}</p>
                </div>
              </div>
              
              {selectedCheck.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Photos</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCheck.images.map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-1">{img.caption}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}