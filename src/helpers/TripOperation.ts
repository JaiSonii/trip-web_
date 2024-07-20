export const DeleteAccount = async (accountId: string, tripId: string) => {
    try {
        const res = await fetch(`/api/trips/${tripId}/accounts/${accountId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await res.json()
        console.log(data)
        let deletedAccount = data.trip.accounts.filter((acc: any) => acc.paymentBook_id == accountId)
        return deletedAccount
    } catch (error) {
        console.log(error)
        return error
    }

}