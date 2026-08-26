import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TextInputProps,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className,
  secureTextEntry,
  ...props 
}) => {
  const isDark = useColorScheme() === 'dark';
  const placeholderColor = isDark ? '#64748B' : '#94A3B8';
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View className="mb-4 w-full">
      {label && (
        <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          {label}
        </Text>
      )}
      <View className="relative w-full justify-center">
        <TextInput
          className={`h-12 border rounded-xl px-4 text-base font-normal tracking-wide transition-colors duration-200
            ${error 
              ? 'border-rose-500 bg-rose-50/5 dark:bg-rose-950/5' 
              : 'border-slate-200 dark:border-slate-700 focus:border-primary'
            } 
            bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${secureTextEntry ? 'pr-12' : ''} ${className || ''}`}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setIsSecure(!isSecure)}
            className="absolute right-3.5 h-full justify-center items-center px-1"
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isSecure ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color={isDark ? "#94A3B8" : "#64748B"} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-xs text-rose-500 mt-1 font-medium tracking-wide">
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;
