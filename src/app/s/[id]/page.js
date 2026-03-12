import ShortRedirectClient from './short-redirect-client';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ShortRedirectPage({ params }) {
  const { id } = await params;

  return <ShortRedirectClient id={id} />;
}