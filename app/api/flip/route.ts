import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Farcaster Frame flip action
    const isHeads = Math.random() < 0.5;
    const result = isHeads ? 'Heads' : 'Tails';
    
    // Return frame response
    return NextResponse.json({
      result,
      emoji: isHeads ? '🎉' : '🎊',
      message: `You got ${result}!`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to flip coin' },
      { status: 500 }
    );
  }
}
