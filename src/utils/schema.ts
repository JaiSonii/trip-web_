import mongoose, { mongo } from "mongoose";
import { Schema } from "mongoose";

export const partySchema = new Schema({
    party_id :{
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    contactPerson: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    gstNumber: {
      type: String,
      required: true,
      unique: true
    },
    balance: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });


export const tripSchema = new Schema({
    tripId: {
      type: String,
      required: true,
      unique: true
    },
    party:{
      type: String,
      required: true
    },
    truck:{
      type : String,
      required : true
    },
    driver: {
      type : String,
      required : true,
    },
    route : {
      origin : {type : String, required: true},
      destination : {type : String, required: true}
    },
    billingType : {
      type : String,
      enum : ['Fixed', 'Per Tonne', 'Per Kg', 'Per Trip', 'Per Day', 'Per Hour', 'Per Litre', 'Per Bag'],
      required: true
    },
    amount : {
      type : Number,
      required: true
    },
    startDate : {
      type : Date,
      default : Date.now(),
      required : true
    },
    truckHireCost : {
      type : Number
    },
    LR:{
      type : String,
      required: true
    },
    status : {
      type : Number,
      enum : [0, 1, 2, 3, 4]
    },
    POD : {
      type : String,
    },
    dates : [
      Date
    ],
    material :{
      type : String,
    },
    notes : {
      type : String
    },
  });

const driverAccountSchema = {
  account_id: String,
  date : Date,
  reason : String,
  gave : Number,
  got : Number,
}
export const driverSchema = new mongoose.Schema({

    driver_id:{
      type: String,
      required: true,
      unique: true
    },
    name:{
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true,
      unique: true
    },
    status : {
      type: String,
      enum: ['Available', 'On Trip'],
      default: 'Active'
    },
    balance: {
      type: Number
    },
    accounts: [{
      type : driverAccountSchema
    }]
  });



export const truckSchema: Schema = new Schema({
    truckNo: { type: String, required: true, unique: true },
    truckType: { type: String },
    model: { type: String},
    capacity: { type: String},
    bodyLength: { type: String },
    ownership: { type: String, enum: ['Market', 'Self'] },
    supplier: { type: String },
    status : {type : String, enum : ['Available', 'On Trip']},
    trip_id : {type : String, default : ''},
    documents : [{document_name : String, document_link : String}],
    updatedAt: { type: Date, default: Date.now }
});

export const supplierSchema : Schema = new Schema({
  supplier_id :{
    type: String,
    required: true
  },
  name: {
    type:String,
    required: true
  },
  contactNumber : {
    type : String
  },
  tripCount :{
    type : Number
  },
  balance : {
    type : Number,
    default : 0
  }
})

export const userSchema = new Schema({
  uid : {type: String, required : true, unique: true},
  phoneNumber: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export async function connectToDatabase() {
  if (!mongoose.connection.readyState) {
    await mongoose.connect('mongodb://localhost:27017/transportbook', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}

export const statuses = ['Started', 'Completed', 'POD Recieved', 'POD Submitted', 'Settled'];