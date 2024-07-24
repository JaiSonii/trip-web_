import { ITruckExpense } from "@/utils/interface";

export const handleDelete = async (id: string, e? : React.MouseEvent ) => {
    e?.stopPropagation(); // Prevent the row's click event from being triggered
    const res = await fetch(`/api/truckExpense/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      alert('Failed to delete expense');
      return;
    }
    const data = await res.json()
    return data
  };

  export const handleAddCharge = async (newCharge: any, id?: string, truckNo? : string) => {
    const truckExpenseData = {
      ...newCharge,
      truck: truckNo,
      transaction_id: newCharge.transactionId || '',
      driver: newCharge.driver || '',
      notes: newCharge.notes || '',
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/truckExpense/${id}` : `/api/trucks/${truckNo}/expense`;

    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(truckExpenseData),
    });

    if (!res.ok) {
      alert('Failed to add charge');
      return;
    }

    const data = await res.json();
    return data
  };

  export const ExpenseforDriver = async(driver : string)=>{
    try{
        const res = await fetch(`/api/truckExpense`,{
            method : 'GET',
            headers : {
                'Content-Type' : 'application/json',
            }
        })
        const data = await res.json()
        const filteredData = data.truckExpense.filter((expense : ITruckExpense)=>expense.driver == driver)
        return filteredData
    }catch(err){
        alert(err)
        console.log(err)
    }
    
  }

  export const fetchTruckExpense = async (month : any, year : any) => {
    try {
        const res = await fetch(`/api/truckExpense?month=${month}&year=${year}`);
        if (!res.ok) {
            throw new Error('Failed to fetch truck expenses');
        }
        const data = await res.json();
        return data.truckExpense;
    } catch (error) {
        console.error('Error fetching truck expenses:', error);
        return [];
    }
};

export const fetchTripExpense = async (month : any, year : any) => {
  try {
      const res = await fetch(`/api/tripExpense?month=${month}&year=${year}`);
      if (!res.ok) {
          throw new Error('Failed to fetch truck expenses');
      }
      const data = await res.json();
      return data.tripExpense;
  } catch (error) {
      console.error('Error fetching truck expenses:', error);
      return [];
  }
};

  