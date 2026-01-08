// components/Footer.js
import { Link } from "@/lib/i18n";
import React from 'react'; // 确保导入 React
import Image from "next/image";
import IconImage from "../../public/favicon.svg";
import {useTranslations} from 'next-intl';
import { FaHeart, FaChartLine, FaShieldAlt, FaUsers, FaHome, FaInfoCircle, FaEnvelope, FaShareAlt } from 'react-icons/fa';

export function FooterV2() {
  const t =  useTranslations('love-possession-calculator.footer');
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo和描述 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <FaHeart className="text-pink-500 text-2xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t("description")}
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                <FaShareAlt />
              </a>
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  {t("startTest")}
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  {t("testInstructions")}
                </a>
              </li>
              <li>
                <a href="#dimensions" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  {t("dimensions")}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  {t("otherTests")}
                </a>
              </li>
            </ul>
          </div>

          {/* 联系信息 */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t("contactUs")}</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 text-sm">
                {t("email")}
              </li>
              <li className="text-gray-600 text-sm">
                {t("workHours")}
              </li>
              <li className="text-gray-600 text-sm">
                {t("feedback")}
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              {t("copyright")}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                {t("privacyPolicy")}
              </a>
              <a href="#" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                {t("termsOfService")}
              </a>
              <a href="#" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                {t("disclaimer")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}