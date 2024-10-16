import React, { useState, useEffect } from 'react';
import { TruckModel } from '@/utils/interface';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '../ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  trucks: TruckModel[];
  formData: any; // Adjust type as per your formData structure
  selectedTruck : any
  hasSupplier : boolean
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
};

const TruckSelect: React.FC<Props> = ({ trucks, formData, handleChange, setFormData }) => {
  const [supplierName, setSupplierName] = useState<string>('');
  const [selectedTruck, setSelectedTruck] = useState<TruckModel | any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const pathname = usePathname()


  useEffect(() => {
    const selectedTruck : any = trucks.find(truck => truck.truckNo === formData.truck);
    setSelectedTruck(selectedTruck || null);
    if (selectedTruck?.supplier) {
      setSupplierName(selectedTruck.supplierName as string)
    } else {
      setSupplierName('');
      setFormData((prev: any) => ({
        ...prev,
        supplierId: null
      }));
    }
  }, [trucks, formData.truck, setFormData]);

  const handleOptionSelect = (value: string) => {
    const truck : TruckModel | undefined= trucks.find(truck => truck.truckNo === value);
    setFormData((prev: any) => ({
      ...prev,
      truck: value,
      driver : truck?.driver_id ? truck.driver_id : ''
    }));
  };

  const filteredTrucks = trucks.filter(truck =>
    truck.truckNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <label className="block w-full">
      <label className="block text-sm text-gray-700">Lorry</label>
        <Select name="truck" value={formData.truck} onValueChange={handleOptionSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Lorry" />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            {filteredTrucks.length > 0 ? (
              filteredTrucks.map((truck : any) => (
                <SelectItem key={truck.truckNo} value={truck.truckNo}>
                  <div className='flex justify-between w-full gap-4'>
                  <span>{truck.truckNo}</span>
                  <span
                    className={`ml-2 p-1 rounded ${truck.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {truck.status}
                  </span>
                  <span>{truck.supplierName}</span>
                  </div>
                  
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-gray-500">No lorries found</div>
            )}
            <Button variant={'ghost'} className="w-full" onClick={()=>{
              localStorage.setItem('tripData',JSON.stringify(formData))
            }}>
            <Link href={{pathname : `/user/trucks/create`, query : {
              nextpath : pathname
            }}}>Add New Lorry</Link>
            </Button>
          </SelectContent>
        </Select>
      </label>
      {supplierName && (
        <div className="mt-2 text-sm text-gray-600">
          Supplier: {supplierName}
        </div>
      )}
    </div>
  );
};

export default TruckSelect;
