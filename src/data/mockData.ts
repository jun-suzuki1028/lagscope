import { Fighter, Move } from '../types/frameData';

export const mockFighters: Fighter[] = [
  {
    id: 'mario',
    name: 'mario',
    displayName: 'マリオ',
    series: 'Super Mario',
    weight: 98,
    fallSpeed: 1.8,
    fastFallSpeed: 2.88,
    gravity: 0.087,
    walkSpeed: 1.1,
    runSpeed: 1.76,
    airSpeed: 1.208,
    iconUrl: '/icons/mario.png',
    moves: [
      {
        id: 'mario-jab1',
        name: 'jab1',
        displayName: 'ジャブ1',
        category: 'jab',
        type: 'normal',
        input: 'A',
        startup: 2,
        active: 2,
        recovery: 5,
        totalFrames: 9,
        onShield: -2,
        onHit: 2,
        onWhiff: -2,
        damage: 2.2,
        baseKnockback: 15,
        knockbackGrowth: 25,
        range: 'close',
        hitboxData: {
          hitboxes: [{
            id: 1,
            damage: 2.2,
            angle: 361,
            baseKnockback: 15,
            knockbackGrowth: 25,
            hitboxType: 'normal',
            effect: 'normal',
            size: 1.5,
            position: { x: 0, y: 8.5, z: 4.5 }
          }],
          multihit: false
        },
        properties: {
          isKillMove: false,
          hasArmor: false,
          isCommandGrab: false,
          isSpike: false,
          isMeteor: false,
          hasInvincibility: false,
          hasIntangibility: false,
          canClank: true,
          priority: 1,
          transcendentPriority: false
        }
      },
      {
        id: 'mario-dash-attack',
        name: 'dash-attack',
        displayName: 'ダッシュアタック',
        category: 'dash',
        type: 'normal',
        input: 'A (ダッシュ中)',
        startup: 8,
        active: 3,
        recovery: 24,
        totalFrames: 35,
        onShield: -5,
        onHit: 5,
        onWhiff: -24,
        damage: 8.0,
        baseKnockback: 70,
        knockbackGrowth: 80,
        range: 'mid',
        hitboxData: {
          hitboxes: [{
            id: 1,
            damage: 8.0,
            angle: 70,
            baseKnockback: 70,
            knockbackGrowth: 80,
            hitboxType: 'normal',
            effect: 'normal',
            size: 3.0,
            position: { x: 0, y: 7, z: 6 }
          }],
          multihit: false
        },
        properties: {
          isKillMove: false,
          hasArmor: false,
          isCommandGrab: false,
          isSpike: false,
          isMeteor: false,
          hasInvincibility: false,
          hasIntangibility: false,
          canClank: true,
          priority: 1,
          transcendentPriority: false
        }
      }
    ],
    shieldData: {
      shieldHealth: 50,
      shieldRegen: 0.07,
      shieldRegenDelay: 30,
      shieldStun: 0.8665,
      shieldReleaseFrames: 11,
      shieldDropFrames: 4,
      shieldGrabFrames: 6,
      outOfShieldOptions: [
        {
          move: 'nair',
          frames: 3,
          type: 'nair',
          effectiveness: 8
        },
        {
          move: 'up_b',
          frames: 3,
          type: 'up_b',
          effectiveness: 9
        }
      ]
    },
    movementData: {
      jumpSquat: 3,
      fullHopHeight: 34.65,
      shortHopHeight: 16.74,
      airJumps: 1,
      dodgeFrames: {
        spotDodge: {
          startup: 3,
          active: 20,
          recovery: 4,
          total: 27
        },
        airDodge: {
          startup: 3,
          active: 29,
          recovery: 28,
          total: 60
        }
      },
      rollFrames: {
        forward: {
          startup: 4,
          active: 12,
          recovery: 15,
          total: 31
        },
        backward: {
          startup: 4,
          active: 12,
          recovery: 15,
          total: 31
        }
      }
    }
  },
  {
    id: 'link',
    name: 'link',
    displayName: 'リンク',
    series: 'The Legend of Zelda',
    weight: 104,
    fallSpeed: 1.6,
    fastFallSpeed: 2.56,
    gravity: 0.096,
    walkSpeed: 1.247,
    runSpeed: 1.534,
    airSpeed: 1.155,
    iconUrl: '/icons/link.png',
    moves: [
      {
        id: 'link-jab1',
        name: 'jab1',
        displayName: 'ジャブ1',
        category: 'jab',
        type: 'normal',
        input: 'A',
        startup: 7,
        active: 2,
        recovery: 3,
        totalFrames: 12,
        onShield: 2,
        onHit: 8,
        onWhiff: -3,
        damage: 2.5,
        baseKnockback: 15,
        knockbackGrowth: 25,
        range: 'close',
        hitboxData: {
          hitboxes: [{
            id: 1,
            damage: 2.5,
            angle: 361,
            baseKnockback: 15,
            knockbackGrowth: 25,
            hitboxType: 'normal',
            effect: 'normal',
            size: 1.8,
            position: { x: 0, y: 8, z: 5.5 }
          }],
          multihit: false
        },
        properties: {
          isKillMove: false,
          hasArmor: false,
          isCommandGrab: false,
          isSpike: false,
          isMeteor: false,
          hasInvincibility: false,
          hasIntangibility: false,
          canClank: true,
          priority: 1,
          transcendentPriority: false
        }
      }
    ],
    shieldData: {
      shieldHealth: 50,
      shieldRegen: 0.07,
      shieldRegenDelay: 30,
      shieldStun: 0.8665,
      shieldReleaseFrames: 11,
      shieldDropFrames: 4,
      shieldGrabFrames: 6,
      outOfShieldOptions: [
        {
          move: 'nair',
          frames: 7,
          type: 'nair',
          effectiveness: 7
        },
        {
          move: 'up_b',
          frames: 7,
          type: 'up_b',
          effectiveness: 8
        }
      ]
    },
    movementData: {
      jumpSquat: 3,
      fullHopHeight: 31.17,
      shortHopHeight: 15.05,
      airJumps: 1,
      dodgeFrames: {
        spotDodge: {
          startup: 3,
          active: 20,
          recovery: 4,
          total: 27
        },
        airDodge: {
          startup: 3,
          active: 29,
          recovery: 28,
          total: 60
        }
      },
      rollFrames: {
        forward: {
          startup: 4,
          active: 12,
          recovery: 15,
          total: 31
        },
        backward: {
          startup: 4,
          active: 12,
          recovery: 15,
          total: 31
        }
      }
    }
  },
  {
    id: 'pikachu',
    name: 'pikachu',
    displayName: 'ピカチュウ',
    series: 'Pokémon',
    weight: 79,
    fallSpeed: 1.55,
    fastFallSpeed: 2.48,
    gravity: 0.095,
    walkSpeed: 1.302,
    runSpeed: 2.039,
    airSpeed: 1.0,
    iconUrl: '/icons/pikachu.png',
    moves: [
      {
        id: 'pikachu-jab1',
        name: 'jab1',
        displayName: 'ジャブ1',
        category: 'jab',
        type: 'normal',
        input: 'A',
        startup: 2,
        active: 1,
        recovery: 4,
        totalFrames: 7,
        onShield: 1,
        onHit: 7,
        onWhiff: -4,
        damage: 1.4,
        baseKnockback: 8,
        knockbackGrowth: 25,
        range: 'close',
        hitboxData: {
          hitboxes: [{
            id: 1,
            damage: 1.4,
            angle: 361,
            baseKnockback: 8,
            knockbackGrowth: 25,
            hitboxType: 'normal',
            effect: 'electric',
            size: 1.2,
            position: { x: 0, y: 6.5, z: 4 }
          }],
          multihit: false
        },
        properties: {
          isKillMove: false,
          hasArmor: false,
          isCommandGrab: false,
          isSpike: false,
          isMeteor: false,
          hasInvincibility: false,
          hasIntangibility: false,
          canClank: true,
          priority: 1,
          transcendentPriority: false
        }
      }
    ],
    shieldData: {
      shieldHealth: 50,
      shieldRegen: 0.07,
      shieldRegenDelay: 30,
      shieldStun: 0.8665,
      shieldReleaseFrames: 11,
      shieldDropFrames: 4,
      shieldGrabFrames: 6,
      outOfShieldOptions: [
        {
          move: 'nair',
          frames: 3,
          type: 'nair',
          effectiveness: 9
        },
        {
          move: 'up_b',
          frames: 2,
          type: 'up_b',
          effectiveness: 10
        }
      ]
    },
    movementData: {
      jumpSquat: 3,
      fullHopHeight: 36.59,
      shortHopHeight: 17.67,
      airJumps: 1,
      dodgeFrames: {
        spotDodge: {
          startup: 3,
          active: 20,
          recovery: 4,
          total: 27
        },
        airDodge: {
          startup: 3,
          active: 29,
          recovery: 28,
          total: 60
        }
      },
      rollFrames: {
        forward: {
          startup: 4,
          active: 12,
          recovery: 15,
          total: 31
        },
        backward: {
          startup: 4,
          active: 12,
          recovery: 15,
          total: 31
        }
      }
    }
  }
];