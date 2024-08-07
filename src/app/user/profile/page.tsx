'use client';

import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface Permissions {
  view: boolean;
  edit: boolean;
}

const UserProfile: React.FC = () => {
  const params = useSearchParams();
  const userId = params.get('user_id');
  const [userPhone, setUserPhone] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [permissions, setPermissions] = useState<Permissions>({
    view: false,
    edit: false,
  });
  const [accessibleAccounts, setAccessibleAccounts] = useState<any[]>([]);
  const [accountsGivenAccess, setAccountsGivenAccess] = useState<
    { phone: string; permissions: Permissions; user_id : string }[]
  >([]);

  useEffect(() => {
    const fetchUserPhone = async () => {
      const response = await fetch(`/api/login`);
      const data = await response.json();
      setUserPhone(data.user.phone);
    };

    const fetchAccessibleAccounts = async () => {
      const response = await fetch(`/api/users/accessible-accounts`);
      const data = await response.json();
      setAccessibleAccounts(data.accounts.haveAccess);
    };

    const fetchAccountsGivenAccess = async () => {
      const response = await fetch(`/api/users/accounts-given-access`);
      const data = await response.json();
      setAccountsGivenAccess(data.accounts.accessGiven);
      console.log(data)
    };

    if (userId) {
      fetchUserPhone();
      fetchAccessibleAccounts();
      fetchAccountsGivenAccess();
    }
  }, [userId]);

  const handlePermissionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPermissions((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/users/grant-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        phone,
        permissions,
      }),
    });

    if (response.ok) {
      alert('Access granted successfully');
      setPhone('');
      setPermissions({ view: false, edit: false});
      // Fetch the updated accounts given access
    //   fetchAccountsGivenAccess();
    } else {
      alert('Failed to grant access');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h1>
      <div className="mb-8">
        <p className="text-lg text-gray-700">User ID: <span className="font-medium">{userId}</span></p>
        <p className="text-lg text-gray-700">User Phone: <span className="font-medium">{userPhone}</span></p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Grant Access to Another User</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Permissions
          </label>
          <div className="flex items-center mt-2">
            <input
              id="view"
              name="view"
              type="checkbox"
              checked={permissions.view}
              onChange={handlePermissionChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="view" className="ml-2 block text-sm text-gray-700">
              View
            </label>
          </div>
          <div className="flex items-center mt-2">
            <input
              id="edit"
              name="edit"
              type="checkbox"
              checked={permissions.edit}
              onChange={handlePermissionChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="edit" className="ml-2 block text-sm text-gray-700">
              Edit
            </label>
          </div>
        </div>

        <Button type="submit">
          Grant Access
        </Button>
      </form>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Accessible Accounts</h2>
        <ul className="list-disc list-inside pl-4">
          {accessibleAccounts?.map((account,index) => (
            <li key={index} className="text-lg text-gray-700">{account.user_id}</li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Accounts Given Access</h2>
        <ul className="space-y-4">
          {accountsGivenAccess?.map(({user_id, phone, permissions }, index) => (
            <li key={index} className="text-lg text-gray-700">
                <div>
                <span className="font-medium">id:</span> {user_id}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {phone}
              </div>
              <div>
                <span className="font-medium">Permissions:</span> 
                {permissions?.view && ' View'}
                {permissions?.edit && ' Edit'}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserProfile;
