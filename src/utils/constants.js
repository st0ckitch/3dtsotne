export const BOARD_CONFIG = {
    CELL_SIZE: 2,
    TOTAL_CELLS: 50,
    GOBLIN_COUNT: 7,
    STARTING_HP: 15,
    PATH_SPACING: 2
};

export const GAME_STATES = {
    IDLE: 'idle',
    ROLLING: 'rolling',
    MOVING: 'moving',
    COMBAT: 'combat',
    GAME_OVER: 'gameOver'
};

export const PLAYER_CONFIG = {
    MOVE_DURATION: 1,
    ATTACK_DURATION: 0.5,
    BASE_HEIGHT: 1
};

export const BOT_CONFIG = {
    MOVE_DURATION: 1,
    THINK_TIME: 1000,
    MAX_PATH_SEARCH: 10
};

export const GOBLIN_CONFIG = {
    MIN_DAMAGE: 1,
    MAX_DAMAGE: 3,
    ATTACK_RANGE: 1,
    ATTACK_DURATION: 0.5
};

export const COLORS = {
    PLAYER: 0x4444ff,
    BOT: 0xff4444,
    GOBLIN: 0xff0000,
    CELL_NORMAL: 0x666666,
    CELL_EXIT: 0x00ff00,
    HIGHLIGHT: 0x666666,
    FOG: 0x000000
};

export const LIGHT_CONFIG = {
    AMBIENT: {
        COLOR: 0x404040,
        INTENSITY: 0.5
    },
    TORCH: {
        COLOR: 0xff6600,
        INTENSITY: 1,
        DISTANCE: 50,
        FLICKER_SPEED: {
            MIN: 50,
            MAX: 150
        }
    }
};

export const CAMERA_CONFIG = {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
    INITIAL_POSITION: {
        x: 0,
        y: 30,
        z: 30
    }
};

export const UI_CONFIG = {
    FONT_FAMILY: 'Cinzel, serif',
    TEXT_COLOR: '#bb9b65',
    BUTTON_BG: '#4a3821',
    BUTTON_BORDER: '#bb9b65'
};

export default {
    BOARD_CONFIG,
    GAME_STATES,
    PLAYER_CONFIG,
    BOT_CONFIG,
    GOBLIN_CONFIG,
    COLORS,
    LIGHT_CONFIG,
    CAMERA_CONFIG,
    UI_CONFIG
};
