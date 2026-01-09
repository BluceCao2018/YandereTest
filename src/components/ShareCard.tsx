'use client';

import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import { getRandomShareCopy } from '@/lib/shareCopyPool';

interface ShareCardProps {
  score: number;
  level: string;
  persona: {
    name: string;
    rarity: string;
    rarityColor: string;
    emoji: string;
    quote: string;
  };
  darkStats: {
    dangerLevel: number;
    loyalty: number;
    possessiveness: number;
    sanity: number;
    obsessiveness: number;
    yanderePotential: number;
  };
  onClose: () => void;
}

export function ShareCard({ score, level, persona, darkStats, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareButtons, setShowShareButtons] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-generate image when component mounts
  useEffect(() => {
    // Wait for images to fully load before generating
    const timer = setTimeout(() => {
      generateImage();
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const generateImage = async () => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f0f23',
        width: 540,
        height: 960,
      });

      const imageUrl = canvas.toDataURL('image/png');
      setGeneratedImage(imageUrl);
      setShowShareButtons(true);
      return imageUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `yandere-test-${score}.png`;
    link.click();
  };

  const shareToX = () => {
    if (!generatedImage) return;

    const text = `I scored ${score}% on the Yandere Test! 🖤\n"${persona.quote.replace(/"/g, '')}"\n\nTake the test to reveal your dark side:`;
    const url = window.location.href;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareToWhatsApp = () => {
    const text = `I scored ${score}% on the Yandere Test! 🖤\n"${persona.quote.replace(/"/g, '')}"\n\nTake the test: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // 移动端原生分享
  const handleMobileShare = async () => {
    if (!generatedImage) return;

    try {
      // 将 base64 图片转换为 Blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], 'yandere-test.png', { type: 'image/png' });

      // 获取随机分享文案
      const shareCopy = getRandomShareCopy();

      // 检查是否支持原生分享
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: shareCopy.title,
          text: shareCopy.text,
          files: [file],
        });
      } else if (navigator.share) {
        // 如果不支持分享文件，则只分享链接
        await navigator.share({
          title: shareCopy.title,
          text: shareCopy.text,
          url: window.location.href,
        });
      }
    } catch (error) {
      console.log('Share cancelled or failed:', error);
    }
  };

  const getScoreColor = () => {
    if (score >= 75) return '#ff1744'; // bright red
    if (score >= 50) return '#ff9100'; // bright orange
    if (score >= 25) return '#d500f9'; // bright purple
    return '#ff4081'; // bright pink
  };

  const getGlowColor = () => {
    if (score >= 75) return 'rgba(255, 23, 68, 0.6)';
    if (score >= 50) return 'rgba(255, 145, 0, 0.6)';
    if (score >= 25) return 'rgba(213, 0, 249, 0.6)';
    return 'rgba(255, 64, 129, 0.6)';
  };

  return (
    <>
      {/* Hidden card for image generation */}
      <div className="fixed -left-[9999px] top-0">
        <div
          ref={cardRef}
          style={{
            width: '540px',
            height: '960px',
            background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 30%, #16213e 70%, #0f0f23 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.08,
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '30px 30px',
            }}
          />

          {/* Decorative gradient circles */}
          <div
            style={{
              position: 'absolute',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: getGlowColor(),
              filter: 'blur(100px)',
              opacity:20,
              top: -80,
              right: -80,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'rgba(236, 72, 153, 0.25)',
              filter: 'blur(100px)',
              bottom: -100,
              left: -100,
            }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header - Logo */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🖤</span>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700, letterSpacing: '2px' }}>
                  YANDERE TEST
                </span>
              </div>
            </div>

            {/* Score Section - Huge */}
            <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '-20px' }}>
              <div
                style={{
                  fontSize: '140px',
                  fontWeight: 900,
                  color: getScoreColor(),
                  lineHeight: 0.85,
                  textShadow: `0 0 80px ${getGlowColor()}, 0 0 40px ${getGlowColor()}`,
                  marginBottom: '2px',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {score}%
              </div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '20px',
                  marginTop: '12px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {level}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  background: `linear-gradient(135deg, ${persona.rarityColor.split(' ')[0]}, ${persona.rarityColor.split(' ')[1]})`,
                  borderRadius: '20px',
                  boxShadow: `0 8px 32px ${getGlowColor()}`,
                }}
              >
                <span style={{ fontSize: '28px' }}>{persona.emoji}</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{persona.name}</span>
              </div>
            </div>

            {/* Six-Dimension Radar Chart */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>
                    DARK STATS ANALYSIS
                  </span>
                </div>

                {/* Stats grid - 3x2 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <MiniStat label="DANGER" value={darkStats.dangerLevel} color="#ff1744" />
                  <MiniStat label="LOYALTY" value={darkStats.loyalty} color="#00e676" />
                  <MiniStat label="POSSESS" value={darkStats.possessiveness} color="#d500f9" />
                  <MiniStat label="SANITY" value={darkStats.sanity} color="#2979ff" />
                  <MiniStat label="OBSESS" value={darkStats.obsessiveness} color="#ff9100" />
                  <MiniStat label="YANDERE" value={darkStats.yanderePotential} color="#ff4081" />
                </div>
              </div>
            </div>

            {/* Quote */}
            <div style={{ marginBottom: 'auto' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderLeft: '3px solid',
                  borderImage: `linear-gradient(to bottom, ${persona.rarityColor.split(' ')[0]}, ${persona.rarityColor.split(' ')[1]}) 1`,
                  padding: '12px 16px',
                  borderRadius: '0 12px 12px 0',
                }}
              >
                <p
                  style={{
                    color: '#fff',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    margin: 0,
                    opacity: 0.9,
                  }}
                >
                  "{persona.quote.replace(/"/g, '')}"
                </p>
              </div>
            </div>

            {/* Yandere Character Image - Bottom */}
            {/* <div style={{ position: 'relative', height: '220px', marginBottom: '16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                <Image
                  src="/jiaoniang.webp"
                  alt=""
                  width={200}
                  height={200}
                  priority
                  style={{
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
                  }}
                />
              </div>
            </div> */}

            {/* Footer - QR Code & URL */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ background: '#fff', padding: '6px', borderRadius: '8px' }}>
                <QRCodeSVG
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  size={64}
                  bgColor="#ffffff"
                  fgColor="#0a0a1a"
                  level="M"
                />
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>
                  yanderetest.com
                </p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: 0, lineHeight: 1.3 }}>
                  Scan to reveal your dark side 🔪
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] flex flex-col relative">
          {/* Fixed Header */}
          <div className="flex-shrink-0 p-6 pb-4">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Share Your Result</h2>
              <p className="text-gray-600"></p>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6">
            {/* Preview image */}
            <div className="rounded-xl overflow-hidden shadow-2xl relative">
              {generatedImage ? (
                <>
                  <img src={generatedImage} alt="Share preview" className="w-full" />
                  {/* 移动端长按提示 */}
                  {isMobile && (
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-sm">
                      <span>Long press image to save</span>
                      <span>👆</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[9/16] bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                  <div className="text-center text-white p-8 pt-4">
                    <div className="text-8xl font-bold mb-4 -mt-12" style={{ color: getScoreColor() }}>{score}%</div>
                    <div className="text-2xl font-bold mb-2">{level}</div>
                    <div className="text-xl opacity-80">{persona.name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer - Action buttons */}
          <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
            {!showShareButtons ? (
              <button
                onClick={generateImage}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Generate Share Image
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                {isMobile ? (
                  // 移动端：显示分享按钮
                  <button
                    onClick={handleMobileShare}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Image
                  </button>
                ) : (
                  // 桌面端：显示保存按钮
                  <button
                    onClick={downloadImage}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Save to Gallery
                  </button>
                )}

                {/* <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={shareToX}
                    className="bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </button>

                  <button
                    onClick={shareToWhatsApp}
                    className="bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </button>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Helper component for mini stat displays
interface MiniStatProps {
  label: string;
  value: number;
  color: string;
}

function MiniStat({ label, value, color }: MiniStatProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div
        style={{
          width: '70px',
          height: '60px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${value}%`,
            background: `linear-gradient(to top, ${color}, ${color}dd)`,
            transition: 'height 0.3s ease',
          }}
        />
        {/* Value */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 800,
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          {value}
        </div>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
}
