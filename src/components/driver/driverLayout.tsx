import React, { useState } from 'react';
import DriverActions from './driverActions';
import DriverModal from './driverModal';
import { IDriver } from '@/utils/interface';
import DropdownMenu from './dropdownMenu';
import { usePathname, useRouter } from 'next/navigation';
import EditDriverModal from './editDriverModal';
import DriverBalance from './DriverBalance';
import Link from 'next/link';
import { FaTruckMoving, FaMapMarkerAlt } from 'react-icons/fa';
import { IoDocuments } from 'react-icons/io5';

interface DriverLayoutProps {
  name: string;
  status: string;
  driverId: string;
  onDriverUpdate: (driver: IDriver) => void;
  contactNumber: string;
  children: React.ReactNode
}

const DriverLayout: React.FC<DriverLayoutProps> = ({ name, status, driverId, onDriverUpdate, contactNumber, children }) => {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'gave' | 'got' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState<boolean>(false);

  const tabs = [
    { logo: <FaTruckMoving />, name: 'Driver Accounts', path: `/user/drivers/${driverId}` },
    { logo: <FaMapMarkerAlt />, name: 'Trips', path: `/user/drivers/${driverId}/trips` },
    { logo: <IoDocuments />, name: 'Documents', path: `/user/drivers/${driverId}/documents` },
  ];

  const pathname = usePathname()

  const openModal = (type: 'gave' | 'got') => {
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setError(null);
  };

  const handleConfirm = async (amount: number, reason: string, date: string) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          got: modalType === 'got' ? amount : 0,
          gave: modalType === 'gave' ? amount : 0,
          reason,
          date,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver');
      }

      const data = await response.json();
      onDriverUpdate(data.driver);

      console.log(`Confirm ${modalType} clicked with amount: ${amount}, reason: ${reason}, date: ${date}`);
      closeModal();
    } catch (error: any) {
      console.error('Failed to update driver:', error);
      setError(error.message);
    }
  };

  const handleEditDriver = async (driverName: string, mobileNumber: string) => {
    const updatedDriver: Partial<IDriver> = {
      name: driverName,
      contactNumber: mobileNumber,
    };

    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'PATCH', // Use PATCH to partially update the driver
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDriver),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver');
      }
      const data = await response.json();
      onDriverUpdate(data.driver);
      setEdit(false);
      alert('Driver Info Edited Successfully');
      router.push('/user/drivers');
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleDeleteDriver = async () => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400) {
          alert(data.message);
          return;
        }
        throw new Error(data.message || 'Failed to delete driver');
      }

      alert('Driver Removed Successfully');
      router.push('/user/drivers');
    } catch (error: any) {
      console.error('Failed to delete driver:', error);
      alert(error.message); // Display an alert with the error message
      setError(error.message);
    }
  };

  return (
    <div className='flex flex-col gap-2 justify-start'>
      <div className="flex items-center justify-between p-4 bg-gray-200 rounded-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold mr-5 cursor-pointer" >
            {name}
          </h1>
          <span className="ml-2 text-lg text-gray-700">{contactNumber}</span>
          {status === 'Available' && (
            <svg style={{ width: '20px', height: '20px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#4caf50" d="M44,24c0,11-9,20-20,20S4,35,4,24S13,4,24,4S44,13,44,24z"></path>
            </svg>
          )}
          {status}
        </div>
        <div className="flex items-center">
          <DriverActions onGaveClick={() => openModal('gave')} onGotClick={() => openModal('got')} />
          <DropdownMenu onEditClick={() => setEdit(true)} onDeleteClick={handleDeleteDriver} />
        </div>

        <DriverModal open={modalOpen} onClose={closeModal} type={modalType} onConfirm={handleConfirm} />
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {edit && (
          <EditDriverModal name={name} driverId={driverId} handleEdit={handleEditDriver} onCancel={() => setEdit(false)} contactNumber={contactNumber} />
        )}
      </div>
      <div>
        <div className="flex items-center justify-between p-3 bg-gray-200 rounded-sm w-fit">
          <span className="text-2xl">Driver Balance: <DriverBalance driverId={driverId} /></span> {/* Display balance */}
        </div>
        <div className="flex border-b-2 border-lightOrange mb-4 mt-2">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.path}
              className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-t-md hover:bg-lightOrangeButtonColor ${pathname === tab.path
                ? 'border-b-2 border-lightOrange text-buttonTextColor bg-lightOrange'
                : 'border-transparent text-buttonTextColor hover:bottomNavBarColor hover:border-bottomNavBarColor'
                }`}
            >
              <div className="flex items-center space-x-2">
                {tab.logo}
                <span>{tab.name}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>

  );
};

export default DriverLayout;
