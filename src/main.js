import { PhysicsWorld } from './physics.js';
import { CharacterController } from './character.js';
import { SceneManager } from './scene.js';
import { InputHandler } from './input.js';

/**
 * Main application class
 */
class Application {
    constructor() {
        // Initialize components
        this.physics = new PhysicsWorld();
        this.scene = new SceneManager();
        this.input = new InputHandler();
        
        // Connect scene manager to input handler
        this.input.setSceneManager(this.scene);
        
        // Game state
        this.lastTime = 0;
        this.isRunning = false;
        
        // Character and ground objects
        this.character = null;
        this.characterMesh = null;
        this.ground = null;
        this.groundMesh = null;
        
        // Debug info
        this.debugInfo = {
            showDebug: true,
            lastJumpTime: 0,
            lastGroundedState: true
        };
    }
    
    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing application...');
        
        // Initialize physics
        await this.physics.init();
        
        // Create ground
        this.ground = this.physics.createGround(50);
        this.groundMesh = this.scene.createGround(50);
        
        // Create character
        this.character = new CharacterController(this.physics);
        this.characterMesh = this.scene.createCharacter(0.5, 1.0);
        
        // Create additional platforms for testing
        this.createTestPlatforms();
        
        // Start the game loop
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        
        console.log('Application initialized');
    }
    
    /**
     * Create test platforms for jumping
     */
    createTestPlatforms() {
        // Create a few platforms at different heights
        const platformPositions = [
            { x: 5, y: 2, z: 5, size: 3 },
            { x: -5, y: 4, z: -5, size: 3 },
            { x: 10, y: 6, z: 0, size: 3 }
        ];
        
        platformPositions.forEach(platform => {
            // Create physics body
            const platformBody = this.physics.createPlatform(
                platform.x, platform.y, platform.z,
                platform.size, 0.5, platform.size
            );
            
            // Create visual mesh
            const platformMesh = this.scene.createPlatform(
                platform.x, platform.y, platform.z,
                platform.size, 0.5, platform.size
            );
        });
    }
    
    /**
     * Main game loop
     * @param {number} currentTime - Current timestamp
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time in seconds (clamped to avoid large jumps)
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        // Update physics
        this.physics.step(deltaTime);
        
        // Update character
        this.character.update(this.input, deltaTime);
        
        // Update character mesh position
        const characterPosition = this.character.getPosition();
        this.scene.updateMeshPosition(this.characterMesh, characterPosition);
        
        // Update camera to follow character
        this.scene.updateCameraTarget(characterPosition);
        
        // Debug info
        if (this.debugInfo.showDebug) {
            const characterState = this.character.getState();
            
            // Log jump events
            if (characterState.isJumping && !this.debugInfo.lastJumpState) {
                this.debugInfo.lastJumpTime = currentTime;
                console.log('Jump started!');
            }
            
            // Log landing events
            if (!characterState.isJumping && this.debugInfo.lastJumpState) {
                console.log('Landed after', ((currentTime - this.debugInfo.lastJumpTime) / 1000).toFixed(2), 'seconds');
            }
            
            // Log ground state changes
            if (characterState.isGrounded !== this.debugInfo.lastGroundedState) {
                console.log('Grounded state changed to:', characterState.isGrounded);
                this.debugInfo.lastGroundedState = characterState.isGrounded;
            }
            
            this.debugInfo.lastJumpState = characterState.isJumping;
        }
        
        // Render the scene
        this.scene.render();
        
        // Continue the game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Create and initialize the application
const app = new Application();
app.init().catch(console.error);

// Display controls info in console
console.log('Controls:');
console.log('W, A, S, D - Move (relative to camera)');
console.log('Space - Jump');
console.log('Mouse - Hold and drag to rotate camera');