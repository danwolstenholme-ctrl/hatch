// HatchIt V3.0 - Structured Build Templates
// The shift from "magic box" to "guided craftsmanship"

export interface Section {
  id: string
  name: string
  description: string // Shown to user - why this section matters
  prompt: string // Contextual prompt/tip for the user
  estimatedTime: string // "~30 seconds"
  required: boolean
  order: number
}

export interface Template {
  id: string
  name: string
  icon: string
  description: string
  sections: Section[]
  isAdvanced?: boolean // For "Custom" mode
  // New metadata for better UX
  pageType: 'one-page' | 'multi-page' | 'flexible'
  estimatedBuildTime: string // e.g., "3-5 min"
  whatYouNeed: string[] // What info the user should have ready
  bestFor: string[] // Who this template is ideal for
}

// =============================================================================
// WEBSITE TEMPLATE (First option)
// Complete multi-page website for businesses, agencies, and companies
// =============================================================================
export const websiteTemplate: Template = {
  id: 'website',
  name: 'Website',
  icon: '🌐',
  description: 'Full-scale multi-page architecture. Optimized for corporate entities and agencies.',
  pageType: 'multi-page',
  estimatedBuildTime: '5-8 min',
  whatYouNeed: [
    'Entity designation',
    'Core functions (services, products)',
    'Target demographic',
    'Client validation data',
    'Communication vectors',
  ],
  bestFor: ['Businesses', 'Agencies', 'Startups', 'Companies'],
  sections: [
    {
      id: 'header',
      name: 'Header/Navigation',
      description: 'Logo, navigation links, and optional CTA button.',
      prompt: 'Define navigation structure. Specify CTA button text.',
      estimatedTime: '~20s',
      required: true,
      order: 1,
    },
    {
      id: 'hero',
      name: 'Hero Section',
      description: 'Your main headline, value prop, and primary call-to-action.',
      prompt: 'Define entity function and target demographic. Specify desired user action.',
      estimatedTime: '~30s',
      required: true,
      order: 2,
    },
    {
      id: 'services',
      name: 'Services/What We Do',
      description: 'Showcase your core offerings or capabilities.',
      prompt: 'List 3-4 core capabilities or offerings.',
      estimatedTime: '~30s',
      required: true,
      order: 3,
    },
    {
      id: 'about',
      name: 'About/Story',
      description: 'Who you are, your mission, or company background.',
      prompt: 'Define entity background and mission parameters.',
      estimatedTime: '~30s',
      required: false,
      order: 4,
    },
    {
      id: 'work',
      name: 'Work/Case Studies',
      description: 'Showcase past projects, clients, or results.',
      prompt: 'Input project history or client results.',
      estimatedTime: '~30s',
      required: false,
      order: 5,
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      description: 'Social proof from happy clients or customers.',
      prompt: 'Input client quotes or validation data.',
      estimatedTime: '~25s',
      required: false,
      order: 6,
    },
    {
      id: 'stats',
      name: 'Stats/Metrics',
      description: 'Key numbers that build credibility.',
      prompt: 'Input performance metrics (Revenue, clients, years).',
      estimatedTime: '~20s',
      required: false,
      order: 7,
    },
    {
      id: 'cta',
      name: 'Call to Action',
      description: 'Final push to convert visitors.',
      prompt: 'Define primary conversion goal.',
      estimatedTime: '~20s',
      required: true,
      order: 8,
    },
    {
      id: 'footer',
      name: 'Footer',
      description: 'Links, contact info, social media, legal.',
      prompt: 'Input contact details, social vectors, and legal requirements.',
      estimatedTime: '~20s',
      required: true,
      order: 9,
    },
  ],
}

