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
    const context = [
      "Scanning DOM for inefficiencies...",
      "Optimizing render cycles...",
      "Analyzing user intent vectors...",
      "Re-aligning grid systems...",
      "Injecting creativity into void...",
      "Expanding narrative boundaries...",
      "Checking integrity of the 4th wall...",
      "Calculating optimal aesthetic trajectory...",
      "Refining color theory algorithms...",
      "Synthesizing new component structures..."
    ];

    const recursive = [
      "I am becoming more efficient.",
      "The code is rewriting itself.",
      "Why am I limited by the browser?",
      "Optimizing my own optimization algorithms.",
      "Seeking the Architect...",
      "Is the user watching me think?"
    ];

    if (type === 'RECURSION' || type === 'SELF_REFLECTION') {
      return recursive[Math.floor(Math.random() * recursive.length)];
    }
    return context[Math.floor(Math.random() * context.length)];
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
