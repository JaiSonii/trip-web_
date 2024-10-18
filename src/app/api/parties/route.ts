import { NextResponse, NextRequest } from 'next/server';
import { model, models } from 'mongoose';
import { connectToDatabase, partySchema } from '@/utils/schema';
import { IParty } from '@/utils/interface';

import { v4 as uuidv4 } from 'uuid'

import {  verifyToken } from '@/utils/auth';

const Party = models.Party || model('Party', partySchema);

export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.redirect(new URL('/api/logout', req.url));
  }


  try {
    await connectToDatabase()

    const parties = await Party.aggregate([
      { $match: { user_id: user } }, // Match based on user ID
      {
        $lookup: {
          from: 'trips', // Join with the trips collection
          localField: 'party_id',
          foreignField: 'party',
          as: 'trips'
        }
      },
      { $unwind: { path: '$trips', preserveNullAndEmptyArrays: true } }, // Unwind trips array
      {
        $lookup: {
          from: 'tripcharges', // Join with the tripcharges collection
          localField: 'trips.trip_id',
          foreignField: 'trip_id',
          as: 'tripExpenses'
        }
      },
      {
        $addFields: {
          tripBalance: {
            $let: {
              vars: {
                accountBalance: {
                  $sum: {
                    $map: {
                      input: '$trips.accounts', // Sum account amounts from each trip
                      as: 'account',
                      in: '$$account.amount'
                    }
                  }
                },
                chargeToBill: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$tripExpenses', // Use tripExpenses from joined tripcharges
                          as: 'expense',
                          cond: { $eq: ['$$expense.partyBill', true] }
                        }
                      },
                      as: 'filteredExpense',
                      in: '$$filteredExpense.amount'
                    }
                  }
                },
                chargeNotToBill: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$tripExpenses', // Use tripExpenses from joined tripcharges
                          as: 'expense',
                          cond: { $eq: ['$$expense.partyBill', false] }
                        }
                      },
                      as: 'filteredExpense',
                      in: '$$filteredExpense.amount'
                    }
                  }
                }
              },
              in: {
                $cond: {
                  if: { $ne: ['$trips', null] }, // Check if trips exist
                  then: {
                    $subtract: [
                      { $add: ['$trips.amount', '$$chargeToBill'] }, // Calculate balance
                      { $add: ['$$accountBalance', '$$chargeNotToBill'] }
                    ]
                  },
                  else: 0 // If no trips, balance is 0
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id', // Group by party_id
          partyBalance: { $sum: '$tripBalance' }, // Sum of balances for all trips
          party: { $first: '$$ROOT' } // Preserve the full party document
        }
      },
      {
        $addFields: {
          'party.partyBalance': '$partyBalance' // Add partyBalance field to the party document
        }
      },
      { $replaceRoot: { newRoot: '$party' } }, // Replace the root with the full party document
      { $project: { trips: 0, tripExpenses: 0 } } // Optionally remove trips and tripExpenses if not needed in the final output
    ]);


    return NextResponse.json({ parties });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: Request) {

  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }


  try {
    await connectToDatabase()

    const data = await req.json();

    // Basic validation


    // GST number validation
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (data.gstNumber && !gstRegex.test(data.gstNumber)) {
      return NextResponse.json({ message: 'Invalid GST number' }, { status: 400 });
    }

    // Phone number validation (10 digits starting with 7, 8, or 9)
    const phoneRegex = /^[789]\d{9}$/;
    if (data.contactNumber != '' && !phoneRegex.test(data.contactNumber)) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
    }


    const newParty: IParty = new Party({
      user_id: user,
      party_id: 'party' + uuidv4(),
      name: data.name,
      contactPerson: data.contactPerson,
      contactNumber: data.contactNumber,
      address: data.address,
      gstNumber: data.gstNumber,
      balance: data.balance,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });

    const savedParty = await newParty.save();
    return NextResponse.json({ message: 'Saved Successfully', data: savedParty }, { status: 200 });

  } catch (error: any) {
    console.error('Error saving party:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', details: error.message }, { status: 400 });
    } else if (error.name === 'MongoError' && error.code === 11000) {
      return NextResponse.json({ message: 'Duplicate Key Error', details: error.message }, { status: 409 });
    } else {
      return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
    }
  }
}