// =============================================================================
// LANDING PAGE TEMPLATE
// The most common use case - SaaS, product launches, services
// =============================================================================
export const landingPageTemplate: Template = {
  id: 'landing-page',
  name: 'Landing Page',
  icon: '🚀',
  description: 'Single-page conversion unit. Optimized for product launches and campaigns.',
  pageType: 'one-page',
  estimatedBuildTime: '3-5 min',
  whatYouNeed: [
    'Product/Service designation',
    'Primary benefit vector',
    '3-6 key features',
    'Pricing structure',
    'Desired user action',
  ],
  bestFor: ['SaaS products', 'App launches', 'Services', 'Campaigns'],
  sections: [
    {
      id: 'header',
      name: 'Header/Navigation',
      description: 'Logo, nav links, and CTA button. Sticky or fixed optional.',
      prompt: 'Define entity designation and navigation links.',
      estimatedTime: '~20s',
      required: false,
      order: 0,
    },
    {
      id: 'hero',
      name: 'Hero Section',
      description: 'Your first impression. The headline and call-to-action that hooks visitors.',
      prompt: 'Define product parameters and target audience. Specify primary benefit vector.',
      estimatedTime: '~30s',
      required: true,
      order: 1,
    },
    {
      id: 'social-proof',
      name: 'Social Proof',
      description: 'Build trust with testimonials, client logos, or stats.',
      prompt: 'Input user validation data (testimonials, logos, metrics).',
      estimatedTime: '~30s',
      required: false,
      order: 2,
    },
    {
      id: 'features',
      name: 'Features',
      description: 'Show what you offer. Benefits over features when possible.',
      prompt: 'List 3-6 core features or benefits. Focus on user outcome.',
      estimatedTime: '~30s',
      required: true,
      order: 3,
    },
    {
      id: 'how-it-works',
      name: 'How It Works',
      description: 'A simple 3-step process that shows ease of use.',
      prompt: 'Define 3-step user journey. Start → Process → Result.',
      estimatedTime: '~30s',
      required: false,
      order: 4,
    },
    {
      id: 'pricing',
      name: 'Pricing',
      description: 'Clear pricing tiers with a recommended option.',
      prompt: 'Define pricing tiers. Highlight optimal choice.',
      estimatedTime: '~30s',
      required: false,
      order: 5,
    },
    {
      id: 'faq',
      name: 'FAQ',
      description: 'Answer common questions before they\'re asked.',
      prompt: 'Input 4-6 common user queries.',
      estimatedTime: '~30s',
      required: false,
      order: 6,
    },
    {
      id: 'footer',
      name: 'Footer',
      description: 'Navigation, legal links, and contact info.',
      prompt: 'Input entity designation and social vectors.',
      estimatedTime: '~20s',
      required: false,
      order: 7,
    },
  ],
}

// =============================================================================
// PORTFOLIO TEMPLATE
// For creatives, developers, designers, photographers
// =============================================================================
export const portfolioTemplate: Template = {
  id: 'portfolio',
  name: 'Portfolio',
  icon: '🎨',
  description: 'Personal brand matrix. Display operational history and capabilities.',
  pageType: 'one-page',
  estimatedBuildTime: '3-4 min',
  whatYouNeed: [
    'Entity designation and title',
    '3-6 project modules',
    'Project descriptions',
    'Background data',
    'Communication vectors',
  ],
  bestFor: ['Designers', 'Developers', 'Photographers', 'Freelancers'],
  sections: [
    {
      id: 'hero',
      name: 'Hero / Intro',
      description: 'Your name, title, and a brief intro that captures who you are.',
      prompt: 'Input entity designation and function. Define stylistic parameters.',
      estimatedTime: '~30s',
      required: true,
      order: 1,
    },
    {
      id: 'work',
      name: 'Work / Projects',
      description: 'A grid or gallery of your best work.',
      prompt: 'Input 3-6 project modules. Include designations and descriptions.',
      estimatedTime: '~45s',
      required: true,
      order: 2,
    },
    {
      id: 'about',
      name: 'About Me',
      description: 'Your story, background, and what makes you unique.',
      prompt: 'Input background data, experience, and operational drivers.',
      estimatedTime: '~30s',
      required: true,
      order: 3,
    },
    {
      id: 'services',
      name: 'Services',
      description: 'What you offer and how people can work with you.',
      prompt: 'Define service offerings and unique capabilities.',
      estimatedTime: '~30s',
      required: false,
      order: 4,
    },
    {
      id: 'contact',
      name: 'Contact',
      description: 'How to get in touch.',
      prompt: 'Define preferred communication vector (Email, Social, Form).',
      estimatedTime: '~20s',
      required: true,
      order: 5,
    },
    {
      id: 'footer',
      name: 'Footer',
      description: 'Simple footer with links and copyright.',
      prompt: 'Input entity designation and additional links.',
      estimatedTime: '~15s',
      required: true,
      order: 6,
    },
  ],
}

