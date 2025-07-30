
import { useState } from "react";

const useEditTransactionDrawer = () => {
  const [open, setOpen] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const onOpenDrawer = (transactionId) => {
    setTransactionId(transactionId);
    setOpen(true);
  };

  const onCloseDrawer = () => {
    setTransactionId("");
    setOpen(false);
  };

  return {
    open,
    transactionId,
    onOpenDrawer,
    onCloseDrawer,
  };
};

export default useEditTransactionDrawer;
