import React from 'react';

interface TouchFriendlyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  icon,
}) => {
  const getBaseClasses = () => {
    return [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'rounded-md',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none',
      // モバイルでのタップ領域を確保
      'min-h-[44px]',
      'min-w-[44px]',
      'touch-manipulation', // タッチ操作を最適化
    ];
  };

  const getVariantClasses = () => {
    const variants = {
      primary: [
        'bg-blue-500',
        'text-white',
        'hover:bg-blue-600',
        'focus:ring-blue-500',
        'active:bg-blue-700',
        'shadow-sm',
        'hover:shadow-md',
      ],
      secondary: [
        'bg-gray-200',
        'text-gray-900',
        'hover:bg-gray-300',
        'focus:ring-gray-500',
        'active:bg-gray-400',
        'shadow-sm',
        'hover:shadow-md',
      ],
      danger: [
        'bg-red-500',
        'text-white',
        'hover:bg-red-600',
        'focus:ring-red-500',
        'active:bg-red-700',
        'shadow-sm',
        'hover:shadow-md',
      ],
      ghost: [
        'bg-transparent',
        'text-gray-600',
        'hover:bg-gray-100',
        'focus:ring-gray-500',
        'active:bg-gray-200',
        'border',
        'border-gray-300',
        'hover:border-gray-400',
      ],
    };

    return variants[variant] || variants.primary;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: ['px-3', 'py-2', 'text-sm'],
      md: ['px-4', 'py-3', 'text-base'],
      lg: ['px-6', 'py-4', 'text-lg'],
    };

    return sizes[size] || sizes.md;
  };

  const allClasses = [
    ...getBaseClasses(),
    ...getVariantClasses(),
    ...getSizeClasses(),
    className,
  ].join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={allClasses}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default TouchFriendlyButton;