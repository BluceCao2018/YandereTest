// 分享文案池 - Share Copy Pool
// 用于随机生成分享的标题和描述，增加趣味性和传播性

export interface ShareCopy {
  title: string;
  text: string;
}

const SHARE_COPY_POOL: ShareCopy[] = [
  // Group A: 🚩 "自我吐槽/红旗"系列 (Self-Roast)
  {
    title: '🚩 Am I a Walking Red Flag?',
    text: "Checking your partner's location 50 times a day isn't 'normal'. Test your toxicity level here. 💀"
  },
  {
    title: '🚑 Send Help. I think I\'m a Psycho.',
    text: "I thought I was just 'caring', turns out I might need therapy. Check your own Yandere score."
  },
  {
    title: '💀 Oops. Is my love \'Illegal\'?',
    text: "Take the test that exposes your darkest relationship habits. Are you safe to date?"
  },
  {
    title: '🤡 I thought I was \'Chill\'. I was wrong.',
    text: "This psychological test humbled me real quick. See if you are actually as normal as you think."
  },
  {
    title: '☢️ Toxicity Check: 100% Honest.',
    text: "Are you the toxic one in the relationship? 37 questions to find the brutal truth."
  },

  // Group B: 🔪 "硬核病娇"系列 (Edgy / Yandere Vibes)
  {
    title: '🔪 "If I can\'t have you, no one can."',
    text: "Does this sentence sound romantic or scary to you? Find out your Yandere Archetype. 🩸"
  },
  {
    title: '⛓️ Love is a cage, and I have the key.',
    text: "Analyze your Possessiveness, Control, and Jealousy levels. How deep is your obsession?"
  },
  {
    title: '🎀 Cute on the outside, Psycho on the inside?',
    text: "Are you a 'Soft Yandere' or a 'Hardcore Stalker'? Unlock your hidden personality. 🗝️"
  },
  {
    title: '👁️ I see everything. Even your deleted texts.',
    text: "Do you have the 'Detective' trait? Take the ultimate jealousy test now."
  },
  {
    title: '🩸 My love is heavy. Can you handle it?',
    text: "Discover your 'Dark Stats'. Warning: Results may cause self-reflection."
  },

  // Group C: 📱 "偷窥/查岗"系列 (Relatable Habits)
  {
    title: '📱 Do you check their phone at 3 AM?',
    text: "Be honest. If the answer is yes, you need to take this test immediately. 📉"
  },
  {
    title: '📍 "Why is your location off?"',
    text: "If you ask this question daily, you might be a Yandere. Calculate your control score."
  },
  {
    title: '🕵️‍♀️ FBI should hire me.',
    text: "I found their ex's new partner in 5 minutes. Is that a skill or a problem? Test your stalker level."
  },
  {
    title: '📵 Who are you texting right now?',
    text: "Do you get jealous easily? See where you rank on the 'Extreme Jealousy' scale."
  },

  // Group D: 👫 "互动/挑战"系列 (Social / Challenge)
  {
    title: '⚔️ I bet you can\'t get a \'Normal\' score.',
    text: "90% of people fail this sanity check. Are you mentally stable or a total Yandere? 🤪"
  },
  {
    title: '💔 Don\'t date me until you take this.',
    text: "Compatibility Check: Are our toxic traits compatible? Send this to your crush."
  },
  {
    title: '🧬 What is your \'Dark Side\' percentage?',
    text: "Everyone has a dark side. Find out how deep yours goes with this 3-minute analysis."
  },
  {
    title: '⚖️ Is it Love, or is it a Crime?',
    text: "Sometimes the line is blurry. Find out where you stand on the legal scale of love."
  },
  {
    title: '🧩 Which Anime Archetype are you?',
    text: "From 'Deredere' to 'Extreme Yandere'. Collect your character card now!"
  },
  {
    title: '🧪 The Ultimate Relationship Test.',
    text: "Obsessive? Jealous? Controlling? Uncover your hidden traits before it's too late."
  }
];

/**
 * 随机获取一条分享文案
 * @returns 随机的分享文案对象（包含 title 和 text）
 */
export function getRandomShareCopy(): ShareCopy {
  return SHARE_COPY_POOL[Math.floor(Math.random() * SHARE_COPY_POOL.length)];
}

/**
 * 获取指定索引的分享文案（用于缓存）
 * @param index 索引
 * @returns 分享文案对象
 */
export function getShareCopyByIndex(index: number): ShareCopy {
  return SHARE_COPY_POOL[index % SHARE_COPY_POOL.length];
}

/**
 * 获取文案池的总数量
 * @returns 文案总数
 */
export function getShareCopyPoolSize(): number {
  return SHARE_COPY_POOL.length;
}
