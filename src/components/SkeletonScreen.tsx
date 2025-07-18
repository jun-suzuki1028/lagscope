import { memo } from 'react';

interface SkeletonScreenProps {
  className?: string;
  rows?: number;
  variant?: 'card' | 'table' | 'grid';
}

const SkeletonCard = memo(() => (
  <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
    <div className="h-4 bg-gray-300 rounded mb-2"></div>
    <div className="h-8 bg-gray-300 rounded mb-2"></div>
    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
  </div>
));

const SkeletonTableRow = memo(() => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 rounded"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 rounded"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 rounded w-16"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 rounded w-12"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 rounded w-12"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-6 bg-gray-300 rounded-full w-20"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-6 bg-gray-300 rounded-full w-16"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 rounded w-12"></div>
    </td>
  </tr>
));

const SkeletonGridItem = memo(() => (
  <div className="aspect-square bg-gray-300 rounded-lg animate-pulse"></div>
));

export const SkeletonScreen = memo(({ 
  className = '', 
  rows = 5, 
  variant = 'card' 
}: SkeletonScreenProps) => {
  if (variant === 'table') {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="h-6 bg-gray-300 rounded mb-4 w-32 animate-pulse"></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 8 }).map((_, index) => (
                  <th key={index} className="px-6 py-3">
                    <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: rows }).map((_, index) => (
                <SkeletonTableRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonGridItem key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
});

SkeletonScreen.displayName = 'SkeletonScreen';