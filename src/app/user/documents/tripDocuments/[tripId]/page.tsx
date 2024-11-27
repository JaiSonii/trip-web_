'use client'

import Loading from '@/app/user/loading'
import { Button } from '@/components/ui/button'
import { ITrip } from '@/utils/interface'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import TripDocumentUpload from '@/components/documents/TripDocumentUpload'
import { FaChevronRight } from 'react-icons/fa6'

const TripDocumentsPage = () => {
    const { tripId } = useParams() as { tripId: string };
    const [trip, setTrip] = useState<ITrip | null>(null);
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)

    const TripDocuments = dynamic(() => import('@/components/trip/TripDocuments'), { ssr: false })

    const fetchTrip = async () => {
        try {
            const res = await fetch(`/api/trips/${tripId}`);
            if (res.ok) {
                const data = await res.json();
                console.log(data)
                setTrip(data.trip);
            } else {
                alert('Failed to fetch trip');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to fetch trip');
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        if (tripId) {
            fetchTrip();
        }
    }, [tripId]);

    if (loading) {
        return <Loading />
    }

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            {/* Trip Documents Section */}

            <div>
                {/* Title and Upload Button */}
                <div className="flex items-center justify-between mb-6 border-b-2 border-gray-300 pb-2">
                    <h1 className="text-2xl font-semibold text-black flex items-center space-x-2">
                        <Button variant={'link'}>
                            <Link href="/user/documents"  className="text-2xl font-semibold hover:underline">
                                Docs
                            </Link>
                        </Button>

                        <FaChevronRight className="text-lg text-gray-500" />
                        <Button variant={'link'}>
                            <Link href="/user/documents/tripDocuments"  className="text-2xl font-semibold hover:underline">
                                Trip Docs
                            </Link>
                        </Button>

                        <FaChevronRight className="text-lg text-gray-500" />
                        <span className="text-2xl font-semibold hover:underline">Trip...</span>
                    </h1>

                    <Button
                        onClick={() => setModalOpen(true)}
                    >
                        Upload Document
                    </Button>
                </div>

                {/* Trip Documents Component */}
                {trip &&
                    <TripDocuments
                        startDate={new Date(trip.startDate)}
                        route={trip.route}
                        ewbValidityDate={new Date(trip.ewbValidityDate)}
                        documents={trip.documents || []}
                    />
                }



                {/* Document Upload Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                        <TripDocumentUpload open={modalOpen} setOpen={setModalOpen} tripId={tripId} />
                    </div>
                )}
            </div>
        </div>


    );
};

export default TripDocumentsPage;
