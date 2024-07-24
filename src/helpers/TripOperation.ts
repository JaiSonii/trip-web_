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

export const fetchTripRoute = async (tripId: string) => {
    if (tripId != '') {
        const tripRes = await fetch(`/api/trips/${tripId}`);
        const data = await tripRes.json();
        const trip = data.trip;
        return trip.route;
    }
}

export const handleEditAccount = async (editedItem: any, tripId : string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/accounts/${editedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account: editedItem }),
      });
      if (!res.ok) {
        throw new Error('Failed to edit item');
      }

      const resData = await res.json();
      if (resData.status == 400) {
        alert(resData.message);
        return;
      }
      return resData.trip
    } catch (error) {
      console.log(error);
      return {error : error}
    }
  };