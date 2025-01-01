import jsPDF from "jspdf";
import { ITrip } from "./interface";

export const savePDFToBackend = async (pdf: jsPDF, filename : string, docType : string, trip : ITrip | any, date : string | Date) => {
    const pdfBlob = pdf.output('blob');
    const file = new File([pdfBlob], `Bilty-${trip.LR}-${trip.truck}.pdf`, {
      type: 'application/pdf',
    });
  
    const formdata = new FormData();
    formdata.append('file', file);
    formdata.append('docType', 'FM/Challan');
    formdata.append('validityDate', new Date(date)?.toISOString().split('T')[0]);
    formdata.append('filename', `Bilty-${trip.LR}-${trip.truck}.pdf`);
  
    const response = await fetch(`/api/trips/${trip.trip_id}/documents`, {
      method: 'PUT',
      body: formdata,
    });
  
    if (!response.ok) {
      throw new Error('Failed to save bilty to documents');
    }
  
    const data = await response.json();
  
  };