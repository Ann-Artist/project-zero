/**
 * PROJECT ZERO — Configuration
 * Change the recipient's name, celebration copy, and game parameters.
 */

export const CONFIG = {
  // Friend's name shown on the final birthday certificate
  friendName: "ATHARV YADAV",

  // Birthday message and certificate titles
  birthdayMessage: "Happy Birthday!",
  certificateTitle: "CERTIFICATE OF ENGINEERING EXCELLENCE",
  certificateSubtitle: "PROJECT ZERO // SPECIAL RECOGNITION",

  // Scoring
  pointsPerChallenge: 1000,
  speedBonusMax: 500,

  // Default audio setting
  audioEnabledByDefault: true,

  // Room metadata
  rooms: [
    { id: 0, key: 'entrance', name: 'FACILITY ENTRANCE', doorNum: '01', subtitle: 'ACCESS CONTROL' },
    { id: 1, key: 'chess',    name: 'CHESS PROTOCOL',    doorNum: '02', subtitle: 'TACTICAL REASONING' },
    { id: 2, key: 'racing',   name: 'KART-X TRIAL',      doorNum: '03', subtitle: 'DYNAMICS & TRACTION' },
    { id: 3, key: 'drone',    name: 'FLIGHT TEST',       doorNum: '04', subtitle: 'AERODYNAMICS & CONTROL' },
    { id: 4, key: 'engine',   name: 'ENGINE ROOM',       doorNum: '05', subtitle: 'THERMODYNAMICS & PROPULSION' },
    { id: 5, key: 'cad',      name: 'CAD WORKSHOP',      doorNum: '06', subtitle: 'PRECISION MECHANICAL ASSEMBLY' },
    { id: 6, key: 'reward',   name: 'REWARD VAULT',      doorNum: 'VAULT', subtitle: 'ENGINEER UNLOCKED' }
  ]
};
