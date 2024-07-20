import React, { useState } from 'react';
import StatusModal from './StatusModal';
import { Button } from '@/components/ui/button';

interface StatusButtonProps {
  status: number;
  amount: number;
  statusUpdate: (data: any) => void;
  dates: Date[];
}

const StatusButton: React.FC<StatusButtonProps> = ({ status, statusUpdate, dates, amount }) => {
  const statusLabels: any = {
    0: 'Complete Trip',
    1: 'POD Received',
    2: 'POD Submitted',
    3: 'Settle Amount',
    4: 'Settled'
  };

  const label = statusLabels[status];

  let gradientClass = '';
  switch (status) {
    case 0:
      gradientClass = 'bg-gray-800';
      break;
    case 1:
      gradientClass = 'bg-gray-700';
      break;
    case 2:
      gradientClass = 'bg-gray-600';
      break;
    case 3:
      gradientClass = 'bg-gray-500';
      break;
    case 4:
      gradientClass = 'bg-gray-400';
      break;
    default:
      gradientClass = 'bg-gray-400';
      break;
  }

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const saveChanges = (data: any) => {
    statusUpdate(data);
    closeModal();
  };

  return (
    <div className='w-full'>
      <Button
        onClick={openModal}
        disabled={status === 4}
      >
        {label}
      </Button>
      <StatusModal status={status} isOpen={modalOpen} onClose={closeModal} onSave={saveChanges} dates={dates} amount={amount} />
    </div>
  );
};

export default StatusButton;
