import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          backgroundImage: 'linear-gradient(to bottom right, #dbeafe, #fff, #fae8ff)',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🪙</div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 10,
          }}
        >
          Coin Flip On-Chain
        </div>
        <div style={{ fontSize: 30, color: '#6b7280' }}>
          Powered by Base Network
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
