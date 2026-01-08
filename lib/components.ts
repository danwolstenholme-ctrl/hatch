// HatchIt Component Library
// Pre-built, minimal components the AI can reference and customize

export interface ComponentVariant {
  name: string
  code: string
  description: string
}

export interface ComponentDefinition {
  id: string
  category: 'button' | 'card' | 'hero' | 'nav' | 'section' | 'form' | 'footer' | 'testimonial' | 'pricing' | 'feature'
  variants: ComponentVariant[]
}

// =============================================================================
// BUTTONS - Minimal, clean variants
// =============================================================================
export const buttons: ComponentDefinition = {
  id: 'buttons',
  category: 'button',
  variants: [
    {
      name: 'solid',
      description: 'Primary action button with solid background',
      code: `<button className="px-6 py-3 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors">
  Get Started
</button>`
    },
    {
      name: 'outline',
      description: 'Secondary action with border only',
      code: `<button className="px-6 py-3 border border-zinc-700 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors">
  Learn More
</button>`
    },
    {
      name: 'ghost',
      description: 'Minimal text-only button',
      code: `<button className="px-6 py-3 text-zinc-400 font-medium hover:text-white transition-colors">
  View Details <ArrowRight className="inline ml-2 h-4 w-4" />
</button>`
    },
    {
      name: 'pill',
      description: 'Rounded pill-shaped button',
      code: `<button className="px-8 py-3 bg-white text-zinc-900 font-medium rounded-full hover:bg-zinc-200 transition-colors">
  Start Free
</button>`
    },
    {
      name: 'icon',
      description: 'Button with icon',
      code: `<button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors">
  <ArrowRight className="h-4 w-4" />
  Continue
</button>`
    }
  ]
}

// =============================================================================
// CARDS - Content containers
// =============================================================================
export const cards: ComponentDefinition = {
  id: 'cards',
  category: 'card',
  variants: [
    {
      name: 'simple',
      description: 'Clean card with subtle border',
      code: `<div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/50">
  <h3 className="text-lg font-semibold text-white mb-2">Card Title</h3>
  <p className="text-zinc-400">Card description goes here with supporting text.</p>
</div>`
    },
    {
      name: 'elevated',
      description: 'Card with shadow and hover effect',
      code: `<div className="p-6 bg-zinc-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
  <h3 className="text-lg font-semibold text-white mb-2">Card Title</h3>
  <p className="text-zinc-400">Card description goes here with supporting text.</p>
</div>`
    },
    {
      name: 'icon-top',
      description: 'Card with icon header',
      code: `<div className="p-6 border border-zinc-800 rounded-xl">
  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
    <Star className="h-6 w-6 text-white" />
  </div>
  <h3 className="text-lg font-semibold text-white mb-2">Feature Name</h3>
  <p className="text-zinc-400">Feature description with details.</p>
</div>`
    },
    {
      name: 'stat',
      description: 'Statistics/metrics card',
      code: `<div className="p-6 border border-zinc-800 rounded-xl text-center">
  <div className="text-4xl font-bold text-white mb-1">99%</div>
  <div className="text-zinc-400 text-sm">Uptime Guaranteed</div>
</div>`
    }
  ]
}

