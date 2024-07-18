'use client';
import React, { useEffect, useState } from 'react';
import { ITrip, TruckModel } from '@/utils/interface';
import { useParams } from 'next/navigation';
import { statuses } from '@/utils/schema';
import { fetchPartyName } from '@/helpers/fetchPartyName';
import { fetchBalance } from '@/helpers/fetchTripBalance';
import Loading from '@/app/loading';

const TruckPage = () => {
  const [data, setData] = useState<any>([]);
  const { truckNo } = useParams();
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expenseRes, tripRes] = await Promise.all([
          fetch(`/api/trucks/${truckNo}/expense`),
          fetch(`/api/trips`),
        ]);

        let [expenseData, tripData] = await Promise.all([
          expenseRes.ok ? expenseRes.json() : [],
          tripRes.ok ? tripRes.json() : [],
        ]);

        tripData = tripData.trips.filter((trip: ITrip) => trip.truck === truckNo);

        // Fetch party names and add them to trip data
        const tripDataWithPartyNames = await Promise.all(
          tripData.map(async (trip: any) => {
            const partyName = await fetchPartyName(trip.party);
            return { ...trip, partyName };
          })
        );

        const combinedData = [...expenseData, ...tripDataWithPartyNames].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setData(combinedData);

        // Calculate total expense and revenue
        let totalExpense = 0;
        let totalRevenue = 0;

        combinedData.forEach((item: any) => {
          if (item.expenseType) {
            totalExpense += item.amount;
          } else {
            totalRevenue += item.amount; // Calculate revenue
          }
        });

        setTotalExpense(totalExpense);
        setRevenue(totalRevenue);
      } catch (error: any) {
        console.log(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [truckNo]); // Add truckNo as a dependency

  if (loading) return <Loading />;

  return (
    <div className="w-full h-full p-4">
      <div className="mb-4 flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-green-700">Total Revenue: <span className="text-black">{revenue}</span></h2>
        <h2 className="text-lg font-bold text-red-700">Total Expense: <span className="text-black">{totalExpense}</span></h2>
        <h2 className="text-lg font-bold text-blue-700">Profit: <span className="text-black">{revenue - totalExpense}</span></h2>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Reason</th>
              <th>Expense</th>
              <th>Revenue</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, index: any) => (
              <tr key={index}>
                <td>{new Date(item.date || item.dates?.[0]).toLocaleDateString()}</td>
                <td>
                  {item.expenseType ||
                    `${statuses[item.status]} ● ${item.partyName} ● ${item.route?.origin.split(',')[0]} -> ${item.route?.destination.split(',')[0]}`}
                </td>
                <td>{item.expenseType ? item.amount : ''}</td>
                <td>{!item.expenseType ? fetchBalance(item) : ''}</td>
                <td>
                  <button className="text-blue-500">Action</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TruckPage;
