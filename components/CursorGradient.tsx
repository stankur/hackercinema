export default function CursorGradient() {
	return (
		<div
			className="fixed inset-0 pointer-events-none z-0"
			style={{
				background: `
					radial-gradient(circle at 60% 50%, rgba(71, 85, 105, 0.20) 0%, rgba(71, 85, 105, 0.15) 30%, rgba(71, 85, 105, 0.08) 60%, transparent 80%),
					radial-gradient(circle at 80% 20%, rgba(71, 85, 105, 0.18) 0%, rgba(71, 85, 105, 0.10) 35%, rgba(71, 85, 105, 0.04) 65%, transparent 80%)
				`,
			}}
		/>
	);
}
