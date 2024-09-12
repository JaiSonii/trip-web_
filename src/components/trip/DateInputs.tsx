export const DateInputs: React.FC<{ formData: any; handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; }> = ({ formData, handleChange }) => (
    <div >
      <label className="block text-sm text-gray-700">Start Date</label>
      <input
        type="date"
        
        value={new Date(formData.startDate).toISOString().split('T')[0]}
        onChange={(e) => handleChange({ target: { name: 'startDate', value: new Date(e.target.value) } } as any)}
        required
      />
    </div>
  );
  