import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Download, Instagram, Linkedin, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { formatText } from "./utils";
import Cover from "./Cover";
import ContactDialog from "./ContactDialog";

type Project = {
  id: string | number;
  title: string;
  description: string;
  image: string;
  tag: string;
  year: string;
  href?: string;
  cover_type?: string;
  video_url?: string;
  poster?: string;
  featured?: boolean;
};

type LiveSite = {
  id: string;
  title: string;
  category: string;
  description?: string;
  preview_type: "image" | "video";
  image_url: string;
  video_url: string;
  poster_url: string;
  url: string;
  accent: string;
};

const fallbackLiveSites = [
  {
    id: "korede-fitness",
    title: "Korede Fitness",
    category: "Fitness & wellness website",
    preview_type: "image",
    image_url: "/live/korede-fitness.png",
    video_url: "",
    poster_url: "",
    url: "https://www.koredefitness.com",
    accent: "#12b9e8",
  },
  {
    id: "allahu-mubaraq",
    title: "Allahu Mubaraq Enterprises",
    category: "Industrial supply website",
    preview_type: "image",
    image_url: "/live/allahumubaraq.png",
    video_url: "",
    poster_url: "",
    url: "https://www.allahumubaraq.com",
    accent: "#f26d21",
  },
] satisfies LiveSite[];

const fallbackProjects = [
  {
    id: "fallback-after-round-one",
    title: "After Round One",
    description: "A multiplayer game experience designed around fast decisions, competition and connection.",
    image: "/archive/after-round-one.png?v=3",
    tag: "Multiplayer game UX",
    year: "2026",
    href: "#work",
  },
  {
    id: "fallback-apc-website",
    title: "APC Website",
    description: "A clearer civic website that makes party information and public participation easier to navigate.",
    image: "/archive/apc-website.png?v=3",
    tag: "Civic website",
    year: "2026",
    href: "#work",
  },
  {
    id: "fallback-saad-portfolio",
    title: "Sa’ad Adam Portfolio",
    description: "A focused portfolio experience built to present product thinking and interface work with clarity.",
    image: "/archive/saad-portfolio.png?v=3",
    tag: "Portfolio website",
    year: "2026",
    href: "#work",
  },
  {
    id: "fallback-ledgerly",
    title: "Ledgerly",
    description: "A financial workspace that turns account activity and risk signals into clear daily decisions.",
    image: "/archive/ledgerly-dashboard.png?v=3",
    tag: "Fintech web app",
    year: "2026",
    href: "#work",
  },
  {
    id: "fallback-caregrid",
    title: "CareGrid",
    description: "A healthcare operations dashboard for coordinating schedules, people and service delivery.",
    image: "/archive/caregrid-dashboard.png?v=3",
    tag: "Healthcare web app",
    year: "2026",
    href: "#work",
  },
] satisfies Project[];

const experience = [
  { period: "2025—Now", role: "Product Designer", company: "Zulaiy Hub" },
  { period: "2024—25", role: "Independent Designer", company: "Upwork" },
  { period: "2023—24", role: "Product Design Intern", company: "C80" },
];

const capabilities = [
  "Product strategy",
  "UX direction",
  "Interface systems",
  "Prototyping",
  "Design systems",
  "Product thinking",
];

const cvUrl = "https://drive.google.com/file/d/1OME7NL3lG8TbD0H2QOJd84eB6UuuxYCw/view?usp=drive_link";

