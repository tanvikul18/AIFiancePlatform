// transactionColumns.js
import React from "react";
import {
  ArrowUpDown,
  CircleDot,
  Copy,
  Loader,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Checkbox } from "../../../components/ui/checkbox";
import { formatCurrency } from "../../../lib/format-currency";
import { useEditTxn } from "../../../context/edit-transaction-context.jsx";
import {
  useDeleteTransactionMutation,
  useDuplicateTransactionMutation,
} from "../../../features/transaction/transactionAPI";
import { toast } from "sonner";
import { TRANSACTION_FREQUENCY, TRANSACTION_TYPE } from "../../../constant/index.js";

export const transactionColumns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
   
      <Checkbox
        checked={row.getIsSelected()}
         indeterminate={row.getIsSomeSelected()}
         disabled={!row.getCanSelect()}
        onCheckedChange={(value) => {
       
        row.toggleSelected(!!value);
      }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Date Created <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(row.getValue("createdAt"), "MMM dd, yyyy"),
  },
  { accessorKey: "title", header: "Title" },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="!pl-0"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Category <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.original.category}</div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Type <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.getValue("type") === TRANSACTION_TYPE.INCOME
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.getValue("type")}
        </span>
      </div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amt = parseFloat(row.getValue("amount"));
      console.log(amt)
      const type = row.getValue("type");
      return (
        <div
          className={`text-right font-medium ${
            type === TRANSACTION_TYPE.INCOME
              ? "text-green-600"
              : "text-destructive"
          }`}
        >
          {type === TRANSACTION_TYPE.EXPENSE ? "-" : "+"}
          {formatCurrency(amt)}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Transaction Date <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(row.original.date, "MMM dd, yyyy"),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => {
      const pm = row.original.paymentMethod;
      if (!pm) return "N/A";
      return (
        <div className="capitalize">{pm.replace("_", " ").toLowerCase()}</div>
      );
    },
  },
  {
    accessorKey: "recurringInterval",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Frequently <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const freq = row.getValue("recurringInterval");
      const next = row.original.nextRecurringDate;
      const isRec = row.original.isRecurring;
      const frequencyMap = isRec
        ? {
            [ TRANSACTION_FREQUENCY.DAILY ]: { label: "Daily", icon: RefreshCw },
            [ TRANSACTION_FREQUENCY.WEEKLY ]: { label: "Weekly", icon: RefreshCw },
            [ TRANSACTION_FREQUENCY.MONTHLY ]: { label: "Monthly", icon: RefreshCw },
            [ TRANSACTION_FREQUENCY.YEARLY ]: { label: "Yearly", icon: RefreshCw },
            DEFAULT: { label: "One-time", icon: CircleDot },
          }
        : { DEFAULT: { label: "One-time", icon: CircleDot } };

      const info = frequencyMap[isRec ? freq : "DEFAULT"] || frequencyMap.DEFAULT;
      const Icon = info.icon;
      return (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span>{info.label}</span>
            {next && isRec && (
              <span className="text-xs text-muted-foreground">
                Next: {format(next, "MMM dd yyyy")}
              </span>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => 
      
    <ActionsCell row={row} />,
  },
];

function ActionsCell({ row }) {
  const id = row.original._id;
 
 const { onOpenDrawer, open, transactionId, onCloseDrawer } = useEditTxn();

  const [duplicate, { isLoading: duplicating }] = useDuplicateTransactionMutation();
  const [delTxn, { isLoading: deleting }] = useDeleteTransactionMutation();

  const doDuplicate = (e) => {
    e.preventDefault();
    if (duplicating) return;
    duplicate(id)
      .unwrap()
      .then(() => toast.success("Transaction duplicated"))
      .catch((err) => toast.error(err.data?.message || "Duplication failed"));
  };

  const doDelete = (e) => {
    e.preventDefault();
    if (deleting) return;
    delTxn(id)
      .unwrap()
      .then(() => toast.success("Deleted"))
      .catch((err) => toast.error(err.data?.message || "Delete failed"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44" align="end">
        <DropdownMenuItem onClick={() => onOpenDrawer(id)}>
          <Pencil className="mr-1 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem disabled={duplicating} onSelect={doDuplicate}>
          <Copy className="mr-1 h-4 w-4" /> Duplicate
          {duplicating && (
            <Loader className="ml-1 h-4 w-4 absolute right-2 animate-spin" />
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={deleting} className="!text-destructive" onSelect={doDelete}>
          <Trash2 className="mr-1 h-4 w-4 !text-destructive" /> Delete
          {deleting && (
            <Loader className="ml-1 h-4 w-4 absolute right-2 animate-spin" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
