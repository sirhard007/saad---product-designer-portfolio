import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { formatText, formatHtml } from "./utils";

export default function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [nextProject, setNextProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();
  const coverRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pageProgress } = useScroll();
  const { scrollYProgress: coverProgress } = useScroll({
    target: coverRef,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(pageProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const coverY = useTransform(coverProgress, [0, 1], ["-5%", "5%"]);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([fetch(`/api/projects/${id}`), fetch("/api/projects")])
      .then(async ([projectResponse, projectsResponse]) => {
        if (!projectResponse.ok) throw new Error("Project not found");
        const current = await projectResponse.json();
        const all = projectsResponse.ok ? await projectsResponse.json() : [];
        setProject(current);
        if (Array.isArray(all) && all.length > 1) {
          const index = all.findIndex((item) => String(item.id) === String(id));
          setNextProject(all[(index + 1) % all.length]);
        }
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!project) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".case-content > *"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
    );

    elements.forEach((element, index) => {
      element.classList.add("case-reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 55}ms`);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [project]);

  if (loading) {
    return <div className="project-state">Loading case study…</div>;
  }

  if (!project) {
    return (
      <div className="project-state">
        <p>This case study could not be found.</p>
        <Link to="/">Return to selected work</Link>
      </div>
    );
  }

  return (
    <main className="case-study">
      <motion.div
        className="scroll-progress"
        style={{ scaleX: smoothProgress }}
        aria-hidden="true"
      />
      <motion.header
        className="case-nav"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to="/"><ArrowLeft size={18} /> Selected work</Link>
        <span>SA’AD ADAM</span>
        <span>{project.year}</span>
      </motion.header>

      <section className="case-hero">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">{project.tag} / Case study</p>
          <h1>{formatText(project.title)}</h1>
          <p className="case-deck">{formatText(project.description)}</p>
        </motion.div>
      </section>

      <motion.div
        ref={coverRef}
        className="case-cover"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.975, y: 24 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0.2 : 0.9, delay: reduceMotion ? 0 : 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={project.image}
          alt={`${project.title} project cover`}
          referrerPolicy="no-referrer"
          style={reduceMotion ? undefined : { y: coverY }}
        />
      </motion.div>

      <section className="case-body">
        <motion.aside
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>Project</p>
          <dl>
            <div><dt>Year</dt><dd>{project.year}</dd></div>
            <div><dt>Discipline</dt><dd>{project.tag}</dd></div>
          </dl>
        </motion.aside>
        <motion.article
          className="case-content"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.75, delay: reduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
          dangerouslySetInnerHTML={{ __html: formatHtml(project.content) || "<p>Detailed case study coming soon.</p>" }}
        />
      </section>

      {nextProject && (
        <motion.section
          className="next-project"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.7 }}
        >
          <p>Next case study</p>
          <motion.div whileTap={reduceMotion ? undefined : { scale: 0.992 }}>
          <Link to={`/project/${nextProject.id}`}>
            {formatText(nextProject.title)}
            <ArrowUpRight />
          </Link>
          </motion.div>
        </motion.section>
      )}

      <footer>
        <p>© {new Date().getFullYear()} Sa’ad Adam</p>
        <p>Product designer · Kwara, Nigeria</p>
        <Link to="/">All projects ↑</Link>
      </footer>
    </main>
  );
}
