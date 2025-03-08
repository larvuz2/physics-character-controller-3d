/**
 * Input handler for keyboard controls
 */
export class InputHandler {
    constructor() {
        // Key states
        this.keys = {
            forward: false,  // W
            backward: false, // S
            left: false,     // A
            right: false,    // D
            jump: false      // Space
        };

        // Bind event listeners
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Reference to scene manager (will be set from main.js)
        this.sceneManager = null;
    }

    /**
     * Set the scene manager reference
     * @param {Object} sceneManager - Scene manager instance
     */
    setSceneManager(sceneManager) {
        this.sceneManager = sceneManager;
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} event 
     */
    onKeyDown(event) {
        // Prevent default behavior for game controls
        if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space'].includes(event.code)) {
            event.preventDefault();
        }
        
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.jump = true;
                break;
        }
    }

    /**
     * Handle keyup events
     * @param {KeyboardEvent} event 
     */
    onKeyUp(event) {
        // Prevent default behavior for game controls
        if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space'].includes(event.code)) {
            event.preventDefault();
        }
        
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
        }
    }

    /**
     * Get the movement direction based on current key states and camera orientation
     * @returns {Object} x and z components of movement direction
     */
    getMovementDirection() {
        const direction = { x: 0, z: 0 };
        
        // If no scene manager is set, use default directions
        if (!this.sceneManager) {
            if (this.keys.forward) direction.z -= 1;
            if (this.keys.backward) direction.z += 1;
            if (this.keys.left) direction.x -= 1;
            if (this.keys.right) direction.x += 1;
        } else {
            // Get camera directions
            const forward = this.sceneManager.getCameraForwardDirection();
            const right = this.sceneManager.getCameraRightDirection();
            
            // Apply input based on camera orientation
            if (this.keys.forward) {
                direction.x += forward.x;
                direction.z += forward.z;
            }
            if (this.keys.backward) {
                direction.x -= forward.x;
                direction.z -= forward.z;
            }
            if (this.keys.right) {
                direction.x += right.x;
                direction.z += right.z;
            }
            if (this.keys.left) {
                direction.x -= right.x;
                direction.z -= right.z;
            }
        }

        // Normalize the direction vector if moving
        const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
        if (length > 0) {
            direction.x /= length;
            direction.z /= length;
        }

        return direction;
    }

    /**
     * Check if the jump key is pressed
     * @returns {boolean}
     */
    isJumping() {
        return this.keys.jump;
    }
}