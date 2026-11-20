import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion'
import {
  Github,
  Linkedin,
  Mail,
  Download,
  User,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  FolderGit2,
  Code2,
  Cpu,
  Brain,
  Layers,
  Send,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  ArrowUp
} from 'lucide-react'
import { usePortfolioData, type Row } from '../lib/data'
import { supabase } from '../lib/supabase'

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' }
]

const SKILL_CATS = [
  'Programming Languages',
  'Frontend Development',
  'Backend Development',
  'AI & Machine Learning',
  'Data Analytics',
  'Tools & Technologies'
]

// Section wrapper with smooth scroll-in animation
function Section({
  id,
  badge,
  title,
  subtitle,
  children
}: {
  id: string
  badge: string
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.section
      id={id}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      className="mx-auto max-w-6xl px-6 py-20 sm:py-24"
    >
      <div className="mb-12">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sage">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" />
          {badge}
        </div>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {subtitle && <p className="mt-3 max-w-2xl text-base text-mute sm:text-lg">{subtitle}</p>}
      </div>
      {children}
    </motion.section>
  )
}

// Elegant empty state placeholder
function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref
}: {
  icon: React.ElementType
  title: string
  description: string
  actionText?: string
  actionHref?: string
}) {
  return (
    <div className="glass-card mx-auto flex max-w-md flex-col items-center p-8 text-center sm:p-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage/10 text-sage">
        <Icon size={26} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink sm:text-lg">{title}</h3>
      <p className="mt-2 text-sm text-mute leading-relaxed">{description}</p>
      {actionText && actionHref && (
        <a href={actionHref} className="btn btn-o mt-5 !text-xs !py-2">
          {actionText} <ChevronRight size={14} />
        </a>
      )}
    </div>
  )
}

// Skeleton card for loading state
function SkeletonCard({ count = 3, height = 'h-48' }: { count?: number; height?: string }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`glass-card ${height} animate-pulse p-6`}>
          <div className="h-4 w-1/3 rounded-md bg-sage2/30" />
          <div className="mt-4 h-6 w-3/4 rounded-md bg-sage2/40" />
          <div className="mt-3 h-4 w-full rounded-md bg-sage2/20" />
          <div className="mt-2 h-4 w-2/3 rounded-md bg-sage2/20" />
        </div>
      ))}
    </div>
  )
}

