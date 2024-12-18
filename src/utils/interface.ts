// interfaces/Driver.ts

import { Document } from 'mongoose';


// Define the interface for the driver account schema
export interface IDriverAccount {
  account_id: string
  date: Date;
  reason: string;
  gave: number;
  got: number;
}

// Define the interface for the driver schema
export interface IDriver extends Document {
  driver_id: string;
  name: string;
  contactNumber: string;
  status: 'Available' | 'On Trip';
  balance?: number;
  accounts: IDriverAccount[];
}
// interfaces/Trip.ts

export interface PaymentBook extends Document{
  _id: string;
  paymentBook_id: string
  accountType: string
  amount: number;
  paymentType: 'Cash' | 'Cheque' | 'Online Transfer';
  receivedByDriver: boolean;
  date: Date;
  notes?: string;
  driver_id? : string
}

interface Route {
  origin: string;
  destination: string;
}

export interface TripExpense extends Document{
  trip_id: string;
  partyBill: boolean;
  amount: number;
  date: Date;
  expenseType: string;
  notes?: string;
}

export interface ITrip extends Document {
  trip_id: string;
  party: string;
  truck: string;
  driver: string;
  supplier : string
  route: Route;
  billingType: 'Fixed' | 'Per Tonne' | 'Per Kg' | 'Per Trip' | 'Per Day' | 'Per Hour' | 'Per Litre' | 'Per Bag';
  amount: number;
  startDate: Date;
  truckHireCost: number;
  LR: string;
  status?: 0 | 1 | 2 | 3 | 4;
  POD?: string;
  dates: Date[];
  material?: string;
  notes?: string;
  accounts : PaymentBook[]
  ewayBill : string
  ewbValidityDate : Date
  documents : [{
    filename : string,
    type : string,
    validityDate : Date,
    uploadedDate : Date,
    url : string
  }]
  partyName : string;
  balance : number
}

export interface Idoc{
  filename : string,
  type : string,
  validityDate : Date,
  uploadedDate : Date,
  url : string
}


// interfaces/Party.ts


export interface IParty extends Document {
  user_id : string
  party_id: string;
  name: string;
  contactPerson: string;
  contactNumber: string;
  address: string;
  gstNumber: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  partyBalance : number
}


// interfaces/Truck.ts

export interface TruckModel extends Document {
  truckNo: string;
  truck_id : string
  truckType: string;
  model: any;
  capacity: string;
  bodyLength: string | null;
  ownership: string;
  supplier: string;
  status: 'Available' | 'On Trip'
  trip_id : string
  documents : []
  createdAt: Date;
  updatedAt: Date;
  driver_id : string
}

export interface ISupplier extends Document{
  supplier_id: string;
  name: string;
  contactNumber: string
  balance : number
}

export interface IExpense extends Document{
  user_id: string;
  trip_id: string;
  truck: string;
  expenseType: string;
  paymentMode: string;
  transaction_id?: string; // Optional
  driver?: string;         // Optional
  amount: number;
  date: Date;
  notes?: string;          // Optional
}

export interface ITripCharges extends Document{
  user_id: string;
  trip_id: string;
  partyBill: boolean;
  amount: number;
  date: Date;
  expenseType: string;
  notes?: string; // Optional field
}

export interface ISupplierAccount extends Document{
  user_id : string
  supplier_id: string;
  trip_id : string
  amount: number;
  paymentMode : string
  date : string
  notes : string
  refNo : string
}

export type ConsignerConsigneeType = {
  gstNumber: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber: string;
};

export type EWBFormDataType = {
  gstNumber: string
  pan: string
  companyName: string
  address: string
  city: string
  pincode: string
  contactNumber: string
  email: string
  date: Date
  LR: string
  consigner: ConsignerConsigneeType
  consignee: ConsignerConsigneeType
  material: string
  weight: string
  unit: string
  paidBy: 'consigner' | 'consignee' | 'agent'
  ewayBillNo: string
  invoiceNo: string
  truckNo: string
  logo: string
  signature: string
  value : string | number
}

export interface FMDataType {
  gstNumber: string;
  pan: string;
  companyName: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber: string;
  email: string;
  date: Date;
  challanNo: string
  from: string;
  to: string;
  truckHireCost: string;
  commision: string;
  weight: string;
  material: string;
  unit: string;
  noOfBags: string;
  vehicleOwner: string;
  advance: string;
  hamali: string;
  extraWeight: string;
  billingtype: string;
  cashAC: string;
  extra: string;
  TDS: string;
  tire: string;
  spareParts: string;
  truckNo: string;
  lrdate: string
  logo: string;
  signature : string;
}