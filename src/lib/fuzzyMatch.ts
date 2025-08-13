/**
 * Fuzzy matching utility for Greek text answers
 * Handles minor spelling errors and variations
 */

// Common Greek character replacements and variations
const GREEK_REPLACEMENTS: Record<string, string[]> = {
  'ει': ['η', 'ι'],
  'η': ['ει', 'ι'], 
  'ι': ['η', 'ει'],
  'ο': ['ω'],
  'ω': ['ο'],
  'υ': ['ου'],
  'ου': ['υ'],
  'αι': ['ε'],
  'ε': ['αι'],
  'αυ': ['αφ', 'αβ'],
  'ευ': ['εφ', 'εβ'],
  'ηυ': ['ηφ', 'ηβ'],
  'κ': ['χ'],
  'χ': ['κ'],
  'γ': ['ζ'],
  'ζ': ['γ'],
  'ντ': ['δ'],
  'δ': ['ντ'],
  'μπ': ['β'],
  'β': ['μπ'],
  'γκ': ['γ'],
  'γγ': ['γ'],
  'τσ': ['ς'],
  'τζ': ['ζ']
};

/**
 * Normalizes Greek text for comparison
 */
function normalizeGreekText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[άα]/g, 'α')
    .replace(/[έε]/g, 'ε')
    .replace(/[ήη]/g, 'η')
    .replace(/[ίι]/g, 'ι')
    .replace(/[όο]/g, 'ο')
    .replace(/[ύυ]/g, 'υ')
    .replace(/[ώω]/g, 'ω')
    .replace(/ς$/g, 'σ') // Final sigma to sigma
    .replace(/[.,;:!?]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize spaces
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculates similarity score between two normalized strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return (maxLength - distance) / maxLength;
}

/**
 * Checks if a user answer matches the correct answer with fuzzy matching
 * @param userAnswer - The answer provided by the user
 * @param correctAnswer - The correct answer
 * @param threshold - Similarity threshold (0.0 to 1.0), default 0.75
 * @returns Object with match result and similarity score
 */
export function fuzzyMatch(
  userAnswer: string, 
  correctAnswer: string, 
  threshold: number = 0.75
): { isMatch: boolean; similarity: number; normalizedUser: string; normalizedCorrect: string } {
  const normalizedUser = normalizeGreekText(userAnswer);
  const normalizedCorrect = normalizeGreekText(correctAnswer);
  
  // Exact match after normalization
  if (normalizedUser === normalizedCorrect) {
    return { 
      isMatch: true, 
      similarity: 1.0, 
      normalizedUser, 
      normalizedCorrect 
    };
  }
  
  // Calculate base similarity
  let similarity = calculateSimilarity(normalizedUser, normalizedCorrect);
  
  // Try common Greek replacements to improve similarity
  let bestSimilarity = similarity;
  let bestUserVariant = normalizedUser;
  
  // Generate variants of user input with common replacements
  const userVariants = generateVariants(normalizedUser);
  
  for (const variant of userVariants) {
    const variantSimilarity = calculateSimilarity(variant, normalizedCorrect);
    if (variantSimilarity > bestSimilarity) {
      bestSimilarity = variantSimilarity;
      bestUserVariant = variant;
    }
  }
  
  return {
    isMatch: bestSimilarity >= threshold,
    similarity: bestSimilarity,
    normalizedUser: bestUserVariant,
    normalizedCorrect
  };
}

/**
 * Generates variants of a word using common Greek replacements
 */
function generateVariants(text: string): string[] {
  const variants = new Set([text]);
  
  // Apply each replacement rule
  for (const [pattern, replacements] of Object.entries(GREEK_REPLACEMENTS)) {
    const currentVariants = Array.from(variants);
    
    for (const variant of currentVariants) {
      for (const replacement of replacements) {
        if (variant.includes(pattern)) {
          variants.add(variant.replace(new RegExp(pattern, 'g'), replacement));
        }
        if (variant.includes(replacement)) {
          variants.add(variant.replace(new RegExp(replacement, 'g'), pattern));
        }
      }
    }
  }
  
  return Array.from(variants);
}

/**
 * Checks multiple answers against multiple correct answers
 * Used for fill-in-the-blank exercises with multiple blanks
 */
export function fuzzyMatchMultiple(
  userAnswers: string[], 
  correctAnswers: string[], 
  threshold: number = 0.75
): { matches: boolean[]; overallMatch: boolean; details: ReturnType<typeof fuzzyMatch>[] } {
  if (userAnswers.length !== correctAnswers.length) {
    return {
      matches: new Array(Math.max(userAnswers.length, correctAnswers.length)).fill(false),
      overallMatch: false,
      details: []
    };
  }
  
  const details = userAnswers.map((userAnswer, index) => 
    fuzzyMatch(userAnswer, correctAnswers[index], threshold)
  );
  
  const matches = details.map(detail => detail.isMatch);
  const overallMatch = matches.every(match => match);
  
  return { matches, overallMatch, details };
}