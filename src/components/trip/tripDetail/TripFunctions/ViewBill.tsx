import { Button } from '@/components/ui/button';
import React from 'react';

const ViewBillButton = () => {
  return (
    <div>
      <Button variant={'outline'}>
        <span className="truncate">View Bill</span>
      </Button>
    </div>
  );
};

export default ViewBillButton;
