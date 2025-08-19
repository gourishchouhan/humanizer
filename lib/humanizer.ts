// lib/humanizer.ts

export type StyleProfile = 
  | "casual" 
  | "professional" 
  | "storyteller" 
  | "academic" 
  | "conversational"
  | "technical";

export interface HumanizationOptions {
  style: StyleProfile;
  preserveFormatting?: boolean;
  intensityLevel?: 1 | 2 | 3 | 4 | 5; // 1 = subtle, 5 = heavy
  maintainTone?: boolean;
}

interface SentenceMetrics {
  length: number;
  complexity: number;
  hasConjunction: boolean;
  startsWithTransition: boolean;
}

export class TextHumanizer {
  private readonly contractionMap = new Map([
    ["cannot", "can't"],
    ["will not", "won't"], 
    ["shall not", "shan't"],
    ["do not", "don't"],
    ["does not", "doesn't"],
    ["did not", "didn't"],
    ["have not", "haven't"],
    ["has not", "hasn't"],
    ["had not", "hadn't"],
    ["would not", "wouldn't"],
    ["could not", "couldn't"],
    ["should not", "shouldn't"],
    ["might not", "mightn't"],
    ["must not", "mustn't"],
    ["you are", "you're"],
    ["we are", "we're"],
    ["they are", "they're"],
    ["it is", "it's"],
    ["that is", "that's"],
    ["there is", "there's"],
    ["I will", "I'll"],
    ["you will", "you'll"],
    ["we will", "we'll"],
    ["they will", "they'll"],
    ["I have", "I've"],
    ["you have", "you've"],
    ["we have", "we've"],
    ["they have", "they've"],
  ]);

  private readonly sophisticatedReplacements = new Map([
    // Overly formal phrases
    ["in order to", ["to", "so we can", "to help"]],
    ["due to the fact that", ["because", "since", "given that"]],
    ["for the purpose of", ["to", "for", "so we can"]],
    ["with regard to", ["about", "regarding", "concerning"]],
    ["in the event that", ["if", "should", "when"]],
    ["prior to", ["before", "ahead of"]],
    ["subsequent to", ["after", "following"]],
    ["in close proximity to", ["near", "close to", "next to"]],
    
    // AI-ish words
    ["utilize", ["use", "employ", "apply"]],
    ["leverage", ["use", "apply", "harness", "tap into"]],
    ["facilitate", ["help", "enable", "make easier", "support"]],
    ["implement", ["set up", "put in place", "carry out", "execute"]],
    ["optimized", ["improved", "enhanced", "refined", "fine-tuned"]],
    ["innovative", ["new", "creative", "fresh", "novel"]],
    ["cutting-edge", ["latest", "advanced", "modern", "state-of-the-art"]],
    
    // Redundant phrases
    ["absolutely essential", ["essential", "crucial", "vital"]],
    ["completely finished", ["finished", "done", "complete"]],
    ["totally unique", ["unique", "one-of-a-kind", "distinct"]],
    ["very important", ["important", "crucial", "significant"]],
  ]);

  private readonly transitionPhrases: Record<StyleProfile, string[]> = {
    casual: [
      "So here's the thing:", "Look,", "Honestly,", "You know what?", 
      "Here's what I think:", "To be fair,", "Let me put it this way:",
      "The way I see it,", "Bottom line:"
    ],
    professional: [
      "Let me clarify:", "To elaborate:", "In essence:", "Put simply:",
      "The key point is:", "What this means is:", "To summarize:"
    ],
    storyteller: [
      "Picture this:", "Here's where it gets interesting:", 
      "But wait, there's more:", "And then something unexpected happened:",
      "Little did they know,", "Against all odds,", "In a surprising turn:"
    ],
    conversational: [
      "You know,", "I mean,", "Think about it:", "Here's the deal:",
      "Between you and me,", "Let's be real,", "The truth is,"
    ],
    academic: [
      "It's worth noting that", "Research suggests that", "Evidence indicates",
      "Studies have shown that", "Analysis reveals that", "Data suggests"
    ],
    technical: [
      "In technical terms,", "From an implementation standpoint,", 
      "Architecturally speaking,", "In practice,", "Operationally,"
    ]
  };

