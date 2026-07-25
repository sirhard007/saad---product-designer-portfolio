import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ReactNode, useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { formatText } from "./utils";

type Project = {
  id: string | number;
  title: string;
  description: string;
  image: string;
  tag: string;
  year: string;
};

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

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  useEffect(() => {
    fetch("/api/projects")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoaded(true));
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
      </motion.header>

      <section className="hero" id="top">
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
          <span className="hero-line">
            <motion.span
              initial={reduceMotion ? { opacity: 0 } : { y: "110%" }}
              animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
              transition={{ duration: reduceMotion ? 0.2 : 0.95, delay: reduceMotion ? 0 : 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              Designing clarity
            </motion.span>
          </span>
          <span className="hero-line">
            <motion.em
              initial={reduceMotion ? { opacity: 0 } : { y: "110%" }}
              animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
              transition={{ duration: reduceMotion ? 0.2 : 1, delay: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              into complex products.
            </motion.em>
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
            <a href="mailto:hello@example.com?subject=CV%20Request" className="cv-button">
              CV / Résumé <FileText size={16} strokeWidth={1.5} />
            </a>
          </div>
        </motion.div>
      </section>

      <section className="work-section" id="work">
        <Reveal className="section-heading">
          <p>Selected work</p>
          <p>{projects.length ? `${String(projects.length).padStart(2, "0")} case studies` : "Case studies"}</p>
        </Reveal>

        <div className="project-list">
          {projects.map((project, index) => (
            <ProjectRow key={project.id} project={project} index={index} />
          ))}

          {loaded && projects.length === 0 && (
            <div className="empty-work">
              <span>Case studies are being curated.</span>
              <p>
                In the meantime, I’m happy to walk through recent product work
                and process in a conversation.
              </p>
              <a href="mailto:hello@example.com">Request a private walkthrough</a>
            </div>
          )}
        </div>
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

function ProjectRow({ project, index }: { project: Project; index: number; key?: string | number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.99 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: reduceMotion ? 0.2 : 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="project-row"
    >
      <Link to={`/project/${project.id}`} aria-label={`Read ${project.title} case study`}>
        <div className="project-media">
          <img src={project.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
          <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="project-arrow"><ArrowUpRight strokeWidth={1.4} /></span>
        </div>
        <div className="project-info">
          <div>
            <p>{project.tag} · {project.year}</p>
            <h3>{formatText(project.title)}</h3>
          </div>
          <p>{formatText(project.description)}</p>
        </div>
      </Link>
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
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduceMotion ? 0.2 : 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
