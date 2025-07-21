import { render, screen } from '../../test/test-utils';
import { FormValidation, ValidatedInput, ValidatedSelect } from '../FormValidation';
import { validators, validateField, validateForm } from '../../lib/validators';

describe('FormValidation', () => {
  it('エラーがない場合は何も表示しない', () => {
    render(<FormValidation errors={[]} />);
    
    expect(screen.queryByText('入力内容に問題があります')).not.toBeInTheDocument();
  });

  it('エラーがある場合はエラーメッセージを表示する', () => {
    const errors = [
      { field: 'name', message: '名前は必須です' },
      { field: 'email', message: 'メールアドレスが無効です' }
    ];
    
    render(<FormValidation errors={errors} />);
    
    expect(screen.getByText('入力内容に問題があります')).toBeInTheDocument();
    expect(screen.getByText('名前は必須です')).toBeInTheDocument();
    expect(screen.getByText('メールアドレスが無効です')).toBeInTheDocument();
  });
});

describe('ValidatedInput', () => {
  it('ラベルとinputを表示する', () => {
    render(<ValidatedInput label="名前" />);
    
    expect(screen.getByText('名前')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('必須マークを表示する', () => {
    render(<ValidatedInput label="名前" required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('エラーメッセージを表示する', () => {
    render(<ValidatedInput label="名前" error="名前は必須です" />);
    
    expect(screen.getByText('名前は必須です')).toBeInTheDocument();
  });

  it('エラー時にaria-invalid属性を設定する', () => {
    render(<ValidatedInput label="名前" error="名前は必須です" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('ValidatedSelect', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ];

  it('ラベルとselectを表示する', () => {
    render(<ValidatedSelect label="選択肢" options={options} />);
    
    expect(screen.getByText('選択肢')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('オプションを表示する', () => {
    render(<ValidatedSelect label="選択肢" options={options} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });
});

describe('validators', () => {
  describe('required', () => {
    it('空文字列の場合エラーを返す', () => {
      expect(validators.required('')).toBe('この項目は必須です');
      expect(validators.required('   ')).toBe('この項目は必須です');
    });

    it('値がある場合nullを返す', () => {
      expect(validators.required('test')).toBeNull();
    });
  });

  describe('minLength', () => {
    const minLengthValidator = validators.minLength(5);

    it('最小文字数未満の場合エラーを返す', () => {
      expect(minLengthValidator('abc')).toBe('5文字以上で入力してください');
    });

    it('最小文字数以上の場合nullを返す', () => {
      expect(minLengthValidator('abcdef')).toBeNull();
    });
  });

  describe('number', () => {
    it('数値でない場合エラーを返す', () => {
      expect(validators.number('abc')).toBe('数値を入力してください');
    });

    it('数値の場合nullを返す', () => {
      expect(validators.number('123')).toBeNull();
    });
  });
});

describe('validateField', () => {
  it('複数のバリデーターを適用する', () => {
    const validators = [
      (value: string) => !value ? 'この項目は必須です' : null,
      (value: string) => value.length < 3 ? '3文字以上で入力してください' : null
    ];

    expect(validateField('', validators)).toBe('この項目は必須です');
    expect(validateField('ab', validators)).toBe('3文字以上で入力してください');
    expect(validateField('abc', validators)).toBeNull();
  });
});

describe('validateForm', () => {
  it('フォーム全体をバリデーションする', () => {
    const values = {
      name: '',
      email: 'invalid-email'
    };

    const rules = {
      name: [validators.required],
      email: [validators.required, validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'メールアドレスが無効です')]
    };

    const errors = validateForm(values, rules);

    expect(errors).toHaveLength(2);
    expect(errors[0]).toEqual({ field: 'name', message: 'この項目は必須です' });
    expect(errors[1]).toEqual({ field: 'email', message: 'メールアドレスが無効です' });
  });
});