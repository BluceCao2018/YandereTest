import {getTranslations} from 'next-intl/server';
import Link from 'next/link';
import { FaHeart, FaChartLine, FaShieldAlt, FaUsers, FaHome, FaInfoCircle, FaEnvelope, FaShareAlt } from 'react-icons/fa';

export async function generateMetadata() {
  const t = await getTranslations('love-possession-calculator');
  const w = await getTranslations('website');
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: w("domain")
    },
    twitter: {
      card: 'summary_large_image',
      title: t("meta_title"),
      description: t("meta_description"),
      site: '@BluceC56570',
      images: `${w("domain")}/love-possession-calculator.png`,
    },
    openGraph: {
      type: 'article',
      title: t("meta_title"),
      description: t("meta_description"),
      url: `${w("domain")}/tests/rpi-calculator`,
      images: `${w("domain")}/love-possession-calculator.png`,
    },
  };
}

// 自定义导航栏组件
function CustomNav() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo和标题 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <FaHeart className="text-pink-500 text-2xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                RPI Test
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
              首页
            </Link>
            <a
              href="#about"
              className="text-gray-700 hover:text-pink-500 transition-colors flex items-center gap-2"
            >
              <FaInfoCircle className="text-sm" />
              关于测试
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-pink-500 transition-colors flex items-center gap-2"
            >
              <FaEnvelope className="text-sm" />
              联系我们
            </a>
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm hover:shadow-lg transition-shadow">
              分享测试
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

      {/* 移动端菜单 */}
      {/* <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-pink-500">
            首页
          </Link>
          <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-pink-500">
            关于测试
          </a>
          <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-pink-500">
            联系我们
          </a>
        </div>
      </div> */}
    </nav>
  );
}

// 自定义Footer组件
function CustomFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo和描述 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <FaHeart className="text-pink-500 text-2xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                RPI Test
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              专业恋爱占有欲指数测试工具，基于心理学研究设计，帮助您了解自己在恋爱关系中的行为模式和情感特征。
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                <FaShareAlt />
              </a>
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  开始测试
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  测试说明
                </a>
              </li>
              <li>
                <a href="#dimensions" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  评估维度
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  其他测试
                </a>
              </li>
            </ul>
          </div>

          {/* 联系信息 */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">联系我们</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 text-sm">
                邮箱：contact@rpi-test.com
              </li>
              <li className="text-gray-600 text-sm">
                工作时间：周一至周五 9:00-18:00
              </li>
              <li className="text-gray-600 text-sm">
                反馈建议：feedback@rpi-test.com
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 RPI Test. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                隐私政策
              </a>
              <a href="#" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                使用条款
              </a>
              <a href="#" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                免责声明
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomNav />
      <main className="flex-1">
        {children}
      </main>
      <CustomFooter />
    </div>
  );
}