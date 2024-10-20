import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { loadingIndicator } from '@/components/ui/LoadingIndicator'; // Ensure this component is available
import { IDriver } from '@/utils/interface';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation';
import { getDocType } from '@/helpers/ImageOperation';
import { createWorker } from 'tesseract.js';
import { extractLatestDate } from '@/helpers/ImageOperation';
import { mutate } from 'swr';
import { useExpenseCtx } from '@/context/context';

interface DocumentForm {
    filename: string;
    validityDate: string;  // ISO string for the date input
    docType: string;
    file: File | null;
    driverId: string;
}

type Props = {
    open: boolean;
    driverId?: string;
    setOpen: (open: boolean) => void;
};

const DriverDocumentUpload: React.FC<Props> = ({ open, setOpen, driverId }) => {
    const { drivers } = useExpenseCtx()
    const [formData, setFormData] = useState<DocumentForm>({
        filename: '',
        validityDate: new Date().toISOString().split('T')[0],
        docType: '',
        file: null,
        driverId: driverId || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter()



    // Filter drivers based on search term

    const filteredDrivers = useMemo(() => {
        if (!drivers || drivers.length === 0) return []
        let filtered = [...drivers]
        if (searchTerm) {
            const lowercaseQuery = searchTerm.toLowerCase()
            filtered = drivers.filter((driver) =>
                driver.name.toLowerCase().includes(lowercaseQuery) ||
                driver.contactNumber.toLowerCase().includes(lowercaseQuery)
            )
        }
        return filtered
    }, [drivers, searchTerm])


    // Handle option selection for lorry (driver)
    const handleOptionSelect = (value: string) => {
        setFormData((prev) => ({ ...prev, driverId: value }));
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const extractTextFromImage = async (file: File): Promise<string> => {
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        return text;
    };

    // Handle file change
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const types = new Set(['License', 'Aadhar', 'PAN', 'Police Verification'])
        const fileData = new FormData();
        if (e.target.files) {
            setFormData({
                ...formData,
                file: e.target.files[0],
            });

            fileData.append('file', e.target.files[0] as File);
            setLoading(true);
            try {
                if (e.target.files[0].type.includes('image/')) {
                    const text = await extractTextFromImage(e.target.files[0]);
                    const type = getDocType(text)
                    const validity: string = extractLatestDate(text) as any
                    setFormData((prev) => ({
                        ...prev,
                        docType: types.has(type) ? type : 'Other',
                        validityDate: new Date(validity || Date.now()).toISOString().split('T')[0]
                    }))
                    setLoading(false)
                    return
                } else {
                    const res = await fetch(`/api/documents/validate`, {
                        method: 'POST',
                        body: fileData,
                    });

                    setLoading(false);

                    if (!res.ok) {
                        setError('Failed to get validity and docType. Please enter manually.');
                        return;
                    }

                    const data = await res.json();
                    if (data.status === 402) {
                        setError(data.error)
                        return
                    }
                    setFormData({
                        ...formData,
                        file: e.target.files[0],
                        validityDate: new Date(data.validity).toISOString().split('T')[0],
                        docType: types.has(data.docType) ? data.docType : 'Other',
                    });
                }
            } catch (error) {
                setLoading(false);
                setError('Error occurred while validating document. Please enter manually');
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.file) {
            setError('Please upload a document.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        const data = new FormData();
        data.append('file', formData.file);
        data.append('filename', formData.filename);
        data.append('validityDate', formData.validityDate);
        data.append('docType', formData.docType);

        try {
            const response = await fetch(`/api/drivers/${driverId || formData.driverId}/documents`, {
                method: 'PUT',
                body: data,
            });

            setLoading(false);

            if (response.ok) {
                setSuccessMessage('Document uploaded successfully!');
                setError('');
                setFormData({
                    filename: '',
                    validityDate: new Date().toISOString().split('T')[0],
                    docType: '',
                    file: null,
                    driverId: ''
                });
                setOpen(false);
                mutate('/api/documents/recent')
                router.refresh()
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Something went wrong.');
            }
        } catch (err) {
            setLoading(false);
            setError('Failed to upload document.');
        }
    };

    if (!open) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.5,
                ease: [0, 0.71, 0.2, 1.01]
            }} className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h1 className="text-2xl font-semibold mb-4 text-black">Upload Document</h1>

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center mb-4">
                    {loadingIndicator}
                </div>
            )}

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

            <form onSubmit={handleSubmit}>
                {/* Lorry (driver) select */}
                <div className="mb-4">
                    <label className="block text-sm text-gray-700">Driver*</label>
                    <Select name="driver" defaultValue={formData.driverId} onValueChange={handleOptionSelect}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Driver" />
                        </SelectTrigger>
                        <SelectContent>
                            <div className="p-2">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            {filteredDrivers.length > 0 ? (
                                filteredDrivers.map((driver) => (
                                    <SelectItem key={driver.driver_id} value={driver.driver_id} >
                                        <div className='grid grid-cols-3 text-left w-full gap-4'>
                                            <p className='col-span-1'>{driver.name}</p>
                                            <p className='col-span-1'>{driver.contactNumber}</p>
                                            <p
                                                className={`col-span-1 p-1 rounded ${driver.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                            >
                                                {driver.status}
                                            </p>
                                        </div>


                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-gray-500">No drivers found</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* File upload input */}
                <div className="mb-4">
                    <label className="block text-gray-700">Upload File(pdf)*</label>
                    <input
                        type="file"
                        name="file"
                        onChange={handleFileChange}
                        className="w-full mt-1 p-2 border rounded"
                        accept="application/pdf, image/*"
                        required
                    />
                </div>

                {/* Filename input */}
                <div className="mb-4">
                    <label className="block text-gray-700">Filename</label>
                    <input
                        type="text"
                        name="filename"
                        value={formData.filename}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border rounded"
                        placeholder="(optional)"
                    />
                </div>

                {/* Document Type select */}
                <div className="mb-4">
                    <label className="block text-gray-700">Document Type*</label>
                    <select
                        name="docType"
                        value={formData.docType}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Select Document Type</option>
                        <option value="License">License</option>
                        <option value="Aadhar">Aadhar</option>
                        <option value="PAN">PAN (Permanent Account Number)</option>
                        <option value="Police Verification">Police Verification</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Validity Date input */}
                <div className="mb-4">
                    <label className="block text-gray-700">Validity Date*</label>
                    <input
                        type="date"
                        name="validityDate"
                        value={formData.validityDate}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border rounded"
                        required
                    />
                </div>



                {/* Submit button */}
                <div className="flex items-center space-x-2 justify-end">
                    <Button type="submit" >
                        Submit
                    </Button>
                    <Button variant={'outline'} onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};

export default DriverDocumentUpload;
