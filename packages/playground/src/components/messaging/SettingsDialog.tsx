import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { Button } from './Button';
import { isValidPhoneNumber, type TestSettings } from '../../hooks/useSettings';

export interface SettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	settings: TestSettings;
	onSave: (settings: TestSettings) => void;
	onClear: () => void;
	onInviteTester: (msisdn: string) => Promise<void>;
}

export function SettingsDialog({
	open,
	onOpenChange,
	settings,
	onSave,
	onClear,
	onInviteTester,
}: SettingsDialogProps) {
	// Local state for form values
	const [localSettings, setLocalSettings] = useState<TestSettings>(settings);
	const [isSaving, setIsSaving] = useState(false);
	const [invitingPhone, setInvitingPhone] = useState<string | null>(null);

	// Reset local state when dialog opens
	useEffect(() => {
		if (open) {
			setLocalSettings(settings);
		}
	}, [open, settings]);

	// Check if at least one phone number is valid
	const isPhoneValid = () => {
		const phoneNumbers = localSettings.recipientPhoneNumbers
			.split(',')
			.map((num) => num.trim())
			.filter(Boolean);
		return phoneNumbers.length > 0 && phoneNumbers.some(isValidPhoneNumber);
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setIsSaving(true);

		// Small delay to show the saving state
		await new Promise((resolve) => setTimeout(resolve, 300));

		onSave(localSettings);
		setIsSaving(false);
		onOpenChange(false);
	};

	const handleCancel = () => {
		setLocalSettings(settings);
		onOpenChange(false);
	};

	const handleClear = () => {
		onClear();
		handleCancel();
	};

	const handleInvite = async (msisdn: string) => {
		setInvitingPhone(msisdn);
		try {
			await onInviteTester(msisdn);
		} finally {
			setInvitingPhone(null);
		}
	};

	const handleAgentTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
		setLocalSettings((prev) => ({
			...prev,
			agentType: e.target.value as TestSettings['agentType'],
		}));
	};

	const phoneNumbers = localSettings.recipientPhoneNumbers
		.split(',')
		.map((num) => num.trim())
		.filter(Boolean);

	const isDev = typeof window !== 'undefined' && window.location.hostname.includes('localhost');

	return (
		<Dialog.Root open={open} onOpenChange={(details) => onOpenChange(details.open)}>
			<Portal>
				<Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[100]" />
				<Dialog.Positioner className="fixed inset-0 flex items-center justify-center z-[101] p-4">
					<Dialog.Content className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
						<form onSubmit={handleSubmit} className="space-y-4 p-6">
							<Dialog.Title className="text-xl font-semibold mb-4">Test Settings</Dialog.Title>

							<div className="border-2 border-gray-200 rounded-lg">
								<div className="space-y-4">
									{isDev && (
										<div className="flex flex-col space-y-4 p-4 border-b">
											<label className="flex items-center gap-3 cursor-pointer">
												<input
													type="radio"
													name="agentType"
													value="default_agent"
													checked={localSettings.agentType === 'default_agent'}
													onChange={handleAgentTypeChange}
													className="w-4 h-4"
												/>
												<span className="text-sm font-medium">Use RCS Maker test agent (default)</span>
											</label>
										</div>
									)}

									<div className="flex flex-col space-y-4 p-4">
										<label className="flex items-center gap-3 cursor-pointer">
											<input
												type="radio"
												name="agentType"
												value="custom_agent"
												checked={localSettings.agentType === 'custom_agent'}
												onChange={handleAgentTypeChange}
												className="w-4 h-4"
											/>
											<span className="text-sm font-medium">Use my own test agent</span>
										</label>
									</div>

									{localSettings.agentType === 'custom_agent' && (
										<div className="flex flex-col space-y-4 p-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Agent ID
												</label>
												<input
													type="text"
													value={localSettings.agentId}
													onChange={(e) =>
														setLocalSettings((prev) => ({ ...prev, agentId: e.target.value }))
													}
													className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
													placeholder="e.g.: my_agent_123456"
													required={localSettings.agentType === 'custom_agent'}
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Service Account Key (JSON)
												</label>
												<textarea
													value={localSettings.serviceAccountKey}
													onChange={(e) =>
														setLocalSettings((prev) => ({
															...prev,
															serviceAccountKey: e.target.value,
														}))
													}
													className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 overflow-y-scroll font-mono text-xs"
													placeholder='{"type": "service_account", ...}'
													required={localSettings.agentType === 'custom_agent'}
												/>
											</div>

											<div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
												<strong>Note:</strong> This information will be saved in your browser.
											</div>
										</div>
									)}
								</div>
							</div>

							<div className="border-2 border-gray-200 rounded-lg">
								<h3 className="py-2 px-4 border-b bg-gray-100 font-semibold rounded-t-lg flex items-center justify-between">
									Test devices
									<span className="text-sm text-gray-200 bg-black px-4 py-1 rounded-full">
										iOS 18.4+ | Android 13+
									</span>
								</h3>

								<div className="p-4 space-y-4">
									<p className="text-sm text-gray-600">
										Before sending messages to your users, you need to invite them to become testers of
										your agent and they need to accept the invitation.
									</p>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Phone Numbers
										</label>
										<input
											type="text"
											value={localSettings.recipientPhoneNumbers}
											onChange={(e) =>
												setLocalSettings((prev) => ({
													...prev,
													recipientPhoneNumbers: e.target.value,
												}))
											}
											className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="e.g.: +1234567890, +0987654321"
											required
										/>
									</div>

									{phoneNumbers.length > 0 && (
										<div className="space-y-2">
											{phoneNumbers.map((num) => (
												<div
													key={num}
													className="flex items-center justify-between py-2 px-3 border-b last:border-b-0"
												>
													<span className="text-sm">{num}</span>
													<Button
														intent="primary"
														size="sm"
														type="button"
														onClick={() => handleInvite(num)}
														loading={invitingPhone === num}
														disabled={invitingPhone !== null}
													>
														{invitingPhone === num ? 'Sending...' : 'Send invite'}
													</Button>
												</div>
											))}
										</div>
									)}

									<div className="text-sm text-gray-500">
										<ul className="list-disc ml-4 space-y-1">
											<li className="text-red-500 font-semibold">T-Mobile numbers are not allowed</li>
											<li>Only valid phone numbers will be invited (E.164 format)</li>
											<li>Example: +1234567890, +0987654321</li>
											<li>iOS numbers from Brazil are not allowed</li>
											<li>iOS numbers from Mexico are not allowed</li>
										</ul>
									</div>
								</div>
							</div>

							<div className="flex justify-between gap-4 pt-4">
								<Button intent="secondary" format="link" size="md" onClick={handleClear} type="button">
									Delete from browser
								</Button>

								<div className="flex gap-4">
									<Button intent="secondary" size="md" onClick={handleCancel} type="button">
										Cancel
									</Button>

									<Button
										intent="primary"
										size="md"
										loading={isSaving}
										disabled={!isPhoneValid()}
										title={!isPhoneValid() ? 'Invalid phone number' : 'Save settings'}
										type="submit"
									>
										{isSaving ? 'Saving...' : 'Save'}
									</Button>
								</div>
							</div>
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
