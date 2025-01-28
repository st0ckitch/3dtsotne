import * as THREE from 'three';
import { gsap } from 'gsap';

export default class Environment {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = new THREE.Group();
        this.torches = new THREE.Group();
        this.scene.add(this.obstacles);
        this.scene.add(this.torches);
        
        // Store visible objects for fog of war
        this.visibleObjects = new Set();
        
        // Initialize environment in order
        this.createBasicEnvironment();
        this.setupLighting();
        this.createAtmosphere();
        this.addDecorations(); // Changed from addEnvironmentDecorations
    }

    createBasicEnvironment() {
        // Create main dungeon floor with better visibility
        const floorGeometry = new THREE.PlaneGeometry(200, 200);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a1f1f, // Slightly lighter color
            roughness: 0.8,
            metalness: 0.2,
            bumpMap: this.createStoneTexture(),
            bumpScale: 0.3
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

        // Create base texture with lighter color
        ctx.fillStyle = '#2a1f1f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add stone texture pattern with better contrast
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 4 + 2;
            const alpha = Math.random() * 0.4 + 0.2; // Increased visibility

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }

        // Add visible cracks
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
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = Math.random() * 2 + 1;
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        return texture;
    }

    addFloorDetails() {
        // Add random debris with better visibility
        const debrisCount = 200;
        const debrisGeometry = new THREE.CircleGeometry(0.2, 4);
        const debrisMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2820,
            roughness: 0.9,
            metalness: 0.1,
            emissive: 0x1a1210,
            emissiveIntensity: 0.2
        });

        for (let i = 0; i < debrisCount; i++) {
            const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 80 + 10;
            
            debris.position.set(
                Math.cos(angle) * radius,
                0.01,
                Math.sin(angle) * radius
            );
            
            debris.rotation.x = -Math.PI / 2;
            debris.rotation.z = Math.random() * Math.PI;
            debris.scale.setScalar(Math.random() * 0.5 + 0.5);
            debris.receiveShadow = true;
            
            this.obstacles.add(debris);
        }

        // Add floor stains
        this.createFloorStains();
    }

    createFloorStains() {
        const stainCount = 50;
        const stainGeometry = new THREE.PlaneGeometry(1, 1);
        const stainTexture = this.createStainTexture();
        const stainMaterial = new THREE.MeshStandardMaterial({
            map: stainTexture,
            transparent: true,
            opacity: 0.5,
            blending: THREE.MultiplyBlending,
            emissive: 0x1a1210,
            emissiveIntensity: 0.1
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

        const gradient = ctx.createRadialGradient(
            64, 64, 0,
            64, 64, 64
        );
        
        gradient.addColorStop(0, 'rgba(58, 40, 32, 0.6)');
        gradient.addColorStop(1, 'rgba(58, 40, 32, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);

        // Add noise
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const alpha = Math.random() * 0.2;
            
            ctx.fillStyle = `rgba(58, 40, 32, ${alpha})`;
            ctx.fillRect(x, y, 1, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

setupLighting() {
        // Main ambient light - significantly increased intensity
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);

        // Primary directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(50, 100, 50);
        mainLight.castShadow = true;
        
        // Improve shadow quality
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 200;
        mainLight.shadow.camera.left = -50;
        mainLight.shadow.camera.right = 50;
        mainLight.shadow.camera.top = 50;
        mainLight.shadow.camera.bottom = -50;
        mainLight.shadow.bias = -0.0001;
        
        this.scene.add(mainLight);

        // Hemisphere light for better ambient lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
        this.scene.add(hemiLight);

        // Additional fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-50, 50, -50);
        this.scene.add(fillLight);

        // Setup atmospheric effects
        this.setupFog();
    }

    setupFog() {
        // Create very light fog
        this.scene.fog = new THREE.FogExp2(0x444444, 0.005);
        this.createFogParticles();
    }

    createFogParticles() {
        const particleCount = 500; // Reduced count for better performance
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 60 + 20;
            const height = Math.random() * 10;

            positions[i] = Math.cos(angle) * radius;
            positions[i + 1] = height;
            positions[i + 2] = Math.sin(angle) * radius;

            velocities[i] = (Math.random() - 0.5) * 0.01;
            velocities[i + 1] = (Math.random() - 0.5) * 0.01;
            velocities[i + 2] = (Math.random() - 0.5) * 0.01;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.2,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.fogParticles = new THREE.Points(geometry, material);
        this.scene.add(this.fogParticles);
        this.fogParticles.userData.velocities = velocities;
    }

    createAtmosphere() {
        this.createDustParticles();
        this.createEmbers();
        this.createBackgroundGlow();
    }

    createDustParticles() {
        const particleCount = 300;
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
                    gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha * 0.2);
                }
            `,
            transparent: true,
            depthWrite: false
        });

        this.dustParticles = new THREE.Points(geometry, material);
        this.scene.add(this.dustParticles);
    }

createEmbers() {
        const emberCount = 50; // Reduced for performance
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
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.embers = new THREE.Points(geometry, material);
        this.embers.userData = { velocities, lifetimes };
        this.scene.add(this.embers);
    }

    createBackgroundGlow() {
        const glowGeometry = new THREE.PlaneGeometry(200, 200);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0x443333) },
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
                    float alpha = smoothstep(20.0, 60.0, dist) * 0.2;
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

    // Renamed from addEnvironmentDecorations
    addDecorations() {
        this.addPillars();
        this.addRocks();
        this.addTorches();
    }

    addTorches() {
        const torchCount = 12; // Reduced count, increased intensity
        for (let i = 0; i < torchCount; i++) {
            const angle = (i / torchCount) * Math.PI * 2;
            const radius = 25;
            
            const torch = this.createTorch();
            torch.position.set(
                Math.cos(angle) * radius,
                3,
                Math.sin(angle) * radius
            );
            
            torch.lookAt(new THREE.Vector3(0, 3, 0));
            this.torches.add(torch);
        }
    }

    createTorch() {
        const torch = new THREE.Group();
        
        // Bracket
        const bracketGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
        const bracketMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3525,
            roughness: 0.9,
            metalness: 0.1,
            emissive: 0x4a3525,
            emissiveIntensity: 0.2
        });
        const bracket = new THREE.Mesh(bracketGeometry, bracketMaterial);
        bracket.rotation.x = Math.PI / 4;
        torch.add(bracket);

        // Bowl with stronger emissive
        const bowlGeometry = new THREE.CylinderGeometry(0.2, 0.1, 0.3, 8);
        const bowlMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3525,
            emissive: 0xff6600,
            emissiveIntensity: 0.5
        });
        const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
        bowl.position.y = 0.5;
        torch.add(bowl);

        // Flame
        this.addTorchFlame(torch);

        // Brighter light
        const light = new THREE.PointLight(0xff6600, 3, 20);
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
        this.updateTorches();
        this.updateParticles();
        this.updateVisibility(playerPosition);
    }

    updateTorches() {
        this.torches.children.forEach(torch => {
            const flame = torch.children.find(child => child.material?.isShaderMaterial);
            if (flame) {
                flame.material.uniforms.time.value += 0.1;
            }

            const light = torch.children.find(child => child instanceof THREE.PointLight);
            if (light) {
                light.intensity = 3 + Math.sin(Date.now() * 0.005) * 0.5;
            }
        });
    }

    updateParticles() {
        if (this.dustParticles) {
            this.dustParticles.material.uniforms.time.value += 0.01;
        }

        if (this.fogParticles) {
            const positions = this.fogParticles.geometry.attributes.position.array;
            const velocities = this.fogParticles.userData.velocities;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];

                if (Math.abs(positions[i]) > 100 || 
                    positions[i + 1] > 15 || 
                    Math.abs(positions[i + 2]) > 100) {
                    this.resetParticle(positions, i);
                }
            }

            this.fogParticles.geometry.attributes.position.needsUpdate = true;
        }

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
        if (this.backgroundGlow) {
            this.backgroundGlow.material.uniforms.viewPosition.value.copy(playerPosition);
        }
        
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
