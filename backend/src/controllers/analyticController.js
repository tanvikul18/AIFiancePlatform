
import mongoose from "mongoose";
import { DateRange } from "../enums/date-range.js";
import { transactionModel } from "../models/transactionModel.js";
import { getdateRange } from "../utils/helper.js";
import { differenceInDays, subDays, subYears } from "date-fns";
import { convertToDollar } from "../utils/formatCurrency.js";
import { TransactionType } from "../models/transactionModel.js";
export const summaryAnalytics=async(req,res)=>{
    try{
         const userId = req.user?.id;
         const {present,from,to} = req.query;
         console.log(present)
         let dateRangeValue = '';
        if(present == "30days")
             {
                 dateRangeValue = DateRange.days;
             }
        else{
            dateRangeValue = DateRange.present;
        }
        console.log("CuuremtWhichPeriod",dateRangeValue)
          const filter= {
            dateRangePresent : dateRangeValue,
            customFrom : from ? new Date(from) : undefined,
            customTo : to ?  new Date(to) : undefined
          }
          
          const range= getdateRange(filter.dateRangePresent,filter.customFrom,filter.customTo);
          
          const {from :rangefrom ,to: rangeto, range :rangeValue} = range;
            const currentPeriodPipeline=  [
            {
                $match: {
                    userId: (userId),
                    ...(from &&
                    to && {
                        date: {
                        $gte: from,
                        $lte: to,
                        },
                    }),
                },
                },
                {
                $group: {
                    _id: null,
                    totalIncome: {
                    $sum: {
                        $cond: [
                        { $eq: ["$type", TransactionType.INCOME] },
                        { $abs: "$amount" },
                        0,
                        ],
                    },
                    },
                    totalExpense: {
                    $sum: {
                        $cond: [
                        { $eq: ["$type", TransactionType.EXPENSE] },
                        { $abs: "$amount" },
                        0,
                        ],
                    },
                    },

                    transactionCount: { $sum: 1 },
                },
                },
                {
                $project: {
                    _id: 0,
                    totalIncome: 1,
                    totalExpense: 1,
                    transactionCount: 1,

                    availableBalance: { $subtract: ["$totalIncome", "$totalExpense"] },

                    savingData: {
                    $let: {
                        vars: {
                        income: { $ifNull: ["$totalIncome", 0] },
                        expenses: { $ifNull: ["$totalExpense", 0] },
                        },
                        in: {
                        // ((income - expenses) / income) * 100;
                        savingsPercentage: {
                            $cond: [
                            { $lte: ["$$income", 0] },
                            0,
                            {
                                $multiply: [
                                {
                                    $divide: [
                                    { $subtract: ["$$income", "$$expenses"] },
                                    "$$income",
                                    ],
                                },
                                100,
                                ],
                            },
                            ],
                        },

                        //Expense Ratio = (expenses / income) * 100
                        expenseRatio: {
                            $cond: [
                            { $lte: ["$$income", 0] },
                            0,
                            {
                                $multiply: [
                                {
                                    $divide: ["$$expenses", "$$income"],
                                },
                                100,
                                ],
                            },
                            ],
                        },
                        },
                    },
                    },
                },
                },
        ];

            const [current] = await transactionModel.aggregate(currentPeriodPipeline);
          
         const {totalIncome = 0,totalExpense=0,availableBalance=0,transactionCount=0,savingData={
            expenseRatio:0 ,savingsPercentage :0
         }} = current || {};
      
         let percentChange={
            income : 0,
            expense:0,
            balance :0,
            prevPeriodFrom :null,
            prevPeriodTo:null,
            previousValues :{
                incomeAmount : 0,
                expenseAmount : 0,
                balanceAmount : 0
            }
         }
           if(from && to && rangeValue !== DateRange.allTime)
            { 
                   const period = differenceInDays(to,from) + 1;
                   const isYearly = [
                    DateRange.lastYear,
                    DateRange.thisYear
                   ].includes(rangeValue)

                   const prevPeriodFrom = isYearly ? subYears(from,1) : subDays(from,period)

                   const prevPeriodTo = isYearly ? subYears(to,1) : subDays(to,period)

                   const prevPeriodPipeline = [
                        {
                            $match: {
                            userId: userId,
                            date: {
                                $gte: prevPeriodFrom,
                                $lte: prevPeriodTo,
                            },
                            },
                        },
                        {
                            $group: {
                            _id: null,
                            totalIncome: {
                                $sum: {
                                $cond: [
                                    { $eq: ["$type", TransactionType.INCOME] },
                                    { $abs: "$amount" },
                                    0,
                                ],
                                },
                            },
                            totalExpenses: {
                                $sum: {
                                $cond: [
                                    { $eq: ["$type", TransactionType.EXPENSE] },
                                    { $abs: "$amount" },
                                    0,
                                ],
                                },
                            },
                            },
                        },
                        ];

                   const [previous] = await transactionModel.aggregate(prevPeriodPipeline);
                 
                   if(previous)
                   {
                     const prevIncome = previous.totalIncome || 0;
                     const prevExp = previous.totalExpense || 0;
                     const prevBal = prevIncome - prevExp;
                     const currentIncome = totalIncome;
                     const currentExpense = totalExpense;
                     const currentBalance =availableBalance;
                     percentChange = {
                        income : calculatePercentageChange(prevIncome,currentIncome),
                        expense : calculatePercentageChange(prevIncome,currentIncome),
                        balance : calculatePercentageChange(prevBal,currentBalance),
                        prevPeriodFrom : prevPeriodFrom,
                        prevPeriodTo: prevPeriodTo,
                        previousValues :{
                            incomeAmount : prevIncome,
                            expenseAmount : prevExp,
                            balanceAmount : prevBal
                        }
                     }
                   }
            }  

          
       const data={
        availableBalance : (availableBalance),
        totalIncome : (totalIncome),
        totalExpense : (totalExpense),
        savingRate : {
            expenseRation : parseFloat(savingData.expenseRatio.toFixed(2)),
            percentage: parseFloat(savingData.savingsPercentage.toFixed(2))
        },
        transactionCount,
        percentChange : {
            ...percentChange,
            previousValues : {
                incomeAmount : (percentChange.incomeAmount),
                 expenseAmount : (percentChange.expenseAmount),
                balanceAmount : (percentChange.balanceAmount)
            }
        },
        present :{
            ...range,
            value : rangeValue || DateRange.allTime,
            label : range?.label  || "All Time"

        },
   
       }
       return res.status(201).json({data,message:"Sumarry fetched sucessfully."})

    }
    catch(err)
    {
         return res.status(501).json({message:err.message})
    }
}
export const chartAnalytics=async(req,res)=>{
    try{
         const userId = req.user?.id;
         const {present,from,to} = req.query;
        let dateRangeValue = '';
        if(present == "30days")
             {
                 dateRangeValue = DateRange.days;
             }
        else{
            dateRangeValue = DateRange.present;
        }
          const filter= {
            userId : userId,
            dateRangePresent : dateRangeValue,
            customFrom : from ? new Date(from) : undefined,
            customTo : to ?  new Date(to) : undefined
          }

          const range= getdateRange(filter.dateRangePresent,filter.customFrom,filter.customTo);
          const {from :rangefrom ,to: rangeto, range :rangeValue} = range;
         
       const result = await transactionModel.aggregate([
            {
                 $match: {
                userId: (userId),
                    ...(from &&
                    to && {
                        date: {
                        $gte: from,
                        $lte: to,
                        },
                    }) }
                },
            //Group the transaction by date (YYYY-MM-DD)
            {
            $group: {
                _id: {
                $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$date",
                },
                },

                income: {
                $sum: {
                    $cond: [
                    { $eq: ["$type", TransactionType.INCOME] },
                    { $abs: "$amount" },
                    0,
                    ],
                },
                },

                expense: {
                $sum: {
                    $cond: [
                    { $eq: ["$type", TransactionType.EXPENSE] },
                    { $abs: "$amount" },
                    0,
                    ],
                },
                },

                incomeCount: {
                $sum: {
                    $cond: [{ $eq: ["$type", TransactionType.INCOME] }, 1, 0],
                },
                },

                expenseCount: {
                $sum: {
                    $cond: [{ $eq: ["$type", TransactionType.EXPENSE] }, 1, 0],
                },
                },
            },
            },

            { $sort: { _id: 1 } },

            {
            $project: {
                _id: 0,
                date: "$_id",
                income: 1,
                expense: 1,
                incomeCount: 1,
                expenseCount: 1,
            },
            },

            {
            $group: {
                _id: null,
                chartData: { $push: "$$ROOT" },
                totalIncomeCount: { $sum: "$incomeCount" },
                totalExpenseCount: { $sum: "$expenseCount" },
            },
            },

            {
            $project: {
                _id: 0,
                chartData: 1,
                totalIncomeCount: 1,
                totalExpenseCount: 1,
            },
            },
        ]);

        
         const resultData = result[0] || {}
        
         const transformedData = (result[0]?.chartData || []).map((item)=>({
                date : item.date,
               income : (item.income),
               expense : (item.expense)
         }));
      
           const data= {
            chartData: transformedData,
            totalIncomeCount: resultData.totalIncomeCount,
            totalExpenseCount : resultData.totalExpenseCount,
            present :{
                ...range,
                value  :rangeValue  || DateRange.allTime,
                label : range?.label || "All Time"
            }

           }
           return res.status(201).json({data,message:"Chart feteched sucessfully."})
    }
    catch(err)
    {
         return res.status(501).json({message: err.message})
    }
}
export const expensePieChartBreakdownAnalytics=async(req,res)=>{
    try{
         const userId = req.user?.id;
         const {present,from,to} = req.query;
          let dateRangeValue = '';
            if(present == "30days")
                {
                    dateRangeValue = DateRange.days;
                }
            else{
                dateRangeValue = DateRange.present;
            }
          const filter= {
            dateRangePresent : dateRangeValue,
            customFrom : from ? new Date(from) : undefined,
            customTo : to ?  new Date(to) : undefined
          }

          const range= getdateRange(filter.dateRangePresent,filter.customFrom,filter.customTo);
          const {from :rangefrom ,to: rangeto, range :rangeValue} = range;
         
         const result = await transactionModel.aggregate([
            {
                $match:{ userId: (userId),
                    ...(from &&
                    to && {
                        date: {
                        $gte: from,
                        $lte: to,
                        },
                    })

                }
            },
             {
                $group: {
                    _id: "$category",
                    value: { $sum: { $abs: "$amount" } },
                },
                },
                { $sort: { value: -1 } }, //

                {
                $facet: {
                    topThree: [{ $limit: 3 }],
                    others: [
                    { $skip: 3 },
                    {
                        $group: {
                        _id: "others",
                        value: { $sum: "$value" },
                        },
                    },
                    ],
                },
                },

    {
      $project: {
        categories: {
          $concatArrays: ["$topThree", "$others"],
        },
      },
    },

    { $unwind: "$categories" },

    {
      $group: {
        _id: null,
        totalSpent: { $sum: "$categories.value" },
        breakdown: { $push: "$categories" },
      },
    },

    {
      $project: {
        _id: 0,
        totalSpent: 1,
        breakdown: {
          // .map((cat: any)=> )
          $map: {
            input: "$breakdown",
            as: "cat",
            in: {
              name: "$$cat._id",
              value: "$$cat.value",
              percentage: {
                $cond: [
                  { $eq: ["$totalSpent", 0] },
                  0,
                  {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ["$$cat.value", "$totalSpent"] },
                          100,
                        ],
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
  ]);
        
         const resultData = result[0] || {
            totalSpent : 0,
                breakdown:[]
         }
         const transformedData = {
            totalSpent : (resultData.totalSpent),
            breakdown : resultData.breakdown.map((item)=>({
                ...item,
                value : (item.value)
            }))
         }
           const data= {
             ...transformedData,
              present :{
                ...range,
                value  :rangeValue  || DateRange.allTime,
                label : range?.label || "All Time"
            }


           }

           return res.status(201).json({data,message:"Expense Pie Chart feteched sucessfulyy."})
    }
    catch(err)
    {
         return res.status(501).json({message:err.message})
    }
}
function calculatePercentageChange(previous,current){
     if(previous === 0) return current === 0 ? 0 :100;
     const changes = ((current-previous)/Math.abs(previous))*100;
     const cappedChange = Math.min(Math.max(changes,-500),500)
     return parseFloat(changes.toFixed(2))
}