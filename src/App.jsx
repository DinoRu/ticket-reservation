import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import DidiConcertBooking from "./components/booking";
import TicketSystem from "./components/ticket_system";
import { AuthProvider } from "./contexts/Authcontext";
import ProtectedRoute from "./components/common/Protectedroutes";
import DashboardPage from "./components/common/Dashboard";
import LoginForm from "./components/auth/Loginform";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/* Page principale */}
          <Route path="/" element={<DidiConcertBooking />} />

          {/* Page système */}
          <Route path="/system" element={<TicketSystem />} />
        </Routes>
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
