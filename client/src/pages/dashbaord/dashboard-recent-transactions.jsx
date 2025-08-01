// DashboardRecentTransactions.js
import React from "react";
import { Link } from "react-router-dom";
import TransactionTable from "../../components/transaction/transaction-table/index.jsx";
import { Button } from "../../components/ui/button.jsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.jsx";
import { Separator } from "../../components/ui/separator.jsx";
import { PROTECTED_ROUTES } from "../../routes/common/routePath.js";

export default function DashboardRecentTransactions() {
  return (
    <Card className="!shadow-none border-1 border-gray-100 dark:border-border">
      <CardHeader className="!pb-0">
        <CardTitle className="text-xl">Recent Transactions</CardTitle>
        <CardDescription>Showing all recent transactions</CardDescription>
        <CardAction>
          <Button
            asChild
            variant="link"
            className="!text-gray-700 dark:!text-gray-200 !font-normal"
          >
            <Link to={PROTECTED_ROUTES.TRANSACTIONS}>View all</Link>
          </Button>
        </CardAction>
        <Separator className="mt-3 !bg-gray-100 dark:!bg-gray-800" />
      </CardHeader>
      <CardContent className="pt-0">
        <TransactionTable pageSize={10} isShowPagination={false} />
      </CardContent>
    </Card>
  );
}
