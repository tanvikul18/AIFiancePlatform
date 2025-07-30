// ColumnMappingStep.js
import React, { useMemo, useState } from "react";
import { BanIcon, ChevronLeft, ChevronRight, FileSpreadsheet, HelpCircle } from "lucide-react";
import { Button } from "../../ui/button.jsx";
import { DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

export default function ColumnMappingStep({
  csvColumns,
  transactionFields,
  mappings: initialMappings,
  onComplete,
  onBack,
}) {
  const [mappings, setMappings] = useState(initialMappings || {});
  const [errors, setErrors] = useState({});

  const availableAttributes = useMemo(
    () => [{ fieldName: "Skip" }, ...transactionFields],
    [transactionFields]
  );

  const handleMappingChange = (csvColumn, field) => {
    setMappings(prev => ({ ...prev, [csvColumn]: field }));
    if (errors[csvColumn]) {
      const newErrors = { ...errors };
      delete newErrors[csvColumn];
      setErrors(newErrors);
    }
  };

  const validateMappings = () => {
    const newErrors = {};
    const usedFields = new Set();

    Object.entries(mappings).forEach(([csvColumn, field]) => {
      if (field !== "Skip" && usedFields.has(field)) {
        newErrors[csvColumn] = "Field already mapped";
      }
      if (field !== "Skip") {
        usedFields.add(field);
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const finalMappings = Object.fromEntries(
        Object.entries(mappings).filter(([_, field]) => field !== "Skip")
      );
      onComplete(finalMappings);
    }
  };

  const hasRequiredMappings = transactionFields.every(field =>
    !field.required || Object.values(mappings).includes(field.fieldName)
  );

  const validMappingsCount = Object.values(mappings).filter(field => field !== "Skip").length;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Map CSV Columns</DialogTitle>
        <DialogDescription>Match the columns from your file to the transaction fields</DialogDescription>
      </DialogHeader>

      <div className="border rounded-md overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CSV Column</TableHead>
              <TableHead>Transaction Field</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {csvColumns.map(column => (
              <TableRow key={column.id} className={column.hasError ? "!bg-red-50" : ""}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-500" />
                    <span>{column.name}</span>
                  </div>
                </TableCell>
                <TableCell className="pl-8">
                  <div className="flex w-full items-center gap-0">
                    <HelpCircle className="h-5 w-5 mr-2 text-slate-400" />
                    <div className="w-[200px]">
                      <Select
                        value={mappings[column.name] || ""}
                        onValueChange={(value) => handleMappingChange(column.name, value)}
                      >
                        <SelectTrigger className="border-none shadow-none focus:ring-0 pl-0" style={{ width: "100%" }}>
                          <SelectValue className="!text-muted-foreground w-full capitalize" placeholder="Select a field" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAttributes.map(attr => {
                            const isDisabled = (
                              attr.fieldName !== "Skip" &&
                              attr.fieldName !== mappings[column.name] &&
                              Object.values(mappings).includes(attr.fieldName)
                            );

                            return (
                              <SelectItem
                                key={attr.fieldName}
                                value={attr.fieldName}
                                className="w-full flex items-center justify-between gap-2"
                                disabled={isDisabled}
                              >
                                <span className="flex-1 capitalize">
                                  {attr.fieldName}
                                  {attr.required && <span className="text-red-500"> *</span>}
                                </span>
                                {isDisabled && <BanIcon className="currentColor size-4" />}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {errors[column.name] && <p className="text-[10px] text-red-500">{errors[column.name]}</p>}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={validateMappings} disabled={!hasRequiredMappings || hasErrors}>
          Continue ({validMappingsCount}/{transactionFields.length}) <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
