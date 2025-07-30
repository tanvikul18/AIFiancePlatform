import Navbar from "../components/navbar/index.jsx";
import { Outlet } from "react-router-dom";
import EditTransactionDrawer from "../components/transaction/edit-transaction-drawer.jsx";


const AppLayout = () => {
  return (
    <>
    <div className="min-h-screen pb-10">
      <Navbar />
      <main className="w-full max-w-full">
        <Outlet />
      </main>
    </div>
  
     <EditTransactionDrawer/>
    
    </>
  );
};

export default AppLayout;