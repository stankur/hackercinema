import EmphasizedText from "@/components/EmphasizedText";
import { SimpleIcon } from "@/components/ui/SimpleIcon";

export default function HeroSection() {
	return (
		<section className="text-left space-y-6 py-20">
			<h1 className="text-5xl md:text-4xl lg:text-5xl font-bold tracking-tight">
				Follow your curiosity,
			</h1>

			<h1 className="text-5xl md:text-4xl lg:text-5xl font-bold tracking-tight">
				Go build some cool shit!
			</h1>

			<div className="text-2xl md:text-xl text-muted-foreground leading-relaxed md:leading-relaxed space-y-1">
				<div>
					<EmphasizedText
						text="Showcase"
						emphasisWords={["showcase"]}
					/>{" "}
					your projects automatically
				</div>
				<div>
					<EmphasizedText
						text="Discover"
						emphasisWords={["Discover"]}
					/>{" "}
					interesting projects
				</div>

				<div>
					<EmphasizedText text="Learn" emphasisWords={["Learn"]} />{" "}
					from the best projects
				</div>
			</div>

			<div className="pt-4">
				<a
					href="https://github.com/login"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium"
				>
					<SimpleIcon name="github" size={20} />
					Join with GitHub
				</a>
			</div>
		</section>
	);
}
