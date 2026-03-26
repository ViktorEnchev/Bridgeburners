import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "src/layouts/AppLayout";
import Login from "src/pages/Login";
import Register from "src/pages/Register";
import RequestedAccess from "src/pages/RequestedAccess";
import Home from "src/pages/Home";
import Chat from "src/pages/Chat";
import Settings from "src/pages/Settings";
import Requests from "src/pages/Requests";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/requested-access" element={<RequestedAccess />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="*" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
