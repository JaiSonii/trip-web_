'use client'

import TripDocuments from '@/components/trip/TripDocuments'
import { ITrip } from '@/utils/interface'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const TripDocumentsPage = () => {
    const { tripId } = useParams() as { tripId: string };
    const [trip, setTrip] = useState<ITrip | null>(null);

    const fetchTrip = async () => {
        try {
            const res = await fetch(`/api/trips/${tripId}`);
            if (res.ok) {
                const data = await res.json();
                setTrip(data.trip);
            } else {
                alert('Failed to fetch trip');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to fetch trip');
        }
    };

    useEffect(() => {
        if (tripId) {
            fetchTrip();
        }
    }, [tripId]);

    if (!trip) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <TripDocuments
                startDate={new Date(trip.startDate)}
                route={trip.route}
                trip_id={tripId}
                ewayBill={trip.docuements.find(doc=>doc.type == 'ewayBill')?.url}
                ewbValidityDate={new Date(trip.ewbValidityDate)}
                POD={trip.docuements.find(doc=>doc.type == 'POD')?.url as string}
            />
        </div>
    );
};

export default TripDocumentsPage;
