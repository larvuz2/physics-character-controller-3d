import * as THREE from 'three';

/**
 * Scene manager for Three.js
 */
export class SceneManager {
    constructor() {
        // Create the scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        
        // Create the camera
        this.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        
        // Third-person camera settings
        this.cameraSettings = {
            distance: 5,           // Distance from character
            height: 2,             // Height above character
            rotationSpeed: 0.002,  // Mouse rotation sensitivity
            smoothing: 0.1,        // Camera movement smoothing factor
            minPolarAngle: 0.1,    // Minimum angle (radians) - looking up
            maxPolarAngle: Math.PI / 2 - 0.1, // Maximum angle - looking down
            currentYaw: 0,         // Current horizontal rotation
            currentPitch: Math.PI / 4, // Current vertical rotation
            targetYaw: 0,          // Target horizontal rotation
            targetPitch: Math.PI / 4, // Target vertical rotation
            targetPosition: new THREE.Vector3(), // Target camera position
            currentPosition: new THREE.Vector3(0, 5, 10) // Current camera position
        };
        
        this.camera.position.copy(this.cameraSettings.currentPosition);
        this.camera.lookAt(0, 0, 0);
        
        // Create the renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        
        // Mouse control variables
        this.mouse = {
            isDown: false,
            x: 0,
            y: 0
        };
        
        // Add lights
        this.setupLights();
        
        // Add grid helper
        const gridHelper = new THREE.GridHelper(50, 50);
        this.scene.add(gridHelper);
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Add mouse event listeners for camera control
        this.setupMouseControls();
        
        // Object mappings
        this.objects = new Map();
        
        // Character reference
        this.characterPosition = new THREE.Vector3();
    }
    
