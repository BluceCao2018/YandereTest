// 维度分析文案池 - Dimension Analysis Copy Pools
// 实现"千人千面"效果：每个等级准备多个称号 + 多条文案，随机组合

export interface DimensionTitle {
  name: string; // 称号名称
  emoji: string; // 表情符号
}

export interface DimensionLevel {
  titles: DimensionTitle[]; // 称号池（每个等级5个称号）
  copies: string[]; // 随机文案池（每个等级5条文案）
}

export interface DimensionAnalysis {
  dimensionKey: string;
  levels: {
    level1: DimensionLevel; // 0-25%
    level2: DimensionLevel; // 26-50%
    level3: DimensionLevel; // 51-75%
    level4: DimensionLevel; // 76-100%
  };
}

// 维度 A: Obsessive Control (强迫控制)
const controlAnalysis: DimensionAnalysis = {
  dimensionKey: 'control',
  levels: {
    level1: {
      titles: [
        { name: 'The Tourist', emoji: '🏖️' },
        { name: 'The Hippie', emoji: '☮️' },
        { name: 'The Free Spirit', emoji: '🍃' },
        { name: 'The Roommate', emoji: '🛋️' },
        { name: 'The Cool Cat', emoji: '😎' }
      ],
      copies: [
        "You give them so much freedom, they might forget they're dating you.",
        "Your philosophy is 'If they leave, they weren't mine.' Very chill.",
        "You respect privacy to a fault. You probably don't even know their phone password.",
        "Zero control issues here. You treat your partner like an adult, not a pet.",
        "You are as controlling as a wet noodle. Total freedom is your vibe."
      ]
    },
    level2: {
      titles: [
        { name: 'The Shepherd', emoji: '🐑' },
        { name: 'The Bodyguard', emoji: '🛡️' },
        { name: 'The Hall Monitor', emoji: '📋' },
        { name: 'The Protective Plushie', emoji: '🧸' },
        { name: 'The Safety Net', emoji: '🕸️' }
      ],
      copies: [
        "You like to know where they are, just for 'safety', right? 😉",
        "You casually check their 'Last Seen' status, but you won't admit it.",
        "You don't demand passwords, but you wouldn't say no if they offered.",
        "You get a little curious when they go out without you. Just a little.",
        "Protective Plushie mode: You want to keep them close, but you don't bite."
      ]
    },
    level3: {
      titles: [
        { name: 'The Detective', emoji: '🕵️‍♀️' },
        { name: 'The Analyst', emoji: '📊' },
        { name: 'The Auditor', emoji: '📝' },
        { name: 'The Gatekeeper', emoji: '⛩️' },
        { name: 'The Drone Pilot', emoji: '🚁' }
      ],
      copies: [
        "Detective Mode Activated. You analyze their followers list like it's data science.",
        "You firmly believe that 'Privacy' is just another word for 'Secrets'.",
        "You know their schedule better than they do. It's impressive, really.",
        "You have the 'Find My Friends' app open a little too often.",
        "If they don't reply in 10 minutes, you assume they are dead (or cheating)."
      ]
    },
    level4: {
      titles: [
        { name: 'The Warden', emoji: '👮' },
        { name: 'The Puppet Master', emoji: '🎭' },
        { name: 'The Dictator', emoji: '👑' },
        { name: 'The System Admin', emoji: '💻' },
        { name: 'The Cage Maker', emoji: '⛓️' }
      ],
      copies: [
        "You control their clothes, their friends, and their breathing.",
        "You want to lock them in a room so the world can't touch them. Literally.",
        "GPS tracking is not enough; you want a chip implanted in their brain.",
        "Your love is a cage, and you threw away the key. Terrifyingly romantic.",
        "You view their independence as a personal attack. They belong to YOU."
      ]
    }
  }
};

