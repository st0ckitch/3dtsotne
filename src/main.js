import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Game from './game/Game.js';

// Make THREE available globally
window.THREE = THREE;

class DungeonCrawler {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
            this.game = new Game(this.scene);
        });
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        
        const container = document.getElementById('game-container');
        if (container) {
            container.appendChild(this.renderer.domElement);
        }

        // Setup camera
        this.camera.position.set(0, 30, 30);
        this.camera.lookAt(0, 0, 0);

        // Setup lights
        this.setupLights();

        // Setup controls
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Start game loop
        this.animate();

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        const torchLight = new THREE.PointLight(0xff6600, 1, 50);
        torchLight.position.set(0, 20, 0);
        torchLight.castShadow = true;
        this.scene.add(torchLight);
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

// Initialize game
new DungeonCrawler();
