import { useState } from 'react'

export default function LegalPage() {
  const [tab, setTab] = useState('privacy')

  const tabs = [
    { key: 'privacy', label: 'Privacy Policy' },
    { key: 'terms', label: 'Terms of Service' },
    { key: 'cookie', label: 'Cookie Policy' },
    { key: 'compliance', label: 'Compliance' },
  ]

  return (
    <div className="min-h-screen bg-background p-6">

      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Legal & Policies</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm border ${
              tab === t.key
                ? 'bg-primary text-white border-primary'
                : 'bg-muted border-border'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-card p-6 rounded-lg border border-border space-y-4 text-sm text-muted-foreground">

        {tab === 'privacy' && (
          <>
            <h2 className="text-lg font-semibold text-foreground">Privacy Policy</h2>
            <p>We collect only necessary data such as name, email, and role.</p>
            <p>Your data is securely stored and never sold to third parties.</p>
            <p>You can request deletion of your account anytime.</p>
          </>
        )}

        {tab === 'terms' && (
          <>
            <h2 className="text-lg font-semibold text-foreground">Terms of Service</h2>
            <p>Users must use the platform responsibly and legally.</p>
            <p>Fraud, abuse, or misuse may lead to account suspension.</p>
            <p>We may update these terms at any time.</p>
          </>
        )}

        {tab === 'cookie' && (
          <>
            <h2 className="text-lg font-semibold text-foreground">Cookie Policy</h2>
            <p>We use cookies to improve user experience.</p>
            <p>Cookies help store login sessions and preferences.</p>
          </>
        )}

        {tab === 'compliance' && (
          <>
            <h2 className="text-lg font-semibold text-foreground">Compliance</h2>
            <p>We follow standard data protection and security practices.</p>
            <p>We aim to comply with applicable digital platform laws.</p>
          </>
        )}

      </div>
    </div>
  )
}