// 维度 B: Extreme Jealousy (极端嫉妒)
const jealousyAnalysis: DimensionAnalysis = {
  dimensionKey: 'jealousy',
  levels: {
    level1: {
      titles: [
        { name: 'The Zen Master', emoji: '🧘' },
        { name: 'The Monk', emoji: '📿' },
        { name: 'The Iceberg', emoji: '🧊' },
        { name: 'The Stone', emoji: '🗿' },
        { name: 'The Confident King', emoji: '👑' }
      ],
      copies: [
        "Zen Master. They could hug a supermodel and you wouldn't even blink. Confidence level: 100.",
        "Jealousy? What's that? You trust them so much it's almost boring.",
        "You realize that 'other people' exist, and you are totally fine with it. A rare breed.",
        "You are too busy loving yourself to worry about potential rivals.",
        "Secure attachment style detected. You are the safest partner on Earth."
      ]
    },
    level2: {
      titles: [
        { name: 'The Pouting Kitten', emoji: '😾' },
        { name: 'The Berry Picker', emoji: '🍒' },
        { name: 'The Mochi', emoji: '🍡' },
        { name: 'The Side-Eye Expert', emoji: '👀' },
        { name: 'The Fox', emoji: '🦊' }
      ],
      copies: [
        "Cute Pout. You get a little jelly when someone flirts with them, but it's adorable.",
        "You might ask 'Who is she?' jokingly, but deep down... you are taking notes.",
        "You want to be their #1 favorite person, and you sulk if you aren't.",
        "You give a polite side-eye to anyone who gets a little too close.",
        "Healthy jealousy. You care enough to protect what's yours, but you don't make a scene."
      ]
    },
    level3: {
      titles: [
        { name: 'The Sniper', emoji: '🔫' },
        { name: 'The Border Patrol', emoji: '🚧' },
        { name: 'The Watchtower', emoji: '🗼' },
        { name: 'The Security Cam', emoji: '📹' },
        { name: 'The Wolf', emoji: '🐺' }
      ],
      copies: [
        "FBI Agent. 'Why did you like that photo from 52 weeks ago?' You see everything.",
        "If looks could kill, that waiter flirting with your partner would be dead.",
        "You scan the room for threats the moment you walk into a party. Target locked.",
        "You don't just dislike their exes; you have a mental list of their coordinates.",
        "Your jealousy isn't cute anymore; it's a security system. Trespassers beware."
      ]
    },
    level4: {
      titles: [
        { name: 'The Executioner', emoji: '🪓' },
        { name: 'The Grim Reaper', emoji: '💀' },
        { name: 'The Exterminator', emoji: '🧪' },
        { name: 'The Yandere God', emoji: '🩸' },
        { name: 'The Final Boss', emoji: '👿' }
      ],
      copies: [
        "Yandere Mode: ON. 'If you look at them, I will end you.' Literal death threats.",
        "You believe they should only have eyes for you. Everyone else is an enemy.",
        "Scorched Earth Policy. You will burn down the world just to keep them to yourself.",
        "You scare people away intentionally so your partner has no one else but you.",
        "Your jealousy is a weapon of mass destruction. It's 'Us against the World'."
      ]
    }
  }
};

// 维度 C: Total Devotion (绝对忠诚/依赖)
const dependencyAnalysis: DimensionAnalysis = {
  dimensionKey: 'dependency',
  levels: {
    level1: {
      titles: [
        { name: 'The Lone Wolf', emoji: '🐺' },
        { name: 'The Nomad', emoji: '⛺' },
        { name: 'The Solo Player', emoji: '🎮' },
        { name: 'The Eagle', emoji: '🦅' },
        { name: 'The Captain', emoji: '⚓' }
      ],
      copies: [
        "Independent Soul. If they break up with you, you'll be sad for 5 minutes then order pizza.",
        "You have your own life, hobbies, and friends. You complement each other, you don't complete each other.",
        "You love them, but you love your freedom just as much.",
        "Space is healthy, and you take plenty of it. No clinginess detected.",
        "You are a partner, not a fan. You stand on your own two feet."
      ]
    },
    level2: {
      titles: [
        { name: 'The Koala', emoji: '🐨' },
        { name: 'The Shadow', emoji: '👤' },
        { name: 'The Sticker', emoji: '🏷️' },
        { name: 'The Golden Retriever', emoji: '🐶' },
        { name: 'The Sidekick', emoji: '🤝' }
      ],
      copies: [
        "Velcro Sticker. You love hand-holding and getting cuddles. Sweet and sticky.",
        "You text 'I miss you' after being apart for 2 hours. Ideally clingy.",
        "Your mood instantly improves when they walk into the room. Puppy love vibes.",
        "You prioritize them over your friends sometimes, but you still have a life.",
        "You are the 'Big Spoon' of the relationship (emotionally). Always there."
      ]
    },
    level3: {
      titles: [
        { name: 'The Super Fan', emoji: '🤩' },
        { name: 'The Believer', emoji: '🙏' },
        { name: 'The Satellite', emoji: '🛰️' },
        { name: 'The Oxygen Mask', emoji: '😷' },
        { name: 'The Moth', emoji: '🦋' }
      ],
      copies: [
        "Oxygen Mask. You literally feel like you can't breathe without them.",
        "You dropped your hobbies because 'watching them sleep' is your new hobby.",
        "Their opinion is your law. You are losing your own identity to fit theirs.",
        "Anxiety spikes when they leave. You count the seconds until they return.",
        "You revolve around them like a planet around the sun. A bit dizzying."
      ]
    },
    level4: {
      titles: [
        { name: 'The Symbiote', emoji: '🧬' },
        { name: 'The Cultist', emoji: '🕯️' },
        { name: 'The Conjoined Twin', emoji: '👯' },
        { name: 'The Parasite', emoji: '🦠' },
        { name: 'The Voodoo Doll', emoji: '🪡' }
      ],
      copies: [
        "Merged Entity. Where do you end and they begin? You want to be surgically attached.",
        "You would burn yourself to keep them warm. It's poetic, but tragic.",
        "God Tier Devotion. You worship the ground they walk on. It's a cult of one.",
        "You have no self-preservation instinct. It's all about THEM.",
        "If they jump off a bridge, you are already at the bottom waiting to catch them."
      ]
    }
  }
};

