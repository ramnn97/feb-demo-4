import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/client")({
  head: () => ({
    meta: [
      { title: "Our Clients — FaceBuilds" },
      { name: "description", content: "Meet the people and brands growing with FaceBuilds." },
    ],
  }),
  component: ClientPage,
});

const clients = [
  { name: "Dr. Harish Patankar", image: "harish-patankar", followers: "206K" },
  { name: "Sagar Babar", image: "sagar-babar", followers: "245K" },
  { name: "Dr. Priya Dandage", image: "priya-dandage", followers: "44.5K" },
  { name: "Dr. Sagar Pathak", image: "sagar-pathak", followers: "25K+" },
  { name: "Dr. Nilesh Londhe", image: "nilesh-londhe", followers: "18K+" },
  { name: "Sudhir Khot", image: "sudhir-khot", followers: "22K+" },
  { name: "Dr. Jyoti Shirodkar", image: "jyoti-shirodkar", followers: "9K+" },
];

function ClientMarquee({ items, reverse = false }: { items: typeof clients; reverse?: boolean }) {
  return (
    <div className={`career-client-marquee${reverse ? " career-client-marquee-down" : ""}`}>
      <div className="career-client-marquee-track">
        <div className="career-client-marquee-group">
          {items.map((client) => (
            <figure className="career-hero-card" key={client.image}>
              <img src={`/clients/${client.image}.png`} alt={client.name} />
              <figcaption><span>{client.name}</span><i>{client.followers}</i></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClientPage() {
  return (
    <main className="career-experience client-page">
      <header className="career-experience-nav">
        <Link to="/" className="career-experience-brand" aria-label="FaceBuilds home">
          <img src="/logo-transparent.png" alt="FaceBuilds" />
        </Link>
        <Link to="/" className="career-nav-cta"><ArrowLeft aria-hidden="true" /> Back home</Link>
      </header>

      <section className="career-hero client-hero" aria-labelledby="client-title">
        <div className="career-hero-copy">
          <h1 id="client-title">Every great name<br />has a story worth<br /><em>telling.</em></h1>
          <p className="career-hero-description">We turn expertise, ideas and individuality into powerful personal brands that build influence, earn trust and create lasting impact.</p>
          <Link className="career-primary-link" to="/career">Explore opportunities <ArrowUpRight aria-hidden="true" /></Link>
          <span className="career-hero-note">CREATIVE THINKING. REAL PEOPLE. WORK THAT MOVES.</span>
        </div>

        <div className="career-hero-art" aria-label="FaceBuilds clients">
          <div className="career-hero-art-backdrop" />
          <div className="career-client-marquees">
            <ClientMarquee items={clients.filter((_, index) => index % 2 === 0)} />
            <ClientMarquee items={clients.filter((_, index) => index % 2 === 1)} reverse />
          </div>
          <div className="career-float-card career-float-card-blue" aria-hidden="true">
            <strong>YOUR STORY<br /><span>YOUR INFLUENCE</span></strong>
            <ArrowUpRight />
          </div>
          <div className="career-float-card career-float-card-note" aria-hidden="true">
            <strong>TURN EXPERTISE<br />INTO AUTHORITY</strong>
          </div>
        </div>

        <Link className="career-scroll-cue" to="/career#application">MEET THE TEAM <ArrowDown aria-hidden="true" /></Link>
      </section>
    </main>
  );
}
