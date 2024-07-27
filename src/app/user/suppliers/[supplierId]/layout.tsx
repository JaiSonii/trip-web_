'use client';

import { useParams } from 'next/navigation';
import Loading from '@/app/loading';
import SupplierLayout from '@/components/layout/SupplierLayout';

interface PartyLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<PartyLayoutProps> = ({ children }) => {
  const {supplierId} = useParams();


  if (!supplierId) {
    return <Loading />
  }

  return (
    <SupplierLayout supplierId={supplierId as string}>
      {children}
    </SupplierLayout>
  );
};

export default Layout;
