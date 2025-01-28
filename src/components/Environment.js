import * as THREE from 'three';

export default class Environment {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = new THREE.Group();
        this.scene.add(this.obstacles);
        
        // First create the basic environment
        this.createBasicEnvironment();
        // Then add atmospheric effects
        this.setupAtmosphere();
        // Finally add decorative elements
        this.addEnvironmentDecorations();
    }

    createBasicEnvironment() {
        // Dark stone floor with dramatic lighting
        const floorGeometry = new THREE.PlaneGeometry(200, 200);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9,
            metalness: 0.1,
            bumpMap: this.createStoneBumpMap(),
            bumpScale: 0.15,
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Add walls around the perimeter
        this.createDungeonWalls();
    }

    createDungeonWalls() {
        const wallHeight = 15;
        const wallGeometry = new THREE.BoxGeometry(1, wallHeight, 1);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c2c2c,
            roughness: 0.8,
            metalness: 0.2,
            bumpMap: this.createStoneBumpMap(),
            bumpScale: 0.2
        });

        // Create a circular arrangement of wall segments
        const radius = 60;
        const segments = 36;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(x, wallHeight / 2, z);
            wall.lookAt(new THREE.Vector3(0, wallHeight / 2, 0));
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.obstacles.add(wall);

            // Add wall decorations
            if (i % 3 === 0) {
                this.addWallDecoration(x, z, angle);
            }
        }
    }

    addWallDecoration(x, z, angle) {
        // Add gothic arch
        const archGeometry = new THREE.Shape();
        archGeometry.moveTo(-1, 0);
        archGeometry.lineTo(-1, 3);
        archGeometry.quadraticCurveTo(0, 5, 1, 3);
        archGeometry.lineTo(1, 0);

        const extrudeSettings = {
            depth: 0.5,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 2,
            bevelSize: 0.1,
            bevelThickness: 0.1
        };

        const archMesh = new THREE.ExtrudeGeometry(archGeometry, extrudeSettings);
        const archMaterial = new THREE.MeshStandardMaterial({
            color: 0x3c3c3c,
            roughness: 0.9,
            metalness: 0.2
        });

        const arch = new THREE.Mesh(archMesh, archMaterial);
        arch.position.set(x * 0.95, 2, z * 0.95);
        arch.lookAt(new THREE.Vector3(0, 2, 0));
        arch.castShadow = true;
        arch.receiveShadow = true;
        this.obstacles.add(arch);
    }

    setupAtmosphere() {
        // Base ambient light (very dim)
        const ambientLight = new THREE.AmbientLight(0x666666, 0.3);
        this.scene.add(ambientLight);

        // Moonlight effect from above
        const moonLight = new THREE.DirectionalLight(0x77ccff, 0.5);
        moonLight.position.set(0, 100, 0);
        moonLight.castShadow = true;
        
        // Improve shadow quality
        moonLight.shadow.mapSize.width = 2048;
        moonLight.shadow.mapSize.height = 2048;
        moonLight.shadow.camera.near = 0.5;
        moonLight.shadow.camera.far = 500;
        moonLight.shadow.camera.left = -100;
        moonLight.shadow.camera.right = 100;
        moonLight.shadow.camera.top = 100;
        moonLight.shadow.camera.bottom = -100;
        
        this.scene.add(moonLight);

        // Add volumetric fog
        this.scene.fog = new THREE.FogExp2(0x000000, 0.015);

        // Add random floating particles for atmosphere
        this.addAtmosphericParticles();
    }

    addAtmosphericParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            const radius = 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = Math.random() * 20; // Height up to 20 units
            positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x666666,
            size: 0.1,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        // Animate particles
        const animate = () => {
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += 0.01;
                if (positions[i + 1] > 20) positions[i + 1] = 0;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            requestAnimationFrame(animate);
        };
        animate();
    }

    addEnvironmentDecorations() {
        // Add trees in clusters
        this.addTreeClusters();
        
        // Add rock formations
        this.addRockFormations();
        
        // Add ancient ruins
        this.addRuins();
        
        // Add atmospheric torches
        this.addTorches();
    }

    addTreeClusters() {
        const clusterCount = 5;
        const treesPerCluster = 4;
        
        for (let i = 0; i < clusterCount; i++) {
            const angle = (i / clusterCount) * Math.PI * 2;
            const baseRadius = 40;
            const clusterX = Math.cos(angle) * baseRadius;
            const clusterZ = Math.sin(angle) * baseRadius;
            
            for (let j = 0; j < treesPerCluster; j++) {
                const tree = this.createDetailedTree();
                const offsetRadius = 5;
                const offsetAngle = Math.random() * Math.PI * 2;
                
                tree.position.set(
                    clusterX + Math.cos(offsetAngle) * offsetRadius,
                    0,
                    clusterZ + Math.sin(offsetAngle) * offsetRadius
                );
                
                tree.rotation.y = Math.random() * Math.PI * 2;
                const scale = 0.8 + Math.random() * 0.4;
                tree.scale.set(scale, scale * 1.2, scale);
                
                this.obstacles.add(tree);
            }
        }
    }

    addRockFormations() {
        const formationCount = 8;
        const rocksPerFormation = 5;
        
        for (let i = 0; i < formationCount; i++) {
            const angle = (i / formationCount) * Math.PI * 2;
            const baseRadius = 35;
            const formationX = Math.cos(angle) * baseRadius;
            const formationZ = Math.sin(angle) * baseRadius;
            
            for (let j = 0; j < rocksPerFormation; j++) {
                const rock = this.createDetailedRock();
                const offsetRadius = 3;
                const offsetAngle = Math.random() * Math.PI * 2;
                
                rock.position.set(
                    formationX + Math.cos(offsetAngle) * offsetRadius,
                    0,
                    formationZ + Math.sin(offsetAngle) * offsetRadius
                );
                
                rock.rotation.set(
                    Math.random() * 0.5,
                    Math.random() * Math.PI * 2,
                    Math.random() * 0.5
                );
                
                const scale = 0.5 + Math.random() * 1;
                rock.scale.set(scale, scale * 0.7, scale);
                
                this.obstacles.add(rock);
            }
        }
    }

    addRuins() {
        // Add broken pillars and ruins
        const ruinCount = 12;
        
        for (let i = 0; i < ruinCount; i++) {
            const angle = (i / ruinCount) * Math.PI * 2;
            const radius = 45;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            if (i % 3 === 0) {
                // Broken pillar
                const pillar = this.createBrokenPillar();
                pillar.position.set(x, 0, z);
                pillar.rotation.y = Math.random() * Math.PI * 2;
                this.obstacles.add(pillar);
            } else {
                // Fallen stones
                const stones = this.createFallenStones();
                stones.position.set(x, 0, z);
                stones.rotation.y = Math.random() * Math.PI * 2;
                this.obstacles.add(stones);
            }
        }
    }

    createBrokenPillar() {
        const pillar = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(1.2, 1.4, 1, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        pillar.add(base);
        
        // Broken shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.8, 0.8, 4, 8);
        const shaft = new THREE.Mesh(shaftGeometry, baseMaterial);
        shaft.position.y = 2.5;
        shaft.rotation.x = Math.random() * 0.3;
        pillar.add(shaft);
        
        return pillar;
    }

    createFallenStones() {
        const stones = new THREE.Group();
        
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5);
            const material = new THREE.MeshStandardMaterial({
                color: 0x666666,
                roughness: 0.9,
                metalness: 0.1
            });
            
            const stone = new THREE.Mesh(geometry, material);
            stone.position.set(
                Math.random() * 2 - 1,
                Math.random() * 0.5,
                Math.random() * 2 - 1
            );
            
            stone.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            stone.scale.set(
                1 + Math.random() * 0.5,
                1 + Math.random() * 0.5,
                1 + Math.random() * 0.5
            );
            
            stones.add(stone);
        }
        
        return stones;
    }

    addTorches() {
        const torchCount = 16;
        const radius = 30;
        
        for (let i = 0; i < torchCount; i++) {
            const angle = (i / torchCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const torch = this.createDetailedTorch();
            torch.position.set(x, 3, z);
            torch.lookAt(new THREE.Vector3(0, 3, 0));
            this.obstacles.add(torch);
        }
    }

    // Keep your existing helper methods (createDetailedTree, createDetailedTorch, etc.)
    // but update their materials to be more atmospheric:

    createDetailedTree() {
        const tree = new THREE.Group();
        
        // Darker, more twisted trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 6);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a1810,
            roughness: 1,
            metalness: 0,
            bumpMap: this.createBarkTexture(),
            bumpScale: 0.2
        });
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.castShadow = true;
        // Add some twist to the trunk
        trunk.rotation.x = (Math.random() - 0.5) * 0.2;
        tree.add(trunk);

        // Dead branches
        for (let i = 0; i < 6; i++) {
            const branchGeometry = new THREE.CylinderGeometry(0.1, 0.05, 2, 5);
            const branch = new THREE.Mesh(branchGeometry, trunkMaterial);
            
            branch.position.y = Math.random() * 3;
            branch.rotation.z = Math.random() * Math.PI - Math.PI / 2;
            branch.rotation.y = Math.random() * Math.PI * 2;
            
            tree.add(branch);
        }

        return tree;
    }

    update() {
        // Update animated elements
        this.updateTorchLights();
        this.updateAtmosphericEffects();
    }

    updateTorchLights() {
        this.obstacles.children.forEach(object => {
            if (object.userData.type === 'torch') {
                const light = object.children.find(child => child instanceof THREE.PointLight);
                if (light) {
                    light.intensity = 1.5 + Math.sin(Date.now() * 0.01) * 0.5;
                }

                const flame = object.children.find(child => child.userData.type === 'flame');
                if (flame && flame.material.uniforms) {
                    flame.material.uniforms.time.value = Date.now() * 0.001;
                }
            }
        });
    }

    updateAtmosphericEffects() {
        // Update fog density with slight variation
        if (this.scene.fog) {
            this.scene.fog.density = 0.015 + Math.sin(Date.now() * 0.001) * 0.002;
        }
    }

    createBarkTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Create a more detailed bark pattern
        for (let y = 0; y < canvas.height; y += 2) {
            for (let x = 0; x < canvas.width; x += 2) {
                // Create vertical striping pattern
                const baseValue = Math.abs(Math.sin(y * 0.1)) * 30;
                const noise = Math.random() * 20;
                const value = Math.min(baseValue + noise, 255);
                
                ctx.fillStyle = `rgb(${value},${value * 0.8},${value * 0.6})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createStoneBumpMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Create more detailed stone texture
        ctx.fillStyle = '#000000';
        
        // Base noise
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const value = Math.random() * 30;
                ctx.fillStyle = `rgb(${value},${value},${value})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        // Add cracks
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            
            const points = 3 + Math.floor(Math.random() * 3);
            for (let j = 0; j < points; j++) {
                ctx.lineTo(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height
                );
            }
            
            ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.5 + 0.5})`;
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    createDetailedTorch() {
        const torch = new THREE.Group();
        torch.userData.type = 'torch';

        // Bracket
        const bracketGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
        const bracketMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d2b1f,
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
            color: 0x3d2b1f,
            roughness: 0.7,
            metalness: 0.3,
            emissive: 0x3d2b1f,
            emissiveIntensity: 0.2
        });
        const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
        bowl.position.y = 1.2;
        torch.add(bowl);

        // Animated flame
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
        flame.userData.type = 'flame';
        torch.add(flame);

        // Point light
        const light = new THREE.PointLight(0xff6600, 2, 10);
        light.position.y = 1.4;
        torch.add(light);

        // Add light flicker animation
        this.animateTorchLight(light);

        // Add glowing embers particle effect
        this.addEmbers(torch);

        return torch;
    }

    addEmbers(torch) {
        const emberCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(emberCount * 3);
        const velocities = new Float32Array(emberCount * 3);

        for (let i = 0; i < emberCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 0.1;
            positions[i + 1] = 1.4;
            positions[i + 2] = (Math.random() - 0.5) * 0.1;

            velocities[i] = (Math.random() - 0.5) * 0.01;
            velocities[i + 1] = Math.random() * 0.02 + 0.02;
            velocities[i + 2] = (Math.random() - 0.5) * 0.01;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const material = new THREE.PointsMaterial({
            color: 0xff3300,
            size: 0.02,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const embers = new THREE.Points(geometry, material);
        embers.userData.type = 'embers';

        // Animate embers
        const animate = () => {
            const positions = embers.geometry.attributes.position.array;
            const velocities = embers.geometry.attributes.velocity.array;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];

                // Reset embers that go too high
                if (positions[i + 1] > 2) {
                    positions[i] = (Math.random() - 0.5) * 0.1;
                    positions[i + 1] = 1.4;
                    positions[i + 2] = (Math.random() - 0.5) * 0.1;
                }
            }

            embers.geometry.attributes.position.needsUpdate = true;
            requestAnimationFrame(animate);
        };
        animate();

        torch.add(embers);
    }
}
