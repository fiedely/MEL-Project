import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <Icon size={48} className="mx-auto mb-4 text-purple-200" />
      <h3 className="text-lg font-bold text-purple-300">{title}</h3>
      <p className="text-xs mt-2 text-gray-400 max-w-xs mx-auto">{message}</p>
    </div>
  );
};

export default EmptyState;