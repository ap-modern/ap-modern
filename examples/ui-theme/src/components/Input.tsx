import React from 'react';

interface InputProps {
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  placeholder,
  size = 'medium',
  disabled = false,
  value,
  onChange,
}) => {
  const baseClasses =
    'w-full rounded-box border border-box-border-light bg-positive transition-colors focus:outline-none focus:border-brand-6';

  const sizeClasses = {
    small: 'h-box-height-sm text-text-s px-box-padding-s',
    medium: 'h-box-height-md text-text-sm px-box-padding-sm',
    large: 'h-box-height-lg text-text-md px-box-padding-md',
  };

  const disabledClasses = disabled
    ? 'bg-box-body-disabled-color border-box-border-disabled-color text-text-disabled cursor-not-allowed'
    : '';

  const classes = `${baseClasses} ${sizeClasses[size]} ${disabledClasses}`;

  return (
    <input
      type="text"
      className={classes}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={onChange}
    />
  );
};

export default Input;
