'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import OtherDocumentUpload from './OtherDocumentUpload';

type Props = {
  setDocs: React.Dispatch<React.SetStateAction<any>>;
};

const OtherDocumentUploadModal: React.FC<Props> = ({ setDocs }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>
        Upload Document
      </Button>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <OtherDocumentUpload open={modalOpen} setOpen={setModalOpen} setUser={setDocs} />
        </div>
      )}
    </>
  );
};

export default OtherDocumentUploadModal;

