import {addDays, addMonths, addWeeks, addYears, endOfDay, startOfMonth, startOfYear, subDays, subMonths, subYears} from "date-fns"
import { DateRange } from "../enums/date-range.js";
export const calculateNextReportDate=(lastSentDate)=>{
 const now = new Date();
 const lastSent = lastSentDate || now;
 const nextDate = startOfMonth(addMonths(lastSent,1));
 console.log("Next Report Date",nextDate)
 nextDate.setHours(0,0,0,0)
 return nextDate;
}
export const calculateNextOccurence=(date,interval)=>{
     console.log("occurence function",date,interval)
 const base= new Date(date);
 base.setHours(0,0,0,0);
 switch(interval)
 {
    
    case "DAILY" : 
    {
         return addDays(base,1);
    }
    case "WEEKLY" : 
    {
         return addWeeks(base,1);
    }  
    case "MONTHLY" : 
    {
         return addMonths(base,1);
    }  
    case "YEARLY" : 
    {
         return addYears(base,1);
    }  
    default : 
    return base;
         
 }
}

export const capitalizeFirstLetter=(string)=>{
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export const getdateRange=(filteredDateRange,customFrom,customTo)=>{
 if(customFrom && customTo)
 {
     return{
          from : customFrom,
          to : customTo,
          value : DateRange.custom
     }
 }

 const now = new Date();
 
 const yesterday = subDays(now.setHours(0,0,0,0),1)
 const last30days = {
     from : subDays(yesterday,29),
     to:yesterday,
     value : DateRange.days,
     label : "Last 30 days"
 }
 switch(filteredDateRange){
          case DateRange.allTime :
          return {
               from : null,
               to : null,
               value: DateRange.allTime,label : "All Time"
          }
           case DateRange.days :
             return last30days;
           case DateRange.lastMonth :
               return {
                    from : startOfMonth(subMonths(now,1)),
                    to : startOfMonth(now),
                    value: DateRange.lastMonth,
                    label : "Last Month"
               }   
            case DateRange.last3Months :
               return {
                    from : startOfMonth(subMonths(now,3)),
                    to : startOfMonth(now),
                    value: DateRange.last3Months,
                    label : "Last 3 Months"
               }  
           case DateRange.lastYear :
               return {
                    from : startOfYear(subYears(now,1)),
                    to : startOfYear(now),
                    value: DateRange.lastYear,
                    label : "Last Year"
               }   
          case DateRange.thisMonth :
          return {
               from : startOfMonth(now),
               to : endOfDay(now),
               value: DateRange.thisMonth,
               label : "This Month"
          }
           case DateRange.thisYear :
          return {
               from : startOfYear(now),
               to : endOfDay(now),
               value: DateRange.thisYear,
               label : "This Year"
          }
          default :
           return last30days;         
 }
}