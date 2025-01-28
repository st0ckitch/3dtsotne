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
        
        try {
            this.initialize();
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Error during game initialization:', error);
        }
    }

    initialize() {
        console.log('Starting initialization...');
        
        // Scene setup
        this.scene = new THREE.Scene();
        console.log('Scene created');

        // Renderer setup first (before other components that might need it)
        this.setupRenderer();
        
        // Camera setup
        this.setupCamera();
        
        // Basic lighting (before environment)
        this.setupBasicLights();

        // Game state
        this.gameState = {
            currentTurn: 'player',
            isAnimating: false,
            gameOver: false
        };

        // Initialize game elements in order
        this.initializeGameElements();

        // Event listeners
        this.setupEventListeners();

        // Start animation loop
        this.startAnimationLoop();
    }

    setupRenderer() {
        try {
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                powerPreference: "high-performance",
                alpha: true
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.0;
            
            const container = document.getElementById('game-container');
            if (!container) {
                throw new Error('Game container not found');
            }
            container.appendChild(this.renderer.domElement);
            console.log('Renderer setup complete');
        } catch (error) {
            console.error('Error setting up renderer:', error);
            throw error;
        }
    }

    setupCamera() {
        try {
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.set(0, 30, 30);
            this.camera.lookAt(0, 0, 0);
            
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
            this.controls.minDistance = 15;
            this.controls.maxDistance = 50;
            this.controls.target.set(0, 0, 0);
            console.log('Camera setup complete');
        } catch (error) {
            console.error('Error setting up camera:', error);
            throw error;
        }
    }

    setupBasicLights() {
        try {
            // Ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            this.scene.add(ambientLight);

            // Main light
            const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
            mainLight.position.set(10, 10, 10);
            mainLight.castShadow = true;
            
            // Improve shadow quality
            mainLight.shadow.mapSize.width = 2048;
            mainLight.shadow.mapSize.height = 2048;
            this.scene.add(mainLight);
            
            console.log('Basic lights setup complete');
        } catch (error) {
            console.error('Error setting up basic lights:', error);
            throw error;
        }
    }

    initializeGameElements() {
        try {
            console.log('Starting game elements initialization...');
            
            // Create board first
            this.board = new Board(this.scene);
            console.log('Board created');

            // Small delay to ensure board is ready
            setTimeout(() => {
                // Create environment
                this.environment = new Environment(this.scene);
                console.log('Environment created');

                // Create players
                this.player = new Player(this.scene, false);
                this.bot = new Player(this.scene, true);
                console.log('Players created');

                // Position players
                const startCell = this.board.getCellAt(0);
                if (startCell) {
                    const startPos = startCell.position.clone();
                    this.player.moveTo(startPos.add(new THREE.Vector3(0, 1, 0)));
                    this.bot.moveTo(startPos.add(new THREE.Vector3(0, 1, 0)));
                }
            }, 100);
        } catch (error) {
            console.error('Error initializing game elements:', error);
            throw error;
        }
    }

    startAnimationLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            try {
                if (this.controls) {
                    this.controls.update();
                }

                if (this.environment && typeof this.environment.update === 'function') {
                    this.environment.update();
                }

                if (this.board && typeof this.board.update === 'function') {
                    this.board.update();
                }

                this.renderer.render(this.scene, this.camera);
            } catch (error) {
                console.error('Error in animation loop:', error);
            }
        };

        animate();
        console.log('Animation loop started');
    }

setupEventListeners() {
        try {
            // Dice roll button
            const rollButton = document.getElementById('roll-dice');
            if (rollButton) {
                rollButton.addEventListener('click', () => this.handleDiceRoll());
            }

            // Window resize
            window.addEventListener('resize', () => this.onWindowResize());

            // Keyboard controls
            window.addEventListener('keydown', (e) => this.handleKeyPress(e));
            
            console.log('Event listeners setup complete');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
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
        try {
            const currentPos = this.player.getPosition();
            const targetIndex = Math.min(currentPos + roll, this.board.pathCells.length - 1);
            const targetCell = this.board.getCellAt(targetIndex);

            if (targetCell) {
                // Highlight path
                this.board.highlightPath(currentPos, targetIndex);

                // Move player
                await this.player.moveTo(targetCell.position);

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
        } catch (error) {
            console.error('Error in player turn:', error);
            this.gameState.isAnimating = false;
        }
    }

    async handleBotTurn(roll) {
        try {
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
        } catch (error) {
            console.error('Error in bot turn:', error);
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
        // Create particle burst effect
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            // Random position around winner
            const angle = Math.random() * Math.PI * 2;
            positions[i] = Math.cos(angle) * 2;
            positions[i + 1] = 0;
            positions[i + 2] = Math.sin(angle) * 2;

            // Random colors
            colors[i] = Math.random();
            colors[i + 1] = Math.random();
            colors[i + 2] = Math.random();

            // Random velocities
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
        if (this.player) {
            particles.position.copy(this.player.getPosition());
        }
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
        if (!this.player || !this.camera) return;
        
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
        // Camera controls
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
        if (!this.controls) return;
        
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
}

// Initialize game when DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating game...');
    new DungeonGame();
});
