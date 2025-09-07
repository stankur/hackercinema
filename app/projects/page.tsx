import Navigation from "@/components/Navigation";
import ProjectsContent from "@/components/ProjectsContent";

export default function ProjectsPage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-3xl mx-auto py-12 px-6">
				<Navigation />
				<ProjectsContent />
			</div>
		</div>
	);
}
