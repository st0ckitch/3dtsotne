// main.js
import { DungeonGame } from './game/DungeonGame';

// Make sure DOM is fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    // Check if container exists
    const container = document.getElementById('game-container');
    if (!container) {
        console.error('Game container not found! Creating one...');
        const gameContainer = document.createElement('div');
        gameContainer.id = 'game-container';
        document.body.appendChild(gameContainer);
    }

    // Check if UI container exists
    const uiContainer = document.getElementById('ui-container');
    if (!uiContainer) {
        console.error('UI container not found! Creating one...');
        const uiDiv = document.createElement('div');
        uiDiv.id = 'ui-container';
        uiDiv.innerHTML = `
            <div class="stats">HP: 15</div>
            <div class="stats">BOT HP: 15</div>
            <button id="roll-dice">Roll Dice</button>
        `;
        document.body.appendChild(uiDiv);
    }

    try {
        // Initialize game
        window.game = new DungeonGame();
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
