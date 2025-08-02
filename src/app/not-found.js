
import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-8">The page you are looking for does not exist.</p>
      <Link href="/" className="text-blue-400 hover:underline">
        Go back to the homepage
      </Link>
    </div>
  );
}
