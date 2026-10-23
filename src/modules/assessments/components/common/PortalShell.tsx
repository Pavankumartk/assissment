"use client";
import type {ReactNode} from "react";
import {getDemoSession} from "@/modules/assessments/auth/demo-auth";
import Header from "./header/Header";
import Sidebar from "./sidebar/page";
import "./AssessmentDashboard/assessment.css";
import "./portal.css";
export default function PortalShell({children,footer=false}:{children:ReactNode;footer?:boolean}){
 const tenant=getDemoSession()?.tenantId === "south" ? "South Institute" : "North Institute";
 return <main className="superAdminPage institutionAdminPage">
  <div className="dashboardLayout" style={{height:"100dvh",overflow:"hidden",display:"flex"}}>
   <Sidebar/>
   <section className="mainContent" style={{minWidth:0,minHeight:0,flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{flexShrink:0}}><Header/></div>
    <div className="institutionScrollArea" style={{flex:1,minHeight:0,overflowY:"auto",overflowX:"hidden"}}>
     <div className="pageContent institutionPageContent">{children}</div>
    </div>
    {footer&&<footer className="portalGlobalFooter">Assessment Management · {tenant} · Demo Portal</footer>}
   </section>
  </div>
 </main>;
}
