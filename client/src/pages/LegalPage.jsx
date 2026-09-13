import { Link, useLocation } from "react-router-dom";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    intro: "CareerLaunch AI respects your privacy and uses account information only to provide and improve the services you request.",
    sections: [
      ["Information we use", "We use the information you provide, such as your name, email address, profile details, saved items, and activity needed to operate your account."],
      ["How we use it", "We use this information to authenticate you, provide career tools, personalize signed-in experiences, and keep the platform secure."],
      ["Your choices", "You can review or update your profile from My Profile. Contact us if you need help accessing, correcting, or deleting your account information."],
    ],
  },
  terms: {
    title: "Terms of Use",
    intro: "By using CareerLaunch AI, you agree to use the platform lawfully and responsibly.",
    sections: [
      ["Platform content", "CareerLaunch AI provides career discovery and preparation tools. Job, company, and resource information may come from third-party sources and should be verified before you act on it."],
      ["Your account", "Keep your sign-in information secure and provide accurate information. You are responsible for activity performed through your account."],
      ["Acceptable use", "Do not misuse the platform, attempt unauthorized access, or submit content that violates another person’s rights or applicable law."],
    ],
  },
};

export default function LegalPage() {
  const { pathname } = useLocation();
  const content = pathname.includes("terms-of-use") ? CONTENT.terms : CONTENT.privacy;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--cl-page)] px-4 py-16 text-[var(--cl-text)] sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-6 shadow-[var(--cl-shadow)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cl-primary)]">CareerLaunch AI</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{content.title}</h1>
        <p className="mt-5 text-[var(--cl-text-muted)]">{content.intro}</p>
        <div className="mt-8 space-y-6">
          {content.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-lg font-semibold">{heading}</h2>
              <p className="mt-2 leading-7 text-[var(--cl-text-muted)]">{body}</p>
            </section>
          ))}
        </div>
        <Link
          to="/"
          className="mt-10 inline-flex rounded-xl bg-[var(--cl-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--cl-button-text)] transition hover:bg-[var(--cl-primary-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-ring)]"
        >
          Back to home
        </Link>
      </article>
    </main>
  );
}
