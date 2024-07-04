import React from 'react';

interface TripInfoProps {
  label: string;
  value: string;
}

const TripInfo: React.FC<TripInfoProps> = ({ label, value }) => {
  return (
    <div className="p-4 border rounded-lg shadow-lg bg-gradient-to-r from-blue-50 to-blue-100 w-full hover:shadow-xl transition-shadow duration-300">
      <p className="text-sm font-medium text-blue-600 mb-1 tracking-wide uppercase">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
};

export default TripInfo;
