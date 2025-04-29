// src/types/transaction.ts
export interface Category {
    id: string;
    created_at: string;
    title: string;
  }

  export interface Merchant {
    id: string;
    created_at: string;
    name: string;
    category_id: string;
  }
  
export interface Transaction {
    id: number;
    transaction_date: string;
    amount: number;
    description: string;
    category_id?: number;
    category?: Category;
    merchant?: Merchant
    user_id: string;
    created_at: string;
  }