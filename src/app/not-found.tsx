import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{minHeight:"100dvh",background:"#DFE6E9",color:"#374151",fontFamily:"Segoe UI, Arial, sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <section style={{maxWidth:480,textAlign:"center"}}>
        <h1 style={{fontSize:28,marginBottom:12}}>Page not found</h1>
        <p style={{lineHeight:1.6}}>This URL does not exist in the shared Assessment project. The old separate MCQ routes were consolidated.</p>
        <p><Link href="/dashboard" style={{color:"#2D4CC8",fontWeight:600}}>Dashboard</Link> &nbsp;·&nbsp; <Link href="/assessments" style={{color:"#2D4CC8",fontWeight:600}}>Assessments</Link></p>
      </section>
    </main>
  );
}