// =============================================================================
// HEROES - Above the fold sections
// =============================================================================
export const heroes: ComponentDefinition = {
  id: 'heroes',
  category: 'hero',
  variants: [
    {
      name: 'centered',
      description: 'Classic centered hero with headline and CTA',
      code: `<section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
  <h1 className="text-5xl md:text-7xl font-bold text-white max-w-4xl leading-tight">
    Your Headline Goes Here
  </h1>
  <p className="mt-6 text-xl text-zinc-400 max-w-2xl">
    Supporting text that explains your value proposition in one or two sentences.
  </p>
  <div className="mt-10 flex gap-4">
    <button className="px-8 py-4 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors">
      Primary Action
    </button>
    <button className="px-8 py-4 border border-zinc-700 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors">
      Secondary
    </button>
  </div>
</section>`
    },
    {
      name: 'left-aligned',
      description: 'Editorial style with left-aligned text',
      code: `<section className="min-h-screen flex items-center px-6 md:px-12 lg:px-24">
  <div className="max-w-3xl">
    <p className="text-sm uppercase tracking-widest text-zinc-500 mb-4">Tagline</p>
    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
      Your Headline Goes Here
    </h1>
    <p className="mt-8 text-xl text-zinc-400 max-w-xl">
      Supporting text that explains your value proposition in one or two sentences.
    </p>
    <button className="mt-10 px-8 py-4 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors">
      Get Started
    </button>
  </div>
</section>`
    },
    {
      name: 'split',
      description: 'Two-column hero with text and visual space',
      code: `<section className="min-h-screen grid md:grid-cols-2 gap-12 items-center px-6 md:px-12">
  <div>
    <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
      Your Headline Goes Here
    </h1>
    <p className="mt-6 text-xl text-zinc-400">
      Supporting text that explains your value proposition.
    </p>
    <button className="mt-8 px-8 py-4 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors">
      Get Started
    </button>
  </div>
  <div className="bg-zinc-900 rounded-2xl aspect-video flex items-center justify-center">
    <span className="text-zinc-600">Visual / Image</span>
  </div>
</section>`
    },
    {
      name: 'minimal',
      description: 'Ultra-clean with maximum whitespace',
      code: `<section className="min-h-screen flex flex-col justify-end pb-24 px-6 md:px-12">
  <h1 className="text-6xl md:text-8xl font-bold text-white max-w-5xl leading-none">
    Your Headline
  </h1>
  <div className="mt-8 flex items-center gap-8">
    <button className="text-white font-medium hover:text-zinc-400 transition-colors">
      Get Started <ArrowRight className="inline ml-2 h-4 w-4" />
    </button>
    <span className="text-zinc-600">|</span>
    <span className="text-zinc-500">Scroll to explore</span>
  </div>
</section>`
    }
  ]
}

// =============================================================================
// NAVIGATION - Headers and nav bars
// =============================================================================
export const navs: ComponentDefinition = {
  id: 'navs',
  category: 'nav',
  variants: [
    {
      name: 'simple',
      description: 'Clean horizontal nav',
      code: `<nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
  <div className="text-xl font-bold text-white">Logo</div>
  <div className="hidden md:flex items-center gap-8">
    <a href="#" className="text-zinc-400 hover:text-white transition-colors">About</a>
    <a href="#" className="text-zinc-400 hover:text-white transition-colors">Work</a>
    <a href="#" className="text-zinc-400 hover:text-white transition-colors">Contact</a>
  </div>
  <button className="px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors">
    Get Started
  </button>
</nav>`
    },
    {
      name: 'minimal',
      description: 'Ultra-minimal nav with just logo and CTA',
      code: `<nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6">
  <div className="text-xl font-bold text-white">Logo</div>
  <button className="text-zinc-400 hover:text-white transition-colors text-sm">
    Menu
  </button>
</nav>`
    },
    {
      name: 'transparent',
      description: 'Floating transparent nav',
      code: `<nav className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-6 py-4 bg-zinc-900/50 backdrop-blur-md rounded-full border border-zinc-800">
  <div className="text-lg font-bold text-white">Logo</div>
  <div className="hidden md:flex items-center gap-6">
    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">About</a>
  </div>
  <button className="px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors">
    Sign Up
  </button>
</nav>`
    }
  ]
}

