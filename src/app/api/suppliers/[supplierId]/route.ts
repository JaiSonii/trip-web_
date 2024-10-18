// Import necessary modules and schemas
import { connectToDatabase, supplierAccountSchema } from "@/utils/schema";
import { models, model } from 'mongoose';
import { supplierSchema } from "@/utils/schema";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";

// Retrieve or define Mongoose model for Supplier
const Supplier = models.Supplier || model('Supplier', supplierSchema);
const SupplierAccount = models.SupplierAccount || model('SupplierAccount', supplierAccountSchema)
// GET request handler function
export async function GET(req: Request, { params }: { params: { supplierId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { supplierId } = params;

  try {
    // Connect to the MongoDB database
    await connectToDatabase();

    // Find the supplier based on supplierId
    // const supplier = await Supplier.findOne({ user_id: user, supplier_id: supplierId }).lean();
    const suppliers = await Supplier.aggregate([
      {
        $match: { user_id: user, supplier_id: supplierId }
      },
      {
        $lookup: {
          from: 'trips',
          localField: 'supplier_id',
          foreignField: 'supplier',
          as: 'supplierTrips'
        }
      },
      {
        $lookup: {
          from: 'supplieraccounts',
          localField: 'supplier_id',
          foreignField: 'supplier_id',
          as: 'supplierAccounts'
        }
      },
      {
        $addFields: {
          supplierTripAccounts: {
            $concatArrays: [
              {
                $map: {
                  input: { $ifNull: ['$supplierTrips', []] }, // Ensures input is always an array
                  as: 'trip',
                  in: {
                    trip_id: '$$trip.trip_id',
                    supplier_id: '$$trip.supplier',
                    truckHireCost: '$$trip.truckHireCost',
                    route: '$$trip.route',
                    LR: '$$trip.LR',
                    date: '$$trip.startDate',
                    type: 'trip',
                    status: '$$trip.status',
                    truck: '$$trip.truck',
                    amount: { $ifNull: ['$$trip.truckHireCost', 0] }, // Use trip.truckHireCost as amount
                    balance: { $subtract: [0, '$$trip.truckHireCost'] } // Subtract truckHireCost from balance
                  }
                }
              },
              {
                $map: {
                  input: { $ifNull: ['$supplierAccounts', []] }, // Ensures input is always an array
                  as: 'payment',
                  in: {
                    _id: '$$payment._id',
                    supplier_id: '$$payment.supplier_id',
                    date: '$$payment.date',
                    type: 'payment',
                    amount: { $ifNull: ['$$payment.amount', 0] },
                    balance: { $add: [0, '$$payment.amount'] }, // Add payment amount to balance
                    // Check if trip_id exists in supplier account and add trip route if found
                    route: {
                      $let: {
                        vars: {
                          matchedTrip: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: { $ifNull: ['$supplierTrips', []] }, // Ensure input is an array
                                  as: 'trip',
                                  cond: { $eq: ['$$trip.trip_id', '$$payment.trip_id'] }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: { $ifNull: ['$$matchedTrip.route', null] } // Add route only if trip_id matches
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      },
      {
        // Sort the concatenated array by date
        $addFields: {
          supplierTripAccounts: {
            $sortArray: {
              input: '$supplierTripAccounts',
              sortBy: { date: 1 }
            }
          }
        }
      },
      {
        // Calculate cumulative balance across trips and payments
        $addFields: {
          supplierTripAccounts: {
            $reduce: {
              input: '$supplierTripAccounts',
              initialValue: { balance: 0, items: [] },
              in: {
                balance: { $add: ['$$value.balance', '$$this.balance'] }, // Adjust cumulative balance
                items: {
                  $concatArrays: [
                    '$$value.items',
                    [
                      {
                        $mergeObjects: [
                          '$$this',
                          { balance: { $add: ['$$value.balance', '$$this.balance'] } }
                        ]
                      }
                    ]
                  ]
                }
              }
            }
          }
        }
      },
      {
        // Specify inclusion only
        $project: {
          supplierTripAccounts: '$supplierTripAccounts.items',
          balance: '$supplierTripAccounts.balance',
          name: 1,
          contactNumber: 1,
          supplier_id: 1
        }
      }
    ]);


    // Handle case where supplier is not found
    if (!suppliers) {
      return NextResponse.json({ message: "No supplier found" }, { status: 404 });
    }

    // Return the supplier details
    return NextResponse.json({ supplier: suppliers[0] }, { status: 200 });

  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { supplierId: String } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { supplierId } = params;
  const data = await req.json()
  const newBalance = data.truckHireCost

  try {
    await connectToDatabase()
    const supplier = await Supplier.findOne({ user_id: user, supplier_id: supplierId })
    supplier.balance = parseFloat(supplier.balance) + parseFloat(newBalance)
    await supplier.save()
    return NextResponse.json({ message: 'Balance updated successfully', balance: supplier.balance }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { supplierId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { supplierId } = params;

  try {
    // Connect to the MongoDB database
    await connectToDatabase();

    // Find the supplier based on supplierId
    const supplier = await Supplier.findOneAndDelete({ user_id: user, supplier_id: supplierId }).lean();
    await SupplierAccount.deleteMany({ user_id: user, supplier_id: supplierId })

    // Handle case where supplier is not found
    if (!supplier) {
      return NextResponse.json({ message: "No supplier found" }, { status: 404 });
    }

    // Return the supplier details
    return NextResponse.json({ supplier: supplier }, { status: 200 });

  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { supplierId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { supplierId } = params;
  const data = await req.json()

  try {
    // Connect to the MongoDB database
    await connectToDatabase();

    // Find the supplier based on supplierId
    const phoneRegex = /^[789]\d{9}$/;
    if (data.contactNumber != '' && !phoneRegex.test(data.contactNumber)) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
    }
    const supplier = await Supplier.findOneAndUpdate({ user_id: user, supplier_id: supplierId }, data).lean();

    // Handle case where supplier is not found
    if (!supplier) {
      return NextResponse.json({ message: "No supplier found" }, { status: 404 });
    }

    // Return the supplier details
    return NextResponse.json({ supplier: supplier }, { status: 200 });

  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

