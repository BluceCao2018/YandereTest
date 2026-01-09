'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { cardCopyPool, getRandomCardCopy } from '@/lib/cardCopyPool'

interface CardDisplayData {
  level: number
  title: string
  emoji: string
  color: string
  currentCopy: string
}

interface CharacterCardsProps {
  onStartTest?: () => void
}

export function CharacterCards({ onStartTest }: CharacterCardsProps) {
  const [cards, setCards] = useState<CardDisplayData[]>([])
  const [mobileIndex, setMobileIndex] = useState(0)

  // Initialize cards with random copies
  useEffect(() => {
    const initialCards = cardCopyPool.map(card => ({
      level: card.level,
      title: card.title,
      emoji: card.emoji,
      color: card.color,
      currentCopy: getRandomCardCopy(card.level)
    }))
    setCards(initialCards)
  }, [])

  // Rotate copies every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prevCards =>
        prevCards.map(card => ({
          ...card,
          currentCopy: getRandomCardCopy(card.level)
        }))
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Auto-rotate mobile cards
  useEffect(() => {
    const mobileInterval = setInterval(() => {
      setMobileIndex(prev => (prev + 1) % 4)
    }, 10000)

    return () => clearInterval(mobileInterval)
  }, [])

  return (
    <section className="w-full bg-gradient-to-b from-pink-50 to-purple-50 py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Find Your Hidden Persona
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Which level of obsession are you?
          </p>
        </div>

        {/* Desktop: Show all 4 cards */}
        <div className="hidden md:grid grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.level}
              className="relative group cursor-pointer"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Card Image */}
                <Image
                  src={`/cards/${card.level}.png`}
                  alt={card.title}
                  fill
                  className="object-cover"
                  priority={card.level <= 2}
                />

                {/* Gradient Overlay for Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Copy Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{card.emoji}</span>
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Level {card.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium leading-relaxed line-clamp-3">
                      "{card.currentCopy}"
                    </p>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      {card.title}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Show one card at a time with auto-rotation */}
        <div className="md:hidden">
          {cards.map((card, idx) => (
            <div
              key={card.level}
              className={`transition-opacity duration-500 ${
                idx === mobileIndex ? 'opacity-100' : 'hidden'
              }`}
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg mx-auto max-w-sm">
                {/* Card Image */}
                <Image
                  src={`/cards/${card.level}.png`}
                  alt={card.title}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Gradient Overlay for Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Copy Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{card.emoji}</span>
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Level {card.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium leading-relaxed">
                      "{card.currentCopy}"
                    </p>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      {card.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Pagination Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {cards.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setMobileIndex(dotIdx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      dotIdx === mobileIndex
                        ? 'bg-purple-600 w-6'
                        : 'bg-gray-300'
                    }`}
                    aria-label={`Show card ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-10">
          <p className="text-gray-600 text-sm mb-4">
            Ready to discover your true nature?
          </p>
          <button
            onClick={onStartTest}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-lg hover:-translate-y-1"
          >
            Take the Test Now
          </button>
        </div>
      </div>
    </section>
  )
}
