import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

// =============================================================================
// GENERATE STRUCTURE API
// AI suggests site structure based on project description
// Uses Gemini 2.0 Flash for fast suggestions
// =============================================================================

const geminiApiKey = process.env.GEMINI_API_KEY
const genai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null

interface PageConfig {
  name: string
  path: string
  sections: string[]
}

const VALID_SECTIONS = [
  'header', 'hero', 'features', 'services', 'about', 'testimonials',
  'pricing', 'stats', 'work', 'faq', 'cta', 'contact', 'footer'
]

export async function POST(request: NextRequest) {
  try {
    const { name, description, siteType } = await request.json()
    
    if (!description) {
      // Return default structure if no description
      return NextResponse.json({
        pages: getDefaultPagesForType(siteType || 'business')
      })
    }

    if (!genai) {
      // No API key - return defaults
      return NextResponse.json({
        pages: getDefaultPagesForType(siteType || 'business')
      })
    }

    const prompt = `You are a web designer planning a website structure.

PROJECT: ${name || 'Website'}
DESCRIPTION: ${description}
TYPE: ${siteType || 'business'}

Available sections (use ONLY these exact IDs):
- header (required, always first)
- hero (main banner/intro)
- features (feature grid)
- services (service offerings)
- about (about the company/person)
- testimonials (customer reviews)
- pricing (pricing tables)
- stats (statistics/numbers)
- work (portfolio/case studies)
- faq (frequently asked questions)
- cta (call to action)
- contact (contact form)
- footer (required, always last)

Based on the description, suggest the optimal page structure.
For most sites, 1-2 pages is enough. Only suggest more if clearly needed.

Respond with ONLY valid JSON in this exact format:
{
  "pages": [
    {
      "name": "Home",
      "path": "/",
      "sections": ["header", "hero", "features", "testimonials", "cta", "footer"]
    }
  ]
}

Rules:
1. Every page MUST have "header" first and "footer" last
2. Use ONLY the section IDs listed above
3. Order sections logically (hero near top, contact/cta near bottom)
4. Home page path is always "/"
5. Other pages use lowercase paths like "/about", "/pricing"
6. Maximum 4 pages unless clearly needed
7. Choose sections that make sense for this specific business

Return ONLY the JSON, no explanation.`

    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt
    })
    
    const text = response.text || ''
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({
        pages: getDefaultPagesForType(siteType)
      })
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    // Validate and sanitize the response
    if (!parsed.pages || !Array.isArray(parsed.pages)) {
      return NextResponse.json({
        pages: getDefaultPagesForType(siteType)
      })
    }

    const validatedPages: PageConfig[] = parsed.pages.map((page: PageConfig, index: number) => {
      // Filter to only valid sections
      let sections = (page.sections || [])
        .filter((s: string) => VALID_SECTIONS.includes(s))
      
      // Ensure header is first
      if (!sections.includes('header')) {
        sections = ['header', ...sections]
      } else {
        sections = sections.filter((s: string) => s !== 'header')
        sections = ['header', ...sections]
      }
      
      // Ensure footer is last
      if (!sections.includes('footer')) {
        sections = [...sections, 'footer']
      } else {
        sections = sections.filter((s: string) => s !== 'footer')
        sections = [...sections, 'footer']
      }

      return {
        name: page.name || `Page ${index + 1}`,
        path: index === 0 ? '/' : (page.path || `/${page.name?.toLowerCase().replace(/\s+/g, '-') || `page-${index}`}`),
        sections
      }
    })

    return NextResponse.json({
      pages: validatedPages
    })

  } catch (error) {
    console.error('Generate structure error:', error)
    return NextResponse.json({
      pages: getDefaultPagesForType('business')
    })
  }
}

function getDefaultPagesForType(siteType: string): PageConfig[] {
  switch (siteType) {
    case 'portfolio':
      return [
        { name: 'Home', path: '/', sections: ['header', 'hero', 'work', 'about', 'contact', 'footer'] }
      ]
    case 'saas':
      return [
        { name: 'Home', path: '/', sections: ['header', 'hero', 'features', 'pricing', 'testimonials', 'faq', 'cta', 'footer'] }
      ]
    case 'agency':
      return [
        { name: 'Home', path: '/', sections: ['header', 'hero', 'services', 'work', 'testimonials', 'cta', 'footer'] }
      ]
    case 'ecommerce':
      return [
        { name: 'Home', path: '/', sections: ['header', 'hero', 'features', 'testimonials', 'cta', 'footer'] }
      ]
    case 'blog':
      return [
        { name: 'Home', path: '/', sections: ['header', 'hero', 'about', 'contact', 'footer'] }
      ]
    case 'business':
    default:
      return [
        { name: 'Home', path: '/', sections: ['header', 'hero', 'services', 'testimonials', 'cta', 'footer'] }
      ]
  }
}
