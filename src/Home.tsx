import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, FileText, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { formatText } from "./utils";

type Project = {
  id: string | number;
  title: string;
  description: string;
  image: string;
  tag: string;
  year: string;
  href?: string;
};

type ArchiveProject = Project & {
  href: string;
  cta: string;
};

type LiveSite = {
  id: string;
  title: string;
  category: string;
  image: string;
  url: string;
  accent: string;
};

const archiveConcepts = [
  {
    id: "archive-ledgerly",
    title: "Ledgerly",
    description: "Finance without friction.",
    image: "/archive/ledgerly-dashboard.png?v=3",
    tag: "Fintech web app",
    year: "2026",
    href: "#work",
    cta: "Concept preview",
  },
  {
    id: "archive-caregrid",
    title: "CareGrid",
    description: "Care, clearly coordinated.",
    image: "/archive/caregrid-dashboard.png?v=3",
    tag: "Healthcare web app",
    year: "2026",
    href: "#work",
    cta: "Concept preview",
  },
] satisfies ArchiveProject[];

const liveSites = [
  {
    id: "korede-fitness",
    title: "Korede Fitness",
    category: "Fitness & wellness website",
    image: "/live/korede-fitness.png",
    url: "https://www.koredefitness.com",
    accent: "#12b9e8",
  },
  {
    id: "allahu-mubaraq",
    title: "Allahu Mubaraq Enterprises",
    category: "Industrial supply website",
    image: "/live/allahumubaraq.png",
    url: "https://www.allahumubaraq.com",
    accent: "#f26d21",
  },
  {
    id: "beta-nurse",
    title: "Beta Nurse",
    category: "Healthcare website",
    image: "/live/beta-nurse.png",
    url: "",
    accent: "#159c91",
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
    href: "#interface-archive",
  },
  {
    id: "fallback-apc-website",
    title: "APC Website",
    description: "A clearer civic website that makes party information and public participation easier to navigate.",
    image: "/archive/apc-website.png?v=3",
    tag: "Civic website",
    year: "2026",
    href: "#interface-archive",
  },
  {
    id: "fallback-saad-portfolio",
    title: "Sa’ad Adam Portfolio",
    description: "A focused portfolio experience built to present product thinking and interface work with clarity.",
    image: "/archive/saad-portfolio.png?v=3",
    tag: "Portfolio website",
    year: "2026",
    href: "#interface-archive",
  },
  {
    id: "fallback-ledgerly",
    title: "Ledgerly",
    description: "A financial workspace that turns account activity and risk signals into clear daily decisions.",
    image: "/archive/ledgerly-dashboard.png?v=3",
    tag: "Fintech web app",
    year: "2026",
    href: "#interface-archive",
  },
  {
    id: "fallback-caregrid",
    title: "CareGrid",
    description: "A healthcare operations dashboard for coordinating schedules, people and service delivery.",
    image: "/archive/caregrid-dashboard.png?v=3",
    tag: "Healthcare web app",
    year: "2026",
    href: "#interface-archive",
  },
] satisfies Project[];

