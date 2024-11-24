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
}

class TypingGameLogic {
    private state: Writable<GameState>;
    private timer: number | null = null;

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
            totalTyped: 0
        });
    }

    getStore() {
        return this.state;
    }

    async updateOutput(userInput: string) {
        try {
            const out = await bfInterpret(userInput);
            this.state.update(state => ({
                ...state,
                output: out ?? "",
                userInput
            }));
            console.log(`input : ${userInput}`);
            console.log(`output: ${out}`);
        } catch (error) {
            console.error("Error interpreting input:", error);
        }
    }

    startGame() {
        this.state.update(state => ({
            ...state,
            isGameActive: true,
            score: 0,
            timeLeft: 90,
            mistakes: 0,
            totalTyped: 0,
            accuracy: 100,
            userInput: "",
            output: ""
        }));

        this.nextWord();

        this.timer = window.setInterval(() => {
            this.state.update(state => {
                const newTimeLeft = state.timeLeft - 1;
                if (newTimeLeft <= 0) {
                    this.endGame();
                }
                if (newTimeLeft % 15 === 0) {
                    this.nextWord();
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
            totalTyped: 0
        };
        this.state.subscribe(state => {
            currentState = state;
        })();

        if (!currentState.isGameActive) return;

        if (event.key === "Backspace") {
            event.preventDefault();
            if (currentState.userInput.length > 0) {
                const newInput = currentState.userInput.slice(0, -1);
                await this.updateOutput(newInput);
            }
            return;
        }

        if (event.key === "Enter") {
            const newInput = currentState.userInput + "\n";
            await this.updateOutput(newInput);
            return;
        }

        if (event.key === "Escape") {
            this.endGame();
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

        const newInput = currentState.userInput + event.key;
        this.state.update(state => ({
            ...state,
            totalTyped: state.totalTyped + 1
        }));

        await this.updateOutput(newInput);

        this.state.subscribe(state => {
            if (state.output === state.currentWord) {
                this.state.update(s => ({
                    ...s,
                    score: s.score + 1,
                    timeLeft: s.timeLeft + 10,
                    output: ""
                }));
                setTimeout(() => this.nextWord(), 100);
            } else if (state.userInput.length >= state.currentWord.length) {
                this.state.update(s => ({
                    ...s,
                    mistakes: s.mistakes + 1,
                    accuracy: Math.round(((s.totalTyped - s.mistakes) / s.totalTyped) * 100)
                }));
            }
        })();
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
