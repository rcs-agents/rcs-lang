import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useMessaging } from '../hooks/useMessaging';
import { SendControls } from '../components/messaging/SendControls';
import { SettingsDialog } from '../components/messaging/SettingsDialog';
import { LoggingPanel } from '../components/messaging/LoggingPanel';

/**
 * Example component demonstrating how to integrate the messaging components
 * into your playground application.
 */
export function MessagingExample() {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isSending, setIsSending] = useState(false);

	// Use the settings hook
	const { settings, saveSettings, clearSettings, getPhoneNumberList } = useSettings();

	// Use the messaging hook
	const { logs, isLogsVisible, clearLogs, sendPlayback, inviteTester } = useMessaging();

	// Handle send button click
	const handleSend = async () => {
		setIsSending(true);

		try {
			const phoneNumbers = getPhoneNumberList();

			// Example playback data - replace with your actual RCS message payload
			const examplePlayback = [
				{
					type: 'message',
					data: {
						text: 'Hello from RCL Playground!',
					},
				},
			];

			// Send to all configured phone numbers
			for (const phoneNumber of phoneNumbers) {
				await sendPlayback({
					playback: examplePlayback,
					recipientPhoneNumber: phoneNumber,
					agentType: settings.agentType,
					agentId: settings.agentId,
					serviceAccountKey: settings.serviceAccountKey,
				});
			}
		} finally {
			setIsSending(false);
		}
	};

	// Handle inviting a tester
	const handleInviteTester = async (msisdn: string) => {
		await inviteTester({
			msisdn,
			agentType: settings.agentType,
			agentId: settings.agentId,
			serviceAccountKey: settings.serviceAccountKey,
		});
	};

	// Handle settings save
	const handleSaveSettings = (newSettings: typeof settings) => {
		saveSettings(newSettings);
	};

	return (
		<div className="flex flex-col h-screen">
			{/* Main content area */}
			<div className="flex-1 p-4">
				<h1 className="text-2xl font-bold mb-4">RCS Messaging Example</h1>
				<p className="text-gray-600 mb-4">
					Configure your RCS agent settings and send test messages to your devices.
				</p>

				{/* Your editor or other content would go here */}
				<div className="border rounded-lg p-8 bg-gray-50 text-center">
					<p className="text-gray-500">Your RCL editor or content goes here</p>
				</div>
			</div>

			{/* Send controls */}
			<SendControls
				recipientPhoneNumber={settings.recipientPhoneNumbers}
				onRecipientChange={() => {}} // Not used in this pattern
				onSend={handleSend}
				onOpenSettings={() => setIsSettingsOpen(true)}
				isLoading={isSending}
			/>

			{/* Settings dialog */}
			<SettingsDialog
				open={isSettingsOpen}
				onOpenChange={setIsSettingsOpen}
				settings={settings}
				onSave={handleSaveSettings}
				onClear={clearSettings}
				onInviteTester={handleInviteTester}
			/>

			{/* Logging panel */}
			<LoggingPanel logs={logs} isVisible={isLogsVisible} onClear={clearLogs} />
		</div>
	);
}
