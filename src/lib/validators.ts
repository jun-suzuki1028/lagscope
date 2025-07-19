// Validation utilities
export const validators = {
  required: (value: string) => {
    if (!value || value.trim() === '') {
      return 'この項目は必須です';
    }
    return null;
  },
  
  minLength: (min: number) => (value: string) => {
    if (value && value.length < min) {
      return `${min}文字以上で入力してください`;
    }
    return null;
  },
  
  maxLength: (max: number) => (value: string) => {
    if (value && value.length > max) {
      return `${max}文字以下で入力してください`;
    }
    return null;
  },
  
  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return null;
  },
  
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return '有効なメールアドレスを入力してください';
    }
    return null;
  },
  
  number: (value: string) => {
    if (value && isNaN(Number(value))) {
      return '数値を入力してください';
    }
    return null;
  },
  
  integer: (value: string) => {
    if (value && !Number.isInteger(Number(value))) {
      return '整数を入力してください';
    }
    return null;
  },
  
  positiveNumber: (value: string) => {
    const num = Number(value);
    if (value && (isNaN(num) || num <= 0)) {
      return '正の数値を入力してください';
    }
    return null;
  },
  
  range: (min: number, max: number) => (value: string) => {
    const num = Number(value);
    if (value && (!isNaN(num) && (num < min || num > max))) {
      return `${min}から${max}の範囲で入力してください`;
    }
    return null;
  },
};

export const validationMessages = {
  REQUIRED: 'この項目は必須です',
  INVALID_FORMAT: '形式が正しくありません',
  TOO_SHORT: '入力が短すぎます',
  TOO_LONG: '入力が長すぎます',
  INVALID_EMAIL: '有効なメールアドレスを入力してください',
  INVALID_NUMBER: '数値を入力してください',
  INVALID_INTEGER: '整数を入力してください',
  INVALID_POSITIVE_NUMBER: '正の数値を入力してください',
  OUT_OF_RANGE: '値が範囲外です',
} as const;

export type ValidationResult = string | null;
export type Validator = (value: string) => ValidationResult;
export type ValidatorFactory = (...args: unknown[]) => Validator;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateField(value: string, validatorFunctions: ((value: string) => string | null)[]): string | null {
  for (const validator of validatorFunctions) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
}

export function validateForm(values: Record<string, string>, rules: Record<string, ((value: string) => string | null)[]>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const [field, validators] of Object.entries(rules)) {
    const value = values[field] || '';
    const error = validateField(value, validators);
    if (error) {
      errors.push({ field, message: error });
    }
  }
  
  return errors;
}