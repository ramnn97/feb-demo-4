import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import type { FormEvent } from "react";

const Lanyard = lazy(() => import("@/components/Lanyard"));

export const Route = createFileRoute("/career 2")({
  head: () => ({
    meta: [
      { title: "Careers at FaceBuilds" },
      { name: "description", content: "Join FaceBuilds and help experts build a brand people remember." },
    ],
  }),
  component: CareerPage,
});

function CareerPage() {
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setIsSubmitting(true);
    setFormMessage("Sending your application…");

    try {
      const response = await fetch("/api/career-application", { method: "POST", body: fields });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "We couldn’t send your application. Please try again.");
      setFormMessage("Thanks! Your application has been sent to our careers team.");
      form.reset();
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : "We couldn’t send your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="career-page">
      <header className="career-header">
        <Link to="/" className="career-logo" aria-label="FaceBuilds home">
          <img src="/logo-transparent.png" alt="FaceBuilds" />
        </Link>
        <Link to="/" className="career-back"><ArrowLeft size={16} /> Back home</Link>
      </header>
      <section className="career-content" aria-labelledby="career-title">
        <div className="career-copy">
          <p className="career-eyebrow">CAREERS AT FACEBUILDS</p>
          <h1 id="career-title">Make room<br />for <em>what’s next.</em></h1>
          <p>Tell us what you’d like to do and share a little about yourself. You can also email us at <a className="career-email" href="mailto:careers@facebuilds.com">careers@facebuilds.com</a>.</p>
          <form className="career-application" onSubmit={handleApplication}>
            <label className="career-field career-role-field">
              <span>What kind of role are you looking for?</span>
              <select name="role" required defaultValue="">
                <option value="" disabled>Choose a role</option>
                <option>Content strategy</option>
                <option>Video production & editing</option>
                <option>PR & communications</option>
                <option>Growth marketing</option>
                <option>AI content & automation</option>
                <option>Something else</option>
              </select>
            </label>
            <div className="career-fields-row">
              <label className="career-field"><span>Your name</span><input name="name" autoComplete="name" placeholder="Name" required /></label>
              <label className="career-field"><span>Email address</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
            </div>
            <label className="career-field"><span>Portfolio or LinkedIn</span><input name="portfolio" type="url" placeholder="https://" /></label>
            <label className="career-field"><span>A little about you</span><textarea name="message" rows={3} placeholder="Your experience, strengths, or what you’d love to work on…" required /></label>
            <label className="career-field"><span>Resume or work samples (PDF, DOC, DOCX · up to 10 MB)</span><input name="attachment" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /></label>
            <button className="career-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send application"} <span aria-hidden="true">↗</span></button>
            <p className="career-form-message" role="status">{formMessage}</p>
          </form>
        </div>
        <div className="career-lanyard" aria-label="Interactive FaceBuilds ID card. Drag to swing and click to turn it over.">
          <Suspense fallback={<div className="career-lanyard-loading" aria-label="Loading interactive card" />}>
            <Lanyard
              frontImage="/logo-transparent.png"
              backImage="/logo-transparent.png"
              imageFit="contain"
              cardColor="#f7f4ef"
              orientation="portrait"
              finish="glossy"
              size={0.58}
              anchor="center"
              strapLength={0.42}
              strapColor="#1748e8"
              metal="silver"
              breeze={0.14}
            />
          </Suspense>
        </div>
        <span className="career-index" aria-hidden="true">01 — YOUR NEXT CHAPTER</span>
      </section>
    </main>
  );
}
