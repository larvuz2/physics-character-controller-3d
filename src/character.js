/**
 * Character controller for physics-based movement
 */
export class CharacterController {
    /**
     * Create a new character controller
     * @param {Object} physics - Physics world instance
     * @param {Object} options - Character options
     */
    constructor(physics, options = {}) {
        this.physics = physics;
        
        // Character options
        this.options = {
            moveSpeed: 7.0,
            jumpForce: 15.0,
            jumpCooldown: 0.2,
            coyoteTime: 0.15,
            jumpBufferTime: 0.15,
            ...options
        };

        // Character state
        this.state = {
            isGrounded: false,
            isJumping: false,
            jumpCooldownTimer: 0,
            coyoteTimeTimer: 0,
            jumpBufferTimer: 0,
            velocity: { x: 0, y: 0, z: 0 },
            wasGrounded: false,
            jumpRequested: false
        };

        // Create the character physics body
        this.character = this.physics.createCharacter(
            { x: 0, y: 5, z: 0 },
            0.5,  // radius
            1.0   // height
        );
    }

    /**
     * Update the character controller
     * @param {Object} input - Input handler
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(input, deltaTime) {
        if (!this.character || !this.character.body) return;

        // Store previous grounded state
        this.state.wasGrounded = this.state.isGrounded;

        // Check if character is grounded
        this.state.isGrounded = this.physics.isGrounded(this.character.body);

        // Update coyote time - allows jumping shortly after leaving a platform
        if (this.state.wasGrounded && !this.state.isGrounded) {
            this.state.coyoteTimeTimer = this.options.coyoteTime;
        } else if (this.state.coyoteTimeTimer > 0) {
            this.state.coyoteTimeTimer -= deltaTime;
        }

        // Update jump cooldown timer
        if (this.state.jumpCooldownTimer > 0) {
            this.state.jumpCooldownTimer -= deltaTime;
        }

        // Update jump buffer timer - allows queuing a jump before landing
        if (this.state.jumpBufferTimer > 0) {
            this.state.jumpBufferTimer -= deltaTime;
        }

        // Get current velocity
        const currentVelocity = this.character.body.linvel();
        this.state.velocity = {
            x: currentVelocity.x,
            y: currentVelocity.y,
            z: currentVelocity.z
        };

        // Handle movement
        this.handleMovement(input, deltaTime);

        // Handle jumping
        this.handleJump(input, deltaTime);

        // Debug info
        if (input.isJumping()) {
            console.log('Jump key pressed, isGrounded:', this.state.isGrounded, 
                        'coyoteTime:', this.state.coyoteTimeTimer.toFixed(2),
                        'jumpBuffer:', this.state.jumpBufferTimer.toFixed(2));
        }
    }

    /**
     * Handle character movement based on input
     * @param {Object} input - Input handler
     * @param {number} deltaTime - Time since last update
     */
    handleMovement(input, deltaTime) {
        // Get movement direction from input
        const direction = input.getMovementDirection();

        // Calculate target velocity
        const targetVelocity = {
            x: direction.x * this.options.moveSpeed,
            y: this.state.velocity.y, // Preserve vertical velocity
            z: direction.z * this.options.moveSpeed
        };

        // Apply the velocity to the character
        this.physics.setBodyVelocity(this.character.body, targetVelocity);
    }

    /**
     * Handle character jumping based on input
     * @param {Object} input - Input handler
     * @param {number} deltaTime - Time since last update
     */
    handleJump(input, deltaTime) {
        // Track if jump was just pressed this frame
        const jumpPressed = input.isJumping();
        
        // Set jump requested flag if jump button was just pressed
        if (jumpPressed && !this.state.jumpRequested) {
            this.state.jumpRequested = true;
            
            // If we're not grounded or in coyote time, set jump buffer
            if (!this.state.isGrounded && this.state.coyoteTimeTimer <= 0) {
                this.state.jumpBufferTimer = this.options.jumpBufferTime;
                console.log('Jump buffered');
            }
        }
        
        // Clear jump requested flag if button is released
        if (!jumpPressed) {
            this.state.jumpRequested = false;
        }
        
        // Try to jump if:
        // 1. Jump was requested AND
        // 2. (We're grounded OR in coyote time) AND
        // 3. Jump cooldown is over
        if (this.state.jumpRequested && 
            (this.state.isGrounded || this.state.coyoteTimeTimer > 0) && 
            this.state.jumpCooldownTimer <= 0) {
            
            // Apply jump impulse
            this.physics.applyImpulse(this.character.body, { 
                x: 0, 
                y: this.options.jumpForce, 
                z: 0 
            });
            
            // Set jump state
            this.state.isJumping = true;
            this.state.isGrounded = false;
            this.state.coyoteTimeTimer = 0;
            this.state.jumpCooldownTimer = this.options.jumpCooldown;
            this.state.jumpRequested = false; // Clear the request
            
            console.log('Jump executed!');
        }
        
        // Check if we should execute a buffered jump
        if (this.state.jumpBufferTimer > 0 && this.state.isGrounded && 
            this.state.jumpCooldownTimer <= 0) {
            
            // Apply jump impulse
            this.physics.applyImpulse(this.character.body, { 
                x: 0, 
                y: this.options.jumpForce, 
                z: 0 
            });
            
            // Set jump state
            this.state.isJumping = true;
            this.state.jumpBufferTimer = 0;
            this.state.jumpCooldownTimer = this.options.jumpCooldown;
            
            console.log('Buffered jump executed!');
        }

        // Reset jump state when landing
        if (this.state.isGrounded && this.state.isJumping) {
            this.state.isJumping = false;
        }
    }

    /**
     * Get the character's current position
     * @returns {Object} - Position as {x, y, z}
     */
    getPosition() {
        if (!this.character || !this.character.body) {
            return { x: 0, y: 0, z: 0 };
        }
        
        return this.physics.getBodyPosition(this.character.body);
    }

    /**
     * Get the character's current state
     * @returns {Object} - Character state
     */
    getState() {
        return { ...this.state };
    }
}