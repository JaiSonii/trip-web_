import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useState, useRef } from 'react';

interface EWayBillUploadProps {
  tripId: string;
  ewayBillUrl?: string;
  setEwayBillUrl: (url: string) => void;
}

const EWayBillUpload: React.FC<EWayBillUploadProps> = ({ tripId, ewayBillUrl, setEwayBillUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      try {
        // Upload the file to S3 or your server here
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('tripId', tripId); // Append the tripId

        const response = await fetch(`/api/s3Upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setEwayBillUrl(data.fileUrl); // Set the uploaded file URL
        } else {
          alert('Failed to upload e-way bill');
        }
      } catch (error) {
        console.error('Error uploading e-way bill:', error);
        alert('Error uploading e-way bill');
      } finally {
        setIsUploading(false);
        setSelectedFile(null); // Clear the selected file
      }
    }
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">E-Way Bill</h3>
      {ewayBillUrl ? (
        <div className="mt-4">
          <div className="relative flex-col space-y-2">
            <Image
              src={ewayBillUrl}
              alt="e-way bill"
              height={100}
              width={100}
              className="cursor-pointer transition-transform transform duration-300 ease-out hover:scale-105"
              onClick={handleImageClick}
            />
            {/* File input for re-uploading */}
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              disabled={isUploading}
              className="w-full text-sm text-gray-700 file:bg-lightOrangeButtonColor file:border-none file:rounded-lg file:px-4 file:py-2 file:cursor-pointer hover:file:bg-darkOrangeButtonColor mt-2"
            />
            {/* Submit button to trigger file upload */}
            <Button
              onClick={handleFileUpload}
              disabled={isUploading || !selectedFile}
              
            >
              {isUploading ? 'Uploading...' : 'Submit E-Way Bill'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          {/* File input for uploading */}
          <input
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={handleFileChange}
            disabled={isUploading}
            
          />
          {/* Submit button to trigger file upload */}
          <Button
            onClick={handleFileUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? 'Uploading...' : 'Upload E-Way Bill'}
          </Button>
          {isUploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
        </div>
      )}

      {/* Modal for displaying larger image */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className=" p-4 rounded-lg shadow-lg flex-col space-y-1 bg-lightOrangeButtonColor">
            <Image
              src={ewayBillUrl || ""}
              alt="E-Way Bill Large View"
              height={500}
              width={500}
              className="max-w-full h-auto"
            />
            <Button
              onClick={handleCloseModal}
              className='w-full'
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EWayBillUpload;
