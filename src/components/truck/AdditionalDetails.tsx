// AdditionalDetails.tsx

import React from 'react';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectLabel,
    SelectValue
} from '@/components/ui/select'; // Adjust the import path as necessary

type Props = {
    formdata: {
        truckType: string;
        model: string;
        bodyLength: number | null;
        capacity: string;
    };
    renderModelOptions: () => string[];
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

const AdditionalDetails: React.FC<Props> = ({ formdata, renderModelOptions, handleInputChange }) => (
    <>
        <Select onValueChange={(value) => handleInputChange({ target: { name: 'model', value } } as React.ChangeEvent<HTMLSelectElement>)}>
            <SelectTrigger >
                <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
                {renderModelOptions().map((model, index) => (
                    <SelectItem key={index} value={model}>{model}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        {formdata.truckType !== 'Tanker' && (
            <input
                className="w-full p-2 border border-gray-300 rounded-md"
                type='text'
                name='bodyLength'
                value={formdata.bodyLength || ''}
                placeholder='Enter the Body Length(ft)'
                onChange={handleInputChange}
            />
        )}
        <input
            className="w-full p-2 border border-gray-300 rounded-md"
            type='text'
            name='capacity'
            value={formdata.capacity}
            placeholder='Enter the Capacity'
            onChange={handleInputChange}
        />
    </>
);

export default AdditionalDetails;
