import * as RAPIER from '@dimforge/rapier3d';

export class PhysicsWorld {
    constructor() {
        this.world = null;
        this.rigidBodies = new Map();
        this.colliders = new Map();
    }

    async init() {
        await RAPIER.init();
        this.world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });
    }

    createGround(size) {
        const groundDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groundDesc);

        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(size, 0.1, size);
        const groundCollider = this.world.createCollider(groundColliderDesc, groundBody);

        this.rigidBodies.set('ground', groundBody);
        this.colliders.set('ground', groundCollider);

        return groundBody;
    }

    createCharacter(radius, height) {
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(0, 5, 0)
            .setLinearDamping(0.1)
            .setAngularDamping(0.5);

        const body = this.world.createRigidBody(bodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.capsule(height / 2, radius)
            .setFriction(0.7)
            .setRestitution(0.3);

        const collider = this.world.createCollider(colliderDesc, body);

        this.rigidBodies.set('character', body);
        this.colliders.set('character', collider);

        return body;
    }

    createPlatform(x, y, z, width, height, depth) {
        const platformDesc = RAPIER.RigidBodyDesc.fixed()
            .setTranslation(x, y, z);

        const platformBody = this.world.createRigidBody(platformDesc);

        const platformColliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
            .setFriction(0.8)
            .setRestitution(0.2);

        const platformCollider = this.world.createCollider(platformColliderDesc, platformBody);

        const id = `platform_${x}_${y}_${z}`;
        this.rigidBodies.set(id, platformBody);
        this.colliders.set(id, platformCollider);

        return platformBody;
    }

    step(deltaTime) {
        this.world.step();
    }

    getRigidBody(id) {
        return this.rigidBodies.get(id);
    }

    getCollider(id) {
        return this.colliders.get(id);
    }

    isCharacterGrounded() {
        const character = this.rigidBodies.get('character');
        if (!character) return false;

        const position = character.translation();
        const ray = new RAPIER.Ray(
            { x: position.x, y: position.y, z: position.z },
            { x: 0, y: -1, z: 0 }
        );

        const hit = this.world.castRay(
            ray,
            0.2,
            true,
            undefined,
            undefined,
            undefined,
            character
        );

        return hit !== null;
    }

    applyCharacterForce(force) {
        const character = this.rigidBodies.get('character');
        if (character) {
            character.applyImpulse(force, true);
        }
    }

    setCharacterVelocity(velocity) {
        const character = this.rigidBodies.get('character');
        if (character) {
            character.setLinvel(velocity, true);
        }
    }

    getCharacterVelocity() {
        const character = this.rigidBodies.get('character');
        return character ? character.linvel() : { x: 0, y: 0, z: 0 };
    }

    getCharacterPosition() {
        const character = this.rigidBodies.get('character');
        return character ? character.translation() : { x: 0, y: 0, z: 0 };
    }
}