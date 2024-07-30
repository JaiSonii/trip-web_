import React, { useState, useEffect } from 'react';

interface DriverNameProps {
    driverId: string;
}

const DriverBalance: React.FC<DriverNameProps> = ({ driverId }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [balance, setBalance] = useState<number>(0)

    useEffect(() => {
        const loadDriverBalance = async () => {
            try {
                const res = await fetch(`/api/drivers/${driverId}/calculateBalance`);
                const data = await res.json()
                const {total} = data
                setBalance(total);
            } catch (error: any) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        loadDriverBalance();
    }, [driverId]);

    if (loading) return <span>Loading...</span>;
    if (error || !balance) return <span>NA</span>;

    return <span className={balance > 0 ? 'text-green-500 p-2' : 'text-red-500 p-2'}>{balance || ''}</span>;
};

export default DriverBalance;
