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

    setupLighting() {
        // Main ambient light (increased intensity, warmer color)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Moonlight effect (brighter, more neutral color)
        const moonLight = new THREE.DirectionalLight(0xffffff, 1.0);
        moonLight.position.set(50, 100, 50);
        moonLight.castShadow = true;
        
        // Improve shadow quality
        moonLight.shadow.mapSize.width = 2048;
        moonLight.shadow.mapSize.height = 2048;
        moonLight.shadow.camera.near = 0.5;
        moonLight.shadow.camera.far = 200;
        moonLight.shadow.camera.left = -50;
        moonLight.shadow.camera.right = 50;
        moonLight.shadow.camera.top = 50;
        moonLight.shadow.camera.bottom = -50;
        moonLight.shadow.bias = -0.0001;
        
        this.scene.add(moonLight);

        // Add hemisphere light for better ambient lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.scene.add(hemiLight);

        // Add volumetric fog
        this.setupFog();
    }

    setupFog() {
        // Create less dense fog with a lighter color
        this.scene.fog = new THREE.FogExp2(0x222222, 0.008);

        // Add fog particles for atmosphere
        this.createFogParticles();
    }

    createFogParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            // Random position in a cylinder shape around the play area
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 60 + 20;
            const height = Math.random() * 10;

            positions[i] = Math.cos(angle) * radius;     // x
            positions[i + 1] = height;                   // y
            positions[i + 2] = Math.sin(angle) * radius; // z

            // Very slow random movement
            velocities[i] = (Math.random() - 0.5) * 0.01;
            velocities[i + 1] = (Math.random() - 0.5) * 0.01;
            velocities[i + 2] = (Math.random() - 0.5) * 0.01;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x666666,
            size: 0.2,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.fogParticles = new THREE.Points(geometry, material);
        this.scene.add(this.fogParticles);

        // Store velocities for animation
        this.fogParticles.userData.velocities = velocities;
    }

    createAtmosphere() {
        // Add dust particles
        this.createDustParticles();
        
        // Add floating embers
        this.createEmbers();
        
        // Add background glow
        this.createBackgroundGlow();
    }

    createDustParticles() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const alphas = new Float32Array(particleCount);

        for (let i = 0; i < particleCount * 3; i += 3) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 40 + 10;
            const height = Math.random() * 15;

            positions[i] = Math.cos(angle) * radius;
            positions[i + 1] = height;
            positions[i + 2] = Math.sin(angle) * radius;

            alphas[i / 3] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float alpha;
                varying float vAlpha;
                uniform float time;
                
                void main() {
                    vAlpha = alpha;
                    vec3 pos = position;
                    pos.y += sin(time + position.x * 0.5) * 0.1;
                    pos.x += cos(time + position.z * 0.5) * 0.1;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = 2.0;
                }
            `,
            fragmentShader: `
                varying float vAlpha;
                
                void main() {
                    float r = length(gl_PointCoord - vec2(0.5));
                    if (r > 0.5) discard;
                    gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha * 0.1);
                }
            `,
            transparent: true,
            depthWrite: false
        });

        this.dustParticles = new THREE.Points(geometry, material);
        this.scene.add(this.dustParticles);
    }

    createEmbers() {
        const emberCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(emberCount * 3);
        const colors = new Float32Array(emberCount * 3);
        const velocities = new Float32Array(emberCount * 3);
        const lifetimes = new Float32Array(emberCount);

        for (let i = 0; i < emberCount; i++) {
            this.initializeEmber(positions, colors, velocities, lifetimes, i);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.embers = new THREE.Points(geometry, material);
        this.embers.userData = { velocities, lifetimes };
        this.scene.add(this.embers);
    }

    initializeEmber(positions, colors, velocities, lifetimes, index) {
        // Random position near torches
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 40 + 10;
        
        positions[index * 3] = Math.cos(angle) * radius;
        positions[index * 3 + 1] = Math.random() * 5;
        positions[index * 3 + 2] = Math.sin(angle) * radius;

        // Orange-red color with variation
        colors[index * 3] = 1;
        colors[index * 3 + 1] = Math.random() * 0.3;
        colors[index * 3 + 2] = 0;

        // Upward and random horizontal movement
        velocities[index * 3] = (Math.random() - 0.5) * 0.05;
        velocities[index * 3 + 1] = Math.random() * 0.1 + 0.05;
        velocities[index * 3 + 2] = (Math.random() - 0.5) * 0.05;

        // Random lifetime
        lifetimes[index] = Math.random() * 2 + 1;
    }

    createBackgroundGlow() {
        // Add subtle glow at the edges of visibility
        const glowGeometry = new THREE.PlaneGeometry(200, 200);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0x220000) },
                viewPosition: { value: new THREE.Vector3() }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform vec3 viewPosition;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    float dist = length(vPosition - viewPosition);
                    float alpha = smoothstep(20.0, 60.0, dist) * 0.3;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        this.backgroundGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.backgroundGlow.rotation.x = -Math.PI / 2;
        this.backgroundGlow.position.y = 0.1;
        this.scene.add(this.backgroundGlow);
    }

    addEnvironmentDecorations() {
        // Add pillars in a circle around the play area
        this.addPillars();
        
        // Add rocks and debris
        this.addRocks();
        
        // Add torches for lighting
        this.addTorches();

        // Add wall ruins
        this.addRuins();
    }

    addPillars() {
        const pillarCount = 8;
        for (let i = 0; i < pillarCount; i++) {
            const angle = (i / pillarCount) * Math.PI * 2;
            const radius = 30;
            
            const pillar = this.createPillar();
            pillar.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            
            // Random slight rotation for variety
            pillar.rotation.y = Math.random() * Math.PI * 2;
            
            this.obstacles.add(pillar);
        }
    }

    createPillar() {
        const pillar = new THREE.Group();

        // Base
        const baseHeight = 1.5;
        const baseGeometry = new THREE.CylinderGeometry(1.2, 1.4, baseHeight, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.7,
            metalness: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = baseHeight/2;
        pillar.add(base);

        // Main shaft with detailed geometry
        const shaftHeight = 8;
        const shaftGeometry = new THREE.CylinderGeometry(0.8, 0.8, shaftHeight, 16, 8);
        const shaftMaterial = baseMaterial.clone();
        
        // Add vertex displacement for weathered look
        const positions = shaftGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const displacement = (Math.random() - 0.5) * 0.1;
            positions[i] += displacement;
            positions[i + 2] += displacement;
        }
        shaftGeometry.computeVertexNormals();

        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.position.y = baseHeight + shaftHeight/2;
        pillar.add(shaft);

        // Capital (top)
        const capitalHeight = 1.5;
        const capitalGeometry = new THREE.CylinderGeometry(1.3, 0.8, capitalHeight, 8);
        const capital = new THREE.Mesh(capitalGeometry, baseMaterial.clone());
        capital.position.y = baseHeight + shaftHeight + capitalHeight/2;
        pillar.add(capital);

        // Add cracks and damage
        this.addPillarDamage(pillar);

        pillar.castShadow = true;
        pillar.receiveShadow = true;
        return pillar;
    }

    addPillarDamage(pillar) {
        // Add random cracks
        const crackCount = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < crackCount; i++) {
            const height = Math.random() * 8 + 1;
            const angle = Math.random() * Math.PI * 2;
            
            const crackGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
            const crackMaterial = new THREE.MeshStandardMaterial({
                color: 0x000000,
                roughness: 1,
                metalness: 0
            });
            
            const crack = new THREE.Mesh(crackGeometry, crackMaterial);
            crack.position.set(
                Math.cos(angle) * 0.79,
                height,
                Math.sin(angle) * 0.79
            );
            crack.rotation.y = angle;
            pillar.add(crack);
        }

        // Add fallen debris around base
        const debrisCount = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < debrisCount; i++) {
            const size = Math.random() * 0.3 + 0.1;
            const debrisGeometry = new THREE.DodecahedronGeometry(size);
            const debrisMaterial = pillar.children[0].material.clone();
            
            const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 2 + 1;
            
            debris.position.set(
                Math.cos(angle) * radius,
                0.1,
                Math.sin(angle) * radius
            );
            
            debris.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            pillar.add(debris);
        }
    }

    addRocks() {
        const rockCount = 50;
        for (let i = 0; i < rockCount; i++) {
            const rock = this.createRock();
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 35 + 15;
            
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
            
            const scale = Math.random() * 0.5 + 0.5;
            rock.scale.set(scale, scale * 0.7, scale);
            
            this.obstacles.add(rock);
        }
    }

    createRock() {
        const geometry = new THREE.DodecahedronGeometry(1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9,
            metalness: 0.1
        });

        // Deform vertices for more natural look
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.2;
            positions[i + 1] += (Math.random() - 0.5) * 0.2;
            positions[i + 2] += (Math.random() - 0.5) * 0.2;
        }
        geometry.computeVertexNormals();

        const rock = new THREE.Mesh(geometry, material);
        rock.castShadow = true;
        rock.receiveShadow = true;
        return rock;
    }

    addTorches() {
        const torchCount = 16;
        for (let i = 0; i < torchCount; i++) {
            const angle = (i / torchCount) * Math.PI * 2;
            const radius = 25;
            
            const torch = this.createTorch();
            torch.position.set(
                Math.cos(angle) * radius,
                3,
                Math.sin(angle) * radius
            );
            
            // Make torch face center
            torch.lookAt(new THREE.Vector3(0, 3, 0));
            this.torches.add(torch);
        }
    }

    createTorch() {
        const torch = new THREE.Group();
        torch.userData.type = 'torch';

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

        // Bowl
        const bowlGeometry = new THREE.CylinderGeometry(0.2, 0.1, 0.3, 8);
        const bowlMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3525,
            emissive: 0xff4400,
            emissiveIntensity: 0.2
        });
        const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
        bowl.position.y = 0.5;
        torch.add(bowl);

        // Flame
        this.addTorchFlame(torch);

        // Light
        const light = new THREE.PointLight(0xff6600, 2, 15);
        light.position.y = 0.5;
        torch.add(light);

        return torch;
    }

    addTorchFlame(torch) {
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
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = 0.7;
        torch.add(flame);
    }

    update(playerPosition) {
        // Update torch effects
        this.updateTorches();
        
        // Update particles
        this.updateParticles();
        
        // Update fog and visibility
        this.updateVisibility(playerPosition);
    }

    updateTorches() {
        this.torches.children.forEach(torch => {
            // Update flame animation
            const flame = torch.children.find(child => child.material?.isShaderMaterial);
            if (flame) {
                flame.material.uniforms.time.value += 0.1;
            }

            // Update light flicker
            const light = torch.children.find(child => child instanceof THREE.PointLight);
            if (light) {
                light.intensity = 2 + Math.sin(Date.now() * 0.005) * 0.5;
            }
        });
    }

    updateParticles() {
        // Update dust particles
        if (this.dustParticles) {
            this.dustParticles.material.uniforms.time.value += 0.01;
        }

        // Update fog particles
        if (this.fogParticles) {
            const positions = this.fogParticles.geometry.attributes.position.array;
            const velocities = this.fogParticles.userData.velocities;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];

                // Reset particles that move too far
                if (Math.abs(positions[i]) > 100 || 
                    positions[i + 1] > 15 || 
                    Math.abs(positions[i + 2]) > 100) {
                    this.resetParticle(positions, i);
                }
            }

            this.fogParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Update embers
        if (this.embers) {
            const positions = this.embers.geometry.attributes.position.array;
            const velocities = this.embers.userData.velocities;
            const lifetimes = this.embers.userData.lifetimes;

            for (let i = 0; i < positions.length / 3; i++) {
                lifetimes[i] -= 0.016;
                if (lifetimes[i] <= 0) {
                    this.initializeEmber(
                        positions, 
                        this.embers.geometry.attributes.color.array,
                        velocities,
                        lifetimes,
                        i
                    );
                } else {
                    positions[i * 3] += velocities[i * 3];
                    positions[i * 3 + 1] += velocities[i * 3 + 1];
                    positions[i * 3 + 2] += velocities[i * 3 + 2];
                }
            }

            this.embers.geometry.attributes.position.needsUpdate = true;
        }
    }

    updateVisibility(playerPosition) {
        // Update background glow
        if (this.backgroundGlow) {
            this.backgroundGlow.material.uniforms.viewPosition.value.copy(playerPosition);
        }
        
        // Update object visibility based on distance from player
        this.obstacles.children.forEach(object => {
            const distance = object.position.distanceTo(playerPosition);
            const wasVisible = object.visible;
            object.visible = distance < 30;
            
            if (object.visible && !wasVisible) {
                gsap.from(object.material, {
                    opacity: 0,
                    duration: 0.5
                });
            }
        });
    }

    resetParticle(positions, index) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 60 + 20;
        
        positions[index] = Math.cos(angle) * radius;
        positions[index + 1] = Math.random() * 10;
        positions[index + 2] = Math.sin(angle) * radius;
    }
}
