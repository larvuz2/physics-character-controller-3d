/**
 * Helper module to initialize Rapier WebAssembly
 */
import * as RAPIER from '@dimforge/rapier3d';

let rapierInstance = null;

/**
 * Initialize Rapier WebAssembly
 * @returns {Promise<Object>} - Initialized Rapier instance
 */
export async function initRapier() {
  if (rapierInstance) {
    return rapierInstance;
  }

  try {
    console.log('Initializing Rapier WebAssembly...');
    rapierInstance = await RAPIER.init();
    console.log('Rapier WebAssembly initialized successfully');
    return rapierInstance;
  } catch (error) {
    console.error('Failed to initialize Rapier WebAssembly:', error);
    throw error;
  }
}

/**
 * Get the initialized Rapier instance
 * @returns {Object|null} - Rapier instance or null if not initialized
 */
export function getRapier() {
  return rapierInstance;
}