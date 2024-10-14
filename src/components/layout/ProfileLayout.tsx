import React, { useEffect, useState } from 'react';
import { IDriver } from '@/utils/interface';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaTruckMoving, FaMapMarkerAlt } from 'react-icons/fa';
import { IoDocuments } from 'react-icons/io5';
import { UserCircle2 } from 'lucide-react';
import { GoReport } from 'react-icons/go';

interface DriverLayoutProps {
    children: React.ReactNode
}

const ProfileLayout: React.FC<DriverLayoutProps> = ({ children }) => {
    const router = useRouter();

    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [edit, setEdit] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null)
    const tabs = [
        { logo: <IoDocuments />, name: 'Details', path: `/user/profile/details` },
        { logo: <UserCircle2 />, name: 'Access', path: `/user/profile/access` },
        { logo: <GoReport />, name: 'Report', path: `/user/profile/reports` },
        
    ];

    const pathname = usePathname()

    const openModal = (type: 'gave' | 'got') => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setError(null);
    };

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/users`)
            const resData = res.ok ? await res.json() : alert('Failed to fetch User')
            setUser(resData.user)
        } catch (error: any) {
            alert(error.message)
            console.log(error)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])


    return (
        <div className="min-h-screen bg-gray-100 rounded-md">
            <div className="w-full h-full p-4">
            <div className="flex justify-between mb-4 border-b-2 border-gray-300 pb-2">
                <h1 className='text-4xl font-semibold text-black'>Profile</h1>
                <header className="">
                    <h1 className="text-2xl font-bold text-black">{user?.phone}</h1>
                </header>
                </div>
                <nav className="flex mb-6 border-b-2 border-gray-200">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.path}
                            className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-t-md hover:bg-lightOrangeButtonColor ${pathname === tab.path
                                ? 'border-b-2 border-lightOrange text-buttonTextColor bg-lightOrange'
                                : 'border-transparent text-buttonTextColor hover:bottomNavBarColor hover:border-bottomNavBarColor'
                                }`}
                        >
                            {tab.name}
                        </Link>
                    ))}
                </nav>
                <main className="bg-white shadow-md rounded-lg p-6">
                    {children}
                </main>
            </div>
        </div>

    );
};

export default ProfileLayout;
