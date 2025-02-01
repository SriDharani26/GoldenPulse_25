
"use client";

import { Sidebar } from "flowbite-react";
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from "react-icons/hi";

export function SidebarC({}) {
  return (
    <Sidebar aria-label="Default sidebar example">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
        <Sidebar.Item href="./pages/Alerts.jsx" icon={HiChartPie}>
            Resource Updation
          </Sidebar.Item>
          <Sidebar.Item href="" icon={HiChartPie}>
            Alerts
          </Sidebar.Item>
          <Sidebar.Item href="#" icon={HiChartPie}>
            Ambulance Data
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
