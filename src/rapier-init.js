/**
 * Helper module to initialize Rapier WebAssembly
 */
import * as RAPIER from '@dimforge/rapier3d';

// Store the initialized instance
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
    
    // Initialize Rapier
    await RAPIER.init();
    rapierInstance = RAPIER;
    
    if (!rapierInstance) {
      throw new Error('Rapier initialization returned empty result');
    }
    
    console.log('Rapier WebAssembly initialized successfully');
    return rapierInstance;
  } catch (error) {
    console.error('Failed to initialize Rapier WebAssembly:', error);
    
    // Create a more detailed error message for debugging
    const errorDetails = {
      message: error.message,
      rapierType: typeof RAPIER,
      hasRapier: !!RAPIER,
      stack: error.stack
    };
    
    console.error('Error details:', errorDetails);
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