import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Board from './game/Board.js';
import Player from './game/Player.js';
import Environment from './components/Environment.js';
import { gsap } from 'gsap';

class DungeonGame {
    constructor() {
        // Make THREE globally available
        window.THREE = THREE;
        this.initialize();
    }

    initialize() {
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 30, 30);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Controls setup
        this.setupControls();

        // Game state
        this.gameState = {
            currentTurn: 'player',
            isAnimating: false,
            gameOver: false
        };

        // Initialize game elements in order
        this.environment = new Environment(this.scene);
        this.board = new Board(this.scene);
        this.player = new Player(this.scene, false);
        this.bot = new Player(this.scene, true);

        // Position players at start
        const startCell = this.board.getCellAt(0);
        if (startCell) {
            const startPos = startCell.position.clone();
            this.player.moveTo(startPos.add(new THREE.Vector3(0, 1, 0)));
            this.bot.moveTo(startPos.add(new THREE.Vector3(0, 1, 0)));
        }

        // Event listeners
        this.setupEventListeners();

        // Start animation loop
        this.animate();
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera going below ground
        this.controls.minDistance = 15;
        this.controls.maxDistance = 50;
        this.controls.target.set(0, 0, 0);
    }

    setupEventListeners() {
        // Dice roll button
        const rollButton = document.getElementById('roll-dice');
        if (rollButton) {
            rollButton.addEventListener('click', () => this.handleDiceRoll());
        }

        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Keyboard controls
        window.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleDiceRoll() {
        if (this.gameState.isAnimating || this.gameState.gameOver) return;

        this.gameState.isAnimating = true;
        const roll = Math.floor(Math.random() * 6) + 1;

        // Visual feedback for dice roll
        const rollButton = document.getElementById('roll-dice');
        if (rollButton) {
            rollButton.textContent = `Rolled: ${roll}`;
            gsap.from(rollButton, {
                scale: 1.2,
                duration: 0.2,
                ease: "power2.out"
            });
        }

        if (this.gameState.currentTurn === 'player') {
            this.handlePlayerTurn(roll);
        } else {
            this.handleBotTurn(roll);
        }
    }

    async handlePlayerTurn(roll) {
        const currentPos = this.player.getPosition();
        const targetIndex = Math.min(currentPos + roll, this.board.pathCells.length - 1);
        const targetCell = this.board.getCellAt(targetIndex);

        if (targetCell) {
            // Highlight path
            this.board.highlightPath(currentPos, targetIndex);

            // Move player
            await this.player.moveTo(targetCell.position);
            
            // Update fog of war
            this.board.updateFogOfWar(targetCell.position);
            this.environment.update(targetCell.position);

            // Check for goblin
            if (targetCell.hasGoblin) {
                const damage = Math.floor(Math.random() * 3) + 1;
                await this.player.takeDamage(damage);
            }

            // Check win condition
            if (targetIndex === this.board.pathCells.length - 1) {
                this.handleGameOver('player');
                return;
            }

            // Switch turns
            this.gameState.currentTurn = 'bot';
            this.gameState.isAnimating = false;

            // Auto-trigger bot turn after delay
            setTimeout(() => this.handleDiceRoll(), 1000);
        }
    }

    async handleBotTurn(roll) {
        const currentPos = this.bot.getPosition();
        const targetIndex = Math.min(currentPos + roll, this.board.pathCells.length - 1);
        const targetCell = this.board.getCellAt(targetIndex);

        if (targetCell) {
            // Highlight path
            this.board.highlightPath(currentPos, targetIndex);

            // Move bot
            await this.bot.moveTo(targetCell.position);

            // Check for goblin
            if (targetCell.hasGoblin) {
                const damage = Math.floor(Math.random() * 3) + 1;
                await this.bot.takeDamage(damage);
            }

            // Check win condition
            if (targetIndex === this.board.pathCells.length - 1) {
                this.handleGameOver('bot');
                return;
            }

            // Switch turns
            this.gameState.currentTurn = 'player';
            this.gameState.isAnimating = false;
        }
    }

    handleGameOver(winner) {
        this.gameState.gameOver = true;
        this.gameState.isAnimating = false;

        // Visual feedback
        const message = winner === 'player' ? 'You Win!' : 'Bot Wins!';
        const rollButton = document.getElementById('roll-dice');
        if (rollButton) {
            rollButton.textContent = message;
            rollButton.style.backgroundColor = winner === 'player' ? '#4CAF50' : '#f44336';
        }

        // Celebration effects
        if (winner === 'player') {
            this.createVictoryEffect();
        }
    }

    createVictoryEffect() {
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            const angle = Math.random() * Math.PI * 2;
            positions[i] = Math.cos(angle) * 2;
            positions[i + 1] = 0;
            positions[i + 2] = Math.sin(angle) * 2;

            colors[i] = Math.random();
            colors[i + 1] = Math.random();
            colors[i + 2] = Math.random();

            velocities[i] = (Math.random() - 0.5) * 0.2;
            velocities[i + 1] = Math.random() * 0.2;
            velocities[i + 2] = (Math.random() - 0.5) * 0.2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 1
        });

        const particles = new THREE.Points(geometry, material);
        particles.position.copy(this.player.getPosition());
        this.scene.add(particles);

        // Animate particles
        const animate = () => {
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];
                velocities[i + 1] -= 0.001; // Gravity
            }
            particles.geometry.attributes.position.needsUpdate = true;
            
            material.opacity -= 0.01;
            if (material.opacity <= 0) {
                this.scene.remove(particles);
                return;
            }
            requestAnimationFrame(animate);
        };
        animate();
    }

    focusCameraOnAction() {
        const playerPos = this.player.getPosition();
        const targetPos = new THREE.Vector3(
            playerPos.x,
            this.camera.position.y,
            playerPos.z + 20
        );
        
        gsap.to(this.camera.position, {
            x: targetPos.x,
            z: targetPos.z,
            duration: 2,
            ease: "power2.inOut"
        });
    }

    handleKeyPress(event) {
        switch(event.key) {
            case 'r':
                this.focusCameraOnAction();
                break;
            case 'c':
                this.toggleCameraMode();
                break;
        }
    }

    toggleCameraMode() {
        if (this.controls.enabled) {
            this.controls.enabled = false;
            this.focusCameraOnAction();
        } else {
            this.controls.enabled = true;
        }
    }

    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Update environment effects
        if (this.environment && this.player) {
            this.environment.update(this.player.getPosition());
        }

        // Update board effects including fog of war
        if (this.board && this.player) {
            this.board.updateFogOfWar(this.player.getPosition());
        }

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new DungeonGame();
});
