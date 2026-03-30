import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import Routing from "@/components/Routing";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routing />
      </AuthProvider>
    </BrowserRouter>
  );
}
