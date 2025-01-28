import Board from './Board.js';
import Player from './Player.js';
import Bot from './Bot.js';
import Environment from '../components/Environment.js';

export default class Game {
    constructor(scene) {
        this.scene = scene;
        this.environment = new Environment(scene);
        this.board = new Board(scene);
        this.player = new Player(scene);
        this.bot = new Bot(scene);
        
        this.init();
    }

    init() {
        // Position player and bot at start
        const startCell = this.board.getCellAt(0);
        if (startCell) {
            const startPos = startCell.mesh.position.clone();
            this.player.setPosition(startPos.add(new THREE.Vector3(0, 1, 0)));
            this.bot.setPosition(startPos.add(new THREE.Vector3(0, 1, 0)));
        }
    }

    update() {
        // Update any animations or game logic here
        if (this.environment) {
            this.environment.update();
        }
    }
}
