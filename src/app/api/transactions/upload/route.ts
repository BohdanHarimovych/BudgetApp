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
  type: z.string().min(1, { message: 'Type is required' }),
  category: z.string().optional(),
  merchant: z.string().optional(),
  post_date: z.string().optional()
    .refine(val => !val || !isNaN(Date.parse(val)), { message: 'Invalid post date format' }),
  purchased_by: z.string().optional()
});


// Define header mappings from CSV to schema fields
const headerMappings: Record<string, string> = {
  // Date fields
  'transaction date': 'transaction_date',
  'date': 'transaction_date',
  'post date': 'post_date', 
  'clearing date': 'post_date',
  
  // Description/merchant fields
  'description': 'description',
  'merchant': 'merchant',
  'merchant name': 'merchant',
  
  // Amount fields
  'amount': 'amount',
  'amount (usd)': 'amount',
  
  // Type fields
  'type': 'type',
  'transaction type': 'type',
  'category': 'category',
  
  // Additional fields
  'purchased by': 'purchased_by',
  'purchaser': 'purchased_by'
};

// Helper function to normalize header names
function normalizeHeader(header: string): string {
  return header.toLowerCase().trim();
}

// Helper function to map CSV headers to schema fields
function mapHeader(header: string): string {
  const normalized = normalizeHeader(header);
  return headerMappings[normalized] || normalized;
}


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
      transformHeader: (header: string) => mapHeader(header)
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
            post_date: validData.post_date ? new Date(validData.post_date).toISOString() : null,
            amount: validData.amount,
            description: validData.description,
            type: validData.type,
            purchased_by: validData.purchased_by || null,
            merchant_src: validData.merchant || null,
            user_id: user.id,
            merchant_id: null, // Will be updated if merchant mapping exists
            category_id: null // Will be updated if category exists or based on merchant
          };
          
          // Check if merchant needs to be processed
          if (validData.merchant) {
            try {
              // First, check if merchant exists directly in the merchant table
              const { data: directMerchantData, error: directMerchantError } = await supabase
                .from('merchant')
                .select('id, category_id')
                .eq('name', validData.merchant)
                .maybeSingle();
              
              if (directMerchantError) throw directMerchantError;
              
              if (directMerchantData) {
                // Direct match found in merchant table
                transaction.merchant_id = directMerchantData.id;
                
                // Set category_id if available from merchant
                if (directMerchantData.category_id) {
                  transaction.category_id = directMerchantData.category_id;
                }
              } else {
                // No direct match, check merchant_map
                const { data: merchantMapData, error: merchantMapError } = await supabase
                  .from('merchant_map')
                  .select('merchant_id')
                  .eq('merchant_src', validData.merchant)
                  .maybeSingle();
                
                if (merchantMapError) throw merchantMapError;
                
                if (merchantMapData && merchantMapData.merchant_id) {
                  // Merchant mapping exists, set merchant_id
                  transaction.merchant_id = merchantMapData.merchant_id;
                  
                  // Get the merchant details to set category_id
                  const { data: merchantData, error: merchantError } = await supabase
                    .from('merchant')
                    .select('category_id')
                    .eq('id', merchantMapData.merchant_id)
                    .maybeSingle();
                  
                  if (!merchantError && merchantData && merchantData.category_id) {
                    transaction.category_id = merchantData.category_id;
                  }
                } else {
                  // If merchantMapData is null, it means the entry doesn't exist yet
                  // We already checked for existence with the previous maybeSingle() query
                  if (merchantMapData === null) {
                    // Insert into merchant_map table with null merchant_id to indicate unmapped merchant
                    const { error: mapError } = await supabase
                      .from('merchant_map')
                      .insert({
                        merchant_src: validData.merchant,
                        merchant_id: null // Leave as null to indicate it needs manual mapping
                      });
                    
                    if (mapError) throw mapError;
                  }
                  // We don't set merchant_id on the transaction since there's no mapping yet
                }
              }
            } catch (error) {
              console.error('Merchant processing error:', error);
              // Continue with transaction, but without merchant info
            }
          }
          
          // Check if category needs to be processed (only if not already set by merchant)
          if (validData.category && !transaction.category_id) {
            try {
              // Look for existing category or create a new one
              const { data: categoryData, error: categoryError } = await supabase
                .from('category')
                .select('id')
                .eq('title', validData.category)
                .maybeSingle();
              
              if (categoryError) throw categoryError;
              
              if (categoryData) {
                transaction.category_id = categoryData.id;
              } else {
                // Create new category
                const { data: newCategory, error: newCategoryError } = await supabase
                  .from('category')
                  .insert({
                    title: validData.category
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