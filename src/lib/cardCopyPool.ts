// 首页角色卡随机文案库 (The Heart-Stinging Copy Pool)

export interface CardCopy {
  level: number
  title: string
  emoji: string
  color: string
  copies: string[]
}

export const cardCopyPool: CardCopy[] = [
  {
    level: 1,
    title: "The Pouting Kitten",
    emoji: "🌸",
    color: "from-pink-400 to-rose-500",
    copies: [
      "I'm not jealous. I just don't like it when you smile at her.",
      "You replied to the group chat before you replied to me. 🙂",
      "Who is that girl you just followed? Just curious.",
      "I noticed you didn't heart my story today. Are you mad?",
      "Pay attention to me. Now.",
      "I'm not clingy, I'm just exclusively yours.",
      "Why did you take 10 minutes to text back 'ok'?",
      "You can hang out with your friends, but miss me, okay?",
      "I had a dream you cheated, so I'm mad at you now.",
      "Tell me I'm your favorite person. Say it."
    ]
  },
  {
    level: 2,
    title: "The Anxious Shadow",
    emoji: "🌑",
    color: "from-purple-400 to-indigo-600",
    copies: [
      "You said 'Goodnight' 3 hours ago... but you're still online.",
      "I checked your followers list again. Who is the new person?",
      "Do you secretly hate me? You can tell me.",
      "I read our old texts just to feel something.",
      "Why is your location turned off? Did I do something wrong?",
      "You liked her post from 2019. Do you still think about her?",
      "I overthink every word you say. Every single one.",
      "Please don't leave me. Everyone always leaves.",
      "I feel like I'm bothering you just by existing.",
      "Is there someone else? Just tell me the truth."
    ]
  },
  {
    level: 3,
    title: "The Silent Controller",
    emoji: "⛓️",
    color: "from-orange-500 to-red-600",
    copies: [
      "I don't check your phone because I don't trust you. I do it to protect you.",
      "You don't need other friends. You have me.",
      "I know where you are right now. Why did you lie?",
      "Unlock your phone. If you have nothing to hide, why are you scared?",
      "I deleted that contact for you. They were bad for our relationship.",
      "Send me a photo of who you are with. Right now.",
      "I did this for your own good. You'll thank me later.",
      "You belong to me. Remember that.",
      "Why would you want to go out without me? That's suspicious.",
      "I know your passwords. It's a sign of true intimacy."
    ]
  },
  {
    level: 4,
    title: "The Crimson Obsession",
    emoji: "🩸",
    color: "from-red-600 to-rose-900",
    copies: [
      "If I can't have you... no one can.",
      "We will be together forever. Even death can't separate us.",
      "I want to lock you up so the world can't touch you.",
      "Look at me. ONLY at me.",
      "I'd rather kill us both than let you leave me.",
      "Your blood smells sweet to me.",
      "I eliminated the competition. You're welcome.",
      "A cage is just a home where you can never leave.",
      "Love means never having to say 'I'm leaving'.",
      "I carved your name on my arm. Do you like it?"
    ]
  }
]

export function getRandomCardCopy(level: number): string {
  const card = cardCopyPool.find(c => c.level === level)
  if (!card || card.copies.length === 0) return ""
  const randomIndex = Math.floor(Math.random() * card.copies.length)
  return card.copies[randomIndex]
}
