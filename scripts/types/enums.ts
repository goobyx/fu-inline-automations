export enum RequestType {
  /** Applies damage to an actor - @DMG[amount type] */
  DMG = 'DMG',
  
  /** Applies a resource gain to an actor - @GAIN[amount resource] */
  GAIN = 'GAIN',
  
  /** Applies a resource loss to an actor - @LOSS[amount resource] */
  LOSS = 'LOSS',
  
  /** Rolls an attribute check on an actor - @CHECK[first second (modifier) dl] */
  CHECK = 'CHECK',
  
  /** Applies an effect that adds a damage type override or modifies an affinity - @TYPE[...] */
  TYPE = 'TYPE',
  
  /** Applies an effect to an actor - @EFFECT[uuid|status|base64] */
  EFFECT = 'EFFECT',
  
  /** Applies an effect to an equipped weapon that changes its damage type - @WEAPON[type] */
  WEAPON = 'WEAPON',
  
  /** Manipulates an existing resource point - @PROGRESS[uuid progType amount] */
  PROGRESS = 'PROGRESS',
  
  /** Manipulates an existing clock - @CLOCK[uuid progType amount] */
  CLOCK = 'CLOCK'
}