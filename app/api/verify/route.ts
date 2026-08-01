import { NextRequest, NextResponse } from 'next/server';

// It's a good practice to use an environment variable for your API URL
const API_URL = process.env.API_URL || 'http://127.0.0.1:8000/predict';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sms } = body;

    if (!sms) {
      return NextResponse.json({ message: 'SMS content is required' }, { status: 400 });
    }

    const apiRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sms }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      // Forward the error from the backend
      return NextResponse.json(data, { status: apiRes.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}