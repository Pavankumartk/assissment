"use client";
import {useEffect,useState,type ReactNode} from "react";
import {useRouter} from "next/navigation";
import {getDemoSession,type DemoRole} from "./demo-auth";
export default function RoleGate({role,children}:{role:DemoRole;children:ReactNode}){
 const router=useRouter(); const [allowed,setAllowed]=useState(false);
 useEffect(()=>{const session=getDemoSession();if(!session){router.replace("/login");return;}if(session.role!==role){router.replace("/dashboard");return;}setAllowed(true);},[router,role]);
 return allowed?<>{children}</>:null;
}
