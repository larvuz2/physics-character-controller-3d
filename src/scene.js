import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class SceneManager {
    constructor() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // Camera setup
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        this.cameraTarget = new THREE.Vector3();
        this.cameraOffset = new THREE.Vector3(0, 2, 5);
        this.cameraRotation = 0;
        this.cameraSmoothness = 0.1;

        // Lighting
        this.setupLighting();

        // Materials
        this.materials = {
            ground: new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.8,
                metalness: 0.2
            }),
            character: new THREE.MeshStandardMaterial({
                color: 0x00ff00,
                roughness: 0.7,
                metalness: 0.3
            }),
            platform: new THREE.MeshStandardMaterial({
                color: 0x4080ff,
                roughness: 0.6,
                metalness: 0.4
            })
        };

        // Window resize handler
        window.addEventListener('resize', this.handleResize.bind(this));

        // Debug helpers
        if (process.env.NODE_ENV === 'development') {
            this.setupDebugHelpers();
        }

        // Remove loading message
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);

        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0x4080ff, 0.5, 20);
        pointLight1.position.set(5, 10, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff4040, 0.5, 20);
        pointLight2.position.set(-5, 10, -5);
        this.scene.add(pointLight2);
    }

    setupDebugHelpers() {
        // Grid helper
        const gridHelper = new THREE.GridHelper(20, 20);
        this.scene.add(gridHelper);

        // Axes helper
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    createGround(size) {
        const geometry = new THREE.BoxGeometry(size, 0.2, size);
        const mesh = new THREE.Mesh(geometry, this.materials.ground);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
    }

    createCharacter(radius, height) {
        const geometry = new THREE.CapsuleGeometry(radius, height - radius * 2, 8, 16);
        const mesh = new THREE.Mesh(geometry, this.materials.character);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
    }

    createPlatform(x, y, z, width, height, depth) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geometry, this.materials.platform);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
    }

    updateMeshPosition(mesh, position) {
        if (mesh) {
            mesh.position.copy(position);
        }
    }

    handleMouseMove(deltaX, deltaY) {
        // Update camera rotation based on mouse movement
        this.cameraRotation -= deltaX * 0.002;
    }

    getCameraRotation() {
        return this.cameraRotation;
    }

    updateCameraTarget(targetPosition) {
        // Smoothly update camera target
        this.cameraTarget.lerp(targetPosition, this.cameraSmoothness);

        // Calculate camera position based on offset and rotation
        const cos = Math.cos(this.cameraRotation);
        const sin = Math.sin(this.cameraRotation);

        const offsetX = this.cameraOffset.z * sin + this.cameraOffset.x * cos;
        const offsetZ = this.cameraOffset.z * cos - this.cameraOffset.x * sin;

        this.camera.position.x = this.cameraTarget.x + offsetX;
        this.camera.position.y = this.cameraTarget.y + this.cameraOffset.y;
        this.camera.position.z = this.cameraTarget.z + offsetZ;

        // Look at target
        this.camera.lookAt(this.cameraTarget);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}