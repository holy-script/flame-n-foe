import Phaser from 'phaser';
import { StateMachine, State, StateStore } from '../utils/fsm';
import { PlayerInput } from '../utils/inputs';

export class PlayerState extends State {
	controls: PlayerInput;
	chain: boolean;
	triggered: boolean;
	stop: boolean;

	constructor(sprite: Player, name: string, controls: PlayerInput) {
		super(sprite, name);
		/** @type {PlayerInput} */
		this.controls = controls;
		this.chain = false;
		this.triggered = false;
		this.stop = false;
	}
}

interface AnimState {
	name: string;
	length: number;
	repeat?: boolean;
	rate?: number;
	state: typeof PlayerState;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
	health: number;
	scene: Phaser.Scene;
	controls: PlayerInput;
	animData: AnimState[];
	fsm!: StateMachine;

	constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
		super(scene, x, y, name);
		this.scene = scene;
		this.name = name;
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.controls = new PlayerInput(scene, this);

		this.animData = [
			{
				name: 'idle',
				length: 13,
				repeat: true,
				state: class IdleState extends PlayerState {
					enter() {
						this.sprite.play(this.name);
						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);
					}
					execute() {
						if (this.controls.DEAD)
							this.machine.transition('death');

						if (this.controls.MOVING)
							this.machine.transition('run');

						if (this.controls.LEFT_CLICK)
							this.machine.transition('attack1');

						if (this.controls.ROLLING)
							this.machine.transition('roll');

						if (this.controls.CASTING)
							this.machine.transition('cast');

						if (this.controls.HURT) this.machine.transition('hurt');
					}
				},
			},
			{
				name: 'run',
				length: 8,
				repeat: true,
				state: class RunState extends PlayerState {
					enter() {
						this.sprite.play(this.name);
					}
					execute() {
						this.controls.movement();

						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);

						if (!this.controls.MOVING)
							this.machine.transition('idle');

						if (this.controls.LEFT_CLICK)
							this.machine.transition('attack1');

						if (this.controls.ROLLING)
							this.machine.transition('roll');

						if (this.controls.HURT) this.machine.transition('hurt');
					}
					exit() {
						this.sprite.setVelocity(0);
					}
				},
			},
			{
				name: 'attack1',
				length: 7,
				state: class Attack1State extends PlayerState {
					enter() {
						this.sprite.play(this.name);
						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);
						this.sprite.once('animationcomplete', () => {
							this.machine.transition(
								this.chain ? 'attack2' : 'sheathe1'
							);
						});
						this.controls.LEFT_CLICK = false;
					}
					execute() {
						if (this.controls.LEFT_CLICK) {
							this.chain = true;
							this.controls.LEFT_CLICK = false;
						}

						if (this.controls.HURT) this.machine.transition('hurt');
					}
					exit() {
						this.chain = false;
					}
				},
			},
			{
				name: 'sheathe1',
				length: 3,
				state: class Sheathe1State extends PlayerState {
					enter() {
						this.sprite.play(this.name);
						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);
						this.sprite.once('animationcomplete', () => {
							this.machine.transition('idle');
						});
					}
				},
			},
			{
				name: 'attack2',
				length: 6,
				state: class Attack2State extends PlayerState {
					enter() {
						this.sprite.play(this.name);
						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);
						this.sprite.once('animationcomplete', () => {
							this.machine.transition(
								this.chain ? 'attack3' : 'sheathe2'
							);
						});
						this.controls.LEFT_CLICK = false;
					}
					execute() {
						if (this.controls.LEFT_CLICK) {
							this.chain = true;
							this.controls.LEFT_CLICK = false;
						}

						if (this.controls.HURT) this.machine.transition('hurt');
					}
					exit() {
						this.chain = false;
					}
				},
			},
			{
				name: 'sheathe2',
				length: 4,
				state: class Sheathe2State extends PlayerState {
					enter() {
						this.sprite.play(this.name);
						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);
						this.sprite.once('animationcomplete', () => {
							this.machine.transition('idle');
						});
					}
				},
			},
			{
				name: 'attack3',
				length: 10,
				state: class Attack3State extends PlayerState {
					enter() {
						this.sprite.play(this.name);
						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);
						this.sprite.once('animationcomplete', () => {
							this.machine.transition('idle');
						});
					}
				},
			},
			{
				name: 'hurt',
				length: 4,
				state: class HurtState extends PlayerState {
					enter() {
						this.sprite.play(this.name);
						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);
						this.sprite.once('animationcomplete', () => {
							this.machine.transition('idle');
						});
						this.sprite.setVelocityX(0);
						this.sprite.health -= 10;
					}
					exit() {
						this.controls.HURT = false;
					}
				},
			},
			{
				name: 'death',
				length: 7,
				state: class DeathState extends PlayerState {
					enter() {
						this.sprite.play(this.name);
						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);
						this.sprite.once('animationcomplete', () => {
							this.sprite.anims.pause();
							//   this.sprite.destroy()
						});
					}
				},
			},
			{
				name: 'cast',
				length: 6,
				state: class CastState extends PlayerState {
					enter() {
						this.sprite.play(this.name);
						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);
						this.controls.CASTING = false;
						this.sprite.once('animationcomplete', () => {
							this.machine.transition('idle');
						});
					}
					exit() {
						this.controls.CASTING = false;
					}
				},
			},
			{
				name: 'roll',
				length: 5,
				state: class RollState extends PlayerState {
					enter() {
						this.sprite.play(this.name);
						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);
						this.sprite.setVelocityX(
							this.sprite.flipX
								? -this.controls.speed * 1.5
								: this.controls.speed * 1.5
						);
						this.sprite.once('animationcomplete', () => {
							this.machine.transition('idle');
						});
					}
					exit() {
						this.controls.ROLLING = false;
						this.sprite.setVelocityX(0);
					}
				},
			},
			{
				name: 'disapper',
				length: 9,
				state: class DisappearState extends PlayerState {
					enter() {
						this.sprite.play(this.name);
						this.sprite.body.setSize(28, 24);
						this.sprite.body.setOffset(
							this.sprite.flipX ? 0 : 5,
							8
						);
						this.sprite.once('animationcomplete', () => {
							this.machine.transition('idle');
						});
					}
				},
			},
		];

		this.setScale(2.5);
		this.health = 100;

		this.create();
	}

	create() {
		let start = -1,
			end = 0;
		const states: StateStore = {};
		for (const obj of this.animData) {
			end = start + obj.length;
			start++;
			this.anims.create({
				key: obj.name,
				frames: this.anims.generateFrameNumbers(this.name, {
					start,
					end,
				}),
				frameRate: obj?.rate ? obj.rate : 10,
				repeat: obj?.repeat ? -1 : 0,
			});
			start = end;
			if (obj?.state)
				states[obj.name] = new obj.state(this, obj.name, this.controls);
		}
		this.fsm = new StateMachine('idle', states);
	}

	preUpdate(time: number, delta: number) {
		super.preUpdate(time, delta);
		this.controls.getActions();
		this.fsm.step();
	}
}
