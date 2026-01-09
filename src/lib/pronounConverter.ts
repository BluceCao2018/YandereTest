/**
 * Pronoun converter for partner reports
 * Converts first-person pronouns to third-person (they/them)
 */

/**
 * Convert text from first-person to third-person for partner reports
 * You → They, Your → Their, etc.
 */
export function convertToPartnerReport(text: string): string {
  return text
    // Case-sensitive replacements (preserve capitalization at start of sentences)
    .replace(/\bYou are\b/gi, 'They are')
    .replace(/\bYou're\b/gi, "They're")
    .replace(/\bYou have\b/gi, 'They have')
    .replace(/\bYou haven't\b/gi, "They haven't")
    .replace(/\bYou will\b/gi, 'They will')
    .replace(/\bYou won't\b/gi, "They won't")
    .replace(/\bYou don't\b/gi, "They don't")
    .replace(/\bYou doesn't\b/gi, "They don't")
    .replace(/\bYou did\b/gi, 'They did')
    .replace(/\bYou didn't\b/gi, "They didn't")
    .replace(/\bYou do\b/gi, 'They do')
    .replace(/\bYou can\b/gi, 'They can')
    .replace(/\bYou can't\b/gi, "They can't")
    .replace(/\bYou cannot\b/gi, 'They cannot')
    .replace(/\bYou should\b/gi, 'They should')
    .replace(/\bYou shouldn't\b/gi, "They shouldn't")
    .replace(/\bYou would\b/gi, 'They would')
    .replace(/\bYou wouldn't\b/gi, "They wouldn't")
    .replace(/\bYou could\b/gi, 'They could')
    .replace(/\bYou couldn't\b/gi, "They couldn't")
    .replace(/\bYou might\b/gi, 'They might')
    .replace(/\bYou may\b/gi, 'They may')
    .replace(/\bYou must\b/gi, 'They must')
    // Handle capitalized "You" at start of sentences
    .replace(/^You\b/gm, 'They')
    .replace(/^You're\b/gm, "They're")
    // Your/Their
    .replace(/\byour\b/gi, 'their')
    .replace(/^Your\b/gm, 'Their')
    .replace(/\byours\b/gi, 'theirs')
    .replace(/^Yours\b/gm, 'Theirs')
    // Yourself/themselves
    .replace(/\byourself\b/gi, 'themselves')
    // I/We (if any slip through) - these should become "You" from perspective of observer
    .replace(/\bI am\b/gi, 'They are')
    .replace(/\bI'm\b/gi, "They're")
    .replace(/\bI have\b/gi, 'They have')
    .replace(/\bI'll\b/gi, "They'll")
    .replace(/\bI'd\b/gi, "They'd")
    .replace(/\bmy\b/gi, 'their')
    .replace(/\bme\b/gi, 'them')
    // My/Our
    .replace(/\bMy\b/g, 'Their')
    // Final catch-all for standalone "you" or "You"
    .replace(/\bYou\b/g, 'They')
    .replace(/\byou\b/g, 'they');
}

/**
 * Get pronoun labels for partner report
 */
export function getPartnerPronouns() {
  return {
    subject: 'They',
    object: 'them',
    possessive: 'their',
    possessivePronoun: 'theirs',
    reflexive: 'themselves',
  };
}
