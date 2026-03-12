"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SponsorDashboard from '@/components/ui/SponsorDashboard';
import { trackEvent } from '@/lib/analytics';

const SponsorDashboardClient = () => {
	const router = useRouter();
	const accessCode = useMemo(() => process.env.NEXT_PUBLIC_SPONSOR_DASHBOARD_ACCESS_CODE || '', []);
	const [isAuthorized, setIsAuthorized] = useState(() => {
		try {
			return typeof window !== 'undefined' && sessionStorage.getItem('sponsor_dashboard_auth') === 'true';
		} catch { return false; }
	});
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleLogin = (e) => {
		e.preventDefault();

		if (!accessCode) {
			setError('Dashboard access is disabled in this environment. Configure a dedicated access code before using this route.');
			trackEvent('sponsor_dashboard_login', { success: false, reason: 'missing_access_code' });
			return;
		}

		if (password === accessCode) {
			setIsAuthorized(true);
			try { sessionStorage.setItem('sponsor_dashboard_auth', 'true'); } catch { /* ignore */ }
			setError('');
			trackEvent('sponsor_dashboard_login', { success: true });
		} else {
			setError('Invalid access code.');
			trackEvent('sponsor_dashboard_login', { success: false, reason: 'invalid_access_code' });
		}
	};

	if (!isAuthorized) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="bg-background border border-border p-8 max-w-md w-full">
					<h1 className="text-2xl font-bold text-foreground mb-6 text-center">
						Sponsor Dashboard Access
					</h1>

					<form onSubmit={handleLogin}>
						{error && (
							<p className="mb-4 border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{error}
							</p>
						)}
						<div className="mb-4">
							<label className="block text-foreground text-sm font-medium mb-2">
								Access Code
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full bg-background border border-border px-3 py-2 text-foreground focus:outline-none focus:border-border"
								placeholder="Enter sponsor dashboard access code"
								required
							/>
						</div>

						<button
							type="submit"
							className="w-full bg-background hover:bg-background text-foreground font-medium py-2 px-4 transition-colors"
						>
							Access Dashboard
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-foreground text-sm">
							This route is a preview gate only. For real sponsor access, move authentication to a server-backed flow.
						</p>
						<button
							onClick={() => router.push('/sponsors')}
							className="text-foreground hover:text-foreground text-sm mt-2"
						>
							← Back to Sponsors Page
						</button>
					</div>
				</div>
			</div>
		);
	}

	return <SponsorDashboard />;
};

export default SponsorDashboardClient;
