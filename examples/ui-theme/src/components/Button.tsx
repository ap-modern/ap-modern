import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'gray';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
}) => {
  const baseClasses = 'font-text-regular-weight rounded-box border transition-colors';

  const variantClasses = {
    primary:
      'bg-brand-6 text-text-inverse border-brand-6 hover:bg-brand-5 hover:border-brand-5 active:bg-brand-7 active:border-brand-7',
    secondary:
      'bg-positive text-brand-6 border-brand-6 hover:text-brand-5 hover:border-brand-5 active:text-brand-7 active:border-brand-7',
    danger:
      'bg-error-6 text-text-inverse border-error-6 hover:bg-error-5 hover:border-error-5 active:bg-error-7 active:border-error-7',
    gray: 'bg-positive text-text-third border-black-4 hover:text-brand-5 hover:border-brand-5 active:text-brand-7 active:border-brand-7',
  };

  const sizeClasses = {
    small: 'h-box-height-sm text-text-s px-box-padding-xs py-box-padding-mini',
    medium: 'h-box-height-md text-text-sm px-box-padding-md py-box-padding-xs',
    large: 'h-box-height-lg text-text-md px-box-padding-lg py-box-padding-sm',
  };

  const disabledClasses =
    variant === 'primary'
      ? 'bg-brand-4 border-brand-4 cursor-not-allowed opacity-50'
      : 'bg-box-body-disabled-color border-box-border-disabled-color text-text-disabled cursor-not-allowed';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
    disabled ? disabledClasses : ''
  }`;

  return (
    <button className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
