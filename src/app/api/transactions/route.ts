// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const daysParam = searchParams.get('days') || '30';
    const days = parseInt(daysParam, 10);

    const { user, supabase } = await requireAuth()
    
    // Get date from X days ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    

    // const user = supabase.auth.getUser()
    console.log("[API Transactions] User id: ", user.id)
    
    // Query transactions from the past X days
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`*,
        category:category_id(title),
        merchant:merchant_id(name)
        `)
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .order('transaction_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
    
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Unexpected error in transactions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}