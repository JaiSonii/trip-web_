import React, { useState, useEffect } from 'react';
import { loadingIndicator } from '../ui/LoadingIndicator';
import { formatNumber } from '@/utils/utilArray';

interface DriverNameProps {
    partyId: string;
}

const PartyBalance: React.FC<DriverNameProps> = ({ partyId }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [balance, setBalance] = useState<number>(0)

    useEffect(() => {
        const loadPartyBalance = async () => {
            try {
                const res = await fetch(`/api/parties/${partyId}/calculateBalance`);
                const data = await res.json()
                const {totalbalance} = data
                setBalance(totalbalance);
            } catch (error: any) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        loadPartyBalance();
    }, [partyId]);

    if (loading) return loadingIndicator;
    if (error || !balance) return <span>NA</span>;

    return <span className='text-green-600 font-semibold'>₹{formatNumber(balance) || ''}</span>;
};

export default PartyBalance;
