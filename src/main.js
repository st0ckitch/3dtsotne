import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class DungeonGame {
    constructor() {
        // Basic Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        // Configure renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.setClearColor(0x000000);
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Camera position
        this.camera.position.set(0, 20, 20);
        this.camera.lookAt(0, 0, 0);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Add OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        // Add a test object to see if rendering works
        const testGeometry = new THREE.BoxGeometry(5, 5, 5);
        const testMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const testCube = new THREE.Mesh(testGeometry, testMaterial);
        this.scene.add(testCube);

        // Ground plane
        const planeGeometry = new THREE.PlaneGeometry(50, 50);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -2;
        plane.receiveShadow = true;
        this.scene.add(plane);

        // Start animation loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize only after DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    new DungeonGame();
});
