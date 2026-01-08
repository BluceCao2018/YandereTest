import { NextRequest, NextResponse } from 'next/server';

/**
 * Create a Creem checkout session
 * POST /api/creem/checkout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { error: 'Missing product_id' },
        { status: 400 }
      );
    }

    // Creem.io API configuration
    const CREEM_API_KEY = process.env.CREEM_API_KEY || 'your-api-key-here';
    const CREEM_API_URL = process.env.CREEM_API_URL || 'https://test-api.creem.io/v1/checkouts';

    // Generate a unique request ID for this checkout
    const requestId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const requestBody = {
      product_id: productId,
      request_id: requestId,
      success_url: body.successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?payment=success`,
    };

    console.log('Creem API request:', {
      url: CREEM_API_URL,
      hasApiKey: !!CREEM_API_KEY,
      apiKeyPrefix: CREEM_API_KEY?.substring(0, 10) + '...',
      body: requestBody,
    });

    // Create checkout session via Creem.io API
    const response = await fetch(CREEM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CREEM_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Creem API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'API request failed' };
      }
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Failed to create checkout session', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('Creem API success response:', {
      id: data.id,
      checkoutUrl: data.checkout_url,
      productId: data.product_id,
      status: data.status,
    });

    // Return checkout URL and checkout ID
    return NextResponse.json({
      checkoutUrl: data.checkout_url,
      paymentId: data.id,
      checkoutId: data.id,
    });

  } catch (error) {
    console.error('Creem checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
