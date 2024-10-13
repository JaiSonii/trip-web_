import { createContext, useContext } from "react";
import useSWR from "swr";
import { ITrip, IDriver, TruckModel } from "@/utils/interface";

const ExpenseCtx = createContext<{
    trips: ITrip[];
    drivers: IDriver[];
    shops: any[];
    trucks: TruckModel[] | any[];
    isLoading: boolean;
    error: any;
}>({
    trips: [],
    drivers: [],
    shops: [],
    trucks: [],
    isLoading: false,
    error: null,
});

export const useExpenseCtx = () => useContext(ExpenseCtx);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Props = {
    children: React.ReactNode;
};

export const ExpenseProvider = ({ children }: Props) => {
    const { data: tripsData, error: tripsError, isLoading: tripsLoading } = useSWR("/api/trips", fetcher);
    const { data: driversData, error: driversError, isLoading: driversLoading } = useSWR("/api/drivers", fetcher);
    const { data: trucksData, error: trucksError, isLoading: trucksLoading } = useSWR("/api/trucks", fetcher);
    const { data: shopsData, error: shopsError, isLoading: shopsLoading } = useSWR("/api/shopkhata", fetcher);

    const isLoading = tripsLoading || driversLoading || trucksLoading || shopsLoading;
    const error = tripsError || driversError || trucksError || shopsError;

    const trips = tripsData?.trips || [];
    const drivers = driversData?.drivers || [];
    const trucks = trucksData?.trucks || [];
    const shops = shopsData?.shops || [];

    return (
        <ExpenseCtx.Provider
            value={{
                trips,
                drivers,
                shops,
                trucks,
                isLoading,
                error,
            }}
        >
            {children}
        </ExpenseCtx.Provider>
    );
};
