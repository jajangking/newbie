"use client";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 rounded peer-checked:border-transparent transition-all duration-200 flex items-center justify-center group-hover:border-zinc-400 dark:group-hover:border-zinc-500 peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500">
          {checked && (
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className={`text-sm transition-all duration-200 ${
        checked 
          ? 'line-through text-zinc-400 dark:text-zinc-500' 
          : 'text-zinc-700 dark:text-zinc-300'
      }`}>
        {label}
      </span>
    </label>
  );
}
