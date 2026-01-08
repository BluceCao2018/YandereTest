'use client'
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import { FaHeart, FaChartLine, FaShieldAlt, FaUsers, FaHome, FaInfoCircle, FaEnvelope, FaShareAlt } from 'react-icons/fa';
import { useState } from 'react';

export const NavigationV2 = ( ) => {
  const t = useTranslations('love-possession-calculator.nav');
  const [showToast, setShowToast] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // 检测是否为移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ url })) {
      // 移动端：唤起原生分享菜单
      try {
        await navigator.share({
          title: document.title,
          url: url,
        });
      } catch (error) {
        // 用户取消分享或其他错误
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // 桌面端：复制到剪贴板
      try {
        await navigator.clipboard.writeText(url);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo和标题 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <FaHeart className="text-pink-500 text-2xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </Link>
          </div>

          {/* 导航链接 */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-pink-500 transition-colors flex items-center gap-2"
            >
              <FaHome className="text-sm" />
              {t("home")}
            </Link>
            <a
              href="#about"
              className="text-gray-700 hover:text-pink-500 transition-colors flex items-center gap-2"
            >
              <FaInfoCircle className="text-sm" />
              {t("aboutTest")}
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-pink-500 transition-colors flex items-center gap-2"
            >
              <FaEnvelope className="text-sm" />
              {t("contactUs")}
            </a>
            <button
              onClick={handleShare}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm hover:shadow-lg transition-shadow"
            >
              {t("shareTest")}
            </button>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-pink-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 复制成功提示气泡 */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          Link Copied!
        </div>
      )}
    </nav>
  );
}