import { Button } from './Button';

export interface SendControlsProps {
	recipientPhoneNumber: string;
	onRecipientChange: (phoneNumber: string) => void;
	onSend: () => void;
	onOpenSettings: () => void;
	isLoading: boolean;
	disabled?: boolean;
}

export function SendControls({
	recipientPhoneNumber,
	onSend,
	onOpenSettings,
	isLoading,
	disabled = false,
}: SendControlsProps) {

	const getPhoneNumbers = () => {
		return recipientPhoneNumber
			.split(',')
			.map((num) => num.trim())
			.filter(Boolean);
	};

	const phoneNumbers = getPhoneNumbers();
	const hasPhoneNumbers = phoneNumbers.length > 0;

	return (
		<div className="flex items-center gap-2 my-2 mx-4 w-full justify-end">
			<Button
				size="sm"
				intent="secondary"
				onClick={onOpenSettings}
				title="Configure test agent"
			>
				Settings
			</Button>

			<Button
				size="sm"
				intent="primary"
				onClick={onSend}
				title="Send to phone"
				disabled={!hasPhoneNumbers || isLoading || disabled}
				loading={isLoading}
			>
				{isLoading ? (
					'Sending...'
				) : hasPhoneNumbers ? (
					<>
						Send to {phoneNumbers[0]}
						{phoneNumbers.length > 1 && (
							<span className="ml-2 rounded bg-blue-800 px-1.5 py-0.5 text-gray-100">
								+{phoneNumbers.length - 1}
							</span>
						)}
					</>
				) : (
					'Send to phone'
				)}
			</Button>
		</div>
	);
}
