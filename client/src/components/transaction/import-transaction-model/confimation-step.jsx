// ConfirmationStep.js
import React, { useState } from "react";
import { z } from "zod";
import { ChevronDown, ChevronLeft, FileCheck } from "lucide-react";
import { Button } from "../../ui/button.jsx";
import { Progress } from "../../ui/progress";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { TRANSACTION_TYPE, PAYMENT_METHODS_ENUM, MAX_IMPORT_LIMIT } from "../../../constant/index.js";
import { toast } from "sonner";
import { useProgressLoader } from "../../../hooks/use-progress-loader";
import { useBulkImportTransactionMutation } from "../../../features/transaction/transactionAPI";

const transactionSchema = z.object({
  title: z.string().nonempty("Title is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  date: z.preprocess(val => new Date(val), z.date()),
  type: z.enum([TRANSACTION_TYPE.INCOME, TRANSACTION_TYPE.EXPENSE]),
  category: z.string().nonempty("Category is required"),
  paymentMethod: z
    .union([
      z.literal(""),
      z.enum(Object.values(PAYMENT_METHODS_ENUM))
    ])
    .optional()
    .transform(val => val === "" ? undefined : val),
});

export default function ConfirmationStep({ file, mappings, csvData, onComplete, onBack }) {
  const [errors, setErrors] = useState({});
  const { progress, isLoading, startProgress, updateProgress, doneProgress, resetProgress } = useProgressLoader({ initialProgress: 10, completionDelay: 500 });
  const [bulkImportTransaction] = useBulkImportTransactionMutation();

  const getMappedTransactions = () => {
    let validationError = false;
    const results = [];

    csvData.forEach((row, idx) => {
      const transaction = {};
      Object.entries(mappings).forEach(([csvCol, txField]) => {
        if (txField !== "Skip" && row[csvCol] !== undefined) {
          const val = row[csvCol];
          transaction[txField] = txField === "amount" ? Number(val)
            : txField === "date" ? new Date(val)
            : val;
        }
      });

      try {
        const validated = transactionSchema.parse(transaction);
        results.push(validated);
      } catch (err) {
        validationError = true;
        const msg = err.errors
          .map(e => `${e.path[0]}: ${e.message}`)
          .join("\n");
        setErrors(prev => ({ ...prev, [idx + 1]: msg }));
      }
    });

    return { transactions: results, validationError };
  };

  const handleImport = () => {
    const { transactions, validationError } = getMappedTransactions();
    if (validationError) return;
    if (transactions.length > MAX_IMPORT_LIMIT) {
      toast.error(`Cannot import more than ${MAX_IMPORT_LIMIT} transactions`);
      return;
    }

    resetProgress();
    startProgress(10);
    let current = 10;
    const interval = setInterval(() => {
      const inc = current < 90 ? 10 : 1;
      current = Math.min(current + inc, 90);
      updateProgress(current);
    }, 250);

    bulkImportTransaction({ transactions })
      .unwrap()
      .then(() => {
        updateProgress(100);
        toast.success("Imported transactions successfully");
      })
      .catch(err => {
        resetProgress();
        toast.error(err.data?.message || "Failed to import transactions");
      })
      .finally(() => {
        clearInterval(interval);
        setTimeout(() => {
          doneProgress();
          resetProgress();
          onComplete();
        }, 500);
      });
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-1">
          Confirm Import
        </DialogTitle>
        <DialogDescription>Review your settings before importing</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="border rounded-md p-4">
          <h4 className="flex items-center gap-1 font-medium mb-2">
            <FileCheck className="w-4 h-4" /> Import Summary
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">File</p><p>{file?.name}</p></div>
            <div><p className="text-muted-foreground">Columns Mapped</p><p>{Object.keys(mappings).length}</p></div>
            <div><p className="text-muted-foreground">Transactions</p><p>{csvData.length}</p></div>
            <div><p className="text-muted-foreground">Transactions Limit</p><p>{MAX_IMPORT_LIMIT}</p></div>
          </div>
        </div>

        {hasErrors && (
          <div className="border border-red-100 bg-[#fef2f2] rounded text-sm overflow-y-auto max-h-60">
            <p className="sticky top-0 bg-[#fef2f2] px-2 py-1 font-medium">Issues found:</p>
            <div className="p-2 space-y-1">
              {Object.entries(errors).map(([row, msg]) => (
                <details key={row} className="group">
                  <summary className="flex justify-between cursor-pointer text-red-600">
                    <span>Row {row}</span>
                    <ChevronDown className="w-4 h-4 transform group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pl-2 text-xs text-red-500 border-l-2 border-red-200">
                    {msg.split("\n").map((l,i) => <p key={i}>{l}</p>)}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">Importing... {progress}%</p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={handleImport} disabled={isLoading}>
          {isLoading ? "Importing..." : "Confirm Import"}
        </Button>
      </div>
    </div>
  );
}
