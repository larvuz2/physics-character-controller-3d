export class CharacterController {
    constructor(physics) {
        this.physics = physics;
        this.moveSpeed = 5;
        this.jumpForce = 5;
        this.maxJumpVelocity = 10;
        this.airControl = 0.3;
        this.groundFriction = 0.9;
        this.airFriction = 0.1;
        this.maxVelocity = 10;
        this.state = {
            isJumping: false,
            isGrounded: false,
            canJump: true,
            jumpCooldown: 0.3,
            lastJumpTime: 0
        };
    }

    update(input, deltaTime) {
        this.state.isGrounded = this.physics.isCharacterGrounded();
        const currentTime = performance.now() / 1000;

        // Update jump state
        if (this.state.isGrounded) {
            this.state.isJumping = false;
            if (currentTime - this.state.lastJumpTime > this.state.jumpCooldown) {
                this.state.canJump = true;
            }
        }

        // Handle movement
        const moveDirection = input.getMoveDirection();
        const velocity = this.physics.getCharacterVelocity();
        const friction = this.state.isGrounded ? this.groundFriction : this.airFriction;
        const controlMultiplier = this.state.isGrounded ? 1 : this.airControl;

        // Calculate new velocity
        let newVelocity = {
            x: velocity.x * (1 - friction),
            y: velocity.y,
            z: velocity.z * (1 - friction)
        };

        // Apply movement force
        if (moveDirection.x !== 0 || moveDirection.z !== 0) {
            const moveForce = this.moveSpeed * controlMultiplier;
            newVelocity.x += moveDirection.x * moveForce * deltaTime;
            newVelocity.z += moveDirection.z * moveForce * deltaTime;
        }

        // Handle jumping
        if (input.isJumping() && this.state.isGrounded && this.state.canJump) {
            newVelocity.y = this.jumpForce;
            this.state.isJumping = true;
            this.state.canJump = false;
            this.state.lastJumpTime = currentTime;
        }

        // Clamp horizontal velocity
        const horizontalSpeed = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.z * newVelocity.z);
        if (horizontalSpeed > this.maxVelocity) {
            const scale = this.maxVelocity / horizontalSpeed;
            newVelocity.x *= scale;
            newVelocity.z *= scale;
        }

        // Clamp vertical velocity
        newVelocity.y = Math.max(Math.min(newVelocity.y, this.maxJumpVelocity), -this.maxJumpVelocity);

        // Update physics
        this.physics.setCharacterVelocity(newVelocity);
    }

    getPosition() {
        return this.physics.getCharacterPosition();
    }

    getState() {
        return { ...this.state };
    }
}