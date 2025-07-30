
import AppRoutes from "./routes";
import { ThemeProvider } from "./context/theme-provider";
import { EditProvider } from "./context/edit-transaction-context";

function App() {
 
  return (
     <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
     <EditProvider>
      <AppRoutes />
     </EditProvider>
    </ThemeProvider>
  )
}

export default App
