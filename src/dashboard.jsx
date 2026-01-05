"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
	LayoutDashboard,
	Plus,
	FolderOpen,
	LogOut,
	X,
	Menu,
	Search,
	Sparkles,
	Sun,
	Moon,
	Save,
	RefreshCw,
	Download,
	FileText,
	Calendar,
} from "lucide-react"

// Embedded styles
const styles = `
	:root {
		--background: oklch(1 0 0);
		--foreground: oklch(0.145 0 0);
		--card: oklch(1 0 0);
		--card-foreground: oklch(0.145 0 0);
		--popover: oklch(1 0 0);
		--popover-foreground: oklch(0.145 0 0);
		--primary: oklch(0.205 0 0);
		--primary-foreground: oklch(0.985 0 0);
		--secondary: oklch(0.97 0 0);
		--secondary-foreground: oklch(0.205 0 0);
		--muted: oklch(0.97 0 0);
		--muted-foreground: oklch(0.556 0 0);
		--accent: oklch(0.97 0 0);
		--accent-foreground: oklch(0.205 0 0);
		--destructive: oklch(0.577 0.245 27.325);
		--destructive-foreground: oklch(0.577 0.245 27.325);
		--border: oklch(0.922 0 0);
		--input: oklch(0.922 0 0);
		--ring: oklch(0.708 0 0);
	}

	.dark {
		--background: oklch(0.145 0 0);
		--foreground: oklch(0.985 0 0);
		--card: oklch(0.145 0 0);
		--card-foreground: oklch(0.985 0 0);
		--popover: oklch(0.145 0 0);
		--popover-foreground: oklch(0.985 0 0);
		--primary: oklch(0.985 0 0);
		--primary-foreground: oklch(0.205 0 0);
		--secondary: oklch(0.269 0 0);
		--secondary-foreground: oklch(0.985 0 0);
		--muted: oklch(0.269 0 0);
		--muted-foreground: oklch(0.708 0 0);
		--accent: oklch(0.269 0 0);
		--accent-foreground: oklch(0.985 0 0);
		--destructive: oklch(0.396 0.141 25.723);
		--destructive-foreground: oklch(0.637 0.237 25.331);
		--border: oklch(0.269 0 0);
		--input: oklch(0.269 0 0);
		--ring: oklch(0.439 0 0);
	}
`

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
	const variants = {
		default: "bg-primary text-primary-foreground hover:bg-primary/90",
		outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
		ghost: "hover:bg-accent hover:text-accent-foreground",
		secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
	}
	const sizes = {
		default: "h-10 px-4 py-2",
		sm: "h-9 rounded-md px-3",
		lg: "h-11 rounded-md px-8",
		icon: "h-10 w-10",
		"icon-sm": "h-8 w-8",
	}
	return (
		<button
			ref={ref}
			className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
			{...props}
		/>
	)
})
Button.displayName = "Button"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
	return (
		<input
			type={type}
			className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
			ref={ref}
			{...props}
		/>
	)
})
Input.displayName = "Input"

const Label = ({ children, className }) => (
	<label
		className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
	>
		{children}
	</label>
)

