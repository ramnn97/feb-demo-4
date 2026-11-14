import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import type { FormEvent } from "react";

const Lanyard = lazy(() => import("@/components/Lanyard"));

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Careers — FaceBuilds" },
      { name: "description", content: "Apply to join the FaceBuilds team." },
    ],
  }),
  component: CareerPage,
});

const careerRoles = ["Content Strategist", "Video Producer & Editor", "PR & Communications", "Growth Marketer", "AI Content & Automation", "Something else"];

function CareerPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setFormMessage("Sending your application…");

    try {
      const response = await fetch("/api/career-application", { method: "POST", body: new FormData(form) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "We couldn’t send your application. Please try again.");
      setFormMessage("Thanks! Your application has been sent to our careers team.");
      form.reset();
      setSelectedRole("");
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : "We couldn’t send your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="career-experience career-form-only">
      <header className="career-experience-nav">
        <Link to="/" className="career-experience-brand" aria-label="FaceBuilds home">
          <img src="/logo-transparent.png" alt="FaceBuilds" />
        </Link>
        <Link to="/" className="career-nav-cta"><ArrowLeft aria-hidden="true" /> Back home</Link>
      </header>

      <section className="career-apply" id="application" aria-labelledby="career-apply-title">
        <div className="career-apply-aside">
          <h1 id="career-apply-title">HELLO, <em>CREATIVE MIND!</em></h1>
          <p className="career-form-prompt">&lt; FILL IN THE FORM &gt;</p>
        </div>

        <form className="career-application" onSubmit={handleApplication}>
          <label className="career-sentence-row career-sentence-row-wide">
            <span>We want to collaborate with you on</span>
            <select name="role" required value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
              <option value="" disabled>Choose a role</option>
              {careerRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <div className="career-sentence-row career-sentence-pair">
            <label><span>My name is</span><input name="name" autoComplete="name" placeholder="Full name" required /></label>
            <label><span>and my email is</span><input name="email" type="email" autoComplete="email" placeholder="Email address" required /></label>
          </div>
          <label className="career-sentence-row career-sentence-row-wide">
            <span>My portfolio or LinkedIn is</span>
            <input name="portfolio" type="url" placeholder="https://" />
          </label>
          <label className="career-sentence-row career-sentence-row-wide career-sentence-about">
            <span>A little about me</span>
            <textarea name="message" rows={2} placeholder="What do you care about? What would you love to make?" required />
          </label>
          <label className="career-sentence-row career-sentence-row-wide career-sentence-upload">
            <span>Here are my work samples <small>PDF, DOC, DOCX · up to 10 MB</small></span>
            <input name="attachment" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required />
          </label>
          <div className="career-form-submit-row">
            <p className="career-form-message" role="status">{formMessage}</p>
            <button className="career-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "SEND"}<ArrowUpRight aria-hidden="true" /></button>
          </div>
        </form>

        <div className="career-form-id-card" aria-label="Interactive FaceBuilds ID card. Drag to swing and click to turn it over.">
          <Suspense fallback={<div className="career-form-id-card-loading" aria-hidden="true" />}>
            <Lanyard
              frontImage="/logo-transparent.png"
              backImage="/logo-transparent.png"
              imageFit="contain"
              cardColor="#f7f4ef"
              orientation="portrait"
              finish="glossy"
              size={0.48}
              anchor="center"
              strapLength={0.4}
              strapColor="#1748e8"
              metal="silver"
              breeze={0.1}
              interactive
            />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
