import RoleGate from "@/modules/assessments/auth/RoleGate";
import Dashboard from "@/modules/assessments/components/common/AssessmentDashboard/AssessmentDashboard";
export default function Page(){return <RoleGate role="admin"><Dashboard initialScreen="create"/></RoleGate>;}
