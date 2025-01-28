import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Game from './game/Game.js';

// Make THREE available globally
window.THREE = THREE;

class DungeonCrawler {
    constructor() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.setClearColor(0x000000, 1);
        
        const container = document.getElementById('game-container');
        if (container) {
            container.appendChild(this.renderer.domElement);
        }

        // Setup camera
        this.camera.position.set(0, 30, 30);
        this.camera.lookAt(0, 0, 0);

        // Setup controls after renderer is added to DOM
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 50;

        // Setup lights
        this.setupLights();

        // Add fog
        this.scene.fog = new THREE.FogExp2(0x000000, 0.015);

        // Initialize game
        this.game = new Game(this.scene);

        // Start animation loop
        this.animate();

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        // Ambient light for overall scene brightness
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.6);
        this.scene.add(ambientLight);

        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(20, 30, 20);
        mainLight.castShadow = true;
        
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.camera.left = -30;
        mainLight.shadow.camera.right = 30;
        mainLight.shadow.camera.top = 30;
        mainLight.shadow.camera.bottom = -30;
        
        this.scene.add(mainLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-20, 20, -20);
        this.scene.add(fillLight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}

// Initialize game
new DungeonCrawler();
