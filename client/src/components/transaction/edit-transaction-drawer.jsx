import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer.jsx";
import TransactionForm from "./transaction-form";
import { useEditTxn } from "../../context/edit-transaction-context.jsx"

const EditTransactionDrawer = () => {
  const { onOpenDrawer, open, transactionId, onCloseDrawer } = useEditTxn();
   
  return (
    <Drawer open={open} onOpenChange={onCloseDrawer} direction="right">
      <DrawerContent className="max-w-md overflow-hidden overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-semibold">
            Edit Transaction
          </DrawerTitle>
          <DrawerDescription>
            Edit a transaction to track your finances
          </DrawerDescription>
        </DrawerHeader>
        <TransactionForm isEdit transactionId={transactionId}
                onCloseDrawer={onCloseDrawer}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default EditTransactionDrawer;