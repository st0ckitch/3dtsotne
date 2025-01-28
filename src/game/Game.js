import * as THREE from 'three';
import { BOARD_CONFIG, GAME_STATES } from '../utils/constants.js';
import Board from './Board.js';
import Player from './Player.js';
import Bot from './Bot.js';
import Dice from './Dice.js';
import Environment from '../components/Environment.js';

export default class Game {
    constructor(scene) {
        this.scene = scene;
        this.gameState = GAME_STATES.IDLE;
        this.init();
    }

    init() {
        // Create environment first (floor, lighting, etc.)
        this.environment = new Environment(this.scene);
        
        // Initialize board
        this.board = new Board(this.scene);
        
        // Add cells to scene
        this.board.createBoard();
        
        // Initialize player and bot after board
        this.player = new Player(this.scene);
        this.bot = new Bot(this.scene);
        
        // Initialize dice
        this.dice = new Dice(this.scene);
        
        // Setup initial positions
        this.player.mesh.position.copy(this.board.cells[0].mesh.position);
        this.player.mesh.position.y = 1;
        
        this.bot.mesh.position.copy(this.board.cells[0].mesh.position);
        this.bot.mesh.position.y = 1;
        
        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const rollButton = document.getElementById('roll-dice');
        if (rollButton) {
            rollButton.addEventListener('click', () => this.handleTurn());
        }
    }

    async handleTurn() {
        if (this.gameState !== GAME_STATES.IDLE) return;
        
        this.gameState = GAME_STATES.ROLLING;
        const roll = await this.dice.roll();
        
        if (this.currentTurn === 'player') {
            await this.handlePlayerTurn(roll);
        } else {
            await this.handleBotTurn(roll);
        }
    }

    async handlePlayerTurn(roll) {
        // Calculate new position
        const newPosition = Math.min(
            this.player.position + roll,
            BOARD_CONFIG.TOTAL_CELLS - 1
        );
        
        // Move player
        await this.player.move(
            this.board.cells[newPosition].mesh.position.clone()
        );
        
        // Check for goblin
        if (this.board.cells[newPosition].hasGoblin) {
            const damage = Math.floor(Math.random() * 3) + 1;
            this.player.takeDamage(damage);
        }
        
        this.currentTurn = 'bot';
        this.gameState = GAME_STATES.IDLE;
        
        // Auto-trigger bot turn after delay
        setTimeout(() => this.handleTurn(), 1000);
    }

    async handleBotTurn(roll) {
        // Calculate new position
        const newPosition = Math.min(
            this.bot.position + roll,
            BOARD_CONFIG.TOTAL_CELLS - 1
        );
        
        // Move bot
        await this.bot.move(
            this.board.cells[newPosition].mesh.position.clone()
        );
        
        // Check for goblin
        if (this.board.cells[newPosition].hasGoblin) {
            const damage = Math.floor(Math.random() * 3) + 1;
            this.bot.takeDamage(damage);
        }
        
        this.currentTurn = 'player';
        this.gameState = GAME_STATES.IDLE;
    }

    // Add this method to check the current state of the game
    debug() {
        console.log({
            playerPosition: this.player.position,
            botPosition: this.bot.position,
            playerHP: this.player.hp,
            botHP: this.bot.hp,
            currentTurn: this.currentTurn,
            gameState: this.gameState
        });
    }
}
