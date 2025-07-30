import { createContext,useContext } from "react";
import useEditTransactionDrawer from "../hooks/use-edit-transaction-drawer";

const EditContext = createContext();

export const EditProvider=({children})=>{
const state = useEditTransactionDrawer();

    return <EditContext.Provider value={state}>
          {children}
    </EditContext.Provider>
}

export const useEditTxn = () => useContext(EditContext);