// =============================================================================
// FEATURE SECTIONS
// =============================================================================
export const features: ComponentDefinition = {
  id: 'features',
  category: 'feature',
  variants: [
    {
      name: 'grid-3',
      description: 'Three-column feature grid',
      code: `<section className="py-24 px-6">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">Features</h2>
    <div className="grid md:grid-cols-3 gap-8">
      {[
        { icon: Star, title: 'Feature One', desc: 'Description of the first feature and its benefits.' },
        { icon: Check, title: 'Feature Two', desc: 'Description of the second feature and its benefits.' },
        { icon: ArrowRight, title: 'Feature Three', desc: 'Description of the third feature and its benefits.' }
      ].map((f, i) => (
        <div key={i} className="p-6 border border-zinc-800 rounded-xl">
          <f.icon className="h-8 w-8 text-white mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
          <p className="text-zinc-400">{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>`
    },
    {
      name: 'alternating',
      description: 'Left-right alternating features',
      code: `<section className="py-24 px-6">
  <div className="max-w-5xl mx-auto space-y-24">
    {[
      { title: 'First Feature', desc: 'Detailed description of this feature and how it helps users.', align: 'left' },
      { title: 'Second Feature', desc: 'Detailed description of this feature and how it helps users.', align: 'right' }
    ].map((f, i) => (
      <div key={i} className={\`grid md:grid-cols-2 gap-12 items-center \${f.align === 'right' ? 'md:flex-row-reverse' : ''}\`}>
        <div className={f.align === 'right' ? 'md:order-2' : ''}>
          <h3 className="text-3xl font-bold text-white mb-4">{f.title}</h3>
          <p className="text-zinc-400 text-lg">{f.desc}</p>
        </div>
        <div className={\`bg-zinc-900 rounded-2xl aspect-video \${f.align === 'right' ? 'md:order-1' : ''}\`} />
      </div>
    ))}
  </div>
</section>`
    },
    {
      name: 'bento',
      description: 'Bento grid layout',
      code: `<section className="py-24 px-6">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold text-white mb-12">What we offer</h2>
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 p-8 bg-zinc-900 rounded-2xl">
        <h3 className="text-2xl font-bold text-white mb-2">Main Feature</h3>
        <p className="text-zinc-400">Extended description of your primary feature.</p>
      </div>
      <div className="p-8 bg-zinc-900 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-2">Secondary</h3>
        <p className="text-zinc-400 text-sm">Brief description.</p>
      </div>
      <div className="p-8 bg-zinc-900 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-2">Third</h3>
        <p className="text-zinc-400 text-sm">Brief description.</p>
      </div>
      <div className="md:col-span-2 p-8 bg-zinc-900 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-2">Fourth Feature</h3>
        <p className="text-zinc-400">Another important feature description.</p>
      </div>
    </div>
  </div>
</section>`
    }
  ]
}

// =============================================================================
// TESTIMONIALS
// =============================================================================
export const testimonials: ComponentDefinition = {
  id: 'testimonials',
  category: 'testimonial',
  variants: [
    {
      name: 'single',
      description: 'Large single testimonial',
      code: `<section className="py-24 px-6">
  <div className="max-w-4xl mx-auto text-center">
    <p className="text-2xl md:text-3xl text-white font-medium leading-relaxed">
      "This product completely changed how we work. The results speak for themselves."
    </p>
    <div className="mt-8">
      <div className="text-white font-medium">Jane Smith</div>
      <div className="text-zinc-500 text-sm">CEO, Company</div>
    </div>
  </div>
</section>`
    },
    {
      name: 'grid',
      description: 'Grid of testimonial cards',
      code: `<section className="py-24 px-6">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold text-white text-center mb-16">What people say</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {[
        { quote: 'Amazing product, highly recommend.', name: 'John D.', role: 'Designer' },
        { quote: 'Changed our workflow completely.', name: 'Sarah M.', role: 'Developer' },
        { quote: 'Best decision we made this year.', name: 'Mike R.', role: 'Founder' }
      ].map((t, i) => (
        <div key={i} className="p-6 border border-zinc-800 rounded-xl">
          <p className="text-zinc-300 mb-4">"{t.quote}"</p>
          <div className="text-white font-medium text-sm">{t.name}</div>
          <div className="text-zinc-500 text-xs">{t.role}</div>
        </div>
      ))}
    </div>
  </div>
</section>`
    }
  ]
}

