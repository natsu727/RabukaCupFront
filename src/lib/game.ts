import { writable, type Writable } from 'svelte/store';
import { bfInterpret } from "./call_wasm.ts";
import { problems } from './problems.ts';

interface GameState {
    output: string;
    currentProblem: typeof problems[0];
    userInput: string;
    score: number;
    timeLeft: number;
    isGameActive: boolean;
    mistakes: number;
    accuracy: number;
    totalTyped: number;
}

export class TypingGameLogic {
    private state: Writable<GameState>;
    private timer: number | null = null;
    private readonly allowedChars = ['+', '-', '[', ']', '.', '>', '<'];

    constructor() {
        this.state = writable({
            output: "",
            currentProblem: problems[0],
            userInput: "",
            score: 0,
            timeLeft: 60,
            isGameActive: false,
            mistakes: 0,
            accuracy: 100,
            totalTyped: 0
        });
    }

    // getStoreメソッドを追加
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

        this.nextProblem();
        this.startTimer();
    }

    private startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }

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

    nextProblem() {
        this.state.update(state => {
            const index = Math.floor(Math.random() * problems.length);
            return {
                ...state,
                currentProblem: problems[index],
                userInput: ""
            };
        });
    }

    async handleKeyPress(event: KeyboardEvent) {
        let currentState: GameState | undefined;
        this.state.subscribe(state => {
            currentState = state;
        })();

        if (!currentState?.isGameActive) return;

        if (event.key === "Enter") {
            await this.checkAnswer();
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

        if (!this.isAllowedChar(event.key)) {
            event.preventDefault();
            return;
        }

        this.state.update(state => ({
            ...state,
            userInput: state.userInput + event.key,
            totalTyped: state.totalTyped + 1
        }));
    }

    private async checkAnswer() {
        let currentState: GameState | undefined;
        this.state.subscribe(state => {
            currentState = state;
        })();

        if (!currentState) return;

        try {
            const userOutput = await bfInterpret(currentState.userInput);
            const expectedOutput = await bfInterpret(currentState.currentProblem.code);

            if (userOutput === expectedOutput) {
                this.state.update(state => ({
                    ...state,
                    score: state.score + 1
                }));
                setTimeout(() => this.nextProblem(), 100);
            } else {
                this.state.update(state => ({
                    ...state,
                    mistakes: state.mistakes + 1,
                    accuracy: Math.round(
                        ((state.totalTyped - state.mistakes) / state.totalTyped) * 100
                    )
                }));
            }
        } catch (error) {
            console.error("Error interpreting Brainfuck code:", error);
        }
    }

    private isAllowedChar(char: string): boolean {
        return this.allowedChars.includes(char);
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
            if (state.userInput[index] === state.currentProblem.code[index]) {
                className = "text-green-500";
            } else {
                className = "text-red-500";
            }
        })();
        return className;
    }
}

export const gameLogic = new TypingGameLogic();
