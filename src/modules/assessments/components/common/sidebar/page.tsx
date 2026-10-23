"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import "./sidebar.css";
import {demoSignOut} from "@/modules/assessments/auth/demo-auth";

const sidebarItems = [
  { title: "Dashboard", icon: "/assets/assessmenticons/dashboardsquare.svg", href: "/dashboard" },
  { title: "Training Operations", icon: "/assets/assessmenticons/chart-up.svg", href: "/training-operations" },
  { title: "Assessment", icon: "/assets/assessmenticons/clipboard-check.svg", href: "/assessments" },
  { title: "Learning", icon: "/assets/assessmenticons/graduation-cap.svg", href: "/learning" },
  { title: "Employee Progress", icon: "/assets/assessmenticons/user-multiple.svg", href: "/employee-progress" },
  { title: "Attendance", icon: "/assets/assessmenticons/user-check.svg", href: "/attendance" },
  { title: "Notification", icon: "/assets/assessmenticons/bell.svg", href: "/notification" },
  { title: "Training Reports", icon: "/assets/assessmenticons/trending-down.svg", href: "/training-reports" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const closeMobileSidebar = () => {
    document.body.classList.remove("mobileSidebarOpen");
  };

  const handleLogout = () => {
    closeMobileSidebar();
    demoSignOut();
    router.replace("/login");
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? "sidebarCollapsed" : ""}`}>
        <div className="logoArea">
          <Image
            src="/assets/assessmenticons/logo.png"
            alt="Neuro LXP"
            width={150}
            height={70}
            className="mainLogo"
            priority
          />
        </div>

        <nav className="sidebarNav" aria-label="Main navigation">
          {sidebarItems.map((item) => {
            const currentPath = (pathname || "").replace(/\/+$/, "").toLowerCase();
            const itemPath = item.href.toLowerCase();
            // Assessment stays highlighted across all pages, including MCQ.
            const isActive = (item.title === "Assessment" && currentPath.startsWith("/assessments")) || currentPath === itemPath;

            return (
              <Link
                href={item.href}
                key={item.title}
                title={collapsed ? item.title : undefined}
                className={`sidebarItem ${item.title === "Dashboard" ? "dashboardItem" : ""} ${isActive ? "sidebarItemActive" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={closeMobileSidebar}
              >
                <Image
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  width={16}
                  height={16}
                  className="sidebarIcon"
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebarBottom">
          <button type="button" className="logoutButton" title={collapsed ? "Logout" : undefined} onClick={handleLogout}>
            <Image
              src="/assets/assessmenticons/log-out.svg"
              alt=""
              aria-hidden="true"
              width={16}
              height={16}
              className="sidebarIcon"
            />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <button
        type="button"
        className={`sidebarCollapseToggle ${collapsed ? "sidebarCollapseToggleCollapsed" : ""}`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((previous) => !previous)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="#2D4CC8" />
          <path d="M10 7.5L14.5 12L10 16.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );
}
