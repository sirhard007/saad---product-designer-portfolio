import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatText, formatHtml } from "./utils";

export default function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [nextProject, setNextProject] = useState<any>(null);
  const [otherProjects, setOtherProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Ensure page starts at the top when navigating
      try {
        const [projectRes, allProjectsRes] = await Promise.all([
          fetch("/api/projects/" + id),
          fetch("/api/projects")
        ]);
        
        let currentProjectData = null;
        if (projectRes.ok) {
          const data = await projectRes.json();
          if (data && !data.error) {
            currentProjectData = data;
          }
        }
        setProject(currentProjectData);

        if (allProjectsRes.ok) {
          const allProjectsData = await allProjectsRes.json();
          if (Array.isArray(allProjectsData)) {
            // Find current index to determine the next project
            const currentIndex = allProjectsData.findIndex(p => String(p.id) === String(id));
            if (currentIndex !== -1 && allProjectsData.length > 1) {
              const nextProj = allProjectsData[(currentIndex + 1) % allProjectsData.length];
              setNextProject(nextProj);
            } else {
              setNextProject(null);
            }

            // Filter out the current project to show previews of the rest
            const others = allProjectsData.filter(p => String(p.id) !== String(id));
            setOtherProjects(others);
          }
        }
      } catch (err) {
        console.error("Failed to load data", err);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-serif italic mb-4">Project Not Found</h1>
        <Link to="/" className="text-accent hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white selection:bg-accent selection:text-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-dark/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs uppercase tracking-widest font-bold">Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-accent rounded-sm rotate-45 flex items-center justify-center">
            <div className="w-1 h-1 bg-dark rounded-full" />
          </div>
          <span className="font-bold text-sm tracking-tight uppercase">Saad</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="break-words w-full"
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-widest text-accent">
              {project.tag}
            </span>
            <span className="text-xs text-white/40 font-mono">{project.year}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic tracking-tighter leading-[0.9] mb-8 break-words">
            {formatText(project.title)}
          </h1>
          
          <p className="text-xl text-white/60 leading-relaxed whitespace-pre-wrap break-words">
            {formatText(project.description)}
          </p>
        </motion.div>
      </section>

      {/* Hero Image */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="px-6 max-w-7xl mx-auto mb-16"
      >
        <div className="w-full aspect-video rounded-[2rem] overflow-hidden border border-white/10">
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.section>

      {/* Content Section */}
      <section className="px-6 max-w-7xl mx-auto pb-24 border-b border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="prose prose-invert prose-lg md:prose-xl max-w-none prose-headings:font-sans prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-a:text-accent hover:prose-a:text-white prose-img:rounded-[2rem] prose-img:border prose-img:border-white/10 prose-p:text-white/70 prose-p:leading-relaxed prose-strong:text-white break-words w-full overflow-hidden"
          dangerouslySetInnerHTML={{ __html: formatHtml(project.content) || '<p>No detailed content available.</p>' }}
        />
      </section>

      {/* Next Project CTA */}
      {nextProject && (
        <section className="px-6 py-32 max-w-7xl mx-auto border-b border-white/5 text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/30 mb-8 block">Up Next</span>
            <Link to={`/project/${nextProject.id}`} className="group inline-block">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif italic tracking-tighter text-white group-hover:text-accent transition-colors duration-500 mb-12">
                {formatText(nextProject.title)}
              </h2>
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mx-auto group-hover:bg-accent group-hover:border-accent group-hover:text-dark group-hover:scale-110 transition-all duration-500">
                <ArrowRight className="w-6 h-6" />
              </div>
            </Link>
          </motion.div>
        </section>
      )}

      {/* More Projects Section */}
      {otherProjects.length > 0 && (
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-16"
          >
            <div className="w-12 h-px bg-accent" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/30">More Projects</span>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherProjects.map((p, i) => (
              <Link to={`/project/${p.id}`} key={p.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group block rounded-[2.5rem] bg-surface/40 border border-white/5 overflow-hidden hover:border-accent/30 transition-all duration-500"
                >
                  <div className="w-full aspect-video overflow-hidden">
                    <img 
                      src={p.image} 
                      alt={p.title} 
                      className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-4 py-1.5 rounded-full bg-white/5 text-[9px] uppercase font-bold tracking-widest text-accent">
                        {p.tag}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">{p.year}</span>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-serif italic text-white group-hover:text-accent transition-colors duration-300">
                      {formatText(p.title)}
                    </h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
