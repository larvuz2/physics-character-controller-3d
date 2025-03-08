export class InputHandler {
    constructor() {
        this.keys = new Set();
        this.mouseButtons = new Set();
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };
        this.sceneManager = null;

        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);

        // Add event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('contextmenu', this.handleContextMenu);

        // Lock pointer on click
        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }

    setSceneManager(sceneManager) {
        this.sceneManager = sceneManager;
    }

    handleKeyDown(event) {
        this.keys.add(event.key.toLowerCase());
    }

    handleKeyUp(event) {
        this.keys.delete(event.key.toLowerCase());
    }

    handleMouseDown(event) {
        this.mouseButtons.add(event.button);
    }

    handleMouseUp(event) {
        this.mouseButtons.delete(event.button);
    }

    handleMouseMove(event) {
        if (document.pointerLockElement === document.body) {
            this.mouseDelta.x = event.movementX;
            this.mouseDelta.y = event.movementY;

            if (this.sceneManager) {
                this.sceneManager.handleMouseMove(event.movementX, event.movementY);
            }
        }
    }

    handleContextMenu(event) {
        event.preventDefault();
    }

    isKeyPressed(key) {
        return this.keys.has(key.toLowerCase());
    }

    isMouseButtonPressed(button) {
        return this.mouseButtons.has(button);
    }

    getMouseDelta() {
        const delta = { ...this.mouseDelta };
        this.mouseDelta = { x: 0, y: 0 };
        return delta;
    }

    getMoveDirection() {
        const direction = { x: 0, z: 0 };

        if (this.isKeyPressed('w')) direction.z -= 1;
        if (this.isKeyPressed('s')) direction.z += 1;
        if (this.isKeyPressed('a')) direction.x -= 1;
        if (this.isKeyPressed('d')) direction.x += 1;

        // Normalize diagonal movement
        if (direction.x !== 0 && direction.z !== 0) {
            const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
            direction.x /= length;
            direction.z /= length;
        }

        // Apply camera rotation to movement direction
        if (this.sceneManager) {
            const cameraRotation = this.sceneManager.getCameraRotation();
            const cos = Math.cos(cameraRotation);
            const sin = Math.sin(cameraRotation);

            const rotatedX = direction.x * cos - direction.z * sin;
            const rotatedZ = direction.x * sin + direction.z * cos;

            direction.x = rotatedX;
            direction.z = rotatedZ;
        }

        return direction;
    }

    isJumping() {
        return this.isKeyPressed(' ');
    }

    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('contextmenu', this.handleContextMenu);
    }
}