function createArchiveProjects(projects: Project[]): ArchiveProject[] {
  const findProject = (...terms: string[]) => projects.find((project) => {
    const title = project.title.toLowerCase();
    return terms.some((term) => title.includes(term));
  });

  const afterRoundOne = findProject("after round one", "round one");
  const apcWebsite = findProject("apc", "congress");
  const portfolio = findProject("portfolio");

  return [
    {
      ...(afterRoundOne ?? {}),
      id: "archive-after-round-one",
      title: "After Round One",
      description: "Play. Compete. Connect.",
      image: "/archive/after-round-one.png?v=3",
      tag: afterRoundOne?.tag ?? "Multiplayer game UX",
      year: afterRoundOne?.year ?? "2026",
      href: afterRoundOne ? `/project/${afterRoundOne.id}` : "#work",
      cta: afterRoundOne ? "View case study" : "Project preview",
    },
    {
      ...(apcWebsite ?? {}),
      id: "archive-apc-website",
      title: "APC Website",
      description: "Progress made accessible.",
      image: "/archive/apc-website.png?v=3",
      tag: apcWebsite?.tag ?? "Civic website",
      year: apcWebsite?.year ?? "2026",
      href: apcWebsite ? `/project/${apcWebsite.id}` : "#work",
      cta: apcWebsite ? "View case study" : "Project preview",
    },
    {
      ...(portfolio ?? {}),
      id: "archive-saad-portfolio",
      title: "Sa'ad Adam Portfolio",
      description: "Design with intention.",
      image: "/archive/saad-portfolio.png?v=3",
      tag: portfolio?.tag ?? "Portfolio website",
      year: portfolio?.year ?? "2026",
      href: portfolio ? `/project/${portfolio.id}` : "#work",
      cta: portfolio ? "View case study" : "View selected work",
    },
    ...archiveConcepts,
  ];
}

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

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isArchiveActive, setIsArchiveActive] = useState(false);
  const [workTab, setWorkTab] = useState<"products" | "live">("products");
  const reduceMotion = useReducedMotion();
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });
  const heroLift = useTransform(scrollYProgress, [0, 0.2], [0, -72]);
  const heroFade = useTransform(scrollYProgress, [0, 0.17], [1, 0.45]);
  const displayedProjects = projects.length ? projects : fallbackProjects;

  useEffect(() => {
    fetch("/api/projects")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      menuTriggerRef.current?.focus();
    };
  }, [isMenuOpen]);

  return (
    <main className="site-shell">
      <motion.div
        className="scroll-progress"
        style={{ scaleX: smoothProgress }}
        aria-hidden="true"
      />
      <motion.header
        className={`topbar${isArchiveActive ? " topbar-dark" : ""}`}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.2 : 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <a className="wordmark" href="#top" aria-label="Sa'ad Adam, home">
          SA<span>’</span>AD ADAM
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#profile">Profile</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="availability" href="mailto:hello@example.com">
          <span aria-hidden="true" />
          Available for select projects
        </a>
        <button
          ref={menuTriggerRef}
          className="mobile-menu-trigger"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen(true)}
        >
          <span>Menu</span>
          <Menu size={19} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.28 }}
          >
            <button
              className="mobile-menu-backdrop"
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.aside
              id="mobile-navigation"
              className="mobile-menu-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
              animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: reduceMotion ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mobile-menu-head">
                <span>SA’AD ADAM</span>
                <button
                  ref={menuCloseRef}
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X size={21} strokeWidth={1.4} aria-hidden="true" />
                </button>
              </div>

              <nav className="mobile-menu-nav" aria-label="Mobile navigation links">
                {[
                  { index: "01", label: "Work", href: "#work" },
                  { index: "02", label: "Profile", href: "#profile" },
                  { index: "03", label: "Contact", href: "#contact" },
                ].map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.12 + index * 0.07, duration: reduceMotion ? 0.12 : 0.45 }}
                  >
                    <span>{item.index}</span>
                    {item.label}
                    <ArrowUpRight aria-hidden="true" />
                  </motion.a>
                ))}
              </nav>

              <div className="mobile-menu-footer">
                <a href={cvUrl} target="_blank" rel="noreferrer">
                  View CV <FileText size={16} strokeWidth={1.5} />
                </a>
                <div>
                  <a href="https://www.linkedin.com/in/saadadam007/" target="_blank" rel="noreferrer">LinkedIn</a>
                  <a href="https://x.com/uiuxsaad" target="_blank" rel="noreferrer">X</a>
                  <a href="https://www.instagram.com/uiuxsaad/" target="_blank" rel="noreferrer">Instagram</a>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section
        className="hero"
        id="top"
        style={reduceMotion ? undefined : { y: heroLift, opacity: heroFade }}
      >
        <motion.div
          className="hero-kicker"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.25 }}
        >
          <span>Product designer</span>
          <span>Based in Kwara, Nigeria · Working globally</span>
        </motion.div>

        <h1 aria-label="Designing clarity into complex products.">
          <span className="hero-line" aria-hidden="true">
            {["Designing", "clarity"].map((word, index) => (
              <motion.span
                className="hero-word"
                key={word}
                initial={reduceMotion ? { opacity: 0 } : { y: "118%", rotate: 2 }}
                animate={reduceMotion ? { opacity: 1 } : { y: 0, rotate: 0 }}
                transition={{ duration: reduceMotion ? 0.18 : 1.05, delay: reduceMotion ? index * 0.04 : 0.46 + index * 0.11, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span className="hero-line hero-line-serif" aria-hidden="true">
            {["into", "complex", "products."].map((word, index) => (
              <motion.em
                className="hero-word"
                key={word}
                initial={reduceMotion ? { opacity: 0 } : { y: "118%", rotate: 2 }}
                animate={reduceMotion ? { opacity: 1 } : { y: 0, rotate: 0 }}
                transition={{ duration: reduceMotion ? 0.18 : 1.05, delay: reduceMotion ? index * 0.04 : 0.62 + index * 0.09, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.em>
            ))}
          </span>
        </h1>

        <motion.div
          className="hero-footer"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.7, delay: reduceMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>
            I turn ambiguous problems into useful digital products—combining
            product thinking, interaction design and rigorous visual systems.
          </p>
          <div className="hero-actions">
            <a href="#work" className="text-link">
              View selected work <ArrowDown size={17} strokeWidth={1.5} />
            </a>
            <a href={cvUrl} target="_blank" rel="noreferrer" className="cv-button">
              CV / Résumé <FileText size={16} strokeWidth={1.5} />
            </a>
          </div>
        </motion.div>
      </motion.section>

      <InterfaceArchive projects={createArchiveProjects(projects)} onActiveChange={setIsArchiveActive} />

      <section className={`work-section work-hub${workTab === "live" ? " work-hub-live" : ""}`} id="work">
        <div className="work-hub-topline">
          <p>{workTab === "live" ? "Work archive / Live" : "Selected work / 2023—Now"}</p>
          <p>{workTab === "live" ? "03 sites · Available to visit" : `${String(displayedProjects.length).padStart(2, "0")} case studies`}</p>
        </div>

        <div className="work-hub-intro">
          <p className="work-hub-eyebrow">{workTab === "live" ? "Live website reel / 02" : "Product work / 01"}</p>
          <div>
            <h2>
              {workTab === "live" ? (
                <>Live websites, built<br />for real audiences.</>
              ) : (
                <>Digital products designed,<br />built and shipped.</>
              )}
            </h2>
            <p>
              {workTab === "live"
                ? "Selected website design and development work currently online."
                : "Explore product case studies across web applications, mobile experiences and interface systems."}
            </p>
          </div>
        </div>

        <div className="work-tabs" role="tablist" aria-label="Project categories">
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
            <b>03</b>
          </button>
        </div>

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
          <a href="mailto:hello@example.com" className="contact-title">
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

      <footer>
        <p>© {new Date().getFullYear()} Sa’ad Adam</p>
        <p>Product designer · Kwara, Nigeria</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}

function InterfaceArchive({
  projects,
  onActiveChange,
}: {
  projects: ArchiveProject[];
  onActiveChange: (active: boolean) => void;
}) {
  const archiveRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: archiveRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextIndex = Math.min(projects.length - 1, Math.floor(latest * projects.length));
    if (nextIndex === activeIndexRef.current) return;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  });

  const activeProject = projects[activeIndex];
  const echoProjects = [1, 2, 3].map((offset) => projects[(activeIndex - offset + projects.length) % projects.length]);
  const visualKind = activeProject.id === "archive-after-round-one"
    ? "device"
    : activeProject.id === "archive-apc-website" || activeProject.id === "archive-saad-portfolio"
      ? "canvas"
      : "cutout";

  useEffect(() => {
    projects.forEach((project) => {
      const image = new Image();
      image.decoding = "async";
      image.src = project.image;
    });
  }, [projects]);

  useEffect(() => {
    const section = archiveRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => onActiveChange(entry.isIntersecting),
      { rootMargin: "-1px 0px -70% 0px" },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      onActiveChange(false);
    };
  }, [onActiveChange]);

  return (
    <section
      ref={archiveRef}
      id="interface-archive"
      className="interface-archive"
      style={{ height: `${Math.max(projects.length, 2) * 86}svh` }}
      aria-label="Selected interface archive"
    >
      <div className="archive-stage">
        <div className="archive-topline">
          <p>Interface archive / 01—{String(projects.length).padStart(2, "0")}</p>
          <p>{String(activeIndex + 1).padStart(2, "0")} — {String(projects.length).padStart(2, "0")}</p>
        </div>

        <div className="archive-heading">
          <p>Interfaces that turn complexity into clarity.</p>
          <h2>
            Product decisions,
            <em> made visible.</em>
          </h2>
        </div>

        <div className={`archive-visual archive-visual-${visualKind}`}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={activeProject.id}
              src={activeProject.image}
              alt={`${activeProject.title} interface preview`}
              referrerPolicy="no-referrer"
              decoding="async"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>
        </div>

        <div className="archive-project">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={activeProject.id}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="archive-title-mask">
                <h3>{formatText(activeProject.title)}</h3>
              </div>
              <p className="archive-description">{formatText(activeProject.description)}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="archive-echoes" aria-hidden="true">
          {echoProjects.map((project, index) => (
            <img key={index} src={project.image} alt="" decoding="async" />
          ))}
        </div>

        <div className="archive-index-ghost" aria-hidden="true">
          {String(activeIndex + 1).padStart(2, "0")}
        </div>
        <div className="archive-scroll-note">Scroll to reorganize ↓</div>
      </div>
    </section>
  );
}

function ProjectRow({ project, index }: { project: Project; index: number; key?: string | number }) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
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
      <Link to={project.href ?? `/project/${project.id}`} aria-label={`Read ${project.title} case study`}>
        <motion.div
          className="project-media"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
          style={reduceMotion ? undefined : { rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200 }}
        >
          <motion.img
            src={project.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            style={reduceMotion ? undefined : { y: imageY }}
          />
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
            <p>{project.tag} · {project.year}</p>
            <h3>{formatText(project.title)}</h3>
          </div>
          <p>{formatText(project.description)}</p>
        </motion.div>
      </Link>
      </motion.div>
    </motion.article>
  );
}

function LiveSiteCard({ site, index }: { site: LiveSite; index: number }) {
  const reduceMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [previewReady, setPreviewReady] = useState(false);

  const measurePreview = () => {
    const viewport = viewportRef.current;
    const image = imageRef.current;
    if (!viewport || !image) return;

    const distance = Math.max(0, image.offsetHeight - viewport.clientHeight);
    image.style.setProperty("--site-scroll-distance", `${distance}px`);
    setPreviewReady(true);
  };

  useEffect(() => {
    const handleResize = () => measurePreview();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cardStyle = {
    "--card-accent": site.accent,
    "--site-delay": `${index * 0.18}s`,
  } as CSSProperties;

  return (
    <motion.article
      className="live-site-card"
      style={cardStyle}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 46 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.16 : 0.7, delay: reduceMotion ? 0 : index * 0.09, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="live-site-browser">
        <div className="live-site-browser-bar" aria-hidden="true">
          <div><span /><span /><span /></div>
          <p>{site.url ? site.url.replace(/^https?:\/\//, "") : "Deployment pending"}</p>
          <em>Auto-scroll</em>
        </div>
        <div ref={viewportRef} className="live-site-scroll-window">
          <img
            ref={imageRef}
            className={previewReady ? "is-ready" : ""}
            src={site.image}
            alt={`${site.title} homepage preview`}
            loading="eager"
            decoding="async"
            onLoad={measurePreview}
          />
        </div>
      </div>

      <div className="live-site-caption">
        <div>
          <p>{String(index + 1).padStart(2, "0")} / {site.category}</p>
          <h3>{site.title}</h3>
        </div>
        {site.url ? (
          <a href={site.url} target="_blank" rel="noreferrer">
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
