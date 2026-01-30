import { JSX } from 'solid-js';
import { cn } from '../../utils/cn';

type SwitchProps = {
  isChecked: boolean;
  onChange: () => void;
  ariaLabel?: string;
  class?: string;
};

export const Switch = (props: SwitchProps): JSX.Element => {
  return (
    <button
      onClick={props.onChange}
      class={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        props.isChecked ? "bg-blue-600" : "bg-gray-200",
        props.class || ""
      )}
      role="switch"
      aria-checked={props.isChecked}
      aria-label={props.ariaLabel}
    >
      <span
        class={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
          props.isChecked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
};
