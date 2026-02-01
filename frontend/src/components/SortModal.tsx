import React from 'react';

type SortField = 'name' | 'number';

const SortModal: React.FC<{
  current: SortField;
  onSelect: (field: SortField) => void;
  onClose: () => void;
}> = ({ current, onSelect, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        className="relative w-48 bg-grayscale-white rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red header */}
        <div className="bg-primary px-4 py-3">
          <p className="text-white text-sm font-semibold">Sort by:</p>
        </div>

        {/* Options */}
        <div className="p-3 flex flex-col gap-3">
          {(['number', 'name'] as const).map((field) => (
            <label
              key={field}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onSelect(field)}
            >
              {/* Radio circle */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  current === field ? 'border-primary' : 'border-grayscale-medium'
                }`}
              >
                {current === field && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>

              <span className="text-sm text-grayscale-dark capitalize">{field}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SortModal;