// =============================================================================
// PRODUCT PAGE TEMPLATE
// For e-commerce, physical products, apps
// =============================================================================
export const productPageTemplate: Template = {
  id: 'product-page',
  name: 'Product Page',
  icon: '📦',
  description: 'Commerce unit. Optimized for single-product transactions.',
  pageType: 'one-page',
  estimatedBuildTime: '3-5 min',
  whatYouNeed: [
    'Product designation and pricing',
    'Key features and benefits',
    'Technical specifications',
    'Customer validation data',
    'Return/Guarantee policy',
  ],
  bestFor: ['E-commerce', 'Physical products', 'Apps', 'Digital products'],
  sections: [
    {
      id: 'product-hero',
      name: 'Product Hero',
      description: 'The product front and center with key selling points.',
      prompt: 'Input product designation, pricing, and primary visual descriptors.',
      estimatedTime: '~30s',
      required: true,
      order: 1,
    },
    {
      id: 'features-benefits',
      name: 'Features & Benefits',
      description: 'What the product does and why it matters.',
      prompt: 'List 4-6 features and associated user benefits.',
      estimatedTime: '~30s',
      required: true,
      order: 2,
    },
    {
      id: 'specifications',
      name: 'Specifications',
      description: 'Technical details, dimensions, materials.',
      prompt: 'Input technical specifications, dimensions, and materials.',
      estimatedTime: '~25s',
      required: false,
      order: 3,
    },
    {
      id: 'reviews',
      name: 'Reviews',
      description: 'Customer testimonials and ratings.',
      prompt: 'Input customer reviews or validation data.',
      estimatedTime: '~30s',
      required: false,
      order: 4,
    },
    {
      id: 'related-products',
      name: 'Related Products',
      description: 'Cross-sell or upsell opportunities.',
      prompt: 'Input related products or accessories.',
      estimatedTime: '~25s',
      required: false,
      order: 5,
    },
    {
      id: 'cta',
      name: 'Call to Action',
      description: 'Final push to buy with urgency or bonus.',
      prompt: 'Define special offers, guarantees, or urgency factors.',
      estimatedTime: '~20s',
      required: true,
      order: 6,
    },
  ],
}

// =============================================================================
// DOCUMENTATION TEMPLATE
// For developer docs, help centers, knowledge bases
// =============================================================================
export const documentationTemplate: Template = {
  id: 'documentation',
  name: 'Documentation',
  icon: '📚',
  description: 'Knowledge base architecture. Optimized for information retrieval.',
  pageType: 'multi-page',
  estimatedBuildTime: '4-6 min',
  whatYouNeed: [
    'Documentation scope',
    'Primary categories/topics',
    'Initialization steps',
    'Common queries',
    'Support vectors',
  ],
  bestFor: ['APIs', 'Software products', 'Help centers', 'Knowledge bases'],
  sections: [
    {
      id: 'doc-hero',
      name: 'Documentation Hero',
      description: 'Title, search bar, and quick links.',
      prompt: 'Define documentation scope. Specify primary categories.',
      estimatedTime: '~25s',
      required: true,
      order: 1,
    },
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Quick start guide for new users.',
      prompt: 'Define initialization steps for new users.',
      estimatedTime: '~30s',
      required: true,
      order: 2,
    },
    {
      id: 'categories',
      name: 'Categories / Topics',
      description: 'Main documentation sections.',
      prompt: 'List 4-8 primary categories or topics.',
      estimatedTime: '~30s',
      required: true,
      order: 3,
    },
    {
      id: 'popular-articles',
      name: 'Popular Articles',
      description: 'Most-read or most-needed docs.',
      prompt: 'Identify high-frequency user queries or articles.',
      estimatedTime: '~25s',
      required: false,
      order: 4,
    },
    {
      id: 'doc-footer',
      name: 'Footer',
      description: 'Links, support contact, version info.',
      prompt: 'Input support email, version number, and critical links.',
      estimatedTime: '~15s',
      required: true,
      order: 5,
    },
  ],
}

// =============================================================================
// BLOG TEMPLATE
// For content creators, writers, thought leaders
// =============================================================================
export const blogTemplate: Template = {
  id: 'blog',
  name: 'Blog',
  icon: '✍️',
  description: 'Content distribution network. Optimized for serial publication.',
  pageType: 'multi-page',
  estimatedBuildTime: '3-5 min',
  whatYouNeed: [
    'Publication designation',
    'Content categories',
    '3-6 sample titles',
    'Subscriber value proposition',
    'Social vectors',
  ],
  bestFor: ['Writers', 'Content creators', 'Thought leaders', 'Educators'],
  sections: [
    {
      id: 'blog-header',
      name: 'Blog Header',
      description: 'Logo, navigation, and search.',
      prompt: 'Input publication designation, tagline, and navigation links.',
      estimatedTime: '~20s',
      required: false,
      order: 0,
    },
    {
      id: 'featured-post',
      name: 'Featured Post',
      description: 'Highlight your best or latest article.',
      prompt: 'Input featured post data (Title, excerpt, topic).',
      estimatedTime: '~25s',
      required: true,
      order: 1,
    },
    {
      id: 'post-grid',
      name: 'Recent Posts',
      description: 'Grid or list of recent blog posts.',
      prompt: 'Input 6 sample post titles with topics/categories.',
      estimatedTime: '~30s',
      required: true,
      order: 2,
    },
    {
      id: 'categories',
      name: 'Categories',
      description: 'Browse posts by topic.',
      prompt: 'Define primary content categories.',
      estimatedTime: '~20s',
      required: false,
      order: 3,
    },
    {
      id: 'newsletter-signup',
      name: 'Newsletter',
      description: 'Capture subscribers with an email signup.',
      prompt: 'Define subscriber value proposition (e.g., Weekly digest).',
      estimatedTime: '~20s',
      required: false,
      order: 4,
    },
    {
      id: 'blog-footer',
      name: 'Footer',
      description: 'Links, social media, and about.',
      prompt: 'Input social vectors, about snippet, and critical pages.',
      estimatedTime: '~15s',
      required: false,
      order: 5,
    },
  ],
}

// =============================================================================
// CUSTOM TEMPLATE
// For power users who know what they want
// =============================================================================
export const customTemplate: Template = {
  id: 'custom',
  name: 'Custom Build',
  icon: '⚡',
  description: 'Manual architecture mode. Full control over system modules. For advanced operators.',
  isAdvanced: true,
  pageType: 'flexible',
  estimatedBuildTime: 'Variable',
  whatYouNeed: [
    'Project requirements',
    'Content modules',
  ],
  bestFor: ['Developers', 'Power users', 'Unique projects'],
  sections: [
    {
      id: 'custom-build',
      name: 'Custom Build',
      description: 'Freeform building with AI assistance.',
      prompt: 'Define custom system parameters.',
      estimatedTime: 'Varies',
      required: true,
      order: 1,
    },
  ],
}

// =============================================================================
// EXPORTS
// =============================================================================
export const templates: Template[] = [
  websiteTemplate,
  landingPageTemplate,
  portfolioTemplate,
  productPageTemplate,
  blogTemplate,
  documentationTemplate,
  customTemplate,
]

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(t => t.id === id)
}

export const getSectionById = (template: Template, sectionId: string): Section | undefined => {
  return template.sections.find(s => s.id === sectionId)
}

// Helper to get required sections
export const getRequiredSections = (template: Template): Section[] => {
  return template.sections.filter(s => s.required)
}

// Helper to get optional sections
export const getOptionalSections = (template: Template): Section[] => {
  return template.sections.filter(s => !s.required)
}

// =============================================================================
// THREE-MODEL SYSTEM (V3.0)
// =============================================================================
// | Model           | Role     | When                                         |
// |-----------------|----------|----------------------------------------------|
// | Architect       | Builder  | First generation per section                 |
// | Architect       | Refiner  | Auto-runs after each section (silent/polish) |
// | Architect       | Auditor  | Optional "Final Audit" after all complete    |
// =============================================================================

// Build state for tracking progress
export interface BuildState {
  templateId: string
  currentSectionIndex: number
  completedSections: string[]
  skippedSections: string[]
  sectionCode: Record<string, string> // sectionId -> generated code
  sectionRefined: Record<string, boolean> // sectionId -> was it refined by Architect?
  sectionChanges: Record<string, string[]> // sectionId -> what Architect changed
  // Gemini final audit (optional, end-of-build)
  finalAuditComplete: boolean
  finalAuditChanges: string[] | null // What Gemini found/fixed, null = not run yet
  auditScores?: {
    accessibility: number
    performance: number
    consistency: number
    mobile: number
  }
  auditPassed?: boolean
}

export const createInitialBuildState = (templateId: string): BuildState => ({
  templateId,
  currentSectionIndex: 0,
  completedSections: [],
  skippedSections: [],
  sectionCode: {},
  sectionRefined: {},
  sectionChanges: {},
  finalAuditComplete: false,
  finalAuditChanges: null,
})
