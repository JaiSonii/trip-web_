// PartiesPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { IParty } from '@/utils/interface';
import { useRouter } from 'next/navigation';
import Loading from '@/app/user/loading'
import { FaPhone, FaUserTie } from 'react-icons/fa6';
import { GoOrganization } from "react-icons/go";
import { FaAddressBook, FaObjectGroup } from 'react-icons/fa';
import ShopBalance from '@/components/shopkhata/ShopBalance';

const ShopKhataPage = () => {
  const router = useRouter();



  const [shops, setShops] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParties = async () => {

      try {
        const res = await fetch('/api/shopkhata', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json(); // Parse the response body as JSON
          setShops(data.shops);
          setLoading(false)
        }


      } catch (err) {

        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!shops || shops.length === 0) {
    return <div>No Shops found</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Number</th>
              <th>Address</th>
              <th>GST Number</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop, index) => (
              <tr key={shop.shop_id as string} className="border-t w-full cursor-pointer" onClick={() => router.push(`/user/shopkhata/${shop.shop_id}`)}>
                <td>
                  <div className='flex items-center space-x-2'>
                    <GoOrganization className="text-bottomNavBarColor" />
                    <span>{shop.name}</span>
                  </div>
                </td>
                <td>
                  <div className='flex items-center space-x-2'>
                    <FaPhone className="text-green-500" />
                    <span>{shop.contactNumber}</span>
                  </div>
                </td>
                <td>
                  <div className='flex items-center space-x-2'>
                    <FaAddressBook className="text-bottomNavBarColor" />
                    <span>{shop.address}</span>
                  </div></td>
                <td>{shop.gstNumber}</td>
                <td><ShopBalance shopId={shop.shop_id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShopKhataPage;
