import React, { useState } from 'react';
import { ISupplier } from '@/utils/interface';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input'; // Assuming you have an Input component for the search field

type Props = {
    suppliers: ISupplier[];
    value: string;
    onChange: (key: string, value: string) => void;
};

const SupplierSelect: React.FC<Props> = ({ suppliers, value, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter suppliers based on the search term
    const filteredSuppliers = suppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Select onValueChange={(value) => onChange('supplier', value)}>
            <SelectTrigger>
                <SelectValue placeholder="Select Supplier*" />
            </SelectTrigger>
            <SelectContent>
                {/* Search input */}
                <div className="p-2">
                    <Input 
                        type="text" 
                        placeholder="Search supplier..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                {/* Display filtered suppliers */}
                {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                        <SelectItem key={supplier.supplier_id} value={supplier.supplier_id}>
                            <div className='flex justify-between'>
                                <p>{supplier.name}</p>
                                <p>{supplier.contactNumber}</p>
                            </div>
                        </SelectItem>
                    ))
                ) : (
                    <div className="p-2 text-sm text-gray-500">No suppliers found</div>
                )}
            </SelectContent>
        </Select>
    );
};

export default SupplierSelect;
