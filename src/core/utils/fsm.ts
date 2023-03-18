import { Player } from '../prefabs/player';

export interface StateStore {
	[key: string]: State;
}

export class State {
	sprite: Player;
	name: string;
	machine!: StateMachine;

	constructor(sprite: Player, name: string) {
		this.sprite = sprite;
		this.name = name;
	}

	enter(data?: any) {
		// Used to initialize the state
	}

	execute(data?: any) {
		// Used to update the state
	}

	exit(data?: any) {
		// Used to clean up the state
	}
}

export class StateMachine {
	initialState: string;
	possibleStates: StateStore;
	state!: string | null;

	constructor(initialState: string, possibleStates: StateStore) {
		this.initialState = initialState;
		this.possibleStates = possibleStates;
		this.state = null;

		for (const state of Object.values(this.possibleStates)) {
			state.machine = this;
		}
	}

	step(data?: any) {
		if (this.state === null) {
			this.state = this.initialState;
			this.possibleStates[this.state].enter();
		}

		this.possibleStates[this.state].execute(data);
	}

	transition(newState: string, data?: any) {
		if (this.state !== null) {
			this.possibleStates[this.state].exit();
		}

		this.state = newState;
		this.possibleStates[this.state].enter(data);
	}
}
