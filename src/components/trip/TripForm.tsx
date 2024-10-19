import React, { useState, useEffect } from 'react';
import { PartySelect } from './PartySelect';
import TruckSelect from './TruckSelect';
import DriverSelect from './DriverSelect';
import RouteInputs from './RouteInputs';
import { BillingInfo } from './BillingInfo';
import { DateInputs } from './DateInputs';
import { IDriver, IParty, TruckModel } from '@/utils/interface';
import { Button } from '../ui/button';
import { formatNumber } from '@/utils/utilArray';
import { loadingIndicator } from '../ui/LoadingIndicator';
import { createWorker } from 'tesseract.js'
type Props = {
    parties: IParty[];
    trucks: TruckModel[];
    drivers: IDriver[];
    lr: string;
    onSubmit: (trip: any) => void;
};

const TripForm: React.FC<Props> = ({ parties, trucks, drivers, onSubmit, lr }) => {
    const [formData, setFormData] = useState({
        party: JSON.parse(localStorage.getItem('tripData') as any)?.party || '',
        truck: JSON.parse(localStorage.getItem('tripData') as any)?.truck || '',
        driver: JSON.parse(localStorage.getItem('tripData') as any)?.driver || '',
        supplierId: JSON.parse(localStorage.getItem('tripData') as any)?.supplierId || '',
        route: {
            origin: '',
            destination: ''
        },
        billingType: 'Fixed',
        perUnit: 0,
        totalUnits: 0,
        amount: 0,
        startDate: new Date(),
        truckHireCost: 0,
        LR: lr,
        material: '',
        notes: '',
        file: null,
        ewbValidity: null
    });

    useEffect(() => {
        if (localStorage.getItem('tripData')) {
            const savedItem = JSON.parse(localStorage.getItem('tripData') as any)
            setFormData(JSON.parse(localStorage.getItem('tripData') as any))
            setFormData((prev) => ({
                ...prev,
                party: savedItem.party,
                truck: savedItem.truck,
                driver: savedItem.driver,
                supplierId: savedItem.supplierId
            }))

        }
    }, [])

    const [file, setFile] = useState<File | null>(null)

    const [showDetails, setShowDetails] = useState(false);
    const [selectedTruck, setSelectedTruck] = useState<TruckModel | undefined>(undefined);
    const [hasSupplier, setHasSupplier] = useState(false);
    const [fileLoading, setFileLoading] = useState(false)

    const handleFileChange = async (e: any) => {
        const uplaodedFile = e.target.files[0];
        setFile(uplaodedFile);
        setFormData((prev) => ({
            ...prev,
            file: uplaodedFile
        }))

    };



    const processTripData = (tripData: any) => {
        if (!tripData) return;

        const driverId = trucks.find((truck) => truck.truckNo === tripData.truckNo)?.driver_id;

        setFormData((prev) => ({
            ...prev,
            startDate: new Date(tripData.startDate),
            route: {
                origin: tripData?.origin?.split('\n')[0],
                destination: tripData?.destination?.split('\n')[0],
            },
            truck: tripData.truckNo,
            ewbValidity: tripData.validity,
            driver: driverId,
        }));
    };

    const processFileUpload = async (file: File, isPdf: boolean) => {
        const data = new FormData();

        if (!isPdf) {
            const text = await extractTextFromImage(file);
            const res = await fetch(`/api/trips/getEwaybillDetails/text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                    'Accept': 'application/json'
                },
                body: text
            })
            if (!res.ok) throw new Error("Failed to process file");

            const data = await res.json()

            return data
        } else {
            data.append('file', file);
            const res = await fetch(`/api/trips/getEwaybillDetails`, {
                method: 'POST',
                body: data
            })
            if (!res.ok) throw new Error("Failed to process file");

            return await res.json();
        }

    };

    const extractTextFromImage = async (file: File): Promise<string> => {
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        return text;
    };

    const submitEwayBill = async () => {
        if (!file) return;

        try {
            setFileLoading(true);
            const isPdf = file.type === 'application/pdf';
            const resData = await processFileUpload(file, isPdf);
            processTripData(resData.ewbValidityDate);
            console.log(formData)

        } catch (error: any) {
            alert(error.message);
            console.error("Error submitting e-way bill:", error);

        } finally {
            setFileLoading(false);
        }
    };



    useEffect(() => {
        const updatedTruck = trucks.find(truck => truck.truckNo === formData.truck);
        setSelectedTruck(updatedTruck);
        setFormData((prev) => ({
            ...prev,
            driver: updatedTruck?.driver_id ? updatedTruck?.driver_id : ''
        }))
        setHasSupplier(!!updatedTruck?.supplier);
    }, [formData.truck, trucks]);

    useEffect(() => {
        if (formData.billingType !== 'Fixed') {
            const newAmount = parseFloat(formData.perUnit as any) * parseFloat(formData.totalUnits as any);
            setFormData(prevFormData => ({
                ...prevFormData,
                amount: newAmount
            }));
        }
    }, [formData.billingType, formData.perUnit, formData.totalUnits]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name.includes('route.')) {
            const routeField = name.split('.')[1];
            setFormData(prevState => ({
                ...prevState,
                route: {
                    ...prevState.route,
                    [routeField]: value
                }
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Helper function to remove commas and check if the value is a valid number
        const sanitizeInput = (value: string) => {
            // Remove commas and extra spaces
            const sanitizedValue = parseFloat(value.replace(/,/g, '').trim());
            // Check if the sanitized value is a valid number
            if (!isNaN(Number(sanitizedValue))) {
                return sanitizedValue;
            }
            return null;
        };

        // Sanitize 'amount' and 'truckHireCost' fields
        const sanitizedAmount = sanitizeInput(formData.amount.toString());
        const sanitizedTruckHireCost = sanitizeInput(formData.truckHireCost.toString());

        if (sanitizedAmount === null || sanitizedTruckHireCost === null) {
            alert('Please enter valid numeric values for Amount and Truck Hire Cost.');
            return;
        }

        if(!formData.supplierId && !formData.driver){
            alert('Driver Needs to be assigned!')
            return
        }

        // Proceed with submission
        onSubmit({
            ...formData,
            amount: sanitizedAmount,
            truckHireCost: sanitizedTruckHireCost,
        });

        localStorage.removeItem('tripData');
    };

    return (
        <div className="bg-white text-black p-4 max-w-3xl mx-auto shadow-md rounded-md">
            <div className='flex items-center gap-3 mb-4'>

                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className=""
                    disabled={fileLoading}
                />
                {fileLoading ? loadingIndicator :
                    <Button onClick={submitEwayBill} >
                        Upload
                    </Button>
                }

            </div>



            <form className="space-y-4" onSubmit={handleSubmit}>
                <BillingInfo
                    formData={formData}
                    handleChange={handleChange}
                    setFormData={setFormData}
                />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <PartySelect
                        parties={parties}
                        formData={formData}
                        handleChange={handleChange}
                    />
                    <TruckSelect
                        trucks={trucks}
                        formData={formData}
                        handleChange={handleChange}
                        selectedTruck={selectedTruck}
                        hasSupplier={hasSupplier}
                        setFormData={setFormData}
                    />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>



                    <DriverSelect
                        drivers={drivers}
                        formData={formData}
                        handleChange={handleChange}
                        setFormData={setFormData}
                    />
                    <DateInputs
                        formData={formData}
                        handleChange={handleChange}
                    />
                </div>
                <div className='z-50 '>
                    <RouteInputs
                        formData={formData}
                        handleChange={handleChange}
                    />
                </div>




                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">LR No</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        name="LR"
                        value={formData.LR}
                        placeholder="LR No"
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        <input
                            type="checkbox"
                            className="mr-2"
                            checked={showDetails}
                            onChange={() => setShowDetails(!showDetails)}
                        />
                        Add More Details
                    </label>
                </div>

                {showDetails && (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Material Name</label>
                            <input
                                type='text'
                                className="w-full p-2 border border-gray-300 rounded-md"
                                name="material"
                                value={formData.material}
                                placeholder="Material Name"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-md"
                                name="notes"
                                value={formData.notes}
                                placeholder="Notes"
                                onChange={handleChange}
                            />
                        </div>
                    </>
                )}

                {hasSupplier && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Truck Hire Cost</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            name="truckHireCost"
                            value={formatNumber(formData.truckHireCost)}
                            placeholder="Truck Hire Cost"
                            onChange={handleChange}
                        />
                    </div>
                )}

                <Button
                    className='w-full'
                    type="submit"
                >
                    Submit
                </Button>
            </form>
        </div>
    );
};

export default TripForm;