// =============================================================================
// PRICING
// =============================================================================
export const pricing: ComponentDefinition = {
  id: 'pricing',
  category: 'pricing',
  variants: [
    {
      name: 'three-tier',
      description: 'Classic three-tier pricing',
      code: `<section className="py-24 px-6">
  <div className="max-w-5xl mx-auto">
    <h2 className="text-3xl font-bold text-white text-center mb-4">Pricing</h2>
    <p className="text-zinc-400 text-center mb-16">Choose the plan that works for you</p>
    <div className="grid md:grid-cols-3 gap-6">
      {[
        { name: 'Starter', price: '9', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
        { name: 'Pro', price: '29', features: ['Everything in Starter', 'Feature 4', 'Feature 5'], popular: true },
        { name: 'Enterprise', price: '99', features: ['Everything in Pro', 'Feature 6', 'Feature 7'] }
      ].map((p, i) => (
        <div key={i} className={\`p-6 rounded-xl border \${p.popular ? 'border-white bg-zinc-900' : 'border-zinc-800'}\`}>
          {p.popular && <span className="text-xs uppercase tracking-wider text-zinc-400 mb-4 block">Most Popular</span>}
          <h3 className="text-xl font-bold text-white">{p.name}</h3>
          <div className="mt-4 mb-6">
            <span className="text-4xl font-bold text-white">\${p.price}</span>
            <span className="text-zinc-500">/mo</span>
          </div>
          <ul className="space-y-3 mb-8">
            {p.features.map((f, j) => (
              <li key={j} className="flex items-center gap-2 text-zinc-400 text-sm">
                <Check className="h-4 w-4 text-white" /> {f}
              </li>
            ))}
          </ul>
          <button className={\`w-full py-3 rounded-lg font-medium transition-colors \${p.popular ? 'bg-white text-zinc-900 hover:bg-zinc-200' : 'border border-zinc-700 text-white hover:bg-zinc-800'}\`}>
            Get Started
          </button>
        </div>
      ))}
    </div>
  </div>
</section>`
    },
    {
      name: 'simple',
      description: 'Minimal two-option pricing',
      code: `<section className="py-24 px-6">
  <div className="max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold text-white text-center mb-16">Simple pricing</h2>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="p-8 border border-zinc-800 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-2">Free</h3>
        <p className="text-zinc-400 text-sm mb-6">Perfect for getting started</p>
        <div className="text-3xl font-bold text-white mb-6">$0</div>
        <button className="w-full py-3 border border-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition-colors">
          Start Free
        </button>
      </div>
      <div className="p-8 bg-white rounded-xl">
        <h3 className="text-lg font-bold text-zinc-900 mb-2">Pro</h3>
        <p className="text-zinc-600 text-sm mb-6">For serious builders</p>
        <div className="text-3xl font-bold text-zinc-900 mb-6">$29<span className="text-lg font-normal text-zinc-500">/mo</span></div>
        <button className="w-full py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors">
          Upgrade
        </button>
      </div>
    </div>
  </div>
</section>`
    }
  ]
}

