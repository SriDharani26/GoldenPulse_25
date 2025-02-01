import React, { useState } from "react";
import { SidebarC } from "./components/Sidebar";

function App() {
  const [activePage, setActivePage] = useState("resources");

  return (
    <div className="h-screen flex">
      <SidebarC />

      <div className="flex-1 p-6 bg-white text-gray-900 overflow-auto">
      </div>
    </div>
  );
}

export default App;
