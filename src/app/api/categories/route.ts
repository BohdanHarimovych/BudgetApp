import { NextResponse } from 'next/server';

// GET handler for retrieving categories
export async function GET(request: Request) {
  // This is a placeholder implementation
  // You'll replace this with your actual Supabase query logic
  console.log(request)
  return NextResponse.json({ 
    categories: [
      { id: 1, name: 'Food', color: '#FF5733' },
      { id: 2, name: 'Transport', color: '#33FF57' },
      { id: 3, name: 'Bills', color: '#3357FF' }
    ] 
  });
}

// POST handler for creating new categories
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // This is a placeholder implementation
    // You'll replace this with your actual Supabase insert logic
    
    return NextResponse.json({ success: true, category: body }, { status: 201 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}