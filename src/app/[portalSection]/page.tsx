export const instant = false;
import { notFound } from "next/navigation";
import Link from "next/link";
import PortalShell from "@/modules/assessments/components/common/PortalShell";

// These Sidebar entries do not have feature implementations yet.
// A shared placeholder prevents dead links without duplicating Assessment pages.
const portalSections: Record<string, string> = {
  "training-operations": "Training Operations",
  "learning": "Learning",
  "employee-progress": "Employee Progress",
  "attendance": "Attendance",
  "notification": "Notification",
  "training-reports": "Training Reports",
};

export default async function PortalSectionPage({
  params,
}: {
  params: Promise<{ portalSection: string }>;
}) {
  const { portalSection } = await params;
  const title = portalSections[portalSection];
  if (!title) notFound();

  return (
    <PortalShell footer>
      <div className="portalScreen">
        <div className="portalPageHeading">
          <h1>{title}</h1>
          <p>This dashboard section is not yet available in the frontend demo.</p>
        </div>
        <section className="portalWelcome" role="status">
          <h2>{title} — Coming Soon</h2>
          <p>
            Use the existing <Link href="/assessments">Assessment</Link> section
            to create or take assessments, depending on your login role.
          </p>
        </section>
      </div>
    </PortalShell>
  );
}
