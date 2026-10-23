"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getDemoSession} from "@/modules/assessments/auth/demo-auth";
import PortalShell from "@/modules/assessments/components/common/PortalShell";
import PortalDashboard from "@/modules/assessments/components/common/PortalDashboard";
export default function DashboardPage(){
 const router=useRouter();const [ready,setReady]=useState(false);
 useEffect(()=>{if(!getDemoSession()){router.replace("/login");return;}setReady(true);},[router]);
 return ready?<PortalShell footer><PortalDashboard/></PortalShell>:null;
}
