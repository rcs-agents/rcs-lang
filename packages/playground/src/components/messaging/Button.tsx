import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface SpinnerProps {
	className?: string;
}

function Spinner({ className }: SpinnerProps) {
	return (
		<svg
			className={twMerge('animate-spin h-4 w-4 text-current', className)}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			></circle>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	intent?: 'primary' | 'secondary' | 'danger';
	size?: 'xs' | 'sm' | 'md' | 'lg';
	format?: 'button' | 'link';
	loading?: boolean;
	className?: string;
}

const baseClasses = 'font-medium transition-colors inline-flex items-center justify-center rounded relative';

const intentClasses = {
	primary: 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500',
	secondary: 'bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-200 text-blue-500',
	danger: 'bg-red-500 hover:bg-red-600 text-white',
};

const sizeClasses = {
	xs: 'px-2 py-1 text-xs',
	sm: 'px-3 py-1.5 text-sm',
	md: 'px-4 py-2 text-base',
	lg: 'px-6 py-3 text-lg',
};

const formatClasses = {
	button: '',
	link: 'px-0 border-0 bg-transparent',
};

const intentLinkClasses = {
	primary: 'text-blue-500 hover:text-blue-600 hover:bg-transparent',
	secondary: 'text-gray-700 hover:text-gray-900 hover:bg-transparent',
	danger: 'text-red-500 hover:text-red-600 hover:bg-transparent',
};

export function Button({
	children,
	intent = 'primary',
	size = 'md',
	format = 'button',
	loading = false,
	disabled = false,
	className,
	...props
}: ButtonProps) {
	const classes = twMerge(
		baseClasses,
		intentClasses[intent],
		sizeClasses[size],
		formatClasses[format],
		format === 'link' && intentLinkClasses[intent],
		(disabled || loading) && 'cursor-not-allowed opacity-70',
		className,
	);

	return (
		<button {...props} className={classes} disabled={disabled || loading}>
			{loading && (
				<span className="absolute inset-0 flex items-center justify-center">
					<Spinner />
				</span>
			)}

			<span className={loading ? 'invisible flex items-center gap-2' : 'flex items-center gap-2'}>
				{children}
			</span>
		</button>
	);
}
