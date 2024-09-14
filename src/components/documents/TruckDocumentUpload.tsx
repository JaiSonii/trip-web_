import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { loadingIndicator } from '@/components/ui/LoadingIndicator'; // Ensure this component is available
import {  TruckModel } from '@/utils/interface';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation';

interface DocumentForm {
    filename: string;
    validityDate: string;  // ISO string for the date input
    docType: string;
    file: File | null;
    truckNo: string;
}

type Props = {
    open: boolean;
    truckNo?: string;
    setOpen: (open: boolean) => void;
};

const TruckDocumentUpload: React.FC<Props> = ({ open, setOpen, truckNo }) => {
    const [formData, setFormData] = useState<DocumentForm>({
        filename: '',
        validityDate: new Date().toISOString().split('T')[0],
        docType: '',
        file: null,
        truckNo: truckNo || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [trucks, setTrucks] = useState<TruckModel[]>([]);
    const [filteredTrucks, setFilteredTrucks] = useState<TruckModel[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter()

    useEffect(() => {
        const fetchTrucks = async () => {
            try {
                const res = await fetch(`/api/trucks`);
                const data = await res.json();
                setTrucks(data.trucks);
                setFilteredTrucks(data.trucks);
            } catch (error) {
                setError('Failed to fetch trucks');
            }
        };
        fetchTrucks();
    }, []);

    // Filter trucks based on search term
    useEffect(() => {
        if (searchTerm) {
            setFilteredTrucks(trucks.filter((truck) =>
                truck.truckNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                truck.truckType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                truck.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                truck.ownership.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        }
    }, [searchTerm, trucks]);

    // Handle option selection for lorry (trip)
    const handleOptionSelect = (value: string) => {
        setFormData((prev) => ({ ...prev, truckNo: value }));
    };
    

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };
    

    // Handle file change
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileData = new FormData();
        const types = new Set(['Permit','Insurance', 'Registration Certificate','Pollution'])
        if (e.target.files) {
            setFormData({
                ...formData,
                file: e.target.files[0],
            });

            fileData.append('file', e.target.files[0] as File);
            setLoading(true);
            try {
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
                if(data.status === 402){
                    setError(data.error)
                    return
                }
                setFormData({
                    ...formData,
                    file : e.target.files[0],
                    validityDate: new Date(data.validity).toISOString().split('T')[0],
                    docType: types.has(data.docType) ? data.docType : 'Other',
                });
            } catch (error) {
                setLoading(false);
                setError('Error occurred while validating document.');
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
            const response = await fetch(`/api/trucks/${truckNo}/documents`, {
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
                    truckNo: ''
                });
                setOpen(false)
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
            <h1 className="text-2xl font-bold mb-4 text-bottomNavBarColor">Upload Document</h1>

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center mb-4">
                    {loadingIndicator}
                </div>
            )}

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

            <form onSubmit={handleSubmit}>
                {/* Lorry (trip) select */}
                <div className="mb-4">
                    <label className="block text-sm text-gray-700">Lorry*</label>
                    <Select name="truckNo" defaultValue={formData.truckNo} value={formData.truckNo} onValueChange={handleOptionSelect}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Lorry" />
                        </SelectTrigger>
                        <SelectContent>
                            <div className="p-2">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {filteredTrucks.length > 0 ? (
                                filteredTrucks.map((truck) => (
                                    <SelectItem key={truck.truckNo} value={truck.truckNo}>
                                        <span>{truck.truckNo}</span>
                                        <span
                                            className={`ml-2 p-1 rounded ${truck.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {truck.status}
                                        </span>
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-gray-500">No lorries found</div>
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
                        accept="application/pdf"
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
                        <option value="Registration Certificate">Registration Certificate</option>
                        <option value="Permit">Permit</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Pollution Certificate">Pollution Certificate</option>
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

export default TruckDocumentUpload;
