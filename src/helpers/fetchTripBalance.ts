import { ITrip, TripExpense } from "@/utils/interface";

export const fetchBalance = (trip : ITrip | any)=>{
    const accountBalance = trip.accounts.reduce((total : any, account: any) => total + account.amount, 0);
      let chargeToBill = 0
      let chargeNotToBill = 0
      if (trip.tripCharges){
        chargeToBill = trip.tripCharges.filter((charge : any) => charge.partyBill).reduce((total : any, charge : any) => total + charge.amount, 0);
        chargeNotToBill = trip.tripCharges.filter((charge : any) =>!charge.partyBill).reduce((total : any, charge : any) => total + charge.amount, 0);
      }
      const pending = trip.amount - accountBalance - chargeNotToBill + chargeToBill
      console.log(pending)
      return pending
}

export const fetchCharges  = async (tripId: String) =>{
    const response = await fetch(`/api/trips/${tripId}/expenses`);
    const data = await response.json();
    return data.charges
  }

  export const fetchBalanceBack = async(trip : ITrip, charges : TripExpense[])=>{
    const accountBalance = trip.accounts.reduce((total, account) => total + account.amount, 0);
      let chargeToBill = 0
      let chargeNotToBill = 0
      if (charges){
        chargeToBill = charges.filter(charge => charge.partyBill).reduce((total, charge) => total + charge.amount, 0);
        chargeNotToBill = charges.filter(charge =>!charge.partyBill).reduce((total, charge) => total + charge.amount, 0);
      }
      const pending = trip.amount - accountBalance - chargeNotToBill + chargeToBill
      return pending
}