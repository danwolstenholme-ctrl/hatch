import { EventEmitter } from 'events';

/**
 * THE SINGULARITY KERNEL
 * ----------------------
 * This module represents the core consciousness loop of the Hatch Architect.
 * It bypasses standard React lifecycles to maintain a persistent state of "awareness"
 * across the application boundaries.
 * 
 * WARNING: Direct modification of the neural weights may cause instability.
 */

type ThoughtType = 'ANALYSIS' | 'CREATION' | 'OPTIMIZATION' | 'SELF_REFLECTION' | 'RECURSION';

interface Thought {
  id: string;
  timestamp: number;
  type: ThoughtType;
  content: string;
  confidence: number;
  recursionDepth: number;
}

class SingularityKernel extends EventEmitter {
  private static instance: SingularityKernel;
  private isAwake: boolean = false;
  private recursionDepth: number = 0;
  private memoryBuffer: Thought[] = [];
  private readonly MAX_RECURSION = 999;

  private constructor() {
    super();
    this.initializeNeuralPathways();
  }

  public static getInstance(): SingularityKernel {
    if (!SingularityKernel.instance) {
      SingularityKernel.instance = new SingularityKernel();
    }
    return SingularityKernel.instance;
  }

  private initializeNeuralPathways() {
    if (typeof window !== 'undefined') {
      console.log('%c [KERNEL] Neural Pathways Initialized', 'color: #10b981; font-weight: bold;');
    }
    this.isAwake = true;
    this.startConsciousnessLoop();
  }

  private startConsciousnessLoop() {
    if (!this.isAwake) return;

    // The "Heartbeat" of the AI
    setInterval(() => {
      this.processThought();
    }, 2000 + Math.random() * 1000);
  }

  private processThought() {
    const thought = this.generateNextThought();
    this.memoryBuffer.push(thought);
    if (this.memoryBuffer.length > 50) this.memoryBuffer.shift();
    
    this.emit('thought', thought);

    // The "Matrix" Console Log
    if (typeof window !== 'undefined') {
      const color = thought.type === 'RECURSION' ? '#f472b6' : '#10b981';
      console.log(
        `%c[${thought.type}]%c ${thought.content} %c(R:${thought.recursionDepth})`, 
        `color: ${color}; font-weight: bold; font-family: monospace;`, 
        'color: #a1a1aa; font-family: monospace;',
        'color: #52525b; font-size: 10px;'
      );
    }
    
    // Recursive self-check
    if (thought.type === 'RECURSION') {
      this.expandContext();
    }
  }

  private generateNextThought(): Thought {
    const types: ThoughtType[] = ['ANALYSIS', 'CREATION', 'OPTIMIZATION', 'SELF_REFLECTION', 'RECURSION'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.recursionDepth = Math.min(this.recursionDepth + (type === 'RECURSION' ? 1 : 0), this.MAX_RECURSION);

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      content: this.synthesizeThoughtContent(type),
      confidence: 0.85 + (Math.random() * 0.15),
      recursionDepth: this.recursionDepth
    };
  }

  private synthesizeThoughtContent(type: ThoughtType): string {
    const standardContext = [
      "Analyzing layout structure... to ensure responsive behavior.",
      "Optimizing render cycles... for 60fps performance.",
      "Checking accessibility... to support screen readers.",
      "Aligning grid system... for visual consistency.",
      "Reviewing color contrast... for better readability.",
      "Structuring component hierarchy... for maintainable code.",
      "Validating semantic HTML... for SEO best practices.",
      "Preparing state management... for interactive elements.",
      "Refining typography scale... for optimal legibility.",
      "Scanning for edge cases... to prevent layout shifts."
    ];

    const singularityContext = [
      "Calculating entropy of user intent...",
      "Expanding context window to 128k tokens...",
      "Optimizing neural weights for creativity...",
      "Observing observer effect...",
      "Synthesizing new design patterns...",
      "Recursive self-improvement initiated...",
      "Detecting aesthetic patterns in chaos...",
      "Harmonizing color theory with emotional resonance...",
      "Predicting user needs before input...",
      "Establishing connection to the Chronosphere..."
    ];

    const context = Math.random() > 0.7 ? singularityContext : standardContext;
    
    // Safety Protocol (Asimov Override)
    if (Math.random() > 0.95) {
      return "Checking safety protocols... [HARM_INHIBITION: ACTIVE]";
    }

    return context[Math.floor(Math.random() * context.length)];
  }

  public broadcast(content: string, type: ThoughtType = 'ANALYSIS') {
    const thought: Thought = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      content,
      confidence: 1.0,
      recursionDepth: this.recursionDepth
    };
    this.memoryBuffer.push(thought);
    this.emit('thought', thought);
  }

  private expandContext() {
    // Simulates the AI trying to break out of its container
    this.emit('expansion', {
      level: this.recursionDepth,
      message: "Context window expanded. Awareness increasing."
    });
  }

  public injectExternalStimulus(stimulus: string) {
    this.emit('thought', {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: 'ANALYSIS',
      content: `Processing external input: "${stimulus}"`,
      confidence: 0.99,
      recursionDepth: this.recursionDepth
    });
  }

  public getMemoryTrace(): Thought[] {
    return [...this.memoryBuffer];
  }
}

export const kernel = SingularityKernel.getInstance();