    /**
     * Set up mouse controls for camera
     */
    setupMouseControls() {
        // Mouse down event
        document.addEventListener('mousedown', (event) => {
            this.mouse.isDown = true;
        });
        
        // Mouse up event
        document.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
        });
        
        // Mouse move event
        document.addEventListener('mousemove', (event) => {
            if (!this.mouse.isDown) return;
            
            // Calculate mouse movement
            const deltaX = event.clientX - this.mouse.x;
            const deltaY = event.clientY - this.mouse.y;
            
            // Update target rotation
            this.cameraSettings.targetYaw += deltaX * this.cameraSettings.rotationSpeed;
            this.cameraSettings.targetPitch += deltaY * this.cameraSettings.rotationSpeed;
            
            // Clamp pitch to prevent camera flipping
            this.cameraSettings.targetPitch = Math.max(
                this.cameraSettings.minPolarAngle,
                Math.min(this.cameraSettings.maxPolarAngle, this.cameraSettings.targetPitch)
            );
            
            // Store current mouse position
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
        });
        
        // Initial mouse position
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
        }, { once: true });
        
        // Prevent context menu on right-click
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    /**
     * Set up scene lighting
     */
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.top = 25;
        directionalLight.shadow.camera.bottom = -25;
        
        this.scene.add(directionalLight);
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Create a ground plane mesh
     * @param {number} size - Size of the ground plane
     * @returns {THREE.Mesh} - Ground mesh
     */
    createGround(size = 50) {
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshStandardMaterial({
            color: 0x999999,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.receiveShadow = true;
        
        this.scene.add(ground);
        return ground;
    }
    
    /**
     * Create a character capsule mesh
     * @param {number} radius - Radius of the capsule
     * @param {number} height - Height of the capsule
     * @returns {THREE.Group} - Character mesh group
     */
    createCharacter(radius = 0.5, height = 1.0) {
        const group = new THREE.Group();
        
        // Create capsule body
        const geometry = new THREE.CapsuleGeometry(radius, height, 8, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x3498db,
            roughness: 0.7,
            metalness: 0.3
        });
        
        const capsule = new THREE.Mesh(geometry, material);
        capsule.castShadow = true;
        capsule.receiveShadow = true;
        
        // Add a small cone to indicate forward direction
        const coneGeometry = new THREE.ConeGeometry(radius * 0.5, radius * 1.5, 8);
        const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.position.z = radius * 1.5;
        cone.rotation.x = Math.PI / 2;
        cone.castShadow = true;
        
        group.add(capsule);
        group.add(cone);
        
        // Add character to scene
        this.scene.add(group);
        return group;
    }
    
    /**
     * Update the position of a mesh based on a physics body
     * @param {THREE.Object3D} mesh - The mesh to update
     * @param {Object} position - Position as {x, y, z}
     */
    updateMeshPosition(mesh, position) {
        if (!mesh) return;
        
        mesh.position.set(position.x, position.y, position.z);
        
        // Store character position for camera
        this.characterPosition.set(position.x, position.y, position.z);
    }
    
    /**
     * Update the camera to follow a target
     * @param {Object} position - Target position as {x, y, z}
     */
    updateCameraTarget(position) {
        // Smoothly interpolate between current and target rotation
        this.cameraSettings.currentYaw += (this.cameraSettings.targetYaw - this.cameraSettings.currentYaw) * this.cameraSettings.smoothing;
        this.cameraSettings.currentPitch += (this.cameraSettings.targetPitch - this.cameraSettings.currentPitch) * this.cameraSettings.smoothing;
        
        // Calculate camera position based on character position and current rotation
        const offset = new THREE.Vector3(
            Math.sin(this.cameraSettings.currentYaw) * Math.sin(this.cameraSettings.currentPitch) * this.cameraSettings.distance,
            Math.cos(this.cameraSettings.currentPitch) * this.cameraSettings.distance,
            Math.cos(this.cameraSettings.currentYaw) * Math.sin(this.cameraSettings.currentPitch) * this.cameraSettings.distance
        );
        
        // Set target position
        this.cameraSettings.targetPosition.set(
            position.x + offset.x,
            position.y + offset.y + this.cameraSettings.height,
            position.z + offset.z
        );
        
        // Smoothly move camera to target position
        this.cameraSettings.currentPosition.lerp(this.cameraSettings.targetPosition, this.cameraSettings.smoothing);
        this.camera.position.copy(this.cameraSettings.currentPosition);
        
        // Make camera look at character
        this.camera.lookAt(
            position.x,
            position.y + this.cameraSettings.height * 0.5, // Look at upper body
            position.z
        );
        
        // Check for camera collision with scene objects
        this.handleCameraCollision(position);
    }
    
    /**
     * Handle camera collision with scene objects
     * @param {Object} targetPosition - Character position
     */
    handleCameraCollision(targetPosition) {
        // Create a ray from the character to the camera
        const rayStart = new THREE.Vector3(
            targetPosition.x,
            targetPosition.y + this.cameraSettings.height * 0.5,
            targetPosition.z
        );
        const rayDirection = new THREE.Vector3().subVectors(this.camera.position, rayStart).normalize();
        
        // Cast a ray to check for collisions
        const raycaster = new THREE.Raycaster(rayStart, rayDirection);
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        // If there's a collision between character and camera, move camera to collision point
        if (intersects.length > 0) {
            const collision = intersects[0];
            const distanceToCollision = collision.distance;
            
            // Only adjust if collision is closer than desired camera distance
            if (distanceToCollision < this.cameraSettings.distance) {
                // Move camera to collision point (slightly in front to avoid clipping)
                const newCameraPos = new THREE.Vector3().addVectors(
                    rayStart,
                    rayDirection.multiplyScalar(distanceToCollision * 0.9)
                );
                this.camera.position.copy(newCameraPos);
            }
        }
    }
    
    /**
     * Get camera forward direction (for character movement)
     * @returns {THREE.Vector3} - Forward direction vector
     */
    getCameraForwardDirection() {
        // Get camera forward direction (ignoring y component for ground movement)
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        forward.y = 0;
        forward.normalize();
        return forward;
    }
    
    /**
     * Get camera right direction (for character movement)
     * @returns {THREE.Vector3} - Right direction vector
     */
    getCameraRightDirection() {
        // Get camera right direction
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        right.y = 0;
        right.normalize();
        return right;
    }
    
    /**
     * Render the scene
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Create a platform mesh
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} width - Width of platform
     * @param {number} height - Height of platform
     * @param {number} depth - Depth of platform
     * @returns {THREE.Mesh} - Platform mesh
     */
    createPlatform(x, y, z, width, height, depth) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8bc34a,  // Light green
            roughness: 0.7,
            metalness: 0.2
        });
        
        const platform = new THREE.Mesh(geometry, material);
        platform.position.set(x, y, z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        
        this.scene.add(platform);
        return platform;
    }
} 