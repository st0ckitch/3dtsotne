import * as THREE from 'three';

export function calculateHexPosition(index, radius = 2) {
    const angle = (index % 6) * (Math.PI / 3);
    const ring = Math.floor(index / 6);
    
    return {
        x: radius * ring * Math.cos(angle),
        z: radius * ring * Math.sin(angle)
    };
}

export function distance(point1, point2) {
    return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) + 
        Math.pow(point2.z - point1.z, 2)
    );
}

export function getRandomPosition(min, max) {
    return {
        x: Math.random() * (max - min) + min,
        z: Math.random() * (max - min) + min
    };
}

export function isValidPosition(position, obstacles, minDistance = 2) {
    return !obstacles.some(obstacle => 
        distance(position, obstacle.position) < minDistance
    );
}

export function createPathFindingGraph(cells) {
    const graph = new Map();
    
    cells.forEach((cell, index) => {
        const connections = new Map();
        
        // Connect to adjacent cells
        const adjacentIndices = getAdjacentCellIndices(index, cells.length);
        adjacentIndices.forEach(adjIndex => {
            const cost = cells[adjIndex].hasGoblin ? 2 : 1;
            connections.set(adjIndex, cost);
        });
        
        graph.set(index, connections);
    });
    
    return graph;
}

export function getAdjacentCellIndices(index, totalCells) {
    const adjacent = [];
    
    // Forward and backward
    if (index > 0) adjacent.push(index - 1);
    if (index < totalCells - 1) adjacent.push(index + 1);
    
    return adjacent;
}

export function findPath(start, end, graph) {
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();
    
    // Initialize
    graph.forEach((_, index) => {
        distances.set(index, Infinity);
        unvisited.add(index);
    });
    distances.set(start, 0);
    
    while (unvisited.size > 0) {
        // Get closest unvisited node
        let current = null;
        let shortestDistance = Infinity;
        
        unvisited.forEach(index => {
            if (distances.get(index) < shortestDistance) {
                shortestDistance = distances.get(index);
                current = index;
            }
        });
        
        if (current === null || current === end) break;
        
        unvisited.delete(current);
        
        // Update distances to neighbors
        const connections = graph.get(current);
        connections.forEach((cost, neighbor) => {
            if (!unvisited.has(neighbor)) return;
            
            const distance = distances.get(current) + cost;
            if (distance < distances.get(neighbor)) {
                distances.set(neighbor, distance);
                previous.set(neighbor, current);
            }
        });
    }
    
    // Build path
    const path = [];
    let current = end;
    
    while (current !== undefined) {
        path.unshift(current);
        current = previous.get(current);
    }
    
    return path;
}

export function generateRandomName() {
    const prefixes = ['Grunk', 'Snark', 'Thrak', 'Gork', 'Mork'];
    const suffixes = ['the Cruel', 'Bonecrusher', 'Shadowstalker', 'Doombringer'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${
        suffixes[Math.floor(Math.random() * suffixes.length)]
    }`;
}

export function createTextSprite(text, parameters = {}) {
    const {
        fontface = 'Arial',
        fontsize = 24,
        borderThickness = 4,
        borderColor = { r:0, g:0, b:0, a:1.0 },
        backgroundColor = { r:255, g:255, b:255, a:1.0 },
        textColor = { r:0, g:0, b:0, a:1.0 }
    } = parameters;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontsize}px ${fontface}`;
    
    // Get size data
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    
    // Background
    context.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`;
    context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`;
    context.lineWidth = borderThickness;
    
    // Text
    context.fillStyle = `rgba(${textColor.r},${textColor.g},${textColor.b},${textColor.a})`;
    context.fillText(text, borderThickness, fontsize + borderThickness);

    // Create texture
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    return sprite;
}

export function createParticleSystem(options = {}) {
    const {
        count = 100,
        color = 0xff0000,
        size = 0.1,
        spread = 1
    } = options;

    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
        // Position
        positions[i] = (Math.random() - 0.5) * spread;
        positions[i + 1] = (Math.random() - 0.5) * spread;
        positions[i + 2] = (Math.random() - 0.5) * spread;

        // Velocity
        velocities[i] = (Math.random() - 0.5) * 0.1;
        velocities[i + 1] = Math.random() * 0.2;
        velocities[i + 2] = (Math.random() - 0.5) * 0.1;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const system = new THREE.Points(particles, material);

    system.update = function(delta) {
        const positions = this.geometry.attributes.position.array;
        const velocities = this.geometry.attributes.velocity.array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];

            // Reset particles that fall below a certain height
            if (positions[i + 1] < 0) {
                positions[i + 1] = spread;
                velocities[i + 1] = Math.random() * 0.2;
            }
        }

        this.geometry.attributes.position.needsUpdate = true;
    };

    return system;
}

