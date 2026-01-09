// Design Tokens - Global styling controls
// These tokens are applied to all generated components

export interface DesignTokens {
  // Spacing
  sectionPadding: number // px - vertical padding for sections
  componentGap: number // px - gap between components
  buttonPadding: string // CSS padding value for buttons

  // Typography
  headingSizeMultiplier: number // 0.8 - 1.5, multiplier for heading sizes
  bodySizeMultiplier: number // 0.8 - 1.2, multiplier for body text
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold'

  // Borders
  borderRadius: number // px - global border radius
  borderWidth: number // px - border thickness

  // Effects
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong'
}

export const defaultTokens: DesignTokens = {
  sectionPadding: 80,
  componentGap: 24,
  buttonPadding: '12px 24px',
  headingSizeMultiplier: 1,
  bodySizeMultiplier: 1,
  fontWeight: 'medium',
  borderRadius: 12,
  borderWidth: 1,
  shadowIntensity: 'subtle',
}

// Convert tokens to Tailwind-compatible CSS variables
export function tokensToCSS(tokens: DesignTokens): string {
  const shadowMap = {
    none: 'none',
    subtle: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    medium: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    strong: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  }

  return `
    --section-padding: ${tokens.sectionPadding}px;
    --component-gap: ${tokens.componentGap}px;
    --button-padding: ${tokens.buttonPadding};
    --heading-multiplier: ${tokens.headingSizeMultiplier};
    --body-multiplier: ${tokens.bodySizeMultiplier};
    --font-weight: ${tokens.fontWeight === 'normal' ? 400 : tokens.fontWeight === 'medium' ? 500 : tokens.fontWeight === 'semibold' ? 600 : 700};
    --border-radius: ${tokens.borderRadius}px;
    --border-width: ${tokens.borderWidth}px;
    --shadow: ${shadowMap[tokens.shadowIntensity]};
  `.trim()
}

// Token presets for quick selection
export const tokenPresets: Record<string, Partial<DesignTokens>> = {
  minimal: {
    sectionPadding: 64,
    componentGap: 16,
    borderRadius: 4,
    shadowIntensity: 'none',
    fontWeight: 'normal',
  },
  modern: {
    sectionPadding: 80,
    componentGap: 24,
    borderRadius: 12,
    shadowIntensity: 'subtle',
    fontWeight: 'medium',
  },
  bold: {
    sectionPadding: 96,
    componentGap: 32,
    borderRadius: 16,
    shadowIntensity: 'medium',
    fontWeight: 'bold',
    headingSizeMultiplier: 1.2,
  },
  soft: {
    sectionPadding: 80,
    componentGap: 24,
    borderRadius: 24,
    shadowIntensity: 'subtle',
    fontWeight: 'normal',
    borderWidth: 0,
  },
}
