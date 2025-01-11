import { useToast } from '@/components/hooks/use-toast';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ReminderContext = createContext<any>(null);

export const useReminder = () => useContext(ReminderContext);

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Function to fetch reminders
    async function fetchReminders() {
      try {
        const response = await fetch(`/api/documents/reminders`);
        const data = await response.json();

        // Check if the new data is different from the current data
        if ((JSON.stringify(data) !== JSON.stringify(reminders) && data?.tripReminders?.length + data?.truckReminders?.length + data?.driverReminders?.length > 0)) {
          setReminders(data);

          // Show toast notification for new reminders
          toast({
            description: 'Please check your reminders',
            variant: 'reminder',
          });
        }
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    }

    // Fetch reminders immediately and set interval
    fetchReminders();
    intervalId = setInterval(fetchReminders, 4 * 60 * 60 * 1000); // 8 hours = 8 * 60 * 60 * 1000 ms

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [reminders, toast]);

  return (
    <ReminderContext.Provider value={{ reminders, setReminders, loading }}>
      {children}
    </ReminderContext.Provider>
  );
};