// Hero section with fluid sizing, non-colliding badges, and parallax
function Hero({ p, isReady }: { p: Row; isReady: boolean }) {
  const prefersReduced = useReducedMotion()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 60, damping: 15 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  const tiltX = useTransform(smoothX, (v) => v * 12)
  const tiltY = useTransform(smoothY, (v) => v * 12)

  // Clean greeting to avoid awkwardly repeating the full name
  const greetingText = useMemo(() => {
    const raw = p.greeting || "Hello, I'm"
    // Remove "Earnest Abraham" from greeting string if present so name isn't duplicated
    const cleaned = raw.replace(/Earnest\s+Abraham/gi, '').replace(/\s*,\s*👋/, ' 👋').trim()
    return cleaned || "Hello, I'm 👋"
  }, [p.greeting])

  const nameText = p.name || 'Earnest Abraham E A'
  const titleText = p.title || 'AI & Data Science Engineer | Full-Stack Developer'
  const introText =
    p.intro ||
    "I'm an AI & Data Science Engineering student passionate about building intelligent solutions and transforming ideas into meaningful digital experiences."

  // Planned geometric floating badges anchored securely outside the portrait circle
  const floatingTags = [
    { label: 'AI & ML', icon: Brain, position: 'top-3 -left-4 sm:-left-6' },
    { label: 'Full-Stack', icon: Code2, position: 'top-10 -right-4 sm:-right-6' },
    { label: 'Python & Data', icon: Cpu, position: 'bottom-16 -left-5 sm:-left-7' },
    { label: 'UI/UX Design', icon: Sparkles, position: 'bottom-8 -right-4 sm:-right-6' }
  ]

  return (
    <section
      id="home"
      onMouseMove={(e) => {
        if (prefersReduced) return
        mouseX.set(e.clientX / window.innerWidth - 0.5)
        mouseY.set(e.clientY / window.innerHeight - 0.5)
      }}
      className="relative mx-auto flex min-h-[90vh] max-w-6xl items-center px-6 pt-28 pb-16 lg:min-h-screen lg:pt-32"
    >
      <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Hero Content */}
        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="lg:col-span-7"
        >
          {/* Greeting Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-sage/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-sage">
            <span className="flex h-2 w-2 rounded-full bg-sage animate-ping" />
            <span className="text-sm">👋</span>
            <span>{greetingText}</span>
          </div>

          {/* Fluid Typography Name Heading */}
          <h1 className="mt-4 text-[clamp(2.15rem,5.2vw,3.75rem)] font-bold tracking-tight text-ink font-head leading-[1.12]">
            {nameText}
          </h1>

          {/* Role / Subtitle */}
          <p className="mt-3 text-base font-medium text-sage sm:text-lg md:text-xl">
            {titleText}
          </p>

          {/* Intro Paragraph */}
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-mute sm:text-base">
            {introText}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <a href="#projects" className="btn btn-p shadow-sm hover:shadow-md">
              Explore My Work <ArrowUpRight size={16} />
            </a>
            <a href="#contact" className="btn btn-o">
              Let's Connect
            </a>
            {p.resume_url && (
              <a
                href={p.resume_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost !px-3.5"
                title="View Resume"
              >
                <Download size={15} />
                <span className="hidden sm:inline">Resume</span>
              </a>
            )}
          </div>

          {/* Social Links */}
          <div className="mt-9 flex items-center gap-4 text-mute">
            <span className="text-xs uppercase tracking-wider text-mute/70 font-semibold">
              Find me on
            </span>
            <div className="h-px w-6 bg-white/[0.1]" />
            <div className="flex items-center gap-2.5">
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub Profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-surface text-ink transition-all hover:border-sage hover:bg-sage hover:text-white"
                >
                  <Github size={17} />
                </a>
              )}
              {p.linkedin && (
                <a
                  href={p.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn Profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-surface text-ink transition-all hover:border-sage hover:bg-sage hover:text-white"
                >
                  <Linkedin size={17} />
                </a>
              )}
              {p.email && (
                <a
                  href={`mailto:${p.email}`}
                  aria-label="Send Email"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-surface text-ink transition-all hover:border-sage hover:bg-sage hover:text-white"
                >
                  <Mail size={17} />
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Hero Portrait Composition with Glowing Gradient Ring & Soft Edge Dissolve */}
        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative mx-auto flex items-center justify-center w-full max-w-[380px] sm:max-w-[420px] lg:col-span-5"
        >
          {/* Echo of the glowing ring from portrait: Soft ambient blur glow */}
          <div
            className="absolute h-72 w-72 sm:h-80 sm:w-80 rounded-full opacity-40 blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #9277E0 0%, #6F8FFF 50%, #7CB4FF 100%)'
            }}
          />

          {/* Thin CSS Gradient Ring (Violet -> Blue -> Light Blue) */}
          <motion.div
            style={prefersReduced ? {} : { x: tiltX, y: tiltY }}
            className="relative flex items-center justify-center aspect-square w-full"
          >
            {/* The Gradient Ring */}
            <div
              className="absolute inset-4 sm:inset-3 rounded-full p-[2px] transition-transform duration-700"
              style={{
                background: 'linear-gradient(135deg, #9277E0 0%, #6F8FFF 50%, #7CB4FF 100%)',
                boxShadow: '0 0 40px -10px rgba(111, 143, 255, 0.35)'
              }}
            >
              <div className="h-full w-full rounded-full bg-paper" />
            </div>

            {/* Portrait Image dissolving seamlessly into page background with radial mask */}
            <div
              className="relative z-10 flex h-[340px] w-[340px] sm:h-[390px] sm:w-[390px] items-center justify-center overflow-hidden"
              style={{
                WebkitMaskImage: 'radial-gradient(circle at center, black 58%, transparent 72%)',
                maskImage: 'radial-gradient(circle at center, black 58%, transparent 72%)'
              }}
            >
              {p.photo_url ? (
                <img
                  src={p.photo_url}
                  alt={p.name || 'Earnest Abraham Portrait'}
                  fetchPriority="high"
                  decoding="async"
                  width="400"
                  height="400"
                  className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-xs text-mute">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage">
                    <User size={32} />
                  </div>
                  <span className="mt-3 font-medium">Portrait Photo</span>
                  <span className="mt-1 text-mute/80">Configure in Admin &rarr; Profile</span>
                </div>
              )}
            </div>

            {/* Non-colliding Floating Skill Badges on Ring Perimeter */}
            {floatingTags.map((tag) => {
              const TagIcon = tag.icon
              return (
                <motion.div
                  key={tag.label}
                  animate={prefersReduced ? {} : { y: [0, -5, 0] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: Math.random() * 2
                  }}
                  className={`glass absolute z-20 hidden sm:flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink shadow-lg border border-white/[0.12] ${tag.position}`}
                >
                  <TagIcon size={13} className="text-accent" />
                  <span>{tag.label}</span>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  const { profile: p, skills: sk, projects: pr, experience: ex, education: ed, certifications: ce, posts: po, isReady } =
    usePortfolioData()

  const [activeSection, setActiveSection] = useState('home')
  const [selectedCat, setSelectedCat] = useState('All')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactStatus, setContactStatus] = useState<'' | 'sending' | 'sent' | 'error'>('')
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)

      const sections = ['home', ...NAV_ITEMS.map((n) => n.id)]
      const scrollPos = window.scrollY + 200

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Project categories
  const projectCategories = useMemo(() => {
    const cats = Array.from(new Set((pr ?? []).map((r) => r.category).filter(Boolean)))
    return ['All', ...cats]
  }, [pr])

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (selectedCat === 'All') return pr ?? []
    return (pr ?? []).filter((r) => r.category === selectedCat)
  }, [pr, selectedCat])

  // Send contact message
  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    setContactStatus('sending')

    try {
      const { error } = await supabase.from('messages').insert({
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
      })

      if (error) {
        setContactStatus('error')
      } else {
        setContactStatus('sent')
        form.reset()
        setTimeout(() => setContactStatus(''), 5000)
      }
    } catch {
      setContactStatus('error')
    }
  }

  return (
    <div className="relative min-h-screen bg-paper text-ink selection:bg-sage/20 selection:text-ink">
      {/* Sticky Header Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-paper/85 backdrop-blur-md transition-all">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-1.5 font-head text-lg font-bold tracking-tight text-ink"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage text-white text-xs font-semibold">
              EA
            </span>
            <span>Earnest</span>
            <span className="text-sage">.</span>
          </a>

          {/* Desktop Nav Items */}
          <div className="hidden items-center gap-6 text-sm md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`relative py-1 text-xs font-medium uppercase tracking-wider transition-colors ${
                    isActive ? 'text-sage font-semibold' : 'text-mute hover:text-ink'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-sage"
                    />
                  )}
                </a>
              )
            })}
          </div>

          {/* Header Action: Resume & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {p.resume_url && (
              <a
                href={p.resume_url}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex btn btn-p !py-1.5 !px-3.5 !text-xs"
              >
                <Download size={13} />
                Resume
              </a>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-surface text-ink md:hidden"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobile Slide-down Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-white/[0.06] bg-paper/95 px-6 py-6 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-3">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-mute hover:bg-white/[0.06] hover:text-ink"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={15} className="text-sage" />
                  </a>
                ))}
                {p.resume_url && (
                  <a
                    href={p.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-p mt-3 justify-center !py-2 text-xs"
                  >
                    <Download size={14} /> Download Resume
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero p={p} isReady={isReady} />

        {/* About Section */}
        <Section id="about" badge="Overview" title="About Me" subtitle="My background, academic journey, and engineering mindset.">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="glass-card p-6 sm:p-8">
                <h3 className="font-head text-xl font-semibold text-ink sm:text-2xl">
                  Engineering Intelligent Digital Experiences
                </h3>
                <div className="mt-4 whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-ink/85 space-y-4">
                  {p.about || (
                    <p className="text-mute">
                      Passionate about exploring emerging technologies, developing practical software
                      solutions, and creating intuitive user experiences.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-5">
              {p.education_summary && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 text-sage">
                    <GraduationCap size={18} />
                    <h4 className="text-sm font-semibold uppercase tracking-wider">
                      Academic Background
                    </h4>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-mute leading-relaxed whitespace-pre-wrap">
                    {p.education_summary}
                  </p>
                </div>
              )}

              {p.interests && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 text-sage">
                    <Brain size={18} />
                    <h4 className="text-sm font-semibold uppercase tracking-wider">
                      Technical Interests
                    </h4>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-mute leading-relaxed whitespace-pre-wrap">
                    {p.interests}
                  </p>
                </div>
              )}

              {p.strengths && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 text-sage">
                    <Sparkles size={18} />
                    <h4 className="text-sm font-semibold uppercase tracking-wider">
                      Core Strengths
                    </h4>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-mute leading-relaxed whitespace-pre-wrap">
                    {p.strengths}
                  </p>
                </div>
              )}

              {p.resume_url && (
                <a
                  href={p.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-o w-full justify-center !py-2.5 text-xs font-medium"
                >
                  <Download size={15} /> Download Full Resume
                </a>
              )}
            </div>
          </div>
        </Section>

        {/* Skills Section */}
        <Section id="skills" badge="Proficiencies" title="Technical Skills" subtitle="Core competencies in software development, artificial intelligence, and data analytics.">
          {!isReady ? (
            <SkeletonCard count={3} height="h-44" />
          ) : !sk?.length ? (
            <EmptyState
              icon={Layers}
              title="Skills Being Curated"
              description="Technical skills and tools are currently being organized in the database. Explore the resume for an overview."
              actionText="View Resume"
              actionHref={p.resume_url || '#contact'}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SKILL_CATS.map((category) => {
                const list = sk.filter((s) => s.category === category)
                if (!list.length) return null
                return (
                  <motion.div
                    whileHover={{ y: -4 }}
                    key={category}
                    className="glass-card flex flex-col p-6"
                  >
                    <div className="flex items-center gap-2 text-sage">
                      <Code2 size={18} />
                      <h3 className="text-base font-semibold text-ink">{category}</h3>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {list.map((item) => (
                        <span
                          key={item.id}
                          className="rounded-lg border border-sage2/30 bg-sage2/20 px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-sage hover:bg-sage/10"
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </Section>

        {/* Projects Section */}
        <Section id="projects" badge="Portfolio" title="Featured Projects" subtitle="Practical applications and software engineering solutions I've developed.">
          {projectCategories.length > 1 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {projectCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`btn !py-1.5 !px-4 !text-xs ${
                    selectedCat === cat ? 'btn-p' : 'btn-o'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {!isReady ? (
            <SkeletonCard count={3} height="h-72" />
          ) : !filteredProjects.length ? (
            <EmptyState
              icon={FolderGit2}
              title="Projects Being Uploaded"
              description="Project case studies and repositories are currently being finalized. Check back soon or visit GitHub."
              actionText="Visit GitHub Profile"
              actionHref={p.github || 'https://github.com/earnest2005'}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <motion.article
                  layout
                  whileHover={{ y: -6 }}
                  key={project.id}
                  className="glass-card group flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-sage2/30">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sage">
                        <FolderGit2 size={32} />
                      </div>
                    )}
                    {project.category && (
                      <span className="absolute top-3 left-3 rounded-md bg-paper/90 px-2.5 py-1 text-[11px] font-semibold text-sage backdrop-blur-sm">
                        {project.category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-head text-lg font-semibold text-ink group-hover:text-sage transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-2 flex-1 text-xs sm:text-sm text-mute line-clamp-3">
                      {project.description}
                    </p>

                    {project.tech && (
                      <p className="mt-3 text-xs font-mono text-sage/90">
                        {project.tech}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-sage2/20 pt-4 text-xs font-medium">
                      <div className="flex gap-3">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-mute hover:text-ink"
                          >
                            <Github size={13} /> Code
                          </a>
                        )}
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sage hover:underline"
                          >
                            <ExternalLink size={13} /> Demo
                          </a>
                        )}
                      </div>

                      {project.slug && (
                        <Link
                          to={`/projects/${project.slug}`}
                          className="inline-flex items-center gap-1 text-sage hover:underline"
                        >
                          Details <ChevronRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </Section>

        {/* Experience Section */}
        <Section id="experience" badge="Career" title="Experience & Internships" subtitle="Professional and organizational roles, projects, and industrial learning.">
          {!isReady ? (
            <SkeletonCard count={2} height="h-36" />
          ) : !ex?.length ? (
            <EmptyState
              icon={Briefcase}
              title="Experience Records"
              description="Internship and professional milestones will appear here as they are published. Details are available in the resume."
              actionText="View Resume"
              actionHref={p.resume_url || '#contact'}
            />
          ) : (
            <div className="relative border-l-2 border-sage/30 pl-6 sm:pl-8 space-y-8">
              {ex.map((item) => (
                <div key={item.id} className="relative">
                  {/* Timeline bullet */}
                  <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-paper bg-sage" />
                  <div className="glass-card p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-head text-base sm:text-lg font-semibold text-ink">
                        {item.position} <span className="text-sage">·</span> {item.organization}
                      </h3>
                      {item.duration && (
                        <span className="rounded-full bg-sage/10 px-3 py-0.5 text-xs font-medium text-sage">
                          {item.duration}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-3 text-xs sm:text-sm text-mute leading-relaxed whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}
                    {item.tech && (
                      <p className="mt-3 text-xs font-mono text-sage">{item.tech}</p>
                    )}
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.position}
                        loading="lazy"
                        className="mt-4 max-h-36 rounded-xl border border-sage2/30 object-contain"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Education Section */}
        <Section id="education" badge="Academics" title="Education" subtitle="Formal degree programs, engineering foundation, and academic institutions.">
          {!isReady ? (
            <SkeletonCard count={2} height="h-32" />
          ) : !ed?.length ? (
            <EmptyState
              icon={GraduationCap}
              title="Education Records"
              description="Currently pursuing B.Tech in Artificial Intelligence & Data Science at St. Xavier's Catholic College of Engineering."
              actionText="View Academic Profile"
              actionHref="#about"
            />
          ) : (
            <div className="relative border-l-2 border-sage/30 pl-6 sm:pl-8 space-y-8">
              {ed.map((item) => (
                <div key={item.id} className="relative">
                  <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-paper bg-sage" />
                  <div className="glass-card p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-head text-base sm:text-lg font-semibold text-ink">
                        {item.degree}
                      </h3>
                      {item.duration && (
                        <span className="rounded-full bg-sage/10 px-3 py-0.5 text-xs font-medium text-sage">
                          {item.duration}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium text-sage">{item.institution}</p>
                    {item.details && (
                      <p className="mt-2 text-xs sm:text-sm text-mute leading-relaxed whitespace-pre-wrap">
                        {item.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Certifications Section */}
        <Section id="certifications" badge="Credentials" title="Certifications & Achievements" subtitle="Recognitions, accredited certifications, and technical accomplishments.">
          {!isReady ? (
            <SkeletonCard count={3} height="h-44" />
          ) : !ce?.length ? (
            <EmptyState
              icon={Award}
              title="Certifications Being Added"
              description="Verified certificates and technical course achievements are being uploaded. Details are available on LinkedIn."
              actionText="View LinkedIn"
              actionHref={p.linkedin || 'https://www.linkedin.com/in/earnest-abraham'}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ce.map((cert) => (
                <motion.div
                  whileHover={{ y: -4 }}
                  key={cert.id}
                  className="glass-card flex flex-col overflow-hidden"
                >
                  {cert.image_url && (
                    <div className="relative aspect-[4/3] w-full bg-sage2/20">
                      <img
                        src={cert.image_url}
                        alt={cert.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-sage">
                        {cert.kind || 'Certification'}
                      </span>
                      <h3 className="mt-1 font-head text-base font-semibold text-ink">
                        {cert.title}
                      </h3>
                      {cert.issuer && (
                        <p className="mt-1 text-xs text-mute">{cert.issuer}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Section>

        {/* Blog Section */}
        <Section id="blog" badge="Articles" title="Blog & Insights" subtitle="Notes, tutorials, and perspectives on AI, data science, and web development.">
          {!isReady ? (
            <SkeletonCard count={2} height="h-44" />
          ) : !po?.length ? (
            <EmptyState
              icon={BookOpen}
              title="Articles Coming Soon"
              description="Writing technical articles on AI agents, machine learning workflows, and modern web engineering. Stay tuned!"
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {po.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="glass-card group flex flex-col p-6 transition-all hover:-translate-y-1"
                >
                  {post.cover_url && (
                    <img
                      src={post.cover_url}
                      alt={post.title}
                      loading="lazy"
                      className="mb-4 aspect-video w-full rounded-xl object-cover"
                    />
                  )}
                  <h3 className="font-head text-lg font-semibold text-ink group-hover:text-sage transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 text-xs sm:text-sm text-mute line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-sage">
                    <span>Read Article</span>
                    <ChevronRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Section>

        {/* Contact Section */}
        <Section id="contact" badge="Get In Touch" title="Let's Connect" subtitle="Have an opportunity, collaboration, or project in mind? Feel free to reach out.">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Contact Details */}
            <div className="space-y-6 lg:col-span-5">
              <div className="glass-card p-6">
                <h3 className="font-head text-lg font-semibold text-ink">Contact Details</h3>
                <p className="mt-2 text-xs sm:text-sm text-mute leading-relaxed">
                  I'm always open to discussing new projects, internship opportunities, and innovative
                  ideas in AI and software engineering.
                </p>

                <div className="mt-6 space-y-4 text-xs sm:text-sm">
                  {p.email && (
                    <a
                      href={`mailto:${p.email}`}
                      className="flex items-center gap-3 text-ink hover:text-sage transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage/10 text-sage">
                        <Mail size={16} />
                      </div>
                      <span className="font-medium">{p.email}</span>
                    </a>
                  )}

                  {p.linkedin && (
                    <a
                      href={p.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 text-ink hover:text-sage transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage/10 text-sage">
                        <Linkedin size={16} />
                      </div>
                      <span className="font-medium">LinkedIn Profile</span>
                    </a>
                  )}

                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 text-ink hover:text-sage transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage/10 text-sage">
                        <Github size={16} />
                      </div>
                      <span className="font-medium">github.com/earnest2005</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Status Pill */}
              <div className="glass-card flex items-center gap-3 p-4">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-sage" />
                </span>
                <span className="text-xs font-medium text-ink">
                  Open for AI/Data Science internships &amp; engineering opportunities
                </span>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleContactSubmit} className="glass-card p-6 sm:p-8 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-mute mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    maxLength={100}
                    placeholder="e.g. Alex Johnson"
                    className="inp"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-mute mb-1.5">
                    Your Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={150}
                    placeholder="alex@example.com"
                    className="inp"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-medium uppercase tracking-wider text-mute mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    maxLength={2000}
                    rows={4}
                    placeholder="Share a project idea, opportunity, or simply say hello..."
                    className="inp"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={contactStatus === 'sending'}
                    className="btn btn-p w-full sm:w-auto min-w-[140px]"
                  >
                    {contactStatus === 'sending' ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Sending…</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>

                {contactStatus === 'sent' && (
                  <div className="flex items-center gap-2 rounded-xl border border-sage/40 bg-sage/10 p-3 text-xs font-medium text-sage">
                    <CheckCircle2 size={16} />
                    <span>Thank you! Your message has been sent successfully.</span>
                  </div>
                )}

                {contactStatus === 'error' && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-400">
                    <AlertCircle size={16} />
                    <span>Could not send message. Please try again or email directly.</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-paper py-10 text-center text-xs text-mute">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-sage text-[10px] text-white font-bold">
              EA
            </span>
            <span>Earnest Abraham &bull; Portfolio</span>
          </div>

          <p>&copy; {new Date().getFullYear()} Earnest Abraham. All rights reserved.</p>

          <a href="#home" className="inline-flex items-center gap-1 text-sage hover:underline">
            <span>Back to top</span>
            <ArrowUp size={12} />
          </a>
        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-surface text-ink shadow-lg backdrop-blur-md transition-all hover:bg-sage hover:text-white"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  )
}
