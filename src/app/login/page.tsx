"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {DEMO_ACCOUNTS,demoSignIn,getDemoSession,roleHome} from "@/modules/assessments/auth/demo-auth";
import "./sign-in.css";
export default function Login(){
 const router=useRouter();const [email,setEmail]=useState("admin@north.demo");const [password,setPassword]=useState("Demo@123");const [error,setError]=useState("");
 useEffect(()=>{const session=getDemoSession();if(session)router.replace(roleHome(session.role));},[router]);
 const signIn=(event:React.FormEvent<HTMLFormElement>)=>{event.preventDefault();const session=demoSignIn(email,password);if(!session){setError("Incorrect demo email or password.");return;}router.replace(roleHome(session.role));};
 return <main className="demoLoginPage"><form className="demoLoginCard" onSubmit={signIn}>
  <p className="demoEyebrow">Assessment Management</p><h1>Sign in</h1><p>Choose an Institute Admin or Student / Learner account to explore the frontend.</p>
  <label>Demo account<select aria-label="Demo account" value={email} onChange={e=>{setEmail(e.target.value);setError("");}}>{DEMO_ACCOUNTS.map(a=><option key={a.userId} value={a.email}>{a.tenantId==="north"?"North Institute":"South Institute"} — {a.role==="admin"?"Institute Admin":"Student / Learner"}</option>)}</select></label>
  <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></label>
  <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>
  {error&&<p role="alert" className="demoError">{error}</p>}
  <button type="submit">Sign in</button><small>Demo credentials for all accounts: <strong>Demo@123</strong>. Local Storage only; not secure production authentication.</small>
 </form></main>;
}
