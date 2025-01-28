import Board from './Board.js';
import Player from './Player.js';
import Bot from './Bot.js';
import Dice from './Dice.js';

export default class Game {
    constructor(scene) {
        this.scene = scene;
        this.board = new Board(scene);
        this.player = new Player(scene);
        this.bot = new Bot(scene);
        this.dice = new Dice();
        
        this.currentTurn = 'player';
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('roll-dice').addEventListener('click', () => this.handleTurn());
    }

    async handleTurn() {
        if (this.currentTurn === 'player') {
            const roll = await this.dice.roll();
            this.player.move(roll);
            this.checkGoblinEncounter(this.player);
            this.currentTurn = 'bot';
            setTimeout(() => this.botTurn(), 1000);
        }
    }

    async botTurn() {
        const roll = await this.dice.roll();
        this.bot.move(roll);
        this.checkGoblinEncounter(this.bot);
        this.currentTurn = 'player';
    }

    checkGoblinEncounter(character) {
        const cell = this.board.getCellAt(character.position);
        if (cell.hasGoblin) {
            const damage = Math.floor(Math.random() * 3) + 1;
            character.takeDamage(damage);
        }
    }
}
