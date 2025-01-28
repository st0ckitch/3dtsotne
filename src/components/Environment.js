import * as THREE from 'three';

export default class Environment {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = new THREE.Group();
        this.torches = new THREE.Group();
        this.scene.add(this.obstacles);
        this.scene.add(this.torches);
        
        // Store visible objects for fog of war
        this.visibleObjects = new Set();
        
        // Initialize environment
        this.createBasicEnvironment();
        this.setupLighting();
        this.createAtmosphere();
        this.addEnvironmentDecorations();
    }

    createBasicEnvironment() {
        // Create main dungeon floor
        const floorGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a0f0f,
            roughness: 0.9,
            metalness: 0.1,
            bumpMap: this.createStoneTexture(),
            bumpScale: 0.2
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Add floor details
        this.addFloorDetails();
    }

    createStoneTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Create base dark texture
        ctx.fillStyle = '#1a0f0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add stone texture pattern
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 4 + 2;
            const alpha = Math.random() * 0.3 + 0.1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fill();
        }

        // Add cracks
        for (let i = 0; i < 20; i++) {
            const startX = Math.random() * canvas.width;
            const startY = Math.random() * canvas.height;
            const length = Math.random() * 50 + 20;
            const angle = Math.random() * Math.PI * 2;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(
                startX + Math.cos(angle) * length,
                startY + Math.sin(angle) * length
            );
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = Math.random() * 2 + 1;
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        return texture;
    }

    addFloorDetails() {
        // Add random debris and small details on the floor
        const debrisCount = 200;
        const debrisGeometry = new THREE.CircleGeometry(0.2, 4);
        const debrisMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a1810,
            roughness: 1,
            metalness: 0
        });

        for (let i = 0; i < debrisCount; i++) {
            const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 80 + 10;
            
            debris.position.set(
                Math.cos(angle) * radius,
                0.01, // Just above floor
                Math.sin(angle) * radius
            );
            
            debris.rotation.x = -Math.PI / 2;
            debris.rotation.z = Math.random() * Math.PI;
            debris.scale.setScalar(Math.random() * 0.5 + 0.5);
            
            this.obstacles.add(debris);
        }

        // Add floor stains
        this.createFloorStains();
    }

    createFloorStains() {
        const stainCount = 50;
        const stainGeometry = new THREE.PlaneGeometry(1, 1);
        const stainTexture = this.createStainTexture();
        const stainMaterial = new THREE.MeshBasicMaterial({
            map: stainTexture,
            transparent: true,
            opacity: 0.3,
            blending: THREE.MultiplyBlending
        });

        for (let i = 0; i < stainCount; i++) {
            const stain = new THREE.Mesh(stainGeometry, stainMaterial);
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 80 + 10;
            
            stain.position.set(
                Math.cos(angle) * radius,
                0.02,
                Math.sin(angle) * radius
            );
            
            stain.rotation.x = -Math.PI / 2;
            stain.rotation.z = Math.random() * Math.PI;
            stain.scale.setScalar(Math.random() * 3 + 1);
            
            this.obstacles.add(stain);
        }
    }

    createStainTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Create radial gradient for stain
        const gradient = ctx.createRadialGradient(
            64, 64, 0,
            64, 64, 64
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);

        // Add noise to make it look more natural
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const alpha = Math.random() * 0.1;
            
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(x, y, 1, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
