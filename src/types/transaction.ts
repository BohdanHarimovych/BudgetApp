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
    id: string;
    transaction_date: string;
    post_date?: string;
    amount: number;
    description: string;
    type: string;
    purchased_by?: string;
    merchant_src?: string;
    category_id?: string;
    category?: Category;
    merchant_id?: string;
    merchant?: Merchant;
    user_id: string;
    created_at: string;
  }
  
export interface MerchantMap {
    merchant_src: string;
    merchant_id: string;
  }