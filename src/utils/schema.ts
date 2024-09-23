import mongoose, { ConnectOptions } from "mongoose";
import { Schema } from "mongoose";

const documentSchema = new Schema({
  filename : String,
  type : String,
  validityDate : Date,
  uploadedDate: Date,
  url : String
})

export const partySchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  party_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
  },
  contactNumber: {
    required : true,
    type: String,
  },
  address: {
    type: String,
  },
  gstNumber: {
    type: String,
  },
});




export const PaymentBookSchema = {
  paymentBook_id: String,
  accountType: {
    type: String,
    enum: ['Payments', 'Advances']
  },
  amount: {
    type: Number,
    required: true
  },
  paymentType: {
    type: String,
    enum: ['Cash', 'Cheque', 'Online Transfer', 'Bank Transfer', 'UPI', 'Fuel', 'Others'],
    required: true
  },
  receivedByDriver: {
    type: Boolean,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  },
}





export const tripSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  trip_id: {
    type: String,
    required: true,
    unique: true
  },
  party: {
    type: String,
    required: true
  },
  truck: {
    type: String,
    required: true
  },
  driver: {
    type: String,
  },
  supplier :{
    type: String,
    default : ''
  },
  route: {
    origin: { type: String, required: true },
    destination: { type: String, required: true }
  },
  billingType: {
    type: String,
    enum: ['Fixed', 'Per Tonne', 'Per Kg', 'Per Trip', 'Per Day', 'Per Hour', 'Per Litre', 'Per Bag'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now(),
    required: true
  },
  truckHireCost: {
    type: Number
  },
  LR: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    enum: [0, 1, 2, 3, 4]
  },
  POD: {
    type: String,
  },
  ewayBill:{
    type : String,
    default : ''
  },
  ewbValidityDate :{
    type : Date ,
    default : null
  },
  dates: [
    Date
  ],
  material: {
    type: String,
  },
  notes: {
    type: String
  },
  accounts: [
    PaymentBookSchema,
  ],
 documents : [
  documentSchema
 ] 
});



const driverAccountSchema = {
  account_id: String,
  date: Date,
  reason: String,
  gave: Number,
  got: Number,
}
export const driverSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  driver_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip'],
    default: 'Active'
  },
  accounts: [{
    type: driverAccountSchema
  }],
  documents: [documentSchema]
});



export const truckSchema: Schema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  truck_id : {type : String, required : true, unique : true},
  truckNo: { type: String, required: true
   },
  truckType: { type: String },
  model: { type: String },
  capacity: { type: String },
  bodyLength: { type: String },
  ownership: { type: String, enum: ['Market', 'Self'] },
  supplier: { type: String },
  status: { type: String, enum: ['Available', 'On Trip'] },
  trip_id: { type: String, default: '' },
  driver_id : {type : String, default : ''},
  documents : [documentSchema],
  updatedAt: { type: Date, default: Date.now }
});
export const supplierSchema: Schema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  supplier_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String
  },
  balance: {
    type: Number,
    default: 0
  }
})

export const userSchema = new Schema({
  user_id: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  name : {type : String},
  role : {
    name : String,
    user : String
  },
  gstNumber : String,
  address : String,
  company : String,
  createdAt: { type: Date, default: Date.now }
});



export const tripChargesSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  trip_id: {
    type: String,
    required: true
  },
  partyBill: {
    type: Boolean,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  expenseType: {
    type: String,
    required: true
  },
  notes: {
    type: String
  }
})

export const 
ExpenseSchema = new Schema({
  user_id : {
    type :String,
    required : true
  },
  trip_id : {
    type : String
  },
  truck : {
    type : String,
    default : ''
  },
  expenseType : {
    type : String,
    required : true
  },
  paymentMode :{
    type : String,
    required : true
  },
  transaction_id : String,
  driver : String,
  amount : {
    type : Number,
    required : true
  },
  shop_id : String,
  date : {
    type : Date,
    required : true
  },
  notes : String
})

export const supplierAccountSchema = new Schema({
  user_id : {
    type : String,
    required : true
  },
  trip_id :{
    type : String,
    required : true
  },
  supplier_id :{
    type : String,
    required : true
  },
  amount : {
    type : Number,
    required : true
  },
  paymentMode: {
    type : String,
    default : 'Cash'
  },
  date : {
    type : Date,
    required : true
  },
  notes : String,
  refNo : String
})

export const OfficeExpenseSchema = new Schema({
  user_id : {
    type : String,
    required : true
  },
  expenseType : {
    type : String,
    required : true
  },
  amount : {
    type : Number,
    required : true
  },
  paymentMode : String,
  shop_id :  String,
  date : {
    type : Date,
    required : true
  },
  transactionId : String,
  notes : String
})

export const TokenBlacklistSchema = new Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export const ShopKhataSchema = new Schema({
  user_id : {type : String, required : true},
  shop_id : {
    type : String,
    required : true,
    unique : true
  },
  name : {
    type : String,
    required : true
  },
  contactNumber : String,
  address : String,
  gstNumber : String,

})

export const ShopKhataAccountsSchema = new Schema({
  user_id : {type : String, required : true},
  shop_id : {
    type : String,
    required : true
  },
  reason : String,
  payment : Number,
  credit : Number,
  date : {type : Date, required : true}
})



const connectString: any = process.env.NEXT_PUBLIC_MONGO_URL

export async function connectToDatabase() {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(connectString);
  }
}

export const statuses = ['Started', 'Completed', 'POD Recieved', 'POD Submitted', 'Settled'];
