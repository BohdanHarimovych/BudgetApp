import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/server';
import { z } from 'zod';
import Papa from 'papaparse';

// Define a schema for validating transaction data
const TransactionSchema = z.object({
  transaction_date: z.string()
    .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  amount: z.number()
    .or(z.string().regex(/^-?\d+(\.\d+)?$/).transform(val => parseFloat(val))),
  description: z.string().min(1, { message: 'Description is required' }),
  category: z.string().optional()
});

export async function POST(request: Request) {
  try {
    // Authenticate user
    const { user, supabase } = await requireAuth();
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Read file content
    const fileContent = await file.text();
    
    // Parse CSV with Papa Parse
    const parseResult = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase()
    });
    
    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
      return NextResponse.json({
        error: 'Failed to parse CSV file',
        details: parseResult.errors
      }, { status: 400 });
    }
    
    // Validate and transform data
    const parsedData = parseResult.data as Record<string, unknown>[];
    
    if (parsedData.length === 0) {
      return NextResponse.json({ error: 'No data found in CSV' }, { status: 400 });
    }
    
    // Create a stats object to track processing
    const stats = {
      processed: 0,
      skipped: 0,
      failed: 0,
      total: parsedData.length
    };
    
    // Process transactions in batches
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < parsedData.length; i += batchSize) {
      batches.push(parsedData.slice(i, i + batchSize));
    }
    
    // Process each batch
    const processedTransactions = [];
    
    for (const batch of batches) {
      for (const row of batch) {
        try {
          // Validate row data against schema
          const validationResult = TransactionSchema.safeParse(row);
          
          if (!validationResult.success) {
            console.error('Validation error:', validationResult.error);
            stats.failed++;
            continue;
          }
          
          const validData = validationResult.data;
          
          // Create transaction object
          const transaction = {
            transaction_date: new Date(validData.transaction_date).toISOString(),
            amount: validData.amount,
            description: validData.description,
            user_id: user.id,
            category_id: null // Will be updated if category exists
          };
          
          // Check if category needs to be processed
          if (validData.category) {
            try {
              // Look for existing category or create a new one
              const { data: categoryData, error: categoryError } = await supabase
                .from('categories')
                .select('id')
                .eq('title', validData.category)
                .eq('user_id', user.id)
                .maybeSingle();
              
              if (categoryError) throw categoryError;
              
              if (categoryData) {
                transaction.category_id = categoryData.id;
              } else {
                // Create new category
                const { data: newCategory, error: newCategoryError } = await supabase
                  .from('categories')
                  .insert({
                    title: validData.category,
                    user_id: user.id
                  })
                  .select('id')
                  .single();
                
                if (newCategoryError) throw newCategoryError;
                
                if (newCategory) {
                  transaction.category_id = newCategory.id;
                }
              }
            } catch (error) {
              console.error('Category processing error:', error);
              // Continue with transaction, but without category
            }
          }
          
          // Add to processed transactions
          processedTransactions.push(transaction);
          stats.processed++;
        } catch (error) {
          console.error('Processing error:', error);
          stats.failed++;
        }
      }
    }
    
    // Insert processed transactions into the database
    if (processedTransactions.length > 0) {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert(processedTransactions);
      
      if (insertError) {
        console.error('Database insertion error:', insertError);
        return NextResponse.json({
          error: 'Failed to save transactions',
          details: insertError.message
        }, { status: 500 });
      }
    }
    
    // Return success with stats
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${stats.processed} transactions`,
      processed: stats.processed,
      skipped: stats.skipped,
      failed: stats.failed,
      total: stats.total
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process file'
    }, { status: 500 });
  }
}