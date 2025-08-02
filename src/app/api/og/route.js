import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get('title') || 'easy-pdf';
  const description = searchParams.get('description') || 'Privacy-First PDF Tools';

  // Load Inter font
  const interRegular = await fetch(
    new URL('../../../../public/fonts/Inter-Regular.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interBold = await fetch(
    new URL('../../../../public/fonts/Inter-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

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
          backgroundColor: '#030712', // gray-950
          color: 'white',
          fontFamily: ''Inter', sans-serif',
          padding: '40px',
          border: '20px solid',
          borderColor: '#1e40af' // blue-800
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <img 
            src="https://easy-pdf-murex.vercel.app/icon.png" 
            width="80" 
            height="80" 
            alt="easy-pdf Logo"
            style={{ marginRight: '20px' }}
          />
          <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#60a5fa' }}>
            easy-pdf
          </h1>
        </div>
        <h2 
          style={{
            fontSize: '60px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '20px',
            background: 'linear-gradient(to right, #60a5fa, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: '32px', textAlign: 'center', color: '#d1d5db' }}>
          {description}
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interRegular,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Inter',
          data: interBold,
          style: 'normal',
          weight: 700,
        },
      ],
    },
  );
}
