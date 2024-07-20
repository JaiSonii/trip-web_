export const fetchDriverName = async (driver: string) => {
    try {
        const response = await fetch(`/api/drivers/${driver}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch driver');
        }

        const result = await response.json();
        return result.name
    } catch (err: any) {
        console.log(err.message);
        return err
    }
};

export const deleteDriverAccount = async (driverId: string, accountId: string) => {
    try {
        const response = await fetch(`/api/drivers/${driverId}/accounts/${accountId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
        return error
    }

}