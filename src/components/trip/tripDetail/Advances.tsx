import React from 'react';

interface AdvanceItem {
  label: string;
  value: string;
}

interface AdvancesProps {
  advances: AdvanceItem[];
  onAddAdvance: () => void;
}

const Advances: React.FC<AdvancesProps> = ({ advances, onAddAdvance }) => {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Advances</h3>
        <button
          className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white hover:bg-purple-600 focus:outline-none ml-4"
          onClick={onAddAdvance}
          aria-label="Add Advance"
        >
          +
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg divide-y divide-gray-200">
        {advances.map((advance, index) => (
          <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{advance.label}</p>
              <p className="text-xs text-gray-600">{advance.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Advances;
