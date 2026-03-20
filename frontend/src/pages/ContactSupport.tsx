function ContactSupportPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-10 md:px-10 lg:px-16">
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80">
            Contact &amp; Support
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            We&apos;re here to support your trade operations.
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Whether you&apos;re onboarding new partners, configuring roles, or going live with a region, our team can
            help you get the most out of TradeBridge.
          </p>
        </header>

        <section className="grid gap-6 text-sm text-slate-200 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
            <h2 className="text-base font-semibold text-slate-50">How to reach us</h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-200">
              <p>
                Email:{" "}
                <a href="mailto:support@tradebridge.app" className="text-emerald-300 hover:text-emerald-200">
                  support@tradebridge.app
                </a>
              </p>
              <p>
                For security and account‑specific changes, please contact us from your verified work email or from
                within the in‑app Help &amp; Support section.
              </p>
            </div>
            <div className="space-y-2 text-[11px] text-slate-400">
              <p>Typical response time: 1–2 business days.</p>
              <p>For critical incidents, include &quot;PRIORITY&quot; in the subject line.</p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5 text-xs sm:text-sm text-slate-300">
            <h2 className="text-base font-semibold text-slate-50">What we can help with</h2>
            <ul className="list-disc space-y-1 pl-4">
              <li>Onboarding new factories, distributors, or retailers.</li>
              <li>Shaping roles, permissions, and approval flows.</li>
              <li>Clarifying analytics, data exports, and audit logs.</li>
              <li>Reporting bugs or requesting small UX improvements.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ContactSupportPage;

