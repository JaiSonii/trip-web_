export const DateInputs: React.FC<{ formData: any; handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; }> = ({ formData, handleChange }) => (
    <div >
      <label className="block text-xs font-medium text-gray-700 mb-1">Start Date*</label>
      <input
        type="date"
        
        value={new Date(formData.startDate || Date.now()).toISOString().split('T')[0]}
        onChange={(e) => handleChange({ target: { name: 'startDate', value: new Date(e.target.value) } } as any)}
        required
      />
    </div>
  );
  