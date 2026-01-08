'use client'
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import { FaHeart, FaChartLine, FaShieldAlt, FaUsers, FaHome, FaInfoCircle, FaEnvelope, FaShareAlt } from 'react-icons/fa';

export const NavigationV2 = ( ) => {    
  const t = useTranslations('love-possession-calculator.nav');
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
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm hover:shadow-lg transition-shadow">
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
    </nav>
  );
}