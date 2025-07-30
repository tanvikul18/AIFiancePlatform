import { useEffect, useState } from "react";
import { Calendar, Loader } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import * as z from "zod";
import { toast } from "sonner";

import {
  TRANSACTION_FREQUENCY,
  TRANSACTION_TYPE,
  CATEGORIES,
  PAYMENT_METHODS,
} from "../../constant/index.js";

import {
  useCreateTransactionMutation,
  useGetSingleTransactionQuery,
  useUpdateTransactionMutation,
} from "../../features/transaction/transactionAPI.js";

import { cn } from "../../lib/utils.js";
import RecieptScanner from "./reciept-scanner.jsx";
import CurrencyInputField from "../ui/currency-input.jsx";
import { SingleSelector } from "../ui/single-select.jsx";

import { Button } from "../ui/button.jsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form.jsx";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input.jsx";
import { Textarea } from "../ui/textarea.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select.jsx";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover.jsx";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number.",
  }),
  type: z.enum(["INCOME", "EXPENSE"], {
  required_error: "Please select a transaction type.",
}),
  category: z.string().min(1, { message: "Please select a category." }),
  date: z.date({ required_error: "Please select a date." }),
  paymentMethod: z.string().min(1, { message: "Please select a payment method." }),
  isRecurring: z.boolean(),
  frequency: z.enum(Object.values(TRANSACTION_FREQUENCY)).nullable().optional(),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
});

const TransactionForm = ({ onCloseDrawer, isEdit, transactionId }) => {
  const [isScanning, setIsScanning] = useState(false);
  const { data, isLoading } = useGetSingleTransactionQuery(transactionId || "", {
    skip: !transactionId,
  });

  const editData = data?.transaction;
  const [createTransaction, { isLoading: isCreating }] = useCreateTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      type: "INCOME",
      category: "",
      date: new Date(),
      paymentMethod: "",
      isRecurring: false,
      frequency: null,
      description: "",
      receiptUrl: "",
    },
  });

  useEffect(() => {
    if (isEdit && transactionId && editData) {
      form.reset({
        ...editData,
        amount: editData.amount.toString(),
        category: editData.category?.toLowerCase(),
        date: new Date(editData.date),
        frequency: editData.recurringInterval,
      });
    }
  }, [isEdit, transactionId, editData, form]);

  const frequencyOptions = Object.values(TRANSACTION_FREQUENCY).map((value) => ({
    value,
    label: value.replace("_", " ").toLowerCase(),
  }));

  const handleScanComplete = (scannedData) => {
    console.log(scannedData)
    form.reset({
      ...form.getValues(),
      ...scannedData,
      amount: scannedData.amount?.toString() || "",
      date: new Date(scannedData.date),
      type: scannedData.type || "EXPENSE",
      category: scannedData.category?.toLowerCase() || "",
      receiptUrl: scannedData.receiptUrl || "",
    });
  };

  const onSubmit = async (values) => {
    console.log("Values",values)
    const payload = {
      ...values,
      amount: Number(values.amount),
      date: values.date.toISOString(),
      recurringInterval: values.frequency,
    };

    try {
      if (isEdit && transactionId) {
        await updateTransaction({ id: transactionId, transaction: payload }).unwrap();
        toast.success("Transaction updated successfully");
      } else {
        await createTransaction(payload).unwrap();
        form.reset();
        toast.success("Transaction created successfully");
      }

      onCloseDrawer?.();
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="relative pb-10 pt-5 px-2.5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
          {!isEdit && (
            <RecieptScanner
              loadingChange={isScanning}
              onLoadingChange={setIsScanning}
              onScanComplete={handleScanComplete}
            />
          )}
         
          {/* Transaction Type */}
          
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Transaction Type</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex space-x-2"
                    disabled={isScanning}
                  >
                    <label
                      htmlFor={TRANSACTION_TYPE.INCOME}
                      className={cn(
                        `text-sm font-normal leading-none cursor-pointer
                        flex items-center space-x-2 rounded-md 
                        shadow-sm border p-2 flex-1 justify-center 
                        `,
                        field.value === TRANSACTION_TYPE.INCOME &&
                          "!border-primary"
                      )}
                    >
                      <RadioGroupItem
                        value={TRANSACTION_TYPE.INCOME}
                        id={TRANSACTION_TYPE.INCOME}
                        className="!border-primary"
                      />
                      Income
                    </label>

                    <label
                      htmlFor={TRANSACTION_TYPE.EXPENSE}
                      className={cn(
                        `text-sm font-normal leading-none cursor-pointer
                        flex items-center space-x-2 rounded-md 
                        shadow-sm border p-2 flex-1 justify-center 
                        `,
                        field.value === TRANSACTION_TYPE.EXPENSE &&
                          "!border-primary"
                      )}
                    >
                      <RadioGroupItem
                        value={TRANSACTION_TYPE.EXPENSE}
                        id={TRANSACTION_TYPE.EXPENSE}
                        className="!border-primary"
                      />
                      Expense
                    </label>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />



          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Transaction title" {...field} disabled={isScanning} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <CurrencyInputField
                    {...field}
                    disabled={isScanning}
                    onValueChange={(val) => field.onChange(val || "")}
                    placeholder="$0.00"
                    prefix="$"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <SingleSelector
                  value={
                    CATEGORIES.find((c) => c.value === field.value) || { value: field.value, label: field.value }
                  }
                  onChange={(opt) => field.onChange(opt.value)}
                  options={CATEGORIES}
                  placeholder="Select or type a category"
                  creatable
                  disabled={isScanning}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 !pointer-events-auto" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("2023-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isScanning}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Recurring Toggle */}
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between border p-4 rounded-lg">
                <div>
                  <FormLabel>Recurring Transaction</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    {field.value ? "This will repeat automatically" : "Set recurring to repeat this transaction"}
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      form.setValue("frequency", checked ? TRANSACTION_FREQUENCY.DAILY : null);
                    }}
                    disabled={isScanning}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Frequency (only show if recurring) */}
          {form.watch("isRecurring") && (
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" className="capitalize" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {frequencyOptions.map(({ value, label }) => (
                        <SelectItem key={value} value={value} className="capitalize">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none"
                    placeholder="Add notes about this transaction"
                    disabled={isScanning}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className="sticky bottom-0 bg-white dark:bg-background pb-2">
            <Button
              type="submit"
              className="w-full !text-white"
              disabled={isScanning || isCreating || isUpdating}
            >
              {(isCreating || isUpdating) && <Loader className="h-4 w-4 animate-spin mr-2" />}
              {isEdit ? "Update" : "Save"}
            </Button>
          </div>

          {/* Loader overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-background/70 z-50 flex justify-center items-center">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default TransactionForm;
