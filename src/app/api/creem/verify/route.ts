import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify Creem payment status
 * GET /api/creem/verify?paymentId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing paymentId' },
        { status: 400 }
      );
    }

    // Creem.io API configuration
    const CREEM_API_KEY = process.env.CREEM_API_KEY || 'your-api-key-here';
    const CREEM_API_URL = process.env.CREEM_API_URL || 'https://api.creem.io/v1';

    // Verify payment status via Creem.io API
    const response = await fetch(`${CREEM_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CREEM_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { verified: false, error: 'Payment verification failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Check if payment is successful
    const isVerified = data.status === 'succeeded' || data.status === 'completed';

    return NextResponse.json({
      verified: isVerified,
      payment: {
        id: data.id,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        createdAt: data.created_at,
      },
    });

  } catch (error) {
    console.error('Creem verification error:', error);
    return NextResponse.json(
      { verified: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
