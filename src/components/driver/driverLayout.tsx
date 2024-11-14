'use client'
import React, { useEffect, useState } from 'react';
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
import { loadingIndicator } from '../ui/LoadingIndicator';
import { useDriver } from '@/context/driverContext';
import Loading from '@/app/user/loading';
import { Frown } from 'lucide-react';
import { formatNumber } from '@/utils/utilArray';


interface DriverLayoutProps {
  driverId: string;
  onDriverUpdate: (driver: IDriver) => void;
  children: React.ReactNode
}



const DriverLayout: React.FC<DriverLayoutProps> = ({ driverId, onDriverUpdate, children }) => {

  const { driver, loading, setDriver } = useDriver()


  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'gave' | 'got' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const router = useRouter();

  // const fetchDriverDetails = async () => {
  //   try {
  //     const response = await fetch(`/api/drivers/${driverId}`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch driver');
  //     }

  //     const result = await response.json();
  //     setDriver(result.driver);
  //   } catch (err: any) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (driverId) {
  //     fetchDriverDetails()
  //   }
  // }, [driverId])


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

      // Update the driver state
      setDriver((prev: any) => {
        const latestAccount = data.accounts[data.accounts.length - 1]; // Get the last account entry from the updated response
        const newBalance =
          prev.balance - (latestAccount.got || 0) + (latestAccount.gave || 0); // Update balance correctly

        return {
          ...prev,
          driverExpAccounts: [latestAccount, ...prev.driverExpAccounts], // Add the latest entry to the accounts
          balance: newBalance, // Set the updated balance
        };
      });

      console.log(`Confirm ${modalType} clicked with amount: ${amount}, reason: ${reason}, date: ${date}`);
      closeModal(); // Close the modal after confirming
    } catch (error: any) {
      console.error('Failed to update driver:', error);
      setError(error.message); // Set error message if something goes wrong
    } finally {
      router.refresh(); // Refresh the page after updating
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
      alert(error.message); // Display an alert with the error message-
      setError(error.message);
    }
  };

  if (loading) return <Loading />

  if (!driver) {
    return <div className='flex items-center justify-center space-x-2'><Frown className='text-bottomNavBarColor' /> Driver Not Found</div>
  }

  return (
    <div className='flex flex-col gap-2 justify-start text-black'>
      <div className="flex items-center justify-between p-4 bg-gray-200 rounded-sm">
        <div className='flex flex-col gap-2'>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold mr-5 cursor-pointer" >
              {driver?.name}
            </h1>
            <span className="ml-2 text-lg text-gray-700">{driver?.contactNumber}</span>
            {driver && (
              <svg style={{ width: '20px', height: '20px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path
                  fill={driver.status === 'On Trip' ? '#f44336' : '#4caf50'} // Red if onTrip, green if available
                  d="M44,24c0,11-9,20-20,20S4,35,4,24S13,4,24,4S44,13,44,24z"
                ></path>
              </svg>
            )}
            {driver?.status}
          </div>
          <div className="flex items-center justify-between ">
            <span className={`text-xl font-semibold `}>Driver Balance : <span className={`${driver.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>₹{formatNumber(Math.abs(driver?.balance))}</span></span> {/* Display balance */}
          </div>
        </div>

        <div className="flex items-center">
          <DriverActions onGaveClick={() => openModal('gave')} onGotClick={() => openModal('got')} />
          <DropdownMenu onEditClick={() => setEdit(true)} onDeleteClick={handleDeleteDriver} />
        </div>

        <DriverModal open={modalOpen} onClose={closeModal} type={modalType} onConfirm={handleConfirm} />
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {edit && (
          <EditDriverModal name={driver?.name} driverId={driverId} handleEdit={handleEditDriver} onCancel={() => setEdit(false)} contactNumber={driver?.contactNumber} />
        )}
      </div>
      <div>

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
        <div className="mt-4">
          {driver ? (
            React.cloneElement(children as React.ReactElement, { driver })
          ) : (
            loadingIndicator
          )}
        </div>
      </div>
    </div>

  );
};

export default DriverLayout;
