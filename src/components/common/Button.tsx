import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  TouchableOpacityProps 
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary', 
  loading = false, 
  disabled, 
  className,
  ...props 
}) => {
  const getButtonClass = () => {
    const base = "h-12 rounded-xl justify-center items-center px-4 flex-row active:opacity-75 transition-all duration-200";
    if (disabled) return `${base} bg-slate-250 dark:bg-slate-800 opacity-50`;
    
    switch (variant) {
      case 'secondary':
        return `${base} bg-secondary`;
      case 'danger':
        return `${base} bg-rose-500`;
      case 'outline':
        return `${base} bg-transparent border border-primary`;
      default:
        return `${base} bg-primary`;
    }
  };

  const getTextClass = () => {
    const base = "text-base font-semibold tracking-wide";
    switch (variant) {
      case 'outline':
        return `${base} text-primary`;
      default:
        return `${base} text-white`;
    }
  };

  return (
    <TouchableOpacity 
      className={`${getButtonClass()} ${className || ''}`}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#0D9488' : '#FFF'} size="small" />
      ) : (
        <Text className={getTextClass()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