  private readonly sentenceEnders: Partial<Record<StyleProfile, string[]>> = {
    casual: [" — just my take.", " — you feel me?", " — at least that's what I think."],
    storyteller: [" — and that's when everything changed.", " — plot twist!", " — who could have seen that coming?"],
    conversational: [" — make sense?", " — you know what I mean?", " — right?"],
  };

  public humanize(
    text: string, 
    options: HumanizationOptions = { style: "casual", intensityLevel: 3 }
  ): string {
    if (!text?.trim()) return "";
    
    let processed = text;
    
    // Phase 1: Text normalization and cleanup
    processed = this.normalizeText(processed);
    
    // Phase 2: Sophisticated word/phrase replacements
    processed = this.applySophisticatedReplacements(processed, options);
    
    // Phase 3: Sentence structure analysis and variation
    processed = this.varySentenceStructure(processed, options);
    
    // Phase 4: Style-specific transformations
    processed = this.applyStyleProfile(processed, options);
    
    // Phase 5: Natural flow and rhythm adjustments
    processed = this.enhanceNaturalFlow(processed, options);
    
    // Phase 6: Final polish and quality assurance
    processed = this.finalPolish(processed, options);
    
    return processed;
  }

  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/([(])\s+/g, "$1")
      .replace(/\s+([)])/g, "$1")
      .replace(/\.{3,}/g, "…")
      .replace(/([.!?])([A-Z])/g, "$1 $2")
      .trim();
  }

  private applySophisticatedReplacements(
    text: string, 
    options: HumanizationOptions
  ): string {
    let result = text;
    
    // Context-aware replacements
    for (const [pattern, replacements] of this.sophisticatedReplacements) {
      const regex = new RegExp(`\\b${pattern}\\b`, "gi");
      result = result.replace(regex, (match, offset) => {
        // Check context before replacing
        const contextBefore = result.slice(Math.max(0, offset - 50), offset);
        const contextAfter = result.slice(offset + match.length, offset + match.length + 50);
        
        // Choose replacement based on style and context
        const replacement = this.selectBestReplacement(
          replacements, 
          options.style, 
          contextBefore + contextAfter
        );
        
        return this.preserveCapitalization(match, replacement);
      });
    }

    // Apply contractions for casual styles
    if (["casual", "conversational"].includes(options.style) && 
        (options.intensityLevel || 3) >= 2) {
      for (const [full, contracted] of this.contractionMap) {
        const regex = new RegExp(`\\b${full}\\b`, "gi");
        result = result.replace(regex, (match) => 
          this.preserveCapitalization(match, contracted)
        );
      }
    }

    return result;
  }

  private selectBestReplacement(
    options: string[], 
    style: StyleProfile, 
    context: string
  ): string {
    // Weight selection based on style and context
    let weightedOptions = [...options];
    
    if (style === "professional" && options.length > 1) {
      // Prefer more formal alternatives for professional style
      weightedOptions = [options[options.length - 1], ...options.slice(0, -1)];
    } else if (style === "casual" && options.length > 0) {
      // Prefer simpler alternatives for casual style
      weightedOptions = [options[0], ...options.slice(1)];
    }
    
    return weightedOptions[0];
  }

  private varySentenceStructure(
    text: string, 
    options: HumanizationOptions
  ): string {
    const sentences = this.splitIntoSentences(text);
    const metrics = sentences.map(s => this.analyzeSentence(s));
    
    return sentences
      .map((sentence, index) => {
        const metric = metrics[index];
        let modified = sentence;
        
        // Add variety to sentence beginnings
        if (index > 0 && Math.random() < 0.15 * (options.intensityLevel || 3) / 5) {
          modified = this.varyBeginning(modified, options.style);
        }
        
        // Break up overly long sentences
        if (metric.length > 25 && metric.hasConjunction) {
          modified = this.splitLongSentence(modified);
        }
        
        // Combine short adjacent sentences occasionally
        if (index < sentences.length - 1 && 
            metric.length < 8 && 
            metrics[index + 1]?.length < 8 &&
            Math.random() < 0.3) {
          // This will be handled in the next iteration
        }
        
        return modified;
      })
      .join(" ");
  }

  private applyStyleProfile(
    text: string, 
    options: HumanizationOptions
  ): string {
    const sentences = this.splitIntoSentences(text);
    const intensity = (options.intensityLevel || 3) / 5;
    
    const styledSentences = sentences.map((sentence, index) => {
      let styled = sentence;
      
      // Add style-specific transitions
      if (Math.random() < 0.2 * intensity && this.transitionPhrases[options.style]) {
        const transitions = this.transitionPhrases[options.style];
        const transition = transitions[Math.floor(Math.random() * transitions.length)];
        styled = `${transition} ${styled.toLowerCase()}`;
        styled = styled.charAt(0).toUpperCase() + styled.slice(1);
      }
      
      // Add style-specific sentence endings (guard missing styles)
      if (Math.random() < 0.15 * intensity) {
        const enders = this.sentenceEnders[options.style];
        if (enders && enders.length) {
          const ender = enders[Math.floor(Math.random() * enders.length)];
          styled = styled.replace(/[.!?]$/, ender);
        }
      }
      
      return styled;
    });
    
    return styledSentences.join(" ");
  }

  private enhanceNaturalFlow(
    text: string, 
    options: HumanizationOptions
  ): string {
    let enhanced = text;
    const intensity = (options.intensityLevel || 3) / 5;
    
    // Add natural hesitations and fillers (sparingly)
    if (["casual", "conversational"].includes(options.style)) {
      enhanced = enhanced.replace(/(\.)\s+([A-Z])/g, (match, punct, letter) => {
        if (Math.random() < 0.1 * intensity) {
          const fillers = ["Well, ", "So, ", "I mean, ", "You know, "];
          const filler = fillers[Math.floor(Math.random() * fillers.length)];
          return `${punct} ${filler}${letter}`;
        }
        return match;
      });
    }
    
    // Add emphasis through punctuation variation
    enhanced = enhanced.replace(/(!)\s/g, (match) => {
      if (Math.random() < 0.1 * intensity) {
        return Math.random() < 0.5 ? "! " : "!! ";
      }
      return match;
    });
    
    return enhanced;
  }

  private finalPolish(text: string, options: HumanizationOptions): string {
    let polished = text;
    
    // Remove any double spaces
    polished = polished.replace(/\s{2,}/g, " ");
    
    // Ensure proper capitalization after punctuation
    polished = polished.replace(/([.!?])\s+([a-z])/g, (match, punct, letter) => 
      `${punct} ${letter.toUpperCase()}`
    );
    
    // Clean up any malformed sentences
    polished = polished.replace(/([a-z])\s*([.!?])\s*([.!?])/g, "$1$2 ");
    
    return polished.trim();
  }

  // Helper methods
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  private analyzeSentence(sentence: string): SentenceMetrics {
    const words = sentence.split(/\s+/).length;
    const hasConjunction = /\b(and|but|or|yet|so|for|nor|because|although|while|since)\b/i.test(sentence);
    const startsWithTransition = /^(however|therefore|furthermore|moreover|additionally|consequently)/i.test(sentence);
    
    return {
      length: words,
      complexity: hasConjunction ? 2 : 1,
      hasConjunction,
      startsWithTransition
    };
  }

  private varyBeginning(sentence: string, style: StyleProfile): string {
    // Add sentence variety based on style
    const beginnings = {
      casual: ["Actually, ", "So ", "Plus, ", "And hey, "],
      professional: ["Additionally, ", "Furthermore, ", "Moreover, "],
      storyteller: ["Then, ", "Suddenly, ", "Meanwhile, "]
    };
    
    const options = beginnings[style as keyof typeof beginnings] || ["Also, "];
    const beginning = options[Math.floor(Math.random() * options.length)];
    
    return beginning + sentence.toLowerCase();
  }

  private splitLongSentence(sentence: string): string {
    // Simple sentence splitting on conjunctions
    return sentence.replace(/\s+(and|but|so)\s+/i, ". ");
  }

  private preserveCapitalization(original: string, replacement: string): string {
    if (original[0] === original[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }
}

// Factory function for easy usage
export function humanizeAlgorithmic(
  text: string,
  style: StyleProfile = "casual",
  intensityLevel: 1 | 2 | 3 | 4 | 5 = 3
): string {
  const humanizer = new TextHumanizer();
  return humanizer.humanize(text, { style, intensityLevel });
}

// Convenience exports
export const humanize = humanizeAlgorithmic;
export default humanizeAlgorithmic;