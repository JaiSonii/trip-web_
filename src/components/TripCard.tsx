import React from 'react';
import Link from 'next/link';
import { FaRoute } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';

interface TripCardProps {
    tripId: string;
    route: {
        origin: string;
        destination: string;
    };
    partyName: string;
    status: number;
    statuses: string[];
}

const TripCard: React.FC<TripCardProps> = ({ tripId, route, partyName, status, statuses }) => {
    const calculateStatusWidth = (status: number) => {
        // Define the width for each status level in percentage
        const widths = [20, 40, 60, 80, 100]; // Each step increases by 20%
        return `${widths[status]}%`; // Based on the current status, return the corresponding width
    };


    return (
        <Link href={`/user/trips/${tripId}`}>
            <div className="flex items-center justify-between gap-4 p-2 bg-white rounded-lg w-full">
                <div className="flex flex-col justify-center space-y-1 border-r border-gray-300 pr-4">
                    <div className="flex items-center space-x-2">
                        <FaRoute className="text-bottomNavBarColor text-base" />
                        <span className="font-semibold text-sm text-gray-800">
                            {route?.origin.split(',')[0]} &rarr; {route?.destination.split(',')[0]}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <GoOrganization className="text-bottomNavBarColor text-base" />
                        <span className="text-xs text-gray-600">{partyName}</span>
                    </div>
                </div>

                <div className="flex flex-col justify-between items-start pl-4 w-[100px]">
                    <span className="font-semibold text-sm text-gray-600">{statuses[status]}</span>
                    <div className="w-full bg-gray-200 h-2 rounded overflow-hidden mt-1">
                        <div
                            className={`h-full transition-width duration-500 rounded ${status === 0
                                    ? "bg-red-500"
                                    : status === 1
                                        ? "bg-yellow-500"
                                        : status === 2
                                            ? "bg-blue-500"
                                            : status === 3
                                                ? "bg-green-500"
                                                : "bg-green-800"
                                }`}
                            style={{ width: calculateStatusWidth(status) }}
                        ></div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default TripCard;
