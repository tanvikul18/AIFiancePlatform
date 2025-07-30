import { date, success } from "zod"
import { transactionModel } from "../../models/transactionModel.js";
import { calculateNextOccurence, calculateNextReportDate } from "../../utils/helper.js";
import mongoose from "mongoose";
import { endOfMonth, startOfMonth, subMinutes, subMonths } from "date-fns";
import { reportSettingModel } from "../../models/reportSettingModel.js";
import { generateReport } from "../../controllers/reportController.js";
import { reportModel, ReportStatus } from "../../models/reportModel.js";
import { sendReportEmail } from "../../mailers/report-mailer.js";
import { userModel } from "../../models/userModel.js";
export const processReportJob = async () => {
  const now = new Date();

  let processedCount = 0;
  let failedCount = 0;

  //Today july 1, then run report for -> june 1 - 30 
//Get Last Month because this will run on the first of the month
  const from = startOfMonth(subMonths(now, 3));
  const to = endOfMonth(subMonths(now, 3));
   console.log("From",from)
     console.log("to",to)
  // const from = "2025-04-01T23:00:00.000Z";
  // const to = "2025-04-T23:00:00.000Z";

  try {
    const reportSettingCursor = reportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: now },
    }).cursor();
 
  //  console.log("RsportSEtting",reportSettingCursor)
    for await (const setting of reportSettingCursor) {
        await setting.populate("userId");
      const user = await userModel.findById(setting.userId);
     // console.log("User",user)
      if (!user) {
        console.log(`User not found for setting: ${setting._id}`);
        continue;
      }

      const session = await mongoose.startSession();

      try {
        const report = await generateReport(user.id, from, to);
      //  console.log("Report",report)
       let emailSent = false;
        if (report) {
          try {
            await sendReportEmail({
              email: user?.email,
              username: user?.name,
              report: {
                period: report.period,
                totalIncome: report?.summary.totalIncome,
                totalExpenses: report?.summary.totalExpense,
                availableBalance: report?.summary.availableBalance,
                savingsRate: report?.summary.savingsRate,
                topSpendingCategories: report?.summary.topCategories,
                insights: report?.insights,
              },
              frequency: setting?.frequency,
            });
            emailSent = true;
          } catch (error) {
            console.log(error)
           // console.log(`Email failed for ${user.id}`);
          }
        }

        await session.withTransaction(
          async () => {
            const bulkReports = [];
            const bulkSettings = [];

            if (report && emailSent) {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sendDate: now,
                    period: report.period,
                    status: ReportStatus.SENT,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: now,
                      nextReportDate: calculateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            } else {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sendDate: now,
                    period:
                      report?.period ||
                      `${format(from, "MMMM d")}–${format(to, "d, yyyy")}`,
                    status: report
                      ? ReportStatus.FAILED
                      : ReportStatus.NO_ACTIVITY,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: null,
                      nextReportDate: calculateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            }
             console.log(JSON.stringify(bulkReports))
            await Promise.all([
              reportModel.bulkWrite(bulkReports, { ordered: false }),
              reportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
            ]);
          },
          {
            maxCommitTimeMS: 10000,
          }
        );

        processedCount++;
      } catch (error) {
        console.log(`Failed to process report`, error);
        failedCount++;
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅Processed: ${processedCount} report`);
    console.log(`❌ Failed: ${failedCount} report`);

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error) {
    console.error("Error processing reports", error);
    return {
      success: false,
      error: "Report process failed",
    };
  }
};