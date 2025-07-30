// ImportTransactionModal.js
import React, { useState } from "react";
import { Dialog, DialogContent } from "../../ui/dialog.jsx";
import { Button } from "../../ui/button";
import { ImportIcon } from "lucide-react";
import FileUploadStep from "./file-upload.jsx";
import ColumnMappingStep from "./column-mapping-step.jsx";
import ConfirmationStep from "./confimation-step.jsx";

export default function ImportTransactionModal() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [csvColumns, setCsvColumns] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [mappings, setMappings] = useState({});
  const [open, setOpen] = useState(false);

  const transactionFields = [
    { fieldName: "title", required: true },
    { fieldName: "amount", required: true },
    { fieldName: "type", required: true },
    { fieldName: "date", required: true },
    { fieldName: "category", required: true },
    { fieldName: "paymentMethod", required: true },
    { fieldName: "description", required: false },
  ];

  const handleFileUpload = (f, columns, data) => {
    setFile(f);
    setCsvColumns(columns);
    setCsvData(data);
    setMappings({});
    setStep(2);
  };

  const resetImport = () => {
    setFile(null);
    setCsvColumns([]);
    setMappings({});
    setStep(1);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetImport, 300);
  };

  const handleMappingComplete = (map) => {
    setMappings(map);
    setStep(3);
  };

  const handleBack = (toStep) => {
    setStep(toStep);
  };

  const renderStep = () => {
    if (step === 1) {
      return <FileUploadStep onFileUpload={handleFileUpload} />;
    }
    if (step === 2) {
      return (
        <ColumnMappingStep
          csvColumns={csvColumns}
          mappings={mappings}
          transactionFields={transactionFields}
          onComplete={handleMappingComplete}
          onBack={() => handleBack(1)}
        />
      );
    }
    if (step === 3) {
      return (
        <ConfirmationStep
          file={file}
          mappings={mappings}
          csvData={csvData}
          onBack={() => handleBack(2)}
          onComplete={handleClose}
        />
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <Button
        variant="outline"
        className="!shadow-none !cursor-pointer !border-gray-500 !text-white !bg-transparent"
        onClick={() => setOpen(true)}
      >
        <ImportIcon className="!w-5 !h-5" />
        Bulk Import
      </Button>

      <DialogContent className="max-w-2xl min-h-[40vh]">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
