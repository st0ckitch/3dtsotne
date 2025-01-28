import * as THREE from 'three';

export default class Environment {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = new THREE.Group();
        this.scene.add(this.obstacles);
        
        this.createEnvironment();
        this.setupLighting();
    }

    createEnvironment() {
        // Create detailed floor with tiles
        this.createDetailedFloor();
        this.addDecorations();
    }

    createDetailedFloor() {
        // Create a large tiled floor
        const floorGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a1810,
            roughness: 0.8,
            metalness: 0.2,
            bumpMap: this.createStoneBumpMap(),
            displacementMap: this.createStoneDisplacementMap(),
            displacementScale: 0.2
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    createStoneBumpMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Create stone texture pattern
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 5 + 2;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    createStoneDisplacementMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Create displacement pattern
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const value = (Math.random() * 20) | 0;
                ctx.fillStyle = `rgb(${value},${value},${value})`;
                ctx.fillRect(i, j, 1, 1);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    createDetailedTree() {
        const tree = new THREE.Group();

        // Create trunk with detailed bark texture
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3525,
            roughness: 0.9,
            metalness: 0.1,
            bumpMap: this.createBarkTexture()
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.castShadow = true;
        tree.add(trunk);

        // Create multiple branch levels
        for (let level = 0; level < 3; level++) {
            const y = level * 1.2 + 1;
            const branches = this.createBranchLevel(level);
            branches.position.y = y;
            tree.add(branches);
        }

        return tree;
    }

    createBranchLevel(level) {
        const branches = new THREE.Group();
        const count = 4 + level * 2;
        const radius = 1.5 - level * 0.3;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const branchGeometry = new THREE.CylinderGeometry(0.1, 0.05, radius, 5);
            const branchMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a3525,
                roughness: 0.9,
                metalness: 0.1
            });
            
            const branch = new THREE.Mesh(branchGeometry, branchMaterial);
            branch.position.x = Math.cos(angle) * 0.3;
            branch.position.z = Math.sin(angle) * 0.3;
            branch.rotation.z = Math.PI / 2 - angle;
            branch.rotation.y = Math.random() * Math.PI * 0.25;
            branches.add(branch);
        }

        return branches;
    }

    createDetailedRock() {
        const rockGeometry = new THREE.IcosahedronGeometry(1, 1);
        const positions = rockGeometry.attributes.position;
        
        // Deform the geometry for more natural look
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            positions.setXYZ(
                i,
                x + (Math.random() - 0.5) * 0.2,
                y + (Math.random() - 0.5) * 0.2,
                z + (Math.random() - 0.5) * 0.2
            );
        }

        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9,
            metalness: 0.1,
            bumpMap: this.createRockTexture()
        });

        return new THREE.Mesh(rockGeometry, rockMaterial);
    }

    createDetailedPillar() {
        const pillar = new THREE.Group();

        // Base
        const baseGeometry = new THREE.CylinderGeometry(1.2, 1.4, 1, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.7,
            metalness: 0.3,
            bumpMap: this.createMarbleTexture()
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        pillar.add(base);

        // Shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.8, 0.8, 6, 16);
        const shaftMaterial = baseMaterial.clone();
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.position.y = 3.5;
        pillar.add(shaft);

        // Capital (top)
        const capitalGeometry = new THREE.CylinderGeometry(1.2, 0.8, 1, 8);
        const capital = new THREE.Mesh(capitalGeometry, baseMaterial.clone());
        capital.position.y = 7;
        pillar.add(capital);

        // Add decorative details
        this.addPillarDetails(pillar);

        return pillar;
    }

    addPillarDetails(pillar) {
        // Add fluting (vertical grooves)
        const flutingCount = 12;
        for (let i = 0; i < flutingCount; i++) {
            const angle = (i / flutingCount) * Math.PI * 2;
            const grooveGeometry = new THREE.BoxGeometry(0.1, 6, 0.1);
            const grooveMaterial = new THREE.MeshStandardMaterial({
                color: 0x777777,
                roughness: 0.8,
                metalness: 0.2
            });
            
            const groove = new THREE.Mesh(grooveGeometry, grooveMaterial);
            groove.position.set(
                Math.cos(angle) * 0.8,
                3.5,
                Math.sin(angle) * 0.8
            );
            groove.rotation.y = angle;
            pillar.add(groove);
        }
    }

    createDetailedTorch() {
        const torch = new THREE.Group();

        // Bracket
        const bracketGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
        const bracketMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3525,
            roughness: 0.9,
            metalness: 0.1
        });
        const bracket = new THREE.Mesh(bracketGeometry, bracketMaterial);
        bracket.rotation.x = Math.PI / 4;
        torch.add(bracket);

        // Handle
        const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
        const handle = new THREE.Mesh(handleGeometry, bracketMaterial);
        handle.position.y = 0.6;
        torch.add(handle);

        // Bowl
        const bowlGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        bowlGeometry.scale(1, 0.5, 1);
        const bowlMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.7,
            metalness: 0.3
        });
        const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
        bowl.position.y = 1.2;
        torch.add(bowl);

        // Flame
        this.addAnimatedFlame(torch);

        // Light
        const light = new THREE.PointLight(0xff6600, 2, 15);
        light.position.y = 1.2;
        this.animateTorchLight(light);
        torch.add(light);

        return torch;
    }

    addAnimatedFlame(torch) {
        const flameGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
        const flameMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    pos.x += sin(pos.y * 10.0 + time) * 0.03;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float time;
                
                void main() {
                    vec3 color1 = vec3(1.0, 0.3, 0.0);
                    vec3 color2 = vec3(1.0, 0.6, 0.0);
                    float noise = sin(vUv.y * 10.0 + time) * 0.5 + 0.5;
                    vec3 color = mix(color1, color2, noise);
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });

        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = 1.4;
        
        // Animate flame
        const animate = () => {
            flameMaterial.uniforms.time.value += 0.1;
            requestAnimationFrame(animate);
        };
        animate();
        
        torch.add(flame);
    }

    createBarkTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Create bark pattern
        ctx.fillStyle = '#000000';
        for (let y = 0; y < canvas.height; y += 4) {
            for (let x = 0; x < canvas.width; x += 4) {
                const value = Math.random() * 30 + 20;
                ctx.fillStyle = `rgb(${value},${value},${value})`;
                ctx.fillRect(x, y, 4, 4);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createRockTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Create rock texture
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 2 + 1;
            const value = Math.random() * 40 + 20;
            
            ctx.fillStyle = `rgb(${value},${value},${value})`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createMarbleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Create marble-like texture
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const noise = this.perlinNoise(x / 30, y / 30);
                const value = (noise * 128 + 128) | 0;
                ctx.fillStyle = `rgb(${value},${value},${value})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    perlinNoise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const A = this.p[X] + Y;
        const B = this.p[X + 1] + Y;
        
        return this.lerp(v, 
            this.lerp(u,
                this.grad(this.p[A], x, y),
                this.grad(perlinNoise(x, y) {
        // Simple perlin noise implementation
        return (Math.sin(x * 10 + Math.cos(y * 10)) + 1) / 2;
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 15;
        const grad = 1 + (h & 7);
        return ((h & 8) ? -grad : grad) * x + ((h & 4) ? -grad : grad) * y;
    }

    addDecorations() {
        // Add trees in a more natural pattern
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 30 + Math.random() * 10;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const tree = this.createDetailedTree();
            tree.position.set(x, 0, z);
            tree.rotation.y = Math.random() * Math.PI * 2;
            tree.scale.set(
                0.8 + Math.random() * 0.4,
                0.8 + Math.random() * 0.4,
                0.8 + Math.random() * 0.4
            );
            this.obstacles.add(tree);
        }

        // Add rocks scattered around
        for (let i = 0; i < 30; i++) {
            const rock = this.createDetailedRock();
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 40;
            
            rock.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            rock.scale.set(
                0.5 + Math.random(),
                0.5 + Math.random(),
                0.5 + Math.random()
            );
            
            this.obstacles.add(rock);
        }

        // Add pillars at strategic locations
        const pillarPositions = [
            { x: 20, z: 20 },
            { x: -20, z: 20 },
            { x: 20, z: -20 },
            { x: -20, z: -20 },
            { x: 0, z: 30 },
            { x: 0, z: -30 },
            { x: 30, z: 0 },
            { x: -30, z: 0 }
        ];

        pillarPositions.forEach(pos => {
            const pillar = this.createDetailedPillar();
            pillar.position.set(pos.x, 0, pos.z);
            this.obstacles.add(pillar);
        });

        // Add torches around the board
        this.addTorchesAroundBoard();
    }

    addTorchesAroundBoard() {
        const torchPositions = [];
        const boardRadius = 35;
        const torchCount = 16;

        // Create a circle of torches
        for (let i = 0; i < torchCount; i++) {
            const angle = (i / torchCount) * Math.PI * 2;
            torchPositions.push({
                x: Math.cos(angle) * boardRadius,
                z: Math.sin(angle) * boardRadius
            });
        }

        torchPositions.forEach(pos => {
            const torch = this.createDetailedTorch();
            torch.position.set(pos.x, 3, pos.z);
            // Point torches toward center
            torch.lookAt(new THREE.Vector3(0, 3, 0));
            this.obstacles.add(torch);
        });
    }

    setupLighting() {
        // Main ambient light
        const ambientLight = new THREE.AmbientLight(0x666666, 0.7);
        this.scene.add(ambientLight);

        // Moonlight effect
        const moonLight = new THREE.DirectionalLight(0x77ccff, 0.8);
        moonLight.position.set(50, 100, 50);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.width = 2048;
        moonLight.shadow.mapSize.height = 2048;
        moonLight.shadow.camera.near = 0.5;
        moonLight.shadow.camera.far = 200;
        moonLight.shadow.camera.left = -50;
        moonLight.shadow.camera.right = 50;
        moonLight.shadow.camera.top = 50;
        moonLight.shadow.camera.bottom = -50;
        this.scene.add(moonLight);

        // Add volumetric fog
        const fog = new THREE.FogExp2(0x000000, 0.015);
        this.scene.fog = fog;
    }

    animateTorchLight(light) {
        const animate = () => {
            const flicker = Math.random() * 0.2 + 0.9;
            light.intensity = 2 * flicker;
            requestAnimationFrame(animate);
        };
        animate();
    }
}
