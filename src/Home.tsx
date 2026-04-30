import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from "motion/react";
import { useRef, useState, useEffect, MouseEvent } from "react";
import { ArrowUpRight, Plus, ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { formatText } from "./utils";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load projects. Status:", res.status, "Body:", text);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error("Projects data is not an array:", data);
          setProjects([]);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
        setProjects([]);
      }
    };
    loadProjects();
  }, []);

  return (
    <div className="min-h-screen bg-dark overflow-x-hidden selection:bg-accent selection:text-dark">
      {/* Navigation */}
      <div className="fixed top-8 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto bg-surface/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-6 md:gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-2 md:pr-8 md:border-r border-white/5">
            <div className="w-4 h-4 bg-accent rounded-sm rotate-45 flex items-center justify-center">
              <div className="w-1 h-1 bg-dark rounded-full" />
            </div>
            <span className="font-bold text-sm tracking-tight uppercase">Saad</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
          </div>

          <a href="#contact" className="hidden md:block bg-white text-dark px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all active:scale-95">
            Contact
          </a>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white transition-colors pointer-events-auto flex items-center justify-center"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.nav>
      </div>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={false}
        animate={isMenuOpen ? { opacity: 1, visibility: "visible" } : { opacity: 0, visibility: "hidden" }}
        className="fixed inset-0 z-40 bg-dark/95 backdrop-blur-2xl md:hidden flex flex-col items-center justify-center gap-8"
      >
        <div className="flex flex-col items-center gap-8 text-2xl font-medium tracking-tighter">
          <a href="#projects" onClick={() => setIsMenuOpen(false)} className="hover:text-accent transition-colors">Projects</a>
          <a href="#experience" onClick={() => setIsMenuOpen(false)} className="hover:text-accent transition-colors">Experience</a>
        </div>
        <a 
          href="#contact" 
          onClick={() => setIsMenuOpen(false)}
          className="mt-8 bg-white text-dark px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-accent transition-all"
        >
          Contact Me
        </a>
      </motion.div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-40 px-6 overflow-hidden">
        {/* Centered Faded Circle Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-green-500 rounded-full opacity-[0.06] blur-[120px] md:blur-[150px] pointer-events-none" />
        
        <div className="relative w-full max-w-7xl mx-auto flex flex-col items-center">
          {/* Status Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-12 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.02)]"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent shadow-[0_0_10px_#99ff00]"></span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">Available for work</span>
          </motion.div>

          {/* Main Heading - Staggered Reveal */}
          <div className="relative z-0 text-center mb-10 w-full flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/60 font-medium text-lg md:text-2xl mb-4 tracking-wide"
            >
              Hi, I'm <span className="text-accent/90 font-semibold">Sa'ad Adam</span>
            </motion.div>
            
            <motion.h1 
              className="text-[14vw] lg:text-[11rem] font-bold leading-[0.8] tracking-tighter w-full max-w-6xl mx-auto flex flex-col pt-4 md:pt-8"
            >
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
                className="text-white/50 relative z-0 text-left md:ml-4"
              >
                Product
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
                className="text-white/50 relative z-10 text-right md:mr-4 mt-0 md:-mt-4"
              >
                Designer
              </motion.div>
            </motion.h1>
          </div>

          {/* Subtitle & CTA Area */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="w-full mt-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left relative z-20 pb-16"
          >
            <p className="text-white/60 text-base md:text-xl leading-relaxed max-w-xl">
              I design intuitive, scalable digital products that simplify complex user experiences and drive real impact.
            </p>
            <motion.a 
              href="#contact"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group shrink-0 inline-flex items-center gap-3 text-white pb-2 border-b border-white/20 font-bold text-[13px] tracking-widest uppercase transition-all hover:text-accent hover:border-accent"
            >
              <span>Let's Talk</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="py-40 px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-px bg-accent" />
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/30">(01) Featured Projects</span>
            </div>
            <h2 className="text-6xl md:text-9xl font-serif italic tracking-tighter leading-[0.85]">
              Showcasing <br />
              <span className="text-white/20">Digital Excellence</span>
            </h2>
          </motion.div>
        </div>

        <div className="flex flex-col gap-12">
          {projects.map((project, i) => (
            <PremiumProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-40 px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">(02) My Experience</span>
            </div>
            
            {/* Stamp/Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="relative w-56 h-56 flex items-center justify-center"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-white/10 rounded-full" 
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-6 border border-white/5 rounded-full border-dashed" 
              />
              <div className="text-center relative z-10">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-14 h-14 mx-auto mb-3 border border-white/20 rounded-full flex items-center justify-center bg-dark/50 backdrop-blur-sm"
                >
                  <div className="w-7 h-7 border-2 border-accent rounded-full animate-pulse" />
                </motion.div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/30">Award Winning<br />Design</span>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-8" ref={containerRef}>
            <div className="text-4xl md:text-5xl font-medium leading-[1.2] text-white/10 mb-16 max-w-3xl">
              {"I design digital products that remove friction, clarify complex ideas, and scale with growing businesses. My work blends strategy, interface design, and real-world constraints to deliver systems that are intuitive, consistent, and built to last beyond trends.".split(" ").map((word, i, arr) => {
                const start = i / arr.length;
                const end = start + (1 / arr.length);
                return <Word key={i} progress={scrollYProgress} range={[start, end]}>{word}</Word>
              })}
            </div>
            
            <motion.a 
              href="#contact"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex bg-surface border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-sm items-center gap-3 hover:bg-white hover:text-dark transition-all shadow-lg"
            >
              Get in touch
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.a>
          </div>
        </div>

        {/* Experience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            { year: "2025 - Present", role: "Product Designer", company: "Zulaiy Hub", type: "Full-time" },
            { year: "2024 - 2025", role: "Freelance Designer", company: "Upwork", type: "Freelance" },
            { year: "2023 - 2024", role: "Intern Product Designer", company: "C80", type: "Internship" }
          ].map((exp, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.215, 0.61, 0.355, 1] }}
              whileHover={{ y: -10 }}
              className="bg-surface/40 border border-white/5 p-10 rounded-[2.5rem] hover:border-accent/30 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.div
                  animate={{ rotate: [0, 90, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Plus className="w-6 h-6 text-accent" />
                </motion.div>
              </div>
              <div className="flex justify-between items-start mb-16">
                <span className="text-xs text-white/30 font-medium">{exp.year}</span>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-accent/40 transition-colors">
                  <motion.div 
                    animate={i === 0 ? { scale: [1, 1.5, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={"w-2 h-2 rounded-full transition-colors " + (i === 0 ? 'bg-accent' : 'bg-white/10 group-hover:bg-accent')} 
                  />
                </div>
              </div>
              <h3 className="text-3xl font-medium mb-3 group-hover:text-accent transition-colors">{exp.role}</h3>
              <div className="flex items-center gap-4 mt-10">
                <span className="px-4 py-1.5 rounded-full bg-white/5 text-[10px] uppercase font-bold text-white/30">{exp.type}</span>
                <span className="text-sm text-white/50">{exp.company}</span>
              </div>
              <div className="mt-12 text-right text-[11px] font-bold text-white/10 tracking-widest">0{i + 1}</div>
              
              {/* Subtle background glow on hover */}
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-40 px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
                }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-12 h-px bg-accent" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/30">(03) Get in Touch</span>
              </motion.div>
              
              <motion.h2 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
                }}
                className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-[0.85] mb-8"
              >
                Let's build <br />
                <span className="text-white/20">something great.</span>
              </motion.h2>
              
              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
                }}
                className="text-white/40 text-lg leading-relaxed max-w-md mb-12"
              >
                I'm currently available for freelance projects and full-time opportunities. If you have a project that needs some creative magic, I'd love to hear about it.
              </motion.p>
              
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
                }}
              >
                <motion.a 
                  href="mailto:hello@example.com"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-4 bg-accent text-dark px-8 py-5 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white transition-colors"
                >
                  Start a Conversation
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
              </motion.div>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
              className="aspect-square rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-white/5 rounded-full border-dashed" 
              />
              <div className="absolute inset-10 border border-white/5 rounded-full" />
              <div className="absolute inset-20 border border-white/5 rounded-full" />
              
              <div className="text-center relative z-10">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="block text-4xl font-serif italic text-white mb-2"
                >
                  Available
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="block text-[10px] uppercase tracking-widest font-bold text-accent"
                >
                  For New Projects
                </motion.span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-accent rounded-sm rotate-45 flex items-center justify-center">
              <div className="w-1 h-1 bg-dark rounded-full" />
            </div>
            <span className="font-bold text-sm tracking-tight uppercase">Saad</span>
          </div>
          
          <div className="flex items-center gap-8">
            {[
              { name: 'Instagram', url: 'https://www.instagram.com/uiuxsaad/' },
              { name: 'Twitter/X', url: 'https://x.com/uiuxsaad' },
              { name: 'LinkedIn', url: 'https://www.linkedin.com/in/saadadam007/' }
            ].map((social) => (
              <a 
                key={social.name} 
                href={social.url} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-accent transition-colors"
              >
                {social.name}
              </a>
            ))}
          </div>

          <div className="text-[10px] uppercase tracking-widest font-bold text-white/20">
            © {new Date().getFullYear()} All Rights Reserved
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          width: fit-content;
        }
      `}</style>
    </div>
  );
}

function PremiumProjectCard({ project, index }: any) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <Link to={"/project/" + project.id}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: index * 0.1 }}
        onMouseMove={handleMouseMove}
        className="group relative rounded-[2.5rem] bg-surface/40 border border-white/5 overflow-hidden cursor-pointer block"
      >
        {/* Spotlight Glow */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(153, 255, 0, 0.1),
                transparent 80%
              )
            `,
          }}
        />

        <div className="relative p-4 md:p-6 flex flex-col md:flex-row gap-8 h-full">
          {/* Image Frame */}
          <div className="relative w-full md:w-7/12 aspect-[4/3] md:aspect-auto md:h-[500px] rounded-[2rem] overflow-hidden">
            <motion.img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
              referrerPolicy="no-referrer"
            />
            
            {/* Floating Badges */}
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] uppercase font-bold tracking-widest text-white">
                {project.tag}
              </span>
            </div>
            <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 group-hover:text-accent group-hover:border-accent/50 transition-colors duration-500">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-4 pt-4 md:pt-8 flex flex-col flex-1 justify-between">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <span className="font-mono text-xs text-accent">0{index + 1}</span>
                <div className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-xs text-white/40">{project.year}</span>
              </div>
              <h3 className="text-4xl md:text-6xl font-serif italic tracking-tighter text-white mb-6 group-hover:text-accent transition-colors duration-500">
                {formatText(project.title)}
              </h3>
              <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-sm">
                {formatText(project.description)}
              </p>
            </div>
            
            <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold group-hover:text-white transition-colors duration-500">
                Explore Case Study
              </span>
              <div className="w-8 h-px bg-white/30 group-hover:w-16 group-hover:bg-accent transition-all duration-500" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function Word({ children, progress, range }: { children: string, progress: any, range: [number, number], key?: any }) {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative inline-block mr-3">
      <span className="absolute opacity-20">{children}</span>
      <motion.span style={{ opacity }} className="text-white">
        {children}
      </motion.span>
    </span>
  );
}
