import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IShop {
  shop_id: string;
  name: string;
}

type Props = {
  shops: IShop[];
  formData: any;
  setFormData: any;
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const ShopSelect: React.FC<Props> = ({ shops, formData, handleChange }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleOptionSelect = (value: string) => {
    const event = {
      target: {
        name: 'shop_id',
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    handleChange(event);
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <label className="block text-sm text-gray-700">Shop</label>
      <Select name="shop" value={formData.shop} onValueChange={handleOptionSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Shop" />
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
          {filteredShops.length > 0 ? (
            filteredShops.map((shop) => (
              <SelectItem key={shop.shop_id} value={shop.shop_id}>
                {shop.name}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-gray-500">No shops found</div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ShopSelect;