function BrickWordmark() {
  // Vector letterforms keep the brick joints sharp at every display size.
  return (
    <svg className="brick-wordmark" viewBox="0 0 720 160" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="hero-bricks" width="40" height="32" patternUnits="userSpaceOnUse">
          <rect x=".6" y=".6" width="38.8" height="14.8" rx=".8" fill="#030d0f" />
          <rect x="-19.4" y="16.6" width="38.8" height="14.8" rx=".8" fill="#030d0f" />
          <rect x="20.6" y="16.6" width="38.8" height="14.8" rx=".8" fill="#030d0f" />
        </pattern>
      </defs>
      <g fill="url(#hero-bricks)">
        <path d="M20 0H140V32H48L40 40V56L120 80L140 88V136L120 152H0V120H100V104L20 80L0 72V24Z" />
        <path fillRule="evenodd" d="M160 152V48L200 0H260L300 48V152H260V120H200V152ZM200 88H260V48L248 32H212L200 48Z" />
        <path d="M312 0H348V32L330 64H320L330 32H312Z" />
        <path fillRule="evenodd" d="M360 152V48L400 0H460L500 48V152H460V120H400V152ZM400 88H460V48L448 32H412L400 48Z" />
        <path fillRule="evenodd" d="M520 0H620L660 24V128L620 152H520ZM560 32V120H610L620 112V40L610 32Z" />
      </g>
      <circle cx="693" cy="135" r="17" fill="#008a85" />
    </svg>
  );
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [liveSites, setLiveSites] = useState<LiveSite[]>(fallbackLiveSites);
  const [unavailable, setUnavailable] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workTab, setWorkTab] = useState<"products" | "live">("products");
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });
  const displayedProjects = unavailable ? fallbackProjects : projects;
  const entrance = (delay: number, distance = 22) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : distance },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0.18 : 0.72,
      delay: reduceMotion ? 0 : delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  useEffect(() => {
    fetch("/api/projects?homepage=true")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setUnavailable(true));
    fetch("/api/websites")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => { if (Array.isArray(data)) setLiveSites(data); })
      .catch(() => {});
    fetch("/api/settings").then(r=>r.ok?r.json():{}).then(setSettings).catch(()=>{});
  }, []);

  return (
    <main className="site-shell">
      <motion.div
        className="scroll-progress"
        style={{ scaleX: smoothProgress }}
        aria-hidden="true"
      />
      <motion.header
        className="topbar"
        {...entrance(0.04, -18)}
      >
        <a className="wordmark" href="#top" aria-label="Sa'ad Adam, home">
          <span className="sa-wordmark" aria-hidden="true">saad.</span>
        </a>
        <a className="mobile-app-logo" href="#top" aria-label="Sa'ad Adam, home">
          <span aria-hidden="true">saad.</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#profile">About</a>
          <a data-event="contact_click" href="#contact">Contact</a>
        </nav>
        <a className="nav-contact" href="#contact">
          Let's Talk <ArrowUpRight aria-hidden="true" />
        </a>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              id="mobile-navigation"
              className="mobile-navigation"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <a href="#work" onClick={() => setMobileMenuOpen(false)}>Work</a>
              <a href="#profile" onClick={() => setMobileMenuOpen(false)}>About</a>
              <a data-event="contact_click" href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      <section
        className="hero"
        id="top"
      >
        <motion.div
          className="hero-greeting"
          {...entrance(0.12, 14)}
        >
          Hello, I am
        </motion.div>

        <motion.div
          className="hero-identity"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 28, scale: reduceMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0.18 : 0.88, delay: reduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 aria-label="Sa’ad Adam, product designer">
            <BrickWordmark />
          </h1>
        </motion.div>

        <motion.h2
          className="hero-statement"
          {...entrance(0.3, 24)}
        >
          <span>I design digital products</span>
          <em>that solve real problems.</em>
        </motion.h2>

        <motion.p
          className="hero-summary"
          {...entrance(0.38, 20)}
        >
          From idea to impact — I turn complex needs into simple,
          useful and beautiful digital experiences.
        </motion.p>

        <motion.div
          className="hero-actions"
          {...entrance(0.46, 18)}
        >
          <a href="#work" className="hero-primary-button">
            View My Work <ArrowRight aria-hidden="true" />
          </a>
          <a data-event="resume_download" href={settings.resume_url || cvUrl} target="_blank" rel="noreferrer" className="hero-secondary-button">
            Download Resume <Download aria-hidden="true" />
          </a>
        </motion.div>

        <motion.aside className="hero-location" aria-label="Location and availability" {...entrance(0.52, 16)}>
          <p>Based in<br /><strong>Kwara, Nigeria</strong></p>
          <span aria-hidden="true" />
          <p>Working<br /><strong>globally</strong></p>
        </motion.aside>

        <motion.div className="hero-socials" aria-label="Social links" {...entrance(0.58, 14)}>
          <a href="https://www.linkedin.com/in/saadadam007/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin aria-hidden="true" /></a>
          <a href="https://x.com/uiuxsaad" target="_blank" rel="noreferrer" aria-label="X">𝕏</a>
          <a href="https://www.instagram.com/uiuxsaad/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram aria-hidden="true" /></a>
        </motion.div>

        <motion.div className="hero-signature" aria-hidden="true" {...entrance(0.62, 14)}>
          <span>Sa’ad</span>
          <small>Product designer</small>
        </motion.div>
      </section>


      <section className={`work-section work-hub${workTab === "live" ? " work-hub-live" : ""}`} id="work">
        <Reveal className="work-hub-topline" amount={0.25}>
          <p>{workTab === "live" ? "Selected websites / Live" : "Selected work / 2023—Now"}</p>
          <p>{workTab === "live" ? `${String(liveSites.length).padStart(2, "0")} live sites` : `${String(displayedProjects.length).padStart(2, "0")} case studies`}</p>
        </Reveal>

        <Reveal className="work-hub-intro" amount={0.2}>
          <p className="work-hub-eyebrow">{workTab === "live" ? "Live website reel / 02" : "Product work / 01"}</p>
          <div>
            <h2>
              {workTab === "live" ? (
                <>Built to be explored.</>
              ) : (
                <>Digital products designed,<br />built and shipped.</>
              )}
            </h2>
            <p>
              {workTab === "live"
                ? "Website design and development, from first screen to final detail."
                : "Explore product case studies across web applications, mobile experiences and interface systems."}
            </p>
          </div>
        </Reveal>

        <motion.div
          className="work-tabs"
          role="tablist"
          aria-label="Project categories"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduceMotion ? 0.18 : 0.68, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            id="products-tab"
            type="button"
            role="tab"
            aria-selected={workTab === "products"}
            aria-controls="products-panel"
            onClick={() => setWorkTab("products")}
          >
            <span>01</span>
            Product &amp; web applications
            <b>{String(displayedProjects.length).padStart(2, "0")}</b>
          </button>
          <button
            id="live-tab"
            type="button"
            role="tab"
            aria-selected={workTab === "live"}
            aria-controls="live-panel"
            onClick={() => setWorkTab("live")}
          >
            <span>02</span>
            Live websites
            <b>{String(liveSites.length).padStart(2, "0")}</b>
          </button>
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {workTab === "products" ? (
            <motion.div
              key="products"
              id="products-panel"
              role="tabpanel"
              aria-labelledby="products-tab"
              className="project-list"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              {displayedProjects.map((project, index) => (
                <ProjectRow key={project.id} project={project} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="live"
              id="live-panel"
              role="tabpanel"
              aria-labelledby="live-tab"
              className="live-site-grid"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {liveSites.map((site, index) => (
                <LiveSiteCard key={site.id} site={site} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="profile-section" id="profile">
        <div className="profile-intro">
          <Reveal><p className="eyebrow">Profile / 02</p></Reveal>
          <Reveal amount={0.2}><h2>
            I care about the point where
            <em> usefulness becomes obvious.</em>
          </h2></Reveal>
        </div>

        <div className="profile-grid">
          <Reveal className="profile-copy">
            <p>
              My practice sits between strategy and craft. I work with teams to
              understand the real problem, make better product decisions, and
              shape interfaces that feel inevitable—not decorated.
            </p>
            <p>
              I’m most useful on complex platforms, zero-to-one products and
              systems that need a clearer point of view.
            </p>
          </Reveal>

          <div className="capability-list">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.7 }}
                transition={{ duration: reduceMotion ? 0.2 : 0.55, delay: reduceMotion ? 0 : index * 0.045, ease: [0.16, 1, 0.3, 1] }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{capability}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="experience-section">
        <Reveal className="section-heading">
          <p>Experience</p>
          <p>2023—Present</p>
        </Reveal>
        <div className="experience-list">
          {experience.map((item, index) => (
            <motion.div
              className="experience-row"
              key={item.period}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: reduceMotion ? 0.2 : 0.6, delay: reduceMotion ? 0 : index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <p>{item.period}</p>
              <h3>{item.role}</h3>
              <p>{item.company}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <Reveal><p className="eyebrow">Have a worthwhile problem?</p></Reveal>
        <Reveal amount={0.45}>
          <a href={settings.contact_email ? `mailto:${settings.contact_email}` : "#contact"} onClick={e=>{e.preventDefault();setContactOpen(true);}} data-event="contact_click" className="contact-title">
            Let’s make it clear.
            <ArrowUpRight aria-hidden="true" />
          </a>
        </Reveal>
        <Reveal className="contact-meta">
          <p>Open to product roles and thoughtful collaborations.</p>
          <div>
            <a href="https://www.linkedin.com/in/saadadam007/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://x.com/uiuxsaad" target="_blank" rel="noreferrer">X / Twitter</a>
            <a href="https://www.instagram.com/uiuxsaad/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </Reveal>
      </section>

      {contactOpen && <ContactDialog email={settings.contact_email} onClose={()=>setContactOpen(false)} />}
      <motion.footer
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <p>© {new Date().getFullYear()} Sa’ad Adam</p>
        <p>Product designer · Kwara, Nigeria</p>
        <a href="#top">Back to top ↑</a>
      </motion.footer>
    </main>
  );
}

function ProjectRow({ project, index }: { project: Project; index: number; key?: string | number }) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const indexY = useTransform(scrollYProgress, [0, 1], [12, -12]);
  const tiltXValue = useMotionValue(0);
  const tiltYValue = useMotionValue(0);
  const tiltX = useSpring(tiltXValue, { stiffness: 180, damping: 24, mass: 0.55 });
  const tiltY = useSpring(tiltYValue, { stiffness: 180, damping: 24, mass: 0.55 });

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    tiltXValue.set(y * -3.2);
    tiltYValue.set(x * 3.2);
  };

  const resetTilt = () => {
    tiltXValue.set(0);
    tiltYValue.set(0);
  };

  return (
    <motion.article
      ref={cardRef}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.99 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: reduceMotion ? 0.2 : 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="project-row"
    >
      <motion.div whileTap={reduceMotion ? undefined : { scale: 0.992 }}>
      <a data-event="project_click" data-target={project.id} href={project.href ? project.image : `/project/${project.id}`} aria-label={`${project.href ? "Preview" : "Read"} ${project.title}`}>
        <motion.div
          className="project-media"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
          style={reduceMotion ? undefined : { rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200 }}
        >
          <Cover project={project} />
          <motion.span className="project-index" style={reduceMotion ? undefined : { y: indexY }}>
            {String(index + 1).padStart(2, "0")}
          </motion.span>
          <span className="project-arrow"><ArrowUpRight strokeWidth={1.4} /></span>
        </motion.div>
        <motion.div
          className="project-info"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: reduceMotion ? 0.16 : 0.58, delay: reduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p>{String(index + 1).padStart(2, "0")} / {project.tag} / {project.year}</p>
            <h3>{formatText(project.title)}</h3>
            {project.featured && <small className="project-featured">Featured</small>}
          </div>
          <p className="project-summary">{formatText(project.description)}</p>
          <span className="project-case-link">
            {project.href ? "View preview" : "Read case study"} <ArrowUpRight aria-hidden="true" />
          </span>
        </motion.div>
      </a>
      </motion.div>
    </motion.article>
  );
}

function LiveSiteCard({ site, index }: { site: LiveSite; index: number; key?: string | number }) {
  const reduceMotion = useReducedMotion();

  const cardStyle = {
    "--card-accent": site.accent,
  } as CSSProperties;

  return (
    <motion.article
      className="live-site-card"
      style={cardStyle}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduceMotion ? 0.16 : 0.7, delay: reduceMotion ? 0 : index * 0.09, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="live-site-browser">
        <div className="live-site-browser-bar" aria-hidden="true">
          <div><span /><span /><span /></div>
          <p>{site.url ? site.url.replace(/^https?:\/\//, "") : "Deployment pending"}</p>
        </div>
        <div className={`live-site-scroll-window${site.preview_type === "video" ? " is-video" : ""}`}>
          {site.preview_type === "video" && site.video_url ? (
            <video
              src={site.video_url}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={`${site.title} website preview`}
            />
          ) : (
            <img
              src={site.image_url}
              alt={`${site.title} homepage preview`}
              loading="eager"
              decoding="async"
            />
          )}
        </div>
      </div>

      <div className="live-site-caption">
        <div>
          <p>{String(index + 1).padStart(2, "0")} / {site.category}</p>
          <h3>{site.title}</h3>
        </div>
        {site.url ? (
          <a data-event="live_click" data-target={site.id} href={site.url} target="_blank" rel="noreferrer">
            Visit site <ArrowUpRight aria-hidden="true" />
          </a>
        ) : (
          <span className="live-site-link" aria-disabled="true">
            Coming soon
          </span>
        )}
      </div>
    </motion.article>
  );
}

function Reveal({
  children,
  className,
  amount = 0.35,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.992 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduceMotion ? 0.2 : 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
