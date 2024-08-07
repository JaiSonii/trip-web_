// PartiesPage.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { ISupplier } from '@/utils/interface';
import Loading from './loading';
import { useRouter } from 'next/navigation';
import { supplierTripCount } from '@/helpers/SupplierOperation';
import SupplierBalance from '@/components/supplier/SupplierBalance';
import { FaUserTie, FaPhone, FaTruck, FaWallet } from 'react-icons/fa';

const SuppliersPage = () => {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<ISupplier[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch('/api/suppliers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch suppliers');
        }

        const data = await res.json();
        setSuppliers(data.suppliers);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchSuppliers();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">No Suppliers found</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <div className="table-container overflow-auto bg-white shadow rounded-lg">
        <table className="custom-table w-full border-collapse table-auto">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="border p-4 text-left">Supplier Name</th>
              <th className="border p-4 text-left">Contact Number</th>
              <th className="border p-4 text-left">Active Trips</th>
              <th className="border p-4 text-left">Supplier Balance</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr
                key={supplier.supplier_id as string}
                className="border-t hover:bg-purple-100 cursor-pointer transition-colors"
                onClick={() => router.push(`suppliers/${supplier.supplier_id}/trips`)}
              >
                <td className="border p-4">
                  <div className="flex items-center space-x-2">
                    <FaUserTie className="text-bottomNavBarColor" />
                    <span>{supplier.name}</span>
                  </div>
                </td>
                <td className="border p-4">
                  <div className="flex items-center space-x-2">
                    <FaPhone className="text-green-500" />
                    <span>{supplier.contactNumber}</span>
                  </div>
                </td>
                <td className="border p-4">
                  <div className="flex items-center space-x-2">
                    <FaTruck className="text-bottomNavBarColor" />
                    <span>{supplierTripCount(supplier.supplier_id)}</span>
                  </div>
                </td>
                <td className="border p-4">
                  <div className="flex items-center space-x-2">
                    <FaWallet className="text-bottomNavBarColor" />
                    <span><SupplierBalance supplierId={supplier.supplier_id} /></span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuppliersPage;
