import { PhysicsWorld } from './physics.js';
import { FallbackPhysicsWorld } from './physics-fallback.js';
import { CharacterController } from './character.js';
import { SceneManager } from './scene.js';
import { InputHandler } from './input.js';

class Application {
    constructor() {
        this.physics = new PhysicsWorld();
        this.scene = new SceneManager();
        this.input = new InputHandler();
        this.input.setSceneManager(this.scene);
        this.lastTime = 0;
        this.isRunning = false;
        this.character = null;
        this.characterMesh = null;
        this.ground = null;
        this.groundMesh = null;
        this.debugInfo = {
            showDebug: true,
            lastJumpTime: 0,
            lastGroundedState: true
        };
    }

    async init() {
        try {
            console.log('Initializing application...');
            try {
                await this.physics.init();
                console.log('Physics initialized successfully');
            } catch (error) {
                console.error('Failed to initialize Rapier physics, falling back to simplified physics:', error);
                this.physics = new FallbackPhysicsWorld();
                await this.physics.init();
                console.log('Fallback physics initialized');
                this.showWarningMessage('Using simplified physics due to WebAssembly initialization failure. Some features may be limited.');
            }
            this.ground = this.physics.createGround(50);
            this.groundMesh = this.scene.createGround(50);
            console.log('Ground created');
            this.character = new CharacterController(this.physics);
            this.characterMesh = this.scene.createCharacter(0.5, 1.0);
            console.log('Character created');
            this.createTestPlatforms();
            console.log('Platforms created');
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            document.body.innerHTML += `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                <h2>Initialization Error</h2>
                <p>${error.message}</p>
                <p>Please try refreshing the page or check the console for more details.</p>
            </div>`;
        }
    }

    showWarningMessage(message) {
        const warningElement = document.createElement('div');
        warningElement.style.position = 'absolute';
        warningElement.style.top = '10px';
        warningElement.style.left = '50%';
        warningElement.style.transform = 'translateX(-50%)';
        warningElement.style.background = 'rgba(255, 200, 0, 0.8)';
        warningElement.style.color = 'black';
        warningElement.style.padding = '10px';
        warningElement.style.borderRadius = '5px';
        warningElement.style.zIndex = '1000';
        warningElement.style.textAlign = 'center';
        warningElement.style.maxWidth = '80%';
        warningElement.textContent = message;
        document.body.appendChild(warningElement);
        setTimeout(() => {
            warningElement.style.opacity = '0';
            warningElement.style.transition = 'opacity 1s';
            setTimeout(() => {
                document.body.removeChild(warningElement);
            }, 1000);
        }, 10000);
    }

    createTestPlatforms() {
        const platformPositions = [
            { x: 5, y: 2, z: 5, size: 3 },
            { x: -5, y: 4, z: -5, size: 3 },
            { x: 10, y: 6, z: 0, size: 3 }
        ];
        platformPositions.forEach(platform => {
            const platformBody = this.physics.createPlatform(
                platform.x, platform.y, platform.z,
                platform.size, 0.5, platform.size
            );
            const platformMesh = this.scene.createPlatform(
                platform.x, platform.y, platform.z,
                platform.size, 0.5, platform.size
            );
        });
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        this.physics.step(deltaTime);
        this.character.update(this.input, deltaTime);
        const characterPosition = this.character.getPosition();
        this.scene.updateMeshPosition(this.characterMesh, characterPosition);
        this.scene.updateCameraTarget(characterPosition);
        if (this.debugInfo.showDebug) {
            const characterState = this.character.getState();
            if (characterState.isJumping && !this.debugInfo.lastJumpState) {
                this.debugInfo.lastJumpTime = currentTime;
                console.log('Jump started!');
            }
            if (!characterState.isJumping && this.debugInfo.lastJumpState) {
                console.log('Landed after', ((currentTime - this.debugInfo.lastJumpTime) / 1000).toFixed(2), 'seconds');
            }
            if (characterState.isGrounded !== this.debugInfo.lastGroundedState) {
                console.log('Grounded state changed to:', characterState.isGrounded);
                this.debugInfo.lastGroundedState = characterState.isGrounded;
            }
            this.debugInfo.lastJumpState = characterState.isJumping;
        }
        this.scene.render();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

const app = new Application();
app.init().catch(console.error);

console.log('Controls:');
console.log('W, A, S, D - Move (relative to camera)');
console.log('Space - Jump');
console.log('Mouse - Hold and drag to rotate camera');