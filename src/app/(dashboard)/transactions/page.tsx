'use client'

import { useEffect, useState } from 'react';
import { Transaction } from '@/types/transaction';
import { DataTable } from "@/components/transactions/data-table"
import { TransactionTableColumns } from "@/components/transactions/columns"




export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch('/api/transactions?days=30');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setTransactions(data.transactions);
      } catch (err) {
        setError('Error loading transactions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Recent Transactions</h2>
        <p className="text-muted-foreground">
          Viewing your transactions from the past 7 days.
        </p>
      </div>
      
      <div className="container mx-auto py-10">
      <DataTable columns={TransactionTableColumns} data={transactions} />
    </div>

    </div>
  );
}