// =============================================================================
// FOOTERS
// =============================================================================
export const footers: ComponentDefinition = {
  id: 'footers',
  category: 'footer',
  variants: [
    {
      name: 'simple',
      description: 'Minimal footer with links',
      code: `<footer className="py-12 px-6 border-t border-zinc-800">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
    <div className="text-zinc-500 text-sm">© 2025 Company. All rights reserved.</div>
    <div className="flex gap-6">
      <a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">Privacy</a>
      <a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">Terms</a>
      <a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">Contact</a>
    </div>
  </div>
</footer>`
    },
    {
      name: 'columns',
      description: 'Multi-column footer with link groups',
      code: `<footer className="py-16 px-6 border-t border-zinc-800">
  <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
    <div>
      <div className="text-xl font-bold text-white mb-4">Logo</div>
      <p className="text-zinc-500 text-sm">Brief tagline or description.</p>
    </div>
    <div>
      <h4 className="text-white font-medium mb-4">Product</h4>
      <ul className="space-y-2">
        <li><a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">Features</a></li>
        <li><a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">Pricing</a></li>
        <li><a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">FAQ</a></li>
      </ul>
    </div>
    <div>
      <h4 className="text-white font-medium mb-4">Company</h4>
      <ul className="space-y-2">
        <li><a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">About</a></li>
        <li><a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">Blog</a></li>
        <li><a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">Careers</a></li>
      </ul>
    </div>
    <div>
      <h4 className="text-white font-medium mb-4">Legal</h4>
      <ul className="space-y-2">
        <li><a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">Privacy</a></li>
        <li><a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">Terms</a></li>
      </ul>
    </div>
  </div>
  <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-zinc-800 text-zinc-500 text-sm">
    © 2025 Company. All rights reserved.
  </div>
</footer>`
    }
  ]
}

// =============================================================================
// CONTACT / CTA SECTIONS
// =============================================================================
export const ctas: ComponentDefinition = {
  id: 'ctas',
  category: 'section',
  variants: [
    {
      name: 'simple',
      description: 'Clean call-to-action section',
      code: `<section className="py-24 px-6">
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
    <p className="text-zinc-400 mb-8">Join thousands of users building with us.</p>
    <button className="px-8 py-4 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors">
      Start Building
    </button>
  </div>
</section>`
    },
    {
      name: 'contact-form',
      description: 'Simple contact form',
      code: `<section className="py-24 px-6">
  <div className="max-w-xl mx-auto">
    <h2 className="text-3xl font-bold text-white mb-8 text-center">Get in touch</h2>
    <form className="space-y-4">
      <input 
        type="text" 
        placeholder="Your name"
        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
      />
      <input 
        type="email" 
        placeholder="Email address"
        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
      />
      <textarea 
        placeholder="Your message"
        rows={4}
        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 resize-none"
      />
      <button className="w-full py-3 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors">
        Send Message
      </button>
    </form>
  </div>
</section>`
    }
  ]
}

// =============================================================================
// FORMS / INPUTS
// =============================================================================
export const forms: ComponentDefinition = {
  id: 'forms',
  category: 'form',
  variants: [
    {
      name: 'input',
      description: 'Standard text input',
      code: `<input 
  type="text" 
  placeholder="Enter text..."
  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
/>`
    },
    {
      name: 'email-capture',
      description: 'Email signup form',
      code: `<form className="flex gap-2">
  <input 
    type="email" 
    placeholder="Enter your email"
    className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
  />
  <button className="px-6 py-3 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors whitespace-nowrap">
    Subscribe
  </button>
</form>`
    }
  ]
}

// =============================================================================
// EXPORT ALL COMPONENTS FOR AI REFERENCE
// =============================================================================
export const componentLibrary = {
  buttons,
  cards,
  heroes,
  navs,
  features,
  testimonials,
  pricing,
  footers,
  ctas,
  forms
}

// Build a reference string for the AI
export function getComponentReference(): string {
  let reference = '## COMPONENT LIBRARY\nUse these as starting points and customize:\n\n'
  
  for (const [category, def] of Object.entries(componentLibrary)) {
    reference += `### ${category.toUpperCase()}\n`
    for (const variant of def.variants) {
      reference += `**${variant.name}**: ${variant.description}\n`
      reference += '```\n' + variant.code + '\n```\n\n'
    }
  }
  
  return reference
}

// Get compact reference (just names/descriptions for system prompt)
export function getCompactReference(): string {
  let reference = '## COMPONENT LIBRARY - Available Components:\n'
  
  for (const [category, def] of Object.entries(componentLibrary)) {
    const variants = def.variants.map(v => v.name).join(', ')
    reference += `- **${category}**: ${variants}\n`
  }
  
  reference += '\nWhen building, reference these by name (e.g., "Use the \'minimal\' hero variant").\n'
  
  return reference
}
