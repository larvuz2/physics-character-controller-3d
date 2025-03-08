export class FallbackPhysicsWorld {
    constructor() {
        this.gravity = -9.81;
        this.objects = new Map();
        this.lastUpdate = performance.now();
    }

    async init() {
        // No initialization needed for fallback physics
        return Promise.resolve();
    }

    createGround(size) {
        const ground = {
            type: 'ground',
            position: { x: 0, y: 0, z: 0 },
            size: { width: size, height: 0.1, depth: size },
            isStatic: true
        };

        this.objects.set('ground', ground);
        return ground;
    }

    createCharacter(radius, height) {
        const character = {
            type: 'character',
            position: { x: 0, y: 5, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            size: { radius, height },
            isStatic: false,
            isGrounded: false
        };

        this.objects.set('character', character);
        return character;
    }

    createPlatform(x, y, z, width, height, depth) {
        const platform = {
            type: 'platform',
            position: { x, y, z },
            size: { width, height, depth },
            isStatic: true
        };

        const id = `platform_${x}_${y}_${z}`;
        this.objects.set(id, platform);
        return platform;
    }

    step(deltaTime) {
        const character = this.objects.get('character');
        if (!character || character.isStatic) return;

        // Update position based on velocity
        character.position.x += character.velocity.x * deltaTime;
        character.position.y += character.velocity.y * deltaTime;
        character.position.z += character.velocity.z * deltaTime;

        // Apply gravity
        character.velocity.y += this.gravity * deltaTime;

        // Check ground collision
        const wasGrounded = character.isGrounded;
        character.isGrounded = false;

        // Simple collision detection with ground and platforms
        for (const [id, obj] of this.objects) {
            if (obj === character) continue;

            if (this.checkCollision(character, obj)) {
                this.resolveCollision(character, obj);
                if (obj.type === 'ground' || obj.type === 'platform') {
                    character.isGrounded = true;
                }
            }
        }

        // Apply damping
        const damping = 0.9;
        character.velocity.x *= damping;
        character.velocity.z *= damping;

        // Prevent falling through ground
        if (character.position.y < character.size.height / 2) {
            character.position.y = character.size.height / 2;
            character.velocity.y = 0;
            character.isGrounded = true;
        }
    }

    checkCollision(character, obj) {
        if (obj.type === 'ground') {
            return character.position.y - character.size.height / 2 <= obj.position.y + obj.size.height / 2;
        }

        if (obj.type === 'platform') {
            const dx = Math.abs(character.position.x - obj.position.x);
            const dy = Math.abs(character.position.y - obj.position.y);
            const dz = Math.abs(character.position.z - obj.position.z);

            return dx < (obj.size.width / 2 + character.size.radius) &&
                   dy < (obj.size.height / 2 + character.size.height / 2) &&
                   dz < (obj.size.depth / 2 + character.size.radius);
        }

        return false;
    }

    resolveCollision(character, obj) {
        if (obj.type === 'ground') {
            if (character.velocity.y < 0) {
                character.velocity.y = 0;
            }
            character.position.y = obj.position.y + obj.size.height / 2 + character.size.height / 2;
        }

        if (obj.type === 'platform') {
            // Simple position correction
            const dx = character.position.x - obj.position.x;
            const dy = character.position.y - obj.position.y;
            const dz = character.position.z - obj.position.z;

            // Find the minimum penetration axis
            const penetrationX = obj.size.width / 2 + character.size.radius - Math.abs(dx);
            const penetrationY = obj.size.height / 2 + character.size.height / 2 - Math.abs(dy);
            const penetrationZ = obj.size.depth / 2 + character.size.radius - Math.abs(dz);

            // Resolve along the axis with minimum penetration
            if (penetrationX < penetrationY && penetrationX < penetrationZ) {
                character.position.x += dx > 0 ? penetrationX : -penetrationX;
                character.velocity.x = 0;
            } else if (penetrationY < penetrationZ) {
                character.position.y += dy > 0 ? penetrationY : -penetrationY;
                character.velocity.y = 0;
            } else {
                character.position.z += dz > 0 ? penetrationZ : -penetrationZ;
                character.velocity.z = 0;
            }
        }
    }

    isCharacterGrounded() {
        const character = this.objects.get('character');
        return character ? character.isGrounded : false;
    }

    applyCharacterForce(force) {
        const character = this.objects.get('character');
        if (character) {
            character.velocity.x += force.x;
            character.velocity.y += force.y;
            character.velocity.z += force.z;
        }
    }

    setCharacterVelocity(velocity) {
        const character = this.objects.get('character');
        if (character) {
            character.velocity = { ...velocity };
        }
    }

    getCharacterVelocity() {
        const character = this.objects.get('character');
        return character ? character.velocity : { x: 0, y: 0, z: 0 };
    }

    getCharacterPosition() {
        const character = this.objects.get('character');
        return character ? character.position : { x: 0, y: 0, z: 0 };
    }
}