// 维度 D: Protective Aggression (保护性攻击/不安)
const insecurityAnalysis: DimensionAnalysis = {
  dimensionKey: 'insecurity',
  levels: {
    level1: {
      titles: [
        { name: 'The Peacekeeper', emoji: '🕊️' },
        { name: 'The Diplomat', emoji: '🤝' },
        { name: 'The Shield', emoji: '🛡️' },
        { name: 'The Pillow', emoji: '🛌' },
        { name: 'The Healer', emoji: '💊' }
      ],
      copies: [
        "Rock Solid. Insecurity? Never heard of her. You know you're the best.",
        "Peacekeeper. You avoid drama and trust that everything will be fine.",
        "You are as calm as a cucumber. No fights, just vibes.",
        "Secure AF. You don't need constant reassurance to know you are loved.",
        "Emotional fortress. You don't let small things shake your confidence."
      ]
    },
    level2: {
      titles: [
        { name: 'The Hedgehog', emoji: '🦔' },
        { name: 'The Chihuahua', emoji: '🐕' },
        { name: 'The Alarm Clock', emoji: '⏰' },
        { name: 'The Porcelain Doll', emoji: '🎎' },
        { name: 'The Rose', emoji: '🌹' }
      ],
      copies: [
        "Human after all. You overthink 'Why is their text so short?', but you get over it.",
        "You need a reassurance hug now and then, but you don't lash out.",
        "A little bit anxious, but in a 'protect me' way, not a 'hurt you' way.",
        "You get sad rather than mad when you feel insecure.",
        "Bark but no bite. You whine for attention, which works."
      ]
    },
    level3: {
      titles: [
        { name: 'The Siren', emoji: '🚨' },
        { name: 'The Guard Dog', emoji: '🐩' },
        { name: 'The Time Bomb', emoji: '💣' },
        { name: 'The Volcano', emoji: '🌋' },
        { name: 'The Trap Master', emoji: '🪤' }
      ],
      copies: [
        "Panic Button. You ask 'Do you love me?' 50 times a day. It's exhausting.",
        "You use guilt as a tool. 'If you leave, I'll be so sad' turns into a threat.",
        "You start fights just to see if they care enough to fight back.",
        "Emotional Rollercoaster. You push them away just to pull them back.",
        "You view every argument as the end of the world. High drama."
      ]
    },
    level4: {
      titles: [
        { name: 'The Berserker', emoji: '⚔️' },
        { name: 'The Doomsday Prepper', emoji: '☢️' },
        { name: 'The Villain', emoji: '🦹' },
        { name: 'The Destroyer', emoji: '🧨' },
        { name: 'The Apocalypse', emoji: '🌪️' }
      ],
      copies: [
        "Doomsday Prepper. You are convinced they will leave, so you might lock the door.",
        "Classic Yandere: 'I will break your legs so you can't leave me.' (Metaphorically?)",
        "If I can't have you, NO ONE CAN. The ultimate catchphrase.",
        "Your fear of abandonment has turned into aggression. Dangerous territory.",
        "You are ready to destroy anyone who threatens your relationship, including them."
      ]
    }
  }
};

// 导出所有维度分析
export const dimensionAnalyses: Record<string, DimensionAnalysis> = {
  control: controlAnalysis,
  jealousy: jealousyAnalysis,
  dependency: dependencyAnalysis,
  insecurity: insecurityAnalysis
};

/**
 * 根据维度和分数获取随机的分析文案
 * @param dimension 维度名称 ('control' | 'jealousy' | 'dependency' | 'insecurity')
 * @param score 分数 (0-100)
 * @returns 格式化的文案：emoji + 称号 - 随机文案
 */
export function getRandomDimensionAnalysis(dimension: string, score: number): string {
  const analysis = dimensionAnalyses[dimension];
  if (!analysis) return 'Analysis not available';

  let level: DimensionLevel;

  if (score <= 25) {
    level = analysis.levels.level1;
  } else if (score <= 50) {
    level = analysis.levels.level2;
  } else if (score <= 75) {
    level = analysis.levels.level3;
  } else {
    level = analysis.levels.level4;
  }

  // 随机选择一个称号
  const randomTitle = level.titles[Math.floor(Math.random() * level.titles.length)];

  // 随机选择一条文案
  const randomCopy = level.copies[Math.floor(Math.random() * level.copies.length)];

  return `${randomTitle.emoji} ${randomTitle.name} - ${randomCopy}`;
}