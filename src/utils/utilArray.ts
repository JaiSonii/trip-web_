import { HiMiniTruck } from "react-icons/hi2"

export const driverGave = [
  'Fuel Expense',
  'Loading Charges',
  'Unloading Charges',
  'Detension Charges',
  'Union Charges',
  'Toll Expense',
  'Police Expense',
  'Brokerage',
  'Other'
]

export const driverGot = [
  'Trip Advance',
  'Trip Payment',
  'Party Advance',
  'Party Payment',
  'Driver Pay'
]

export const minitruck = ['3 Wheel Ape', 'Omni Van', 'Tata Zip', 'Maximo', 'Super Ace', 'Dost', 'Bolero Pickup', 'Isuzu Pickup', 'Tata 407', 'Tata Intra', 'Other']
export const openBody = ['Tata - 12 Feet - 3MT',
  'Canter / 709 14ft - 14 MT',
  'Canter / LPT 17 ft - 5 MT',
  '1109 - 19 ft -7 MT',
  '6 Wheel LP - 9 MT',
  '10 Wheel Taurus 15 MT',
  '10 Wheel Taurus 16 MT',
  '12 Wheel Taurus 20 MT',
  '12 Wheel Taurus 21 MT',
  '14 Wheel Taurus 25 MT',
  '14 Wheel Taurus 26 MT',
  '16 Wheeler',
  '18 Wheeler',
  '22 Wheeler']

export const closedContainer = [
  "Canter / 709 14 ft - 3.5 MT",
  "Canter 17 ft - 5 MT",
  "19 ft - 6 Wheeler - 7 MT",
  "19 ft - 6 Wheeler - 8 MT",
  "20 ft - SXL - 6.5 MT",
  "20 ft - SXL - 7 MT",
  "21 ft - 6 W container",
  "22 ft - 6W container",
  "24 ft SXL Container",
  "24 ft MXL container",
  "28 ft SXL Container",
  "28 ft MXL container",
  "30 ft Container",
  "32 ft SXL Container",
  "32 ft MXL Container",
  "32 ft MXL HQ Container",
  "32 ft triple axle - 20 MT",
  "34 ft Container",
  "40 ft Container",
  "Other"
];

export const trailer = [
  "20 ft platform",
  "22 ft platform",
  "24 ft platform",
  "28 ft platform(JCB) - 8 MT",
  "32 ft platform(JCB) - 13 MT",
  "32 ft Flat bed - 25 MT",
  "20 ft Double - Axle - 22 MT",
  "20 ft Triple - Axle - 28 MT",
  "20 ft double crown - 33 MT",
  "20 ft Tuskar",
  "28 ft Tripple - Axle Sidebody",
  "40 ft Flat bed",
  "40 ft Double - Axle - 20 MT",
  "40 ft Triple - Axle - 28 MT",
  "40 ft Double Crown Triple Axle - 32 MT",
  "40 ft Tripple - Axle Sidebody",
  "50 ft Flat bed",
  "50 ft Double - Axle - 20 MT",
  "50 ft Triple - Axle - 28 MT",
  "50 ft Double Crown Triple Axle - 32 MT",
  "50 ft Tripple - Axle Sidebody",
  "42 ft High Bed",
  "42 ft Semi low Bed",
  "42 ft Low Bed",
  "55 ft Triple - Axle",
  "60 ft Triple -Axle",
  "70 ft Triple - Axle",
  "80 ft Triple - Axle",
  "Hydraulic axle trailer(ODC)",
  "Other"
];



export const truckTypes = [
  'Mini Truck / LCV',
  'Open Body Truck',
  'Closed Container',
  'Trailer',
  'Tanker',
  'Tipper',
  'Other'
]


import { FaTruckPickup, FaTruckLoading, FaTruckMoving, FaGasPump, FaEllipsisH } from "react-icons/fa";
import { MdLocalShipping, MdOutlineLocalShipping, MdOutlineConstruction } from "react-icons/md";
import { FaTrailer } from "react-icons/fa6"

// Define the truck types and their corresponding icons
export const truckTypesIcons = [
  { type: 'Mini Truck / LCV', Icon: FaTruckPickup },
  { type: 'Open Body Truck', Icon: MdOutlineLocalShipping },
  { type: 'Closed Container', Icon: FaTruckMoving },
  { type: 'Trailer', Icon: FaTrailer },
  { type: 'Tanker', Icon: FaGasPump },
  { type: 'Tipper', Icon: MdOutlineConstruction },
  { type: 'Other', Icon: FaEllipsisH }
];

export const chargeType = [
  'Detention/Halting Charges',
  'Repair Expense',
  'Loading Charges',
  'Unloading Charges',
  'Union Charges',
  'Weight Charges',
  'Other Charges'
];

export const deductionType = [
  'Material Loss',
  'Brokerage',
  'Late Fees',
  'TDS',
  'Mamul',
  'Other'
];

export const fuelAndDriverChargeTypes = new Set([
  'Brokerage',
  'Detention',
  'Driver bhatta',
  'Driver payment',
  'Loading Charges',
  'Fuel Expense',
  'Other',
  'Police Expense',
  'RTO Expense',
  'Toll Expense',
  'Union Expense',
  'Weight Charges',
  'Unloading Charges',
]);

export const maintenanceChargeTypes = new Set([
  'Repair Expense',
  'Showroom Service',
  'Regular Service',
  'Minor Repair',
  'Gear Maintenance',
  'Brake Oil Change',
  'Grease Oil Change',
  'Spare Parts Purchase',
  'Air Filter Change',
  'Tyre Puncture',
  'Tyre Retread',
  'Tyre Purchase',
  'Roof Top Repair'
]);

export const officeExpenseTypes = [
  'Audit Fees',
  'Courier Expenses',
  'Electricity',
  'Rent',
  'Labour',
  'Legal Expenses',
  'Mess Expenses',
  'Telephone Expenses',
  'Pooja Expenses',
  'Salary and Wages',
  'Stationary Expenses',
  'Tea Expenses',
  'Travelling Expenses'
]

export const monthMap: { [key: string]: number } = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11
};

export const formatNumber = (num: number) => {
  if (!num && num !== 0) return ""; // Check if num is null or undefined, but allow 0
  const cleanNum = num.toString().replace(/[^\d]/g, ""); // Remove non-digit characters

  // Format the number according to Indian numbering system (lakhs, crores)
  const lastThree = cleanNum.slice(-3);
  const otherNumbers = cleanNum.slice(0, cleanNum.length - 3);

  const formattedNumber = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ","); // Insert commas after every two digits
  return otherNumbers ? `${formattedNumber},${lastThree}` : lastThree;
};


