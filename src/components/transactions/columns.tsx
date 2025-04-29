"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Transaction } from '@/types/transaction'
import { formatCurrency } from "@/lib/utils/currency"
import {DataTableColumnHeader} from "@/components/transactions/data-table"



export const TransactionTableColumns: ColumnDef<Transaction>[] = [
  // {
  //   accessorKey: "id",
  //   header: "Id",
  // },
  {
    accessorKey: "transaction_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const transaction = row.original;
      const formattedAmount = formatCurrency(transaction.amount);
      const textColorClass = transaction.amount < 0 ? 'text-red-500' : 'text-green-500';

      return <span className={`text-right ${textColorClass}`}>{formattedAmount}</span>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const transaction = row.original;
      return transaction.category?.title || 'Uncategorized';
    },
  },
  {
    accessorKey: "merchant",
    header: "Merchant",
    cell: ({ row }) => {
      const transaction = row.original;
      return transaction.merchant?.name || 'Unknown';
    },
  },
  // {
  //   accessorKey: "user_id",
  //   header: "user_id",
  // },
  // {
  //   accessorKey: "created_at",
  //   header: "created_at",
  // },
]

