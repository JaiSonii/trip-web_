import {useState } from 'react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion'
import { createWorker } from 'tesseract.js';
import { mutate } from 'swr';
import { Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface DocumentForm {
    filename: string;
    file: File | null;
}

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    setUser : any
};

const CompanyDocumentUpload: React.FC<Props> = ({ open, setOpen, setUser }) => {
    const [formData, setFormData] = useState<DocumentForm>({
        filename: '',
        file: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const {toast} = useToast()



    // Filter drivers based on search term



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
    // Handle file change
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault(); // prevent any accidental form submission due to file input change

        
        if (e.target.files) {
            const file = e.target.files[0];
            setFormData({
                ...formData,
                file: file,
            });
        }
    };


    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.file || !formData.filename) {
            setError('Please upload a document and enter filename.');
            toast({
                description : 'Please upload a document and enter filename.',
                variant : 'warning'
            })
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        const data = new FormData();
        data.append('file', formData.file);
        data.append('filename', formData.filename);

        try {
            const response = await fetch(`/api/users`, {
                method: 'PATCH',
                body: data,
            });

            setLoading(false);

            if (response.ok) {
                setSuccessMessage('Document uploaded successfully!');
                setError('');
                setFormData({
                    filename: '',
                    file: null,
                });
                setOpen(false);
                const data = await response.json()
                setUser(data.user)
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Something went wrong.');
                toast({
                    description : 'Failed to upload document',
                    variant : 'destructive'
                })
            }
        } catch (err) {
            setLoading(false);
            setError('Failed to upload document.');
            toast({
                description : 'Failed to upload document',
                variant : 'destructive'
            })
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
            }} className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col z-50">
            <h1 className="text-2xl font-semibold mb-4 text-black">Upload Document</h1>

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center mb-4">
                    <Loader2 className='animate-spin text-bottomNavBarColor' /> 
                </div>
            )}

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

            <form onSubmit={handleSubmit}>
                

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
                    <label className="block text-gray-700">Filename*</label>
                    <input
                        type="text"
                        name="filename"
                        value={formData.filename}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border rounded"
                        placeholder=""
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

export default CompanyDocumentUpload;
