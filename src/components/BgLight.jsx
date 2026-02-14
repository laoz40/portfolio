export default function BgLight({ children }) {
	return (
		<div className="min-h-svh w-full bg-amber-50 relative text-gray-800 flex flex-col">
			{/* Concentric Squares - Light Pattern */}
			<div
				className="absolute inset-0 z-0 pointer-events-none"
style={{
      backgroundImage: `
        linear-gradient(rgba(59, 130, 246, 0.10) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.10) 1px, transparent 1px),
        linear-gradient(rgba(96, 165, 250, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(96, 165, 250, 0.06) 1px, transparent 1px)
      `,
      backgroundSize: `
        15px 15px,
        15px 15px,
        30px 30px,
        30px 30px
      `,
      backgroundPosition: `0 0, 0 0, 0 0, 0 0`,
    }}
			/>
			{/* Your Content/Components */}
			{children}
		</div>
	)}
