import React from 'react'
import Image from 'next/image';
import { Button } from '../ui/button';

type props = {
    isOpen : boolean
    documentUrl : string
    onClose : any
}

const isPdf = (fileName: string) => {
    return fileName?.toLowerCase().endsWith('.pdf');
};

const PreviewDocument: React.FC<props> = ({isOpen, documentUrl, onClose}) => {
    const handleDownload = async () => {
        try {
            const response = await fetch(documentUrl.split('.pdf')[0]);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', documentUrl.split('/').pop() || 'file'); // Set file name or fallback to 'file'
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // Clean up link element
            window.URL.revokeObjectURL(blobUrl); // Revoke blob URL after download
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    };
    if(!isOpen) return null
    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-[80vw] max-w-3xl thin-scrollbar">
                {/* Close button */}
                <button
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={onClose}
                >
                    &#x2715; {/* Close icon */}
                </button>

                {/* Document content */}
                <div className="h-[70vh] overflow-auto">
                    {isPdf(documentUrl) ? (
                        <iframe
                            src={documentUrl.split('.pdf')[0]}
                            className="w-full h-full"
                            title="Full PDF Preview"
                        />
                    ) : (
                        <Image
                            src={documentUrl}
                            alt='Full document preview'
                            className="rounded-md object-cover w-full h-auto"
                            height={600}
                            width={600}
                        />
                    )}
                </div>

                {/* Download Button */}
                <div className="mt-4 flex justify-end">
                    <Button

                        onClick={handleDownload}
                    >
                        Download
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PreviewDocument