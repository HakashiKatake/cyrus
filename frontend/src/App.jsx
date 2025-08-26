import { useState } from 'react'

export default function App() {
	const [topic, setTopic] = useState('Addition')
	const [count, setCount] = useState(5)
	const [includeAnswers, setIncludeAnswers] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [exam, setExam] = useState('')
	const [copied, setCopied] = useState(false)

	const valid = topic.trim().length > 0 && Number.isInteger(Number(count)) && Number(count) >= 1 && Number(count) <= 50

	const onGenerate = async () => {
		if (!valid) return
		setLoading(true)
		setError('')
		setExam('')
		setCopied(false)
		try {
			const res = await fetch('/api/generate-exam', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topic: topic.trim(), count: Number(count), includeAnswers }),
			})
			if (!res.ok) {
				const data = await res.json().catch(() => ({}))
				throw new Error(data.error || 'Failed to generate exam')
			}
			const data = await res.json()
			setExam(data.exam || '')
		} catch (e) {
			setError(e.message || 'Failed to generate exam. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	const onCopy = async () => {
		if (!exam) return
		try {
			await navigator.clipboard.writeText(exam)
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		} catch {
			/* noop */
		}
	}

		return (
			<div className="min-h-full text-neutral-900 dark:text-neutral-100 bg-gradient-to-b from-violet-50 via-sky-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-zinc-900">
				<header className="sticky top-0 z-10 backdrop-blur border-b border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/50">
					<div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
						<h1 className="text-lg sm:text-xl font-semibold tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">AI Exam Paper Generator</h1>
						<a className="text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-300/80 dark:hover:text-neutral-200" href="#" target="_blank" rel="noreferrer">Primary Math</a>
					</div>
				</header>

			<main className="mx-auto max-w-4xl px-4 py-8 grid gap-6">
			<section className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-5 sm:p-6 shadow-md">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<label className="text-sm font-medium">Math Topic</label>
							<input
				className="w-full rounded-lg border border-neutral-300/80 dark:border-white/10 bg-white dark:bg-slate-950/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/70"
								placeholder="e.g., Addition, Fractions"
								value={topic}
								onChange={(e) => setTopic(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<label className="text-sm font-medium">Number of Questions</label>
							<input
				className="w-full rounded-lg border border-neutral-300/80 dark:border-white/10 bg-white dark:bg-slate-950/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/70"
								type="number"
								min={1}
								max={50}
								value={count}
								onChange={(e) => setCount(e.target.value)}
							/>
						</div>
					</div>
					<div className="mt-4 flex items-center gap-4">
						<label className="inline-flex items-center gap-2 text-sm">
							<input type="checkbox" checked={includeAnswers} onChange={(e) => setIncludeAnswers(e.target.checked)} />
							Include answer key
						</label>
						<button
			      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 active:from-violet-800 active:to-fuchsia-800 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={!valid || loading}
							onClick={onGenerate}
						>
							{loading ? (
								<>
									<svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
									Generating...
								</>
							) : (
								<>Generate Exam</>
							)}
						</button>
					</div>

					{!valid && (
						<p className="mt-3 text-sm text-amber-600">Enter a topic and choose 1-50 questions.</p>
					)}
								{error && (
									<p className="mt-3 text-sm text-rose-600">{error}</p>
					)}
				</section>

							<section className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-5 sm:p-6 shadow-md">
					<div className="flex items-center justify-between gap-4">
						<h2 className="text-base font-semibold">Generated Exam</h2>
						<div className="flex items-center gap-2">
							<button
											className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium bg-transparent hover:bg-violet-50 dark:hover:bg-violet-900/40 disabled:opacity-50 border border-transparent hover:border-violet-200/60 dark:hover:border-violet-800/60"
								onClick={onCopy}
								disabled={!exam}
							>
								{copied ? 'Copied' : 'Copy'}
							</button>
						</div>
					</div>
								<pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-800 dark:text-neutral-200 min-h-[8rem]">{exam || (loading ? 'Working on it...' : 'Your generated exam will appear here.')}</pre>
				</section>
			</main>

						<footer className="mx-auto max-w-4xl px-4 py-6 text-xs text-neutral-600 dark:text-neutral-400">
			
			</footer>
		</div>
	)
}
