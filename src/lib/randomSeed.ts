/**
 * Random seed utilities for reproducible content generation
 */

export interface RandomSeeds {
  controlTitle: number;
  controlCopy: number;
  jealousyTitle: number;
  jealousyCopy: number;
  dependencyTitle: number;
  dependencyCopy: number;
  insecurityTitle: number;
  insecurityCopy: number;
  redFlagMessage: number;
  redFlagUnlockText: number;
  shareCopy: number;
}

/**
 * Generate random seeds for all content that needs to be saved
 */
export function generateRandomSeeds(): RandomSeeds {
  return {
    controlTitle: Math.floor(Math.random() * 1000),
    controlCopy: Math.floor(Math.random() * 1000),
    jealousyTitle: Math.floor(Math.random() * 1000),
    jealousyCopy: Math.floor(Math.random() * 1000),
    dependencyTitle: Math.floor(Math.random() * 1000),
    dependencyCopy: Math.floor(Math.random() * 1000),
    insecurityTitle: Math.floor(Math.random() * 1000),
    insecurityCopy: Math.floor(Math.random() * 1000),
    redFlagMessage: Math.floor(Math.random() * 1000),
    redFlagUnlockText: Math.floor(Math.random() * 1000),
    shareCopy: Math.floor(Math.random() * 1000),
  };
}

/**
 * Get a random item from an array using a seed
 */
export function getRandomItemBySeed<T>(array: T[], seed: number): T {
  return array[seed % array.length];
}
