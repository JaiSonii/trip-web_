'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CompanyDocumentUpload from '@/components/documents/CompanyDocumentUpload';

type Props = {
  setUser: React.Dispatch<React.SetStateAction<any>>;
};

const CompanyDocumentUploadModal: React.FC<Props> = ({ setUser }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>
        Upload Document
      </Button>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <CompanyDocumentUpload open={modalOpen} setOpen={setModalOpen} setUser={setUser} />
        </div>
      )}
    </>
  );
};

export default CompanyDocumentUploadModal;

