import * as RAPIER from '@dimforge/rapier3d';

let rapierModule = null;

export async function initRapier() {
    if (rapierModule) {
        return rapierModule;
    }

    try {
        await RAPIER.init();
        rapierModule = RAPIER;
        console.log('Rapier physics engine initialized successfully');
        return rapierModule;
    } catch (error) {
        console.error('Failed to initialize Rapier:', error);
        throw new Error('Failed to initialize physics engine');
    }
}

export function getRapier() {
    if (!rapierModule) {
        throw new Error('Rapier not initialized. Call initRapier() first.');
    }
    return rapierModule;
}

export function createWorld() {
    if (!rapierModule) {
        throw new Error('Rapier not initialized. Call initRapier() first.');
    }

    return new rapierModule.World({
        x: 0.0,
        y: -9.81,
        z: 0.0
    });
}

export function createRigidBody(world, options = {}) {
    if (!rapierModule) {
        throw new Error('Rapier not initialized. Call initRapier() first.');
    }

    const {
        position = { x: 0, y: 0, z: 0 },
        rotation = { x: 0, y: 0, z: 0 },
        type = 'dynamic',
        linearDamping = 0.0,
        angularDamping = 0.0
    } = options;

    let bodyDesc;
    switch (type) {
        case 'dynamic':
            bodyDesc = rapierModule.RigidBodyDesc.dynamic();
            break;
        case 'static':
            bodyDesc = rapierModule.RigidBodyDesc.fixed();
            break;
        case 'kinematic':
            bodyDesc = rapierModule.RigidBodyDesc.kinematicPositionBased();
            break;
        default:
            throw new Error(`Invalid rigid body type: ${type}`);
    }

    bodyDesc
        .setTranslation(position.x, position.y, position.z)
        .setRotation(rotation)
        .setLinearDamping(linearDamping)
        .setAngularDamping(angularDamping);

    return world.createRigidBody(bodyDesc);
}