export default function Dashboard() {
	const [sidebarOpen, setSidebarOpen] = useState(true)
	const [theme, setTheme] = useState("dark")
	const [activeTab, setActiveTab] = useState("dashboard")
	const [isGenerating, setIsGenerating] = useState(false)
	const [lessonPlan, setLessonPlan] = useState(null)
	const [formData, setFormData] = useState({
		schoolName: "",
		pathway: "",
		grade: "",
		topic: "",
		strand: "",
		subStrand: "",
	})

	const stats = {
		totalCreated: 124,
		thisMonth: 12,
		recentPlan: {
			title: "Introduction to Calculus",
			date: "2024-03-20",
			grade: "12th Grade",
		},
	}

	useEffect(() => {
		// Inject styles
		const styleTag = document.createElement('style')
		styleTag.textContent = styles
		document.head.appendChild(styleTag)
    
		// Set initial theme
		document.documentElement.classList.toggle("dark", theme === "dark")
		document.body.style.backgroundColor = theme === "dark" ? "oklch(0.145 0 0)" : "oklch(1 0 0)"
		document.body.style.color = theme === "dark" ? "oklch(0.985 0 0)" : "oklch(0.145 0 0)"
    
		return () => {
			document.head.removeChild(styleTag)
		}
	}, [theme])

	const toggleTheme = () => {
		const newTheme = theme === "light" ? "dark" : "light"
		setTheme(newTheme)
		document.documentElement.classList.toggle("dark", newTheme === "dark")
		document.body.style.backgroundColor = newTheme === "dark" ? "oklch(0.145 0 0)" : "oklch(1 0 0)"
		document.body.style.color = newTheme === "dark" ? "oklch(0.985 0 0)" : "oklch(0.145 0 0)"
	}

	const handleGenerate = () => {
		setIsGenerating(true)
		setTimeout(() => {
			setLessonPlan({
				...formData,
				content: `# Lesson Plan: ${formData.topic}\n\n## Learning Objectives\n- Understand the core concepts of ${formData.topic}\n- Apply ${formData.topic} in real-world scenarios\n\n## Activities\n1. Introduction (10 mins)\n2. Group Discussion (20 mins)\n3. Practical Exercise (30 mins)\n\n## Assessment\nShort quiz at the end of the session.`,
			})
			setIsGenerating(false)
		}, 1500)
	}

	return (
		<div className="flex min-h-screen transition-colors duration-300" style={{ 
			backgroundColor: theme === "dark" ? "oklch(0.145 0 0)" : "oklch(1 0 0)",
			color: theme === "dark" ? "oklch(0.985 0 0)" : "oklch(0.145 0 0)"
		}}>
			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 ${
					sidebarOpen ? "w-64" : "w-0 -translate-x-full"
				}`}
				style={{
					backgroundColor: theme === "dark" ? "oklch(0.145 0 0)" : "oklch(1 0 0)",
					borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)"
				}}
			>
				<div className="flex h-16 items-center justify-between border-b px-6" style={{
					borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)"
				}}>
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{
							backgroundColor: theme === "dark" ? "oklch(0.985 0 0)" : "oklch(0.205 0 0)"
						}}>
							<Sparkles className="h-5 w-5" style={{
								color: theme === "dark" ? "oklch(0.205 0 0)" : "oklch(0.985 0 0)"
							}} />
						</div>
						<span className="text-lg font-bold tracking-tight text-nowrap">EduPlan AI</span>
					</div>
					<Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden">
						<X className="h-5 w-5" />
					</Button>
				</div>

				<nav className="flex-1 space-y-1 p-4">
					{[
						{ id: "dashboard", label: "Overview", icon: LayoutDashboard },
						{ id: "create", label: "Create Lesson", icon: Plus },
						{ id: "archive", label: "My Lessons", icon: FolderOpen },
					].map((item) => (
						<button
							key={item.id}
							onClick={() => setActiveTab(item.id)}
							className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
								activeTab === item.id
									? ""
									: ""
							}`}
							style={
								activeTab === item.id
									? {
											backgroundColor: theme === "dark" ? "oklch(0.985 0 0)" : "oklch(0.205 0 0)",
											color: theme === "dark" ? "oklch(0.205 0 0)" : "oklch(0.985 0 0)"
										}
									: {
											color: theme === "dark" ? "oklch(0.708 0 0)" : "oklch(0.556 0 0)"
										}
							}
						>
							<item.icon className="h-4 w-4" />
							{item.label}
						</button>
					))}
				</nav>

				<div className="border-t p-4" style={{
					borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)"
				}}>
					<button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors" style={{
						color: theme === "dark" ? "oklch(0.708 0 0)" : "oklch(0.556 0 0)"
					}}>
						<LogOut className="h-4 w-4" />
						Logout
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:pl-64" : ""}`}>
				{/* Header */}
				<header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b px-6 backdrop-blur-md" style={{
					backgroundColor: theme === "dark" ? "rgba(37, 37, 37, 0.8)" : "rgba(255, 255, 255, 0.8)",
					borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)"
				}}>
					<div className="flex items-center gap-4">
						{!sidebarOpen && (
							<Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
								<Menu className="h-5 w-5" />
							</Button>
						)}
						<div className="relative hidden w-96 md:block">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{
								color: theme === "dark" ? "oklch(0.708 0 0)" : "oklch(0.556 0 0)"
							}} />
							<Input placeholder="Search lesson plans..." className="pl-10" />
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon-sm"
							onClick={toggleTheme}
							className="rounded-full"
							aria-label="Toggle theme"
							style={{
								borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)",
								backgroundColor: theme === "dark" ? "rgba(37, 37, 37, 0.5)" : "rgba(255, 255, 255, 0.5)"
							}}
						>
							{theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-yellow-500" />}
						</Button>
						<div className="h-8 w-8 rounded-full bg-gradient-to-tr" style={{
							backgroundImage: theme === "dark" 
								? "linear-gradient(to top right, oklch(0.985 0 0), rgba(252, 252, 252, 0.5))"
								: "linear-gradient(to top right, oklch(0.205 0 0), rgba(52, 52, 52, 0.5))"
						}} />
					</div>
				</header>

				{/* Content Area */}
				<div className="p-6 lg:p-10">
					{activeTab === "dashboard" && (
						<div>
							<div className="mb-10">
								<h1 className="text-3xl font-bold tracking-tight md:text-4xl">Overview</h1>
								<p className="mt-2" style={{
									color: theme === "dark" ? "oklch(0.708 0 0)" : "oklch(0.556 0 0)"
								}}>Monitor your teaching materials and performance.</p>
							</div>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
								<div className="rounded-3xl border p-8" style={{
									backgroundColor: theme === "dark" ? "oklch(0.145 0 0)" : "oklch(1 0 0)",
									borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)"
								}}>
									<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl" style={{
										backgroundColor: theme === "dark" ? "rgba(252, 252, 252, 0.1)" : "rgba(52, 52, 52, 0.1)"
									}}>
										<FileText className="h-6 w-6" style={{
											color: theme === "dark" ? "oklch(0.985 0 0)" : "oklch(0.205 0 0)"
										}} />
									</div>
									<div className="text-4xl font-bold tracking-tighter">{stats.totalCreated}</div>
									<div className="mt-2 font-medium">Lesson Plans Created</div>
									<p className="mt-4 text-sm" style={{
										color: theme === "dark" ? "oklch(0.708 0 0)" : "oklch(0.556 0 0)"
									}}>Total generated across all time.</p>
								</div>

								<div className="rounded-3xl border p-8" style={{
									backgroundColor: theme === "dark" ? "oklch(0.145 0 0)" : "oklch(1 0 0)",
									borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)"
								}}>
									<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl" style={{
										backgroundColor: theme === "dark" ? "rgba(252, 252, 252, 0.1)" : "rgba(52, 52, 52, 0.1)"
									}}>
										<Calendar className="h-6 w-6" style={{
											color: theme === "dark" ? "oklch(0.985 0 0)" : "oklch(0.205 0 0)"
										}} />
									</div>
									<div className="text-4xl font-bold tracking-tighter">{stats.thisMonth}</div>
									<div className="mt-2 font-medium">Created This Month</div>
									<p className="mt-4 text-sm" style={{
										color: theme === "dark" ? "oklch(0.708 0 0)" : "oklch(0.556 0 0)"
									}}>Keep up the great momentum.</p>
								</div>

								<div className="rounded-3xl border p-8" style={{
									backgroundColor: theme === "dark" ? "oklch(0.145 0 0)" : "oklch(1 0 0)",
									borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)"
								}}>
									<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl" style={{
										backgroundColor: theme === "dark" ? "rgba(252, 252, 252, 0.1)" : "rgba(52, 52, 52, 0.1)"
									}}>
										<Sparkles className="h-6 w-6" style={{
											color: theme === "dark" ? "oklch(0.985 0 0)" : "oklch(0.205 0 0)"
										}} />
									</div>
									{stats.recentPlan ? (
										<>
											<div className="text-lg font-bold truncate">{stats.recentPlan.title}</div>
											<div className="mt-2 font-medium">Most Recent Plan</div>
											<p className="mt-4 text-sm" style={{
												color: theme === "dark" ? "oklch(0.708 0 0)" : "oklch(0.556 0 0)"
											}}>
												{stats.recentPlan.grade} • {stats.recentPlan.date}
											</p>
										</>
									) : (
										<div className="italic" style={{
											color: theme === "dark" ? "oklch(0.708 0 0)" : "oklch(0.556 0 0)"
										}}>No recent plans found</div>
									)}
								</div>
							</div>
						</div>
					)}

					{activeTab === "create" && (
						<div className="max-w-4xl mx-auto">
							<div className="mb-10">
								<h1 className="text-3xl font-bold tracking-tight">Create Lesson Plan</h1>
								<p className="mt-2" style={{
									color: theme === "dark" ? "oklch(0.708 0 0)" : "oklch(0.556 0 0)"
								}}>
									Fill in the details to generate your curriculum-aligned plan.
								</p>
							</div>

							{!lessonPlan ? (
								<div className="rounded-3xl border p-8 shadow-sm" style={{
									backgroundColor: theme === "dark" ? "oklch(0.145 0 0)" : "oklch(1 0 0)",
									borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)"
								}}>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label>School Name</Label>
											<Input
												placeholder="Enter school name"
												value={formData.schoolName}
												onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
											/>
										</div>
										<div className="space-y-2">
											<Label>Pathway</Label>
											<Input
												placeholder="e.g. Science, Arts"
												value={formData.pathway}
												onChange={(e) => setFormData({ ...formData, pathway: e.target.value })}
											/>
										</div>
										<div className="space-y-2">
											<Label>Grade</Label>
											<Input
												placeholder="e.g. Grade 10"
												value={formData.grade}
												onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
											/>
										</div>
										<div className="space-y-2">
											<Label>Topic</Label>
											<Input
												placeholder="e.g. Photosynthesis"
												value={formData.topic}
												onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
											/>
										</div>
										<div className="space-y-2">
											<Label>Strand</Label>
											<Input
												placeholder="e.g. Life Sciences"
												value={formData.strand}
												onChange={(e) => setFormData({ ...formData, strand: e.target.value })}
											/>
										</div>
										<div className="space-y-2">
											<Label>Sub-strand</Label>
											<Input
												placeholder="e.g. Plant Biology"
												value={formData.subStrand}
												onChange={(e) => setFormData({ ...formData, subStrand: e.target.value })}
											/>
										</div>
									</div>
									<Button className="w-full mt-8 gap-2" size="lg" onClick={handleGenerate} disabled={isGenerating}>
										{isGenerating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
										Generate Lesson Plan
									</Button>
								</div>
							) : (
								<div className="rounded-3xl border p-8 shadow-sm" style={{
									backgroundColor: theme === "dark" ? "oklch(0.145 0 0)" : "oklch(1 0 0)",
									borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)"
								}}>
									<div className="flex items-center justify-between mb-8 pb-4 border-b" style={{
										borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)"
									}}>
										<h2 className="text-xl font-bold">Document Editor</h2>
										<div className="flex gap-2">
											<Button variant="outline" size="sm" onClick={() => setLessonPlan(null)} className="gap-2">
												<RefreshCw className="h-4 w-4" />
												Regenerate
											</Button>
											<Button size="sm" className="gap-2">
												<Save className="h-4 w-4" />
												Save
											</Button>
											<Button variant="secondary" size="sm" className="gap-2">
												<Download className="h-4 w-4" />
												PDF
											</Button>
										</div>
									</div>

									<div className="space-y-6">
										<div className="grid grid-cols-2 gap-4 text-sm p-4 rounded-xl" style={{
											backgroundColor: theme === "dark" ? "rgba(68, 68, 68, 0.3)" : "rgba(247, 247, 247, 0.3)"
										}}>
											<div>
												<span className="font-bold">School:</span> {lessonPlan.schoolName}
											</div>
											<div>
												<span className="font-bold">Pathway:</span> {lessonPlan.pathway}
											</div>
											<div>
												<span className="font-bold">Grade:</span> {lessonPlan.grade}
											</div>
											<div>
												<span className="font-bold">Topic:</span> {lessonPlan.topic}
											</div>
											<div>
												<span className="font-bold">Strand:</span> {lessonPlan.strand}
											</div>
											<div>
												<span className="font-bold">Sub-strand:</span> {lessonPlan.subStrand}
											</div>
										</div>

										<textarea
											className="w-full min-h-[400px] p-6 rounded-2xl border font-mono text-sm leading-relaxed focus:ring-2 focus:outline-none transition-all"
											defaultValue={lessonPlan.content}
											style={{
												backgroundColor: theme === "dark" ? "oklch(0.145 0 0)" : "oklch(1 0 0)",
												borderColor: theme === "dark" ? "oklch(0.269 0 0)" : "oklch(0.922 0 0)",
												color: theme === "dark" ? "oklch(0.985 0 0)" : "oklch(0.145 0 0)"
											}}
										/>
									</div>
								</div>
							)}
						</div>
					)}

					{activeTab === "archive" && (
						<div className="text-center py-20">
							<FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-20" style={{
								color: theme === "dark" ? "oklch(0.708 0 0)" : "oklch(0.556 0 0)"
							}} />
							<h2 className="text-xl font-semibold">Lesson Archive</h2>
							<p style={{
								color: theme === "dark" ? "oklch(0.708 0 0)" : "oklch(0.556 0 0)"
							}}>Your saved lesson plans will appear here.</p>
						</div>
					)}
				</div>
			</main>
		</div>
	)
}
