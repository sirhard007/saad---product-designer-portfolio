import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { formatText, formatHtml } from "./utils";

export default function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [nextProject, setNextProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress: pageProgress } = useScroll();
  const smoothProgress = useSpring(pageProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setProject(null);
    setNextProject(null);

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
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to="/"><ArrowLeft size={18} /> Selected work</Link>
        <span>SA’AD ADAM</span>
        <span>{project.year}</span>
      </motion.header>

      <section className="case-hero">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">{project.tag} / Case study</p>
          <h1>{formatText(project.title)}</h1>
          <p className="case-deck">{formatText(project.description)}</p>
        </motion.div>
      </section>

      <motion.div
        className="case-cover"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.99, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.46, delay: reduceMotion ? 0 : 0.04, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src={project.image}
          alt={`${project.title} project cover`}
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <section className="case-body">
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: reduceMotion ? 0 : 0.36, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>Project</p>
          <dl>
            <div><dt>Year</dt><dd>{project.year}</dd></div>
            <div><dt>Discipline</dt><dd>{project.tag}</dd></div>
          </dl>
        </motion.aside>
        <article
          className="case-content"
          dangerouslySetInnerHTML={{ __html: formatHtml(project.content) || "<p>Detailed case study coming soon.</p>" }}
        />
      </section>

      {nextProject && (
        <motion.section
          className="next-project"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
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
