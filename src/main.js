import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Board from './game/Board.js';

class DungeonGame {
    constructor() {
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
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x000000);
        
        const container = document.getElementById('game-container');
        container.appendChild(this.renderer.domElement);

        // Set up camera
        this.camera.position.set(0, 25, 25);
        this.camera.lookAt(0, 0, 0);

        // Setup lighting - IMPROVED LIGHTING
        this.setupLighting();

        // Add OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 50;

        // Create game board
        this.board = new Board(this.scene);

        // Add ground plane with better material
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.8,
            metalness: 0.2
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.2;
        plane.receiveShadow = true;
        this.scene.add(plane);

        this.animate();
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light - brighter
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(10, 30, 10);
        mainLight.castShadow = true;
        
        // Improve shadow quality
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.camera.left = -30;
        mainLight.shadow.camera.right = 30;
        mainLight.shadow.camera.top = 30;
        mainLight.shadow.camera.bottom = -30;
        
        this.scene.add(mainLight);

        // Add hemisphere light for better ambient lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
        this.scene.add(hemiLight);

        // Add point lights at corners for better path visibility
        const pointLightPositions = [
            { x: 15, y: 10, z: 15 },
            { x: -15, y: 10, z: 15 },
            { x: 15, y: 10, z: -15 },
            { x: -15, y: 10, z: -15 }
        ];

        pointLightPositions.forEach(pos => {
            const pointLight = new THREE.PointLight(0xffaa66, 0.8, 30);
            pointLight.position.set(pos.x, pos.y, pos.z);
            pointLight.castShadow = true;
            this.scene.add(pointLight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update controls
        this.controls.update();

        // Render
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
