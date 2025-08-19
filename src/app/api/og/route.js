import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters for dynamic generation
    const title = searchParams.get('title') || 'easy-pdf';
    const description = searchParams.get('description') || 'Privacy-First PDF Tools';
    const tool = searchParams.get('tool') || '';
    const category = searchParams.get('category') || '';
    const theme = searchParams.get('theme') || 'default';
    
    // Dynamic color scheme based on tool category
    const getThemeColors = (category, theme) => {
      const themes = {
        'Organize & Edit': { primary: '#3B82F6', secondary: '#EFF6FF', accent: '#1D4ED8' },
        'Convert & Create': { primary: '#10B981', secondary: '#ECFDF5', accent: '#047857' },
        'Security & Privacy': { primary: '#8B5CF6', secondary: '#F3E8FF', accent: '#7C3AED' },
        'Business Tools': { primary: '#F59E0B', secondary: '#FFFBEB', accent: '#D97706' },
        'AI & Analysis': { primary: '#EF4444', secondary: '#FEF2F2', accent: '#DC2626' },
        default: { primary: '#1F2937', secondary: '#F9FAFB', accent: '#374151' }
      };
      
      return themes[category] || themes.default;
    };

    const colors = getThemeColors(category, theme);

    // Clean and format text for display
    const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
    const displayDescription = description.length > 120 ? description.substring(0, 117) + '...' : description;

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
            backgroundColor: colors.secondary,
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary}15 100%)`,
              opacity: 0.1,
            }}
          />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: colors.primary,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                fontSize: '40px',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              📄
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: colors.primary,
                letterSpacing: '-2px',
              }}
            >
              easy-pdf
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '1000px',
            }}
          >
            {/* Tool Badge */}
            {tool && (
              <div
                style={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  padding: '8px 24px',
                  borderRadius: '25px',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {tool}
              </div>
            )}

            {/* Title */}
            <div
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: colors.accent,
                lineHeight: '1.1',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              {displayTitle}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '24px',
                color: '#6B7280',
                lineHeight: '1.4',
                textAlign: 'center',
                maxWidth: '800px',
              }}
            >
              {displayDescription}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px',
              color: '#9CA3AF',
            }}
          >
            <div
              style={{
                marginRight: '10px',
              }}
            >
              🔒 Privacy-First
            </div>
            <div
              style={{
                marginRight: '10px',
              }}
            >
              •
            </div>
            <div
              style={{
                marginRight: '10px',
              }}
            >
              ⚡ Client-Side Processing
            </div>
            <div
              style={{
                marginRight: '10px',
              }}
            >
              •
            </div>
            <div>
              🆓 100% Free
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('Error generating OG image:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}