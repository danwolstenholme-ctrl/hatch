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
  description: 'A complete multi-page website. Perfect for businesses, agencies, and companies.',
  pageType: 'multi-page',
  estimatedBuildTime: '5-8 min',
  whatYouNeed: [
    'Your company/brand name',
    'What you do (services, products)',
    'Who your customers are',
    'Any testimonials or client names',
    'Contact details & social links',
  ],
  bestFor: ['Businesses', 'Agencies', 'Startups', 'Companies'],
  sections: [
    {
      id: 'header',
      name: 'Header/Navigation',
      description: 'Logo, navigation links, and optional CTA button.',
      prompt: 'What pages should be in your nav? Any CTA button?',
      estimatedTime: '~20s',
      required: true,
      order: 1,
    },
    {
      id: 'hero',
      name: 'Hero Section',
      description: 'Your main headline, value prop, and primary call-to-action.',
      prompt: 'What do you do and who is it for? What action should visitors take?',
      estimatedTime: '~30s',
      required: true,
      order: 2,
    },
    {
      id: 'services',
      name: 'Services/What We Do',
      description: 'Showcase your core offerings or capabilities.',
      prompt: 'What are your 3-4 main services or offerings?',
      estimatedTime: '~30s',
      required: true,
      order: 3,
    },
    {
      id: 'about',
      name: 'About/Story',
      description: 'Who you are, your mission, or company background.',
      prompt: 'Tell your story. What makes you different?',
      estimatedTime: '~30s',
      required: false,
      order: 4,
    },
    {
      id: 'work',
      name: 'Work/Case Studies',
      description: 'Showcase past projects, clients, or results.',
      prompt: 'Any projects, clients, or results to highlight?',
      estimatedTime: '~30s',
      required: false,
      order: 5,
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      description: 'Social proof from happy clients or customers.',
      prompt: 'Any quotes or testimonials from clients?',
      estimatedTime: '~25s',
      required: false,
      order: 6,
    },
    {
      id: 'stats',
      name: 'Stats/Metrics',
      description: 'Key numbers that build credibility.',
      prompt: 'Any impressive numbers? Revenue, clients, years, etc.',
      estimatedTime: '~20s',
      required: false,
      order: 7,
    },
    {
      id: 'cta',
      name: 'Call to Action',
      description: 'Final push to convert visitors.',
      prompt: 'What action do you want visitors to take?',
      estimatedTime: '~20s',
      required: true,
      order: 8,
    },
    {
      id: 'footer',
      name: 'Footer',
      description: 'Links, contact info, social media, legal.',
      prompt: 'Contact details, social links, any legal pages?',
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
  description: 'A single-page site focused on one goal. Great for launches and campaigns.',
  pageType: 'one-page',
  estimatedBuildTime: '3-5 min',
  whatYouNeed: [
    'Your product/service name',
    'The main benefit you offer',
    '3-6 key features',
    'Pricing (if applicable)',
    'What action visitors should take',
  ],
  bestFor: ['SaaS products', 'App launches', 'Services', 'Campaigns'],
  sections: [
    {
      id: 'header',
      name: 'Header/Navigation',
      description: 'Logo, nav links, and CTA button. Sticky or fixed optional.',
      prompt: 'Company/product name, main nav links (3-5), and CTA button text?',
      estimatedTime: '~20s',
      required: false,
      order: 0,
    },
    {
      id: 'hero',
      name: 'Hero Section',
      description: 'Your first impression. The headline and call-to-action that hooks visitors.',
      prompt: 'Describe your product/service and who it\'s for. What\'s the main benefit?',
      estimatedTime: '~30s',
      required: true,
      order: 1,
    },
    {
      id: 'social-proof',
      name: 'Social Proof',
      description: 'Build trust with testimonials, client logos, or stats.',
      prompt: 'Who uses your product? Any testimonials, notable clients, or impressive numbers?',
      estimatedTime: '~30s',
      required: false,
      order: 2,
    },
    {
      id: 'features',
      name: 'Features',
      description: 'Show what you offer. Benefits over features when possible.',
      prompt: 'What are the 3-6 main features or benefits? Focus on what users get, not how it works.',
      estimatedTime: '~30s',
      required: true,
      order: 3,
    },
    {
      id: 'how-it-works',
      name: 'How It Works',
      description: 'A simple 3-step process that shows ease of use.',
      prompt: 'Break down the user journey into 3 simple steps. Start → Middle → Result.',
      estimatedTime: '~30s',
      required: false,
      order: 4,
    },
    {
      id: 'pricing',
      name: 'Pricing',
      description: 'Clear pricing tiers with a recommended option.',
      prompt: 'Describe your pricing tiers. Which one should be highlighted as recommended?',
      estimatedTime: '~30s',
      required: false,
      order: 5,
    },
    {
      id: 'faq',
      name: 'FAQ',
      description: 'Answer common questions before they\'re asked.',
      prompt: 'What are 4-6 questions your users commonly ask?',
      estimatedTime: '~30s',
      required: false,
      order: 6,
    },
    {
      id: 'footer',
      name: 'Footer',
      description: 'Navigation, legal links, and contact info.',
      prompt: 'Company name, key links, and any social media handles?',
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
  description: 'Showcase your work and tell your story. A personal brand site.',
  pageType: 'one-page',
  estimatedBuildTime: '3-4 min',
  whatYouNeed: [
    'Your name and title',
    '3-6 projects to showcase',
    'Brief descriptions of each project',
    'Your story/background',
    'How people can contact you',
  ],
  bestFor: ['Designers', 'Developers', 'Photographers', 'Freelancers'],
  sections: [
    {
      id: 'hero',
      name: 'Hero / Intro',
      description: 'Your name, title, and a brief intro that captures who you are.',
      prompt: 'Your name, what you do, and one sentence about your style or approach.',
      estimatedTime: '~30s',
      required: true,
      order: 1,
    },
    {
      id: 'work',
      name: 'Work / Projects',
      description: 'A grid or gallery of your best work.',
      prompt: 'Describe 3-6 projects. Include project names and brief descriptions.',
      estimatedTime: '~45s',
      required: true,
      order: 2,
    },
    {
      id: 'about',
      name: 'About Me',
      description: 'Your story, background, and what makes you unique.',
      prompt: 'A paragraph about your background, experience, and what drives your work.',
      estimatedTime: '~30s',
      required: true,
      order: 3,
    },
    {
      id: 'services',
      name: 'Services',
      description: 'What you offer and how people can work with you.',
      prompt: 'What services do you offer? Include any specialties or unique offerings.',
      estimatedTime: '~30s',
      required: false,
      order: 4,
    },
    {
      id: 'contact',
      name: 'Contact',
      description: 'How to get in touch.',
      prompt: 'Email, social links, or a contact form? What\'s your preferred contact method?',
      estimatedTime: '~20s',
      required: true,
      order: 5,
    },
    {
      id: 'footer',
      name: 'Footer',
      description: 'Simple footer with links and copyright.',
      prompt: 'Your name/brand and any additional links.',
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
  description: 'Sell a specific product with all the details buyers need.',
  pageType: 'one-page',
  estimatedBuildTime: '3-5 min',
  whatYouNeed: [
    'Product name and price',
    'Key features and benefits',
    'Specs or dimensions',
    'Customer reviews (if any)',
    'Your return/guarantee policy',
  ],
  bestFor: ['E-commerce', 'Physical products', 'Apps', 'Digital products'],
  sections: [
    {
      id: 'product-hero',
      name: 'Product Hero',
      description: 'The product front and center with key selling points.',
      prompt: 'Product name, tagline, price, and the main visual description.',
      estimatedTime: '~30s',
      required: true,
      order: 1,
    },
    {
      id: 'features-benefits',
      name: 'Features & Benefits',
      description: 'What the product does and why it matters.',
      prompt: 'List 4-6 features and the benefit each provides to the user.',
      estimatedTime: '~30s',
      required: true,
      order: 2,
    },
    {
      id: 'specifications',
      name: 'Specifications',
      description: 'Technical details, dimensions, materials.',
      prompt: 'Any specs, dimensions, materials, or technical details?',
      estimatedTime: '~25s',
      required: false,
      order: 3,
    },
    {
      id: 'reviews',
      name: 'Reviews',
      description: 'Customer testimonials and ratings.',
      prompt: 'Any customer reviews or testimonials to include?',
      estimatedTime: '~30s',
      required: false,
      order: 4,
    },
    {
      id: 'related-products',
      name: 'Related Products',
      description: 'Cross-sell or upsell opportunities.',
      prompt: 'Any related products or accessories to show?',
      estimatedTime: '~25s',
      required: false,
      order: 5,
    },
    {
      id: 'cta',
      name: 'Call to Action',
      description: 'Final push to buy with urgency or bonus.',
      prompt: 'Any special offer, guarantee, or urgency to include?',
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
  description: 'Help center or docs site with search and categories.',
  pageType: 'multi-page',
  estimatedBuildTime: '4-6 min',
  whatYouNeed: [
    'What you\'re documenting',
    'Main categories/topics',
    'Getting started steps',
    'Common questions',
    'Support contact info',
  ],
  bestFor: ['APIs', 'Software products', 'Help centers', 'Knowledge bases'],
  sections: [
    {
      id: 'doc-hero',
      name: 'Documentation Hero',
      description: 'Title, search bar, and quick links.',
      prompt: 'What is this documentation for? Any main categories to highlight?',
      estimatedTime: '~25s',
      required: true,
      order: 1,
    },
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Quick start guide for new users.',
      prompt: 'What are the first 3-5 steps a new user should take?',
      estimatedTime: '~30s',
      required: true,
      order: 2,
    },
    {
      id: 'categories',
      name: 'Categories / Topics',
      description: 'Main documentation sections.',
      prompt: 'What are the 4-8 main categories or topics?',
      estimatedTime: '~30s',
      required: true,
      order: 3,
    },
    {
      id: 'popular-articles',
      name: 'Popular Articles',
      description: 'Most-read or most-needed docs.',
      prompt: 'What are the most common questions or popular articles?',
      estimatedTime: '~25s',
      required: false,
      order: 4,
    },
    {
      id: 'doc-footer',
      name: 'Footer',
      description: 'Links, support contact, version info.',
      prompt: 'Support email, version number, any important links?',
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
  description: 'A content site with posts, categories, and newsletter signup.',
  pageType: 'multi-page',
  estimatedBuildTime: '3-5 min',
  whatYouNeed: [
    'Your blog name/brand',
    'Main content categories',
    '3-6 sample post titles',
    'What subscribers get',
    'Your social links',
  ],
  bestFor: ['Writers', 'Content creators', 'Thought leaders', 'Educators'],
  sections: [
    {
      id: 'blog-header',
      name: 'Blog Header',
      description: 'Logo, navigation, and search.',
      prompt: 'Blog name, tagline, and main navigation links?',
      estimatedTime: '~20s',
      required: false,
      order: 0,
    },
    {
      id: 'featured-post',
      name: 'Featured Post',
      description: 'Highlight your best or latest article.',
      prompt: 'What\'s your featured post? Title, excerpt, and topic?',
      estimatedTime: '~25s',
      required: true,
      order: 1,
    },
    {
      id: 'post-grid',
      name: 'Recent Posts',
      description: 'Grid or list of recent blog posts.',
      prompt: 'Show 6 sample post titles with topics/categories.',
      estimatedTime: '~30s',
      required: true,
      order: 2,
    },
    {
      id: 'categories',
      name: 'Categories',
      description: 'Browse posts by topic.',
      prompt: 'What are your main content categories? (e.g., Tech, Life, Tutorials)',
      estimatedTime: '~20s',
      required: false,
      order: 3,
    },
    {
      id: 'newsletter-signup',
      name: 'Newsletter',
      description: 'Capture subscribers with an email signup.',
      prompt: 'What do subscribers get? Weekly digest, exclusive content?',
      estimatedTime: '~20s',
      required: false,
      order: 4,
    },
    {
      id: 'blog-footer',
      name: 'Footer',
      description: 'Links, social media, and about.',
      prompt: 'Social links, about snippet, and any important pages?',
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
  description: 'Full control. Pick your sections, define your structure. For developers and power users who know exactly what they need.',
  isAdvanced: true,
  pageType: 'flexible',
  estimatedBuildTime: 'You decide',
  whatYouNeed: [
    'Clear project requirements',
    'Content ready for each section',
  ],
  bestFor: ['Developers', 'Power users', 'Unique projects'],
  sections: [
    {
      id: 'custom-build',
      name: 'Custom Build',
      description: 'Freeform building with AI assistance.',
      prompt: 'In one sentence, what are you building?',
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
// | Sonnet 4.5      | Builder  | First generation per section                 |
// | Opus 4.5        | Refiner  | Auto-runs after each section (silent/polish) |
// | Gemini 2.5 Pro  | Auditor  | Optional "Final Audit" after all complete    |
// =============================================================================

// Build state for tracking progress
export interface BuildState {
  templateId: string
  currentSectionIndex: number
  completedSections: string[]
  skippedSections: string[]
  sectionCode: Record<string, string> // sectionId -> generated code
  sectionRefined: Record<string, boolean> // sectionId -> was it refined by Opus?
  sectionChanges: Record<string, string[]> // sectionId -> what Opus changed
  // Gemini final audit (optional, end-of-build)
  finalAuditComplete: boolean
  finalAuditChanges: string[] | null // What Gemini found/fixed, null = not run yet
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
