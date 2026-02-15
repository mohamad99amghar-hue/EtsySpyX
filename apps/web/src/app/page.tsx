
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-8">
      <div className="max-w-2xl space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
          Dominate Etsy with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Real AI</span>
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          Stop guessing. Start spying. EtsySpyPro X uses advanced LLMs to analyze demand,
          spy on competitors, and rewrite your listings for maximum conversion.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="btn-primary text-lg px-8 py-3">
            Start Free Trial
          </Link>
          <Link href="/login" className="btn-secondary text-lg px-8 py-3">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
