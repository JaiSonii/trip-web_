'use client'
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import React from 'react'

interface props {
    children: React.ReactNode
}

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { tripId } = useParams()
    const pathname = usePathname()
    const tabs = [
        { name: 'Summary', path: `/user/trips/${tripId}` },
        { name: 'Documents', path: `/user/trips/${tripId}/documents` }
    ]
    return (
        <div>
            <div className="flex items-center justify-around "style={{scrollbarWidth : 'thin'}}>
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.path}
                        className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-t-md hover:bg-hoverColor ${pathname === tab.path
                            ? 'border-b-2 border-[#3190F5] text-buttonTextColor '
                            : 'border-transparent text-buttonTextColor hover:border-bottomNavBarColor'
                            }`}
                        prefetch={true}
                    >
                        <div className="flex items-center space-x-2">
                            <span>{tab.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
            {children}
        </div>
    )
}

export default Layout;