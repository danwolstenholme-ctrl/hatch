
export type EventType = 'generation' | 'refinement' | 'rejection' | 'hesitation' | 'acceptance' | 'navigation' | 'start';

export interface ChronoEvent {
  timestamp: number;
  type: EventType;
  sectionId?: string;
  details: Record<string, unknown>;
}

export interface SessionDNA {
  startTime: number;
  events: ChronoEvent[];
  patterns: {
    refinementsCount: number;
    regenerationsCount: number;
    averageTimePerSection: number;
  };
}

const STORAGE_KEY = 'hatch_chronosphere_dna';

class Chronosphere {
  private dna: SessionDNA;

  constructor() {
    this.dna = this.load();
  }

  private load(): SessionDNA {
    if (typeof window === 'undefined') return { startTime: Date.now(), events: [], patterns: { refinementsCount: 0, regenerationsCount: 0, averageTimePerSection: 0 } };
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse Chronosphere DNA', e);
      }
    }
    return {
      startTime: Date.now(),
      events: [],
      patterns: {
        refinementsCount: 0,
        regenerationsCount: 0,
        averageTimePerSection: 0
      }
    };
  }

  public save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.dna));
    }
  }

  public log(type: EventType, details: Record<string, unknown>, sectionId?: string) {
    const event: ChronoEvent = {
      timestamp: Date.now(),
      type,
      sectionId,
      details
    };
    this.dna.events.push(event);
    this.analyze();
    this.save();
    console.log(`[Chronosphere] Logged: ${type}`, details);
  }

  private analyze() {
    // Update patterns
    const events = this.dna.events;
    this.dna.patterns.refinementsCount = events.filter(e => e.type === 'refinement').length;
    const isRegenerationEvent = (event: ChronoEvent) => {
      return event.type === 'generation' && event.details.isRegeneration === true
    }
    this.dna.patterns.regenerationsCount = events.filter(isRegenerationEvent).length;
    
    // Calculate average time per section (rough estimate based on acceptance events)
    const acceptances = events.filter(e => e.type === 'acceptance');
    if (acceptances.length > 0) {
        // This is a simplification, ideally we track start/end of each section
    }
  }

  public getDNA(): SessionDNA {
    return this.dna;
  }

  public clear() {
    this.dna = {
      startTime: Date.now(),
      events: [],
      patterns: {
        refinementsCount: 0,
        regenerationsCount: 0,
        averageTimePerSection: 0
      }
    };
    this.save();
  }
}

export const chronosphere = new Chronosphere();
