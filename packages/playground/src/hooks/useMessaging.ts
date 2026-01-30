import { useState, useCallback } from 'react';

export interface LogEntry {
	id: string;
	timestamp: number;
	url: string;
	method: string;
	requestBody: any;
	responseBody: any;
	status: number;
	success: boolean;
}

export interface SendPlaybackParams {
	playback: any;
	recipientPhoneNumber: string;
	agentType: 'default_agent' | 'custom_agent';
	agentId?: string;
	serviceAccountKey?: string;
}

export interface InviteTesterParams {
	msisdn: string;
	agentType: 'default_agent' | 'custom_agent';
	agentId?: string;
	serviceAccountKey?: string;
}

const getBaseUrl = (): string => {
	const isDev = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
	return isDev ? 'http://localhost:3000' : 'https://api.rcsmaker.com';
};

export function useMessaging() {
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [isLogsVisible, setIsLogsVisible] = useState(true);

	// Add a log entry
	const addLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
		const id = Math.random().toString(36).substring(2, 9);

		setLogs((prev) => {
			// Add to the beginning for reverse chronological order
			const newLogs = [{ ...entry, id }, ...prev];
			// Keep only the last 50 logs
			return newLogs.slice(0, 50);
		});
	}, []);

	// Clear all logs
	const clearLogs = useCallback(() => {
		setLogs([]);
	}, []);

	// Toggle logs visibility
	const toggleLogsVisibility = useCallback(() => {
		setIsLogsVisible((prev) => !prev);
	}, []);

	// Send playback to RCS API
	const sendPlayback = useCallback(
		async (params: SendPlaybackParams): Promise<{ success: boolean; error?: string }> => {
			const baseUrl = getBaseUrl();
			const url = `${baseUrl}/api/playbacks`;

			const requestBody = {
				playback: params.playback,
				recipientPhoneNumber: params.recipientPhoneNumber,
				agentType: params.agentType,
				agentId: params.agentType === 'custom_agent' ? params.agentId : undefined,
				serviceAccountKey: params.agentType === 'custom_agent' ? params.serviceAccountKey : undefined,
			};

			try {
				const response = await fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(requestBody),
				});

				const responseBody = await response.json();

				// Log the request/response
				addLog({
					timestamp: Date.now(),
					url,
					method: 'POST',
					requestBody,
					responseBody,
					status: response.status,
					success: response.ok && responseBody.ok !== false,
				});

				if (!response.ok || responseBody.ok === false) {
					return {
						success: false,
						error: responseBody.error || `HTTP ${response.status}: ${response.statusText}`,
					};
				}

				return { success: true };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

				// Log the failed request
				addLog({
					timestamp: Date.now(),
					url,
					method: 'POST',
					requestBody,
					responseBody: { error: errorMessage },
					status: 0,
					success: false,
				});

				return {
					success: false,
					error: errorMessage,
				};
			}
		},
		[addLog],
	);

	// Invite tester
	const inviteTester = useCallback(
		async (params: InviteTesterParams): Promise<{ success: boolean; error?: string }> => {
			const baseUrl = getBaseUrl();
			const url = `${baseUrl}/api/tester/invite`;

			const requestBody = {
				msisdn: params.msisdn,
				agentType: params.agentType,
				agentId: params.agentType === 'custom_agent' ? params.agentId : undefined,
				serviceAccountKey: params.agentType === 'custom_agent' ? params.serviceAccountKey : undefined,
			};

			try {
				const response = await fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(requestBody),
				});

				const responseBody = await response.json();

				// Log the request/response
				addLog({
					timestamp: Date.now(),
					url,
					method: 'POST',
					requestBody,
					responseBody,
					status: response.status,
					success: response.ok,
				});

				if (!response.ok) {
					return {
						success: false,
						error: responseBody.error || `HTTP ${response.status}: ${response.statusText}`,
					};
				}

				return { success: true };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

				// Log the failed request
				addLog({
					timestamp: Date.now(),
					url,
					method: 'POST',
					requestBody,
					responseBody: { error: errorMessage },
					status: 0,
					success: false,
				});

				return {
					success: false,
					error: errorMessage,
				};
			}
		},
		[addLog],
	);

	return {
		logs,
		isLogsVisible,
		addLog,
		clearLogs,
		toggleLogsVisibility,
		sendPlayback,
		inviteTester,
	};
}
