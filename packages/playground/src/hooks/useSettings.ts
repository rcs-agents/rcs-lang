import { useState, useCallback } from 'react';

const KEY_PREFIX = 'rcsmaker_';

export interface TestSettings {
	serviceAccountKey: string;
	agentId: string;
	recipientPhoneNumbers: string;
	agentType: 'default_agent' | 'custom_agent';
}

// Storage key type for type safety
type StorageKey = 'serviceAccountKey' | 'agentId' | 'recipientPhoneNumbers' | 'agentType';

// Helper functions for localStorage
const writeToStorage = (key: StorageKey, value: string): void => {
	try {
		localStorage.setItem(`${KEY_PREFIX}${key}`, value);
	} catch (error) {
		console.error(`Failed to save ${key} to local storage:`, error);
	}
};

const readFromStorage = (key: StorageKey): string | null => {
	try {
		return localStorage.getItem(`${KEY_PREFIX}${key}`);
	} catch (error) {
		console.error(`Failed to load ${key} from local storage:`, error);
		return null;
	}
};

// Phone number validation
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
	const trimmed = phoneNumber.trim();
	const hasMinimum8Digits = trimmed.length >= 8;
	const startsWithPlusSign = trimmed.startsWith('+');
	return hasMinimum8Digits && startsWithPlusSign;
};

// Clean phone numbers by removing any characters that are not digits, '+', or ','
export const cleanPhoneNumbers = (phoneNumbers: string): string => {
	return phoneNumbers.replace(/[^\d+,]/g, '');
};

export function useSettings() {
	const [settings, setSettings] = useState<TestSettings>({
		serviceAccountKey: readFromStorage('serviceAccountKey') || '',
		agentId: readFromStorage('agentId') || '',
		recipientPhoneNumbers: readFromStorage('recipientPhoneNumbers') || '',
		agentType: (readFromStorage('agentType') as TestSettings['agentType']) || 'custom_agent',
	});

	// Save all settings to localStorage
	const saveSettings = useCallback((newSettings: Partial<TestSettings>) => {
		setSettings((prev) => {
			const updated = { ...prev, ...newSettings };

			// Clean and save phone numbers
			if (newSettings.recipientPhoneNumbers !== undefined) {
				const cleaned = cleanPhoneNumbers(newSettings.recipientPhoneNumbers);
				updated.recipientPhoneNumbers = cleaned;
				writeToStorage('recipientPhoneNumbers', cleaned);
			}

			// Save other fields
			if (newSettings.serviceAccountKey !== undefined) {
				writeToStorage('serviceAccountKey', newSettings.serviceAccountKey);
			}
			if (newSettings.agentId !== undefined) {
				writeToStorage('agentId', newSettings.agentId);
			}
			if (newSettings.agentType !== undefined) {
				writeToStorage('agentType', newSettings.agentType);
			}

			return updated;
		});
	}, []);

	// Clear all settings
	const clearSettings = useCallback(() => {
		const emptySettings: TestSettings = {
			serviceAccountKey: '',
			agentId: '',
			recipientPhoneNumbers: '',
			agentType: 'custom_agent',
		};

		setSettings(emptySettings);

		// Clear from localStorage
		writeToStorage('serviceAccountKey', '');
		writeToStorage('agentId', '');
		writeToStorage('recipientPhoneNumbers', '');
		writeToStorage('agentType', '');
	}, []);

	// Load settings from localStorage
	const loadSettings = useCallback(() => {
		setSettings({
			serviceAccountKey: readFromStorage('serviceAccountKey') || '',
			agentId: readFromStorage('agentId') || '',
			recipientPhoneNumbers: readFromStorage('recipientPhoneNumbers') || '',
			agentType: (readFromStorage('agentType') as TestSettings['agentType']) || 'custom_agent',
		});
	}, []);

	// Get list of phone numbers
	const getPhoneNumberList = useCallback((): string[] => {
		return settings.recipientPhoneNumbers
			.split(',')
			.map((num) => num.trim())
			.filter(Boolean);
	}, [settings.recipientPhoneNumbers]);

	// Validate at least one phone number
	const hasValidPhoneNumbers = useCallback((): boolean => {
		const numbers = getPhoneNumberList();
		return numbers.length > 0 && numbers.every(isValidPhoneNumber);
	}, [getPhoneNumberList]);

	return {
		settings,
		saveSettings,
		clearSettings,
		loadSettings,
		getPhoneNumberList,
		hasValidPhoneNumbers,
	};
}
