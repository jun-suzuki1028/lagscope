import { cn } from '@/utils/cn';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number;
  className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { base: 1, md: 2, lg: 3 },
  gap = 4,
  className = '',
}) => {
  const getGridClasses = () => {
    const baseClasses = ['grid'];
    
    // カラム数のクラス
    if (cols.base) baseClasses.push(`grid-cols-${cols.base}`);
    if (cols.sm) baseClasses.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) baseClasses.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) baseClasses.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) baseClasses.push(`xl:grid-cols-${cols.xl}`);
    if (cols['2xl']) baseClasses.push(`2xl:grid-cols-${cols['2xl']}`);
    
    // Gap のクラス
    baseClasses.push(`gap-${gap}`);
    
    return baseClasses.join(' ');
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;