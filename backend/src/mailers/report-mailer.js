
import { getReportEmailTemplate } from "./templates/report-template.js";
import { sendEmail } from "./mailer.js";
import { convertToDollar } from "../utils/formatCurrency.js";



export const sendReportEmail = async ({email,username,report,frequency}) => {
 
  const html = getReportEmailTemplate({username,frequency,report});
  console.log("HTML",html)
  const text = `Your ${frequency} Financial Report (${report.period})
    Income: ${convertToDollar(report.totalIncome)}
    Expenses: ${convertToDollar(report.totalExpenses)}
    Balance: ${convertToDollar(report.availableBalance)}
    Savings Rate: ${report.savingsRate.toFixed(2)}%

    ${report.insights.join("\n")}
`;

  console.log(text, "text mail");

  return sendEmail({
    to: email,
    subject: `${frequency} Financial Report - ${report.period}`,
    text,
    html,
  });
};