import jsPDF from "jspdf";
import { invData, ITrip } from "./interface";

export const savePDFToBackend = async (pdf: jsPDF, filename: string, docType: string, trip: ITrip | any, date: string | Date) => {
  const pdfBlob = pdf.output('blob');
  const file = new File([pdfBlob], `Bilty-${trip.LR}-${trip.truck}.pdf`, {
    type: 'application/pdf',
  });

  const formdata = new FormData();
  formdata.append('file', file);
  formdata.append('docType', docType);
  formdata.append('validityDate', new Date(date)?.toISOString().split('T')[0]);
  formdata.append('filename', filename);

  const response = await fetch(`/api/trips/${trip.trip_id}/documents`, {
    method: 'PUT',
    body: formdata,
  });

  if (!response.ok) {
    throw new Error('Failed to save bilty to documents');
  }

  const data = await response.json();
  return data

};


export const saveInvoice = async (pdf: jsPDF, invData: Partial<invData>) => {
  try {
    // Convert PDF to a Blob and create a File instance
    const pdfBlob = pdf.output('blob');
    const file = new File([pdfBlob], 'invoice.pdf', { type: 'application/pdf' });

    // Prepare form data with the PDF file and additional invoice data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify(invData));

    // Make API request to save the invoice
    const response = await fetch(`/api/trips/invoice`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save invoice: ${errorText}`);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in saveInvoice:", error);
    throw error; // Rethrow to be handled by the calling function
  }
};