export function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

export function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function generateDungeonPath(numCells) {
    const path = [];
    let currentPos = { x: 0, z: 0 };
    path.push({ ...currentPos });

    // Direction vectors for possible moves
    const directions = [
        { x: 1, z: 0 },   // right
        { x: 0.5, z: 0.866 },  // up-right (60 degrees)
        { x: -0.5, z: 0.866 }, // up-left
        { x: -1, z: 0 },  // left
        { x: -0.5, z: -0.866 }, // down-left
        { x: 0.5, z: -0.866 }  // down-right
    ];

    for (let i = 1; i < numCells; i++) {
        // Choose random direction but favor moving towards the goal
        const dirIndex = Math.floor(Math.random() * directions.length);
        const dir = directions[dirIndex];

        currentPos = {
            x: currentPos.x + dir.x * 2, // Scale by 2 for spacing
            z: currentPos.z + dir.z * 2
        };

        path.push({ ...currentPos });
    }

    return path;
}

export function createDebugVisuals(scene) {
    // Grid helper
    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    return {
        gridHelper,
        axesHelper,
        toggle: function(visible) {
            gridHelper.visible = visible;
            axesHelper.visible = visible;
        }
    };
}

// Shader related helpers
export const shaderLib = {
    fogFragment: `
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        
        varying float vFogDepth;
        
        void main() {
            float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
            gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);
        }
    `,
    
    fogVertex: `
        varying float vFogDepth;
        
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vFogDepth = -mvPosition.z;
        }
    `
};

// Audio related helpers
export const soundEffects = {
    createAudioListener() {
        return new THREE.AudioListener();
    },

    loadSound(listener, path) {
        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        
        return new Promise((resolve, reject) => {
            audioLoader.load(path, buffer => {
                sound.setBuffer(buffer);
                resolve(sound);
            }, undefined, reject);
        });
    },

    playSoundEffect(sound, volume = 1) {
        if (sound.isPlaying) sound.stop();
        sound.setVolume(volume);
        sound.play();
    }
};

// State management helper
export class GameState {
    constructor() {
        this.states = new Map();
        this.callbacks = new Map();
    }

    set(key, value) {
        const oldValue = this.states.get(key);
        this.states.set(key, value);
        
        if (this.callbacks.has(key)) {
            this.callbacks.get(key).forEach(callback => 
                callback(value, oldValue)
            );
        }
    }

    get(key) {
        return this.states.get(key);
    }

    onChange(key, callback) {
        if (!this.callbacks.has(key)) {
            this.callbacks.set(key, new Set());
        }
        this.callbacks.get(key).add(callback);
    }

    removeCallback(key, callback) {
        if (this.callbacks.has(key)) {
            this.callbacks.get(key).delete(callback);
        }
    }
}

export default {
    calculateHexPosition,
    distance,
    getRandomPosition,
    isValidPosition,
    createPathFindingGraph,
    findPath,
    generateRandomName,
    createTextSprite,
    createParticleSystem,
    lerp,
    easeInOutQuad,
    generateDungeonPath,
    createDebugVisuals,
    shaderLib,
    soundEffects,
    GameState
};
