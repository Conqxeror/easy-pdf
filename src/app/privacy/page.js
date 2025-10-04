import PrivacyClient from './PrivacyClient';

export const metadata = {
  title: 'Privacy Policy | easy-pdf',
  description: 'Learn how easy-pdf protects your privacy. We process all PDFs in your browser - no server uploads, no data collection, complete privacy.',
  keywords: 'privacy policy, data protection, GDPR, browser-based PDF processing, client-side encryption',
  openGraph: {
    title: 'Privacy Policy | easy-pdf',
    description: 'Learn how easy-pdf protects your privacy with 100% client-side processing.',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
