import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DidiConcertBooking from "./composants/booking";
import TicketSystem from "./composants/ticket_system";

function App() {
  return (
    <Router>
      <Routes>
        {/* Page principale */}
        <Route path="/" element={<DidiConcertBooking />} />

        {/* Page système */}
        <Route path="/system" element={<TicketSystem />} />
      </Routes>
    </Router>
  );
}

export default App;
