import { writable, type Writable } from 'svelte/store';
import { bfInterpret } from "./call_wasm.ts";

interface GameState {
    output: string;
    words: string[];
    currentWord: string;
    userInput: string;
    score: number;
    timeLeft: number;
    isGameActive: boolean;
    mistakes: number;
    accuracy: number;
    totalTyped: number;
    bfCode: string;
}

class TypingGameLogic {
    private state: Writable<GameState>;
    private timer: number | null = null;
    private readonly allowedChars = ['+', '-', '[', ']', '.', '>', '<'];

    constructor() {
        this.state = writable({
            output: "",
            words: ["A", "B", "c", "d"],
            currentWord: "",
            userInput: "",
            score: 0,
            timeLeft: 60,
            isGameActive: false,
            mistakes: 0,
            accuracy: 100,
            totalTyped: 0,
            bfCode: `+++++++++[>++++++++>+++++++++++>+++>+<<<<-]>
.>++.+++++++..+++.>+++++.<<+++++++++++++++.>.+++.------.--------.>+.>+.`
        });
    }

    getStore() {
        return this.state;
    }

    startGame() {
        this.state.update(state => ({
            ...state,
            isGameActive: true,
            score: 0,
            timeLeft: 60,
            mistakes: 0,
            totalTyped: 0,
            accuracy: 100,
            userInput: ""
        }));

        this.nextWord();

        this.timer = window.setInterval(() => {
            this.state.update(state => {
                const newTimeLeft = state.timeLeft - 1;
                if (newTimeLeft <= 0) {
                    this.endGame();
                }
                return { ...state, timeLeft: newTimeLeft };
            });
        }, 1000);
    }

    nextWord() {
        this.state.update(state => {
            const index = Math.floor(Math.random() * state.words.length);
            return {
                ...state,
                currentWord: state.words[index],
                userInput: ""
            };
        });
    }

    isAllowedChar(char: string): boolean {
        return this.allowedChars.includes(char);
    }

    async handleKeyPress(event: KeyboardEvent) {
        let currentState: GameState = {
            output: "",
            words: [],
            currentWord: "",
            userInput: "",
            score: 0,
            timeLeft: 0,
            isGameActive: false,
            mistakes: 0,
            accuracy: 0,
            totalTyped: 0,
            bfCode: ""
        };
        this.state.subscribe(state => {
            currentState = state;
        })();

        if (!currentState.isGameActive) return;

        if (event.key === "Enter") {
            this.nextWord();
            return;
        }

        if (
            event.key.length !== 1 ||
            event.ctrlKey ||
            event.altKey ||
            event.metaKey
        ) {
            return;
        }

        // Check if key is allowed for Brainfuck
        if (!this.isAllowedChar(event.key)) {
            event.preventDefault();
            return;
        }

        const newInput = currentState.userInput + event.key;
        this.state.update(state => ({
            ...state,
            userInput: newInput,
            totalTyped: state.totalTyped + 1
        }));

        if (newInput === currentState.currentWord) {
            this.state.update(state => ({
                ...state,
                score: state.score + 1
            }));
            setTimeout(() => this.nextWord(), 100);
        } else if (newInput.length >= currentState.currentWord.length) {
            this.state.update(state => ({
                ...state,
                mistakes: state.mistakes + 1,
                accuracy: Math.round(((state.totalTyped - state.mistakes) / state.totalTyped) * 100)
            }));
        }
    }

    async interpretBf(code: string) {
        try {
            const result = await bfInterpret(code);
            return result;
        } catch (error) {
            console.error("Error interpreting Brainfuck code:", error);
            return null;
        }
    }

    endGame() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.state.update(state => {
            alert(`ゲーム終了!\nスコア: ${state.score}\n正確性: ${state.accuracy}%`);
            return { ...state, isGameActive: false };
        });
    }

    getCharacterClass(index: number): string {
        let className = "text-gray-400";
        this.state.subscribe(state => {
            if (!state.userInput[index]) return;
            if (state.userInput[index] === state.currentWord[index]) {
                className = "text-green-500";
            } else {
                className = "text-red-500";
            }
        })();
        return className;
    }
}

export const gameLogic = new TypingGameLogic();
