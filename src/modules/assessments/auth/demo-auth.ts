/** Demo-only browser identity. NOT authentication or an access-control boundary. */
export type DemoRole = "admin" | "learner";
export type DemoTenant = "north" | "south";
export type DemoSession = { userId: string; displayName: string; email: string; role: DemoRole; tenantId: DemoTenant };
export const DEMO_ACCOUNTS: (DemoSession & { password: string })[] = [
  {userId:"north-admin",displayName:"Institute Admin",email:"admin@north.demo",role:"admin",tenantId:"north",password:"Demo@123"},
  {userId:"north-student",displayName:"Student / Learner",email:"student@north.demo",role:"learner",tenantId:"north",password:"Demo@123"},
  {userId:"south-admin",displayName:"Institute Admin",email:"admin@south.demo",role:"admin",tenantId:"south",password:"Demo@123"},
  {userId:"south-student",displayName:"Student / Learner",email:"student@south.demo",role:"learner",tenantId:"south",password:"Demo@123"},
];
const KEY = "neurolxp.assessments.demo-session.v1";
export function getDemoSession(): DemoSession | null {
 if(typeof window === "undefined") return null;
 try { const raw=localStorage.getItem(KEY); if(!raw) return null;
  const parsed=JSON.parse(raw) as DemoSession;
  const account=DEMO_ACCOUNTS.find(a=>a.userId===parsed.userId && a.role===parsed.role && a.tenantId===parsed.tenantId);
  return account ? {userId:account.userId,displayName:account.displayName,email:account.email,role:account.role,tenantId:account.tenantId} : null;
 } catch {return null;}
}
export function demoSignIn(email:string,password:string):DemoSession|null {
 const match=DEMO_ACCOUNTS.find(a=>a.email.toLowerCase()===email.trim().toLowerCase() && a.password===password);
 if(!match) return null;
 const {password:ignored,...session}=match;void ignored;
 localStorage.setItem(KEY,JSON.stringify(session));window.dispatchEvent(new Event("neurolxp-demo-session-changed"));return session;
}
export function demoSignOut(){if(typeof window!=="undefined"){localStorage.removeItem(KEY);window.dispatchEvent(new Event("neurolxp-demo-session-changed"));}}
export const roleHome = (_role:DemoRole) => "/dashboard";

export const demoDashboardPath = () => "/dashboard";
