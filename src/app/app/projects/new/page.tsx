import { ProjectForm } from "@/components/project-form";
import { PageHeader } from "@/components/design-system";
export default function NewProject() {
  return (
    <div className="stack" style={{ maxWidth: 700 }}>
      <PageHeader
        context="A fresh start"
        title="Let’s build your workspace."
        description="Name your project and add any funds you already have. Invite your team next."
      />
      <div className="setup-progress">
        <span className="active">1 · Your project</span>
        <i />
        <span>2 · Your team</span>
        <i />
        <span>3 · First purchase</span>
      </div>
      <ProjectForm />
    </div>
  );
}
