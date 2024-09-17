import { fetchBalance } from "@/helpers/fetchTripBalance"
import { ITrip } from "@/utils/interface"
import { formatNumber } from "@/utils/utilArray"
import { useState, useEffect } from "react"
import { loadingIndicator } from "../ui/LoadingIndicator"

const TripBalance = ({ trip }: { trip: ITrip }) => {
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(true)
    const fetchData = async () => {
      const pending = await fetchBalance(trip)
      setBalance(pending)
      setLoading(false)
    }
    useEffect(()=>{
      fetchData()    
    },[])
    return (
      <div >
        {loading ?
          loadingIndicator :
          <span className='text-green-500 font-semibold'>₹{formatNumber(balance)}</span>
        }
      </div>
    )
  }

  export default TripBalance
  