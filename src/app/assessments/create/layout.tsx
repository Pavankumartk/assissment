import RoleGate from "@/modules/assessments/auth/RoleGate";
import type {ReactNode} from "react";
export default function CreateLayout({children}:{children:ReactNode}){return <RoleGate role="admin">{children}</RoleGate>;}
