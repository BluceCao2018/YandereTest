'use client'
import React from 'react'

interface TestModeSelectorProps {
  onSelect: (mode: 'self' | 'partner') => void
}

export function TestModeSelector({ onSelect }: TestModeSelectorProps) {
  return (
    <div className="flex flex-col justify-center items-center px-4 py-16 h-[550px] relative z-10">
      {/* 桌面端：显示爱心 */}
      <i className="hidden md:block fas fa-heart text-9xl text-white mb-8 animate-pulse"></i>

      <h1 className="text-4xl font-bold text-center mb-4 text-white relative z-30">
        Who is the subject?
      </h1>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full relative z-30">
        {/* Myself Option */}
        <button
          onClick={() => onSelect('self')}
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-2xl p-8 border-2 border-white/30 hover:border-white/60 group"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
            🙋‍♀️
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Myself
          </h2>
         
          <p className="text-white/70 text-xs mt-3 italic">
            &quot;Am I a Yandere? Analyze my own toxicity.&quot;
          </p>
        </button>

        {/* Partner Option */}
        <button
          onClick={() => onSelect('partner')}
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-2xl p-8 border-2 border-white/30 hover:border-white/60 group"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
            👫
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            My Partner
          </h2>
         
          <p className="text-white/70 text-xs mt-3 italic">
            &quot;Are they crazy? Expose their true nature.&quot;
          </p>
        </button>
      </div>
    </div>
  )
}
