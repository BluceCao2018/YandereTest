'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import '@fortawesome/fontawesome-free/css/all.min.css'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'

export default function LovePossessionCalculator() {
  const [gameState, setGameState] = useState<'start' | 'mode-selection' | 'playing' | 'result'>('start')
  const [testMode, setTestMode] = useState<'self' | 'partner'>('self')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')

  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'

  const t = useTranslations('love-possession-calculator')

  // 测试题目 - 基于心理学占有欲量表设计
  const questions: string[] = [
    // 控制欲望维度
    t('questions.0'),
    t('questions.1'),
    t('questions.2'),
    t('questions.3'),
    t('questions.4'),
    t('questions.5'),
    t('questions.6'),
    t('questions.7'),
    t('questions.8'),
    t('questions.9'),
    // 嫉妒强度维度
    t('questions.10'),
    t('questions.11'),
    t('questions.12'),
    t('questions.13'),
    t('questions.14'),
    t('questions.15'),
    t('questions.16'),
    t('questions.17'),
    t('questions.18'),
    t('questions.19'),
    // 情感依赖维度
    t('questions.20'),
    t('questions.21'),
    t('questions.22'),
    t('questions.23'),
    t('questions.24'),
    t('questions.25'),
    t('questions.26'),
    t('questions.27'),
    t('questions.28'),
    t('questions.29'),
    // 关系不安全感维度
    t('questions.30'),
    t('questions.31'),
    t('questions.32'),
    t('questions.33'),
    t('questions.34'),
    t('questions.35'),
    t('questions.36')
  ]

  const questionOptions = [
    { value: 1, label: t('options.never') },
    { value: 2, label: t('options.rarely') },
    { value: 3, label: t('options.sometimes') },
    { value: 4, label: t('options.often') },
    { value: 5, label: t('options.always') }
  ]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmbedUrl(`${window.location.origin}${window.location.pathname}?embed=true`)
    }
  }, [])

  const startTest = () => {
    setGameState('mode-selection')
  }

  const selectMode = (mode: 'self' | 'partner') => {
    setTestMode(mode)
    setGameState('playing')
    setCurrentQuestionIndex(0)
    setAnswers([])
  }

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = value
    setAnswers(newAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      calculateResults(newAnswers)
    }
  }

  const calculateResults = (answers: number[]) => {
    // 计算四个维度的得分
    const controlDesire = answers.slice(0, 10).reduce((a, b) => a + b, 0)
    const jealousyIntensity = answers.slice(10, 20).reduce((a, b) => a + b, 0)
    const emotionalDependency = answers.slice(20, 30).reduce((a, b) => a + b, 0)
    const relationshipInsecurity = answers.slice(30, 37).reduce((a, b) => a + b, 0)

    const totalScore = controlDesire + jealousyIntensity + emotionalDependency + relationshipInsecurity
    const maxScore = 37 * 5
    const percentage = Math.round((totalScore / maxScore) * 100)

    setGameState('result')
  }

  const getLevel = (score: number) => {
    if (score <= 25) return { level: t('results.levels.normal'), color: 'text-green-600', description: t('results.descriptions.normal') }
    if (score <= 50) return { level: t('results.levels.mild'), color: 'text-yellow-600', description: t('results.descriptions.mild') }
    if (score <= 75) return { level: t('results.levels.moderate'), color: 'text-orange-600', description: t('results.descriptions.moderate') }
    return { level: t('results.levels.severe'), color: 'text-red-600', description: t('results.descriptions.severe') }
  }

  const getDetailedAnalysis = (dimension: string, score: number) => {
    const controlAnalysis = [
      "你在关系中表现出非常健康的独立性，尊重伴侣的个人空间和自由。这种开放包容的态度有助于建立稳定的伴侣关系，让双方都能在关系中保持真实的自我。",
      "你对伴侣表现出适度的关心，偶尔会想要了解对方的行踪和活动。这种程度的关心是正常的情感表达，只要不过度干涉，有助于维护关系的亲密感。",
      "你对伴侣的控制欲望较为明显，可能会经常查看对方手机或要求汇报行踪。建议适当放松控制，给予彼此更多信任和空间。",
      "你对伴侣的控制欲望很强，可能会限制对方的社交活动或个人选择。这种过度控制可能会损害关系的健康发展，建议寻求专业指导来调整行为模式。",
      "你的控制欲望已经达到了需要警惕的程度。过度的控制不仅会让伴侣感到窒息，也会影响你们关系的长期发展。强烈建议寻求心理咨询师的帮助。"
    ]

    const jealousyAnalysis = [
      "你对伴侣表现出充分的信任，即使面对潜在的竞争威胁也能保持冷静和理性。这种安全感能够为你们的关系提供稳定的基础。",
      "偶尔出现的嫉妒反应是正常的情感表现，表明你在乎这段关系。只要能够理性处理并通过沟通化解，适当的嫉妒反而能增进感情。",
      "你较容易产生嫉妒情绪，可能会因为小事而感到不安或怀疑。建议学会客观看待情况，通过有效沟通来获得安全感。",
      "嫉妒情绪经常困扰着你，可能会因为对方的正常社交而产生强烈反应。建议深入分析嫉妒的根源，学习情绪管理技巧。",
      "嫉妒情绪已经严重影响了你的日常生活和关系质量。频繁的猜疑和对峙不仅伤害对方，也让自己备受煎熬。强烈建议寻求专业心理支持。"
    ]

    const dependencyAnalysis = [
      "你在关系中保持着很好的独立性，有自己的生活重心和支撑系统。这种健康的情感状态能够让你在享受爱情的同时保持完整的自我。",
      "你对伴侣有一定的情感依赖，这是亲密关系中的正常现象。只要不失去自我，适度的依赖有助于增进感情的深度和稳定性。",
      "你对伴侣的情感需求较强，可能会过度关注对方的感受和反应。建议培养自己的兴趣爱好，建立多元化的情感支撑系统。",
      "你对伴侣产生了明显的情感依赖，很难独立面对生活中的挑战。过度依赖会给双方带来压力，不利于关系的平衡发展。",
      "你的情感依赖已经达到了需要关注的地步。将全部情感寄托在一个人身上是危险的，既可能压垮对方，也会让自己变得脆弱。建议立即寻求专业帮助。"
    ]

    const insecurityAnalysis = [
      "你对关系有很强的安全感，相信自己能够维持稳定健康的恋爱关系。这种自信的态度有助于面对各种关系挑战。",
      "偶尔会为关系感到一些不安，这是人之常情。适当的担忧能促使你更用心地经营关系，只要不影响正常生活即可。",
      "你对关系的稳定性存在较多担忧，可能会因为小事而怀疑关系的可持续性。建议增强自信，建立更稳固的自我价值感。",
      "关系不安全感经常困扰着你，可能会反复确认对方的感情或担心关系随时结束。这种焦虑状态会影响你的生活质量。",
      "严重的不安全感已经让你备受煎熬。持续的焦虑和担忧不仅损害了你的心理健康，也可能对关系造成实际的负面影响。强烈建议寻求专业心理支持。"
    ]

    const index = Math.min(Math.floor(score / 20), 4)

    switch(dimension) {
      case 'control':
        return controlAnalysis[index]
      case 'jealousy':
        return jealousyAnalysis[index]
      case 'dependency':
        return dependencyAnalysis[index]
      case 'insecurity':
        return insecurityAnalysis[index]
      default:
        return ''
    }
  }

  const restart = () => {
    setGameState('start')
    setCurrentQuestionIndex(0)
    setAnswers([])
    setTestMode('self')
  }

  useEffect(() => {
    if (isIframe) {
      const sendHeight = () => {
        const height = document.querySelector('.banner')?.scrollHeight
        if (height) {
          window.parent.postMessage({ type: 'resize', height }, '*')
        }
      }

      const observer = new ResizeObserver(sendHeight)
      const banner = document.querySelector('.banner')
      if (banner) {
        observer.observe(banner)
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState])

  const currentAnswers = answers.filter(a => a !== undefined)
  const progress = Math.round((currentAnswers.length / questions.length) * 100)

  return (
    <div className="w-full">
      <div className="w-full mx-auto py-0 space-y-16">
        <div className="banner w-full flex flex-col justify-center items-center bg-gradient-to-br from-pink-500 to-purple-600 text-white">
          {/* 开始页面 */}
          {gameState === 'start' && (
            <div className='flex flex-col justify-center items-center px-4 py-16 h-[550px]'>
              <i className="fas fa-heart text-9xl text-white mb-8 animate-pulse"></i>
              <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
              <p className="text-lg text-center mb-8 text-white max-w-2xl">{t("description")}</p>
              <button
                onClick={startTest}
                className="bg-white text-purple-600 px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
              >
                {t("startTest")}
              </button>
            </div>
          )}

          {/* 选择测试模式 */}
          {gameState === 'mode-selection' && (
            <div className='flex flex-col justify-center items-center px-4 py-16 h-[550px]'>
              <h2 className="text-3xl font-bold text-center mb-8 text-white">{t("selectMode")}</h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-2xl w-full">
                <button
                  onClick={() => selectMode('self')}
                  className="bg-white/20 backdrop-blur-sm p-8 rounded-xl hover:bg-white/30 transition-colors text-white border-2 border-white/50"
                >
                  <i className="fas fa-user text-6xl mb-4"></i>
                  <h3 className="text-2xl font-bold mb-2">{t("mode.self.title")}</h3>
                  <p>{t("mode.self.description")}</p>
                </button>
                <button
                  onClick={() => selectMode('partner')}
                  className="bg-white/20 backdrop-blur-sm p-8 rounded-xl hover:bg-white/30 transition-colors text-white border-2 border-white/50"
                >
                  <i className="fas fa-heart text-6xl mb-4"></i>
                  <h3 className="text-2xl font-bold mb-2">{t("mode.partner.title")}</h3>
                  <p>{t("mode.partner.description")}</p>
                </button>
              </div>
            </div>
          )}

          {/* 答题页面 */}
          {gameState === 'playing' && (
            <div className="w-full max-w-3xl px-4 py-8">
              {/* 进度条 */}
              <div className="w-full bg-white/20 rounded-full h-4 mb-8">
                <div
                  className="bg-white h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* 题目编号 */}
              <p className="text-center mb-4 text-lg">
                {t("questionNumber", { current: currentQuestionIndex + 1, total: questions.length })}
              </p>

              {/* 题目 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-center">
                  {testMode === 'self' ? t("selfPrefix") : t("partnerPrefix")}
                  {questions[currentQuestionIndex]}
                </h3>

                {/* 选项 */}
                <div className="space-y-4">
                  {questionOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white px-6 py-4 rounded-xl text-left border-2 border-white/50 hover:border-white"
                    >
                      <span className="font-semibold mr-2">{option.value}.</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 结果页面 */}
          {gameState === 'result' && (
            <div className="w-full">
              <div className="bg-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                  {/* 报告标题 */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                      <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                      测试报告
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">恋爱占有欲测试</h1>
                    <p className="text-gray-600">你的恋爱占有欲评估结果</p>
                  </div>

                  {/* 总分和等级 */}
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h2 className="text-xl font-medium mb-2">综合得分</h2>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-6xl font-bold">{Math.round((answers.reduce((a, b) => a + b, 0) / 185) * 100)}</span>
                          <span className="text-2xl">%</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                          <span className="font-medium">{getLevel(Math.round((answers.reduce((a, b) => a + b, 0) / 185) * 100)).level}</span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-8 border-white/30 flex items-center justify-center">
                          <div className="text-center">
                                <div className="text-2xl font-bold">{Math.round((answers.reduce((a, b) => a + b, 0) / 185) * 100)}%</div>
                            <div className="text-sm opacity-90">匹配度</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 维度得分 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">控</div>
                          <h3 className="font-semibold text-gray-900">控制欲望</h3>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round((answers.slice(0, 10).reduce((a, b) => a + b, 0) / 50) * 100)}%
                        </div>
                      </div>
                      <div className="bg-blue-100 rounded-full h-3 mb-2">
                        <div
                          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(answers.slice(0, 10).reduce((a, b) => a + b, 0) / 50) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">对伴侣行为的控制倾向</p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">妒</div>
                          <h3 className="font-semibold text-gray-900">嫉妒强度</h3>
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                          {Math.round((answers.slice(10, 20).reduce((a, b) => a + b, 0) / 50) * 100)}%
                        </div>
                      </div>
                      <div className="bg-red-100 rounded-full h-3 mb-2">
                        <div
                          className="bg-red-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(answers.slice(10, 20).reduce((a, b) => a + b, 0) / 50) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">面对竞争威胁的反应程度</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">依</div>
                          <h3 className="font-semibold text-gray-900">情感依赖</h3>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round((answers.slice(20, 30).reduce((a, b) => a + b, 0) / 50) * 100)}%
                        </div>
                      </div>
                      <div className="bg-green-100 rounded-full h-3 mb-2">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(answers.slice(20, 30).reduce((a, b) => a + b, 0) / 50) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">对伴侣的情感需求程度</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">不</div>
                          <h3 className="font-semibold text-gray-900">关系不安全感</h3>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {Math.round((answers.slice(30, 37).reduce((a, b) => a + b, 0) / 35) * 100)}%
                        </div>
                      </div>
                      <div className="bg-yellow-100 rounded-full h-3 mb-2">
                        <div
                          className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(answers.slice(30, 37).reduce((a, b) => a + b, 0) / 35) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">对关系稳定性的担忧程度</p>
                    </div>
                  </div>

                  {/* 详细分析 */}
                  <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <i className="fas fa-chart-line text-purple-600"></i>
                      详细分析
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">控制欲望倾向</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {getDetailedAnalysis('control', Math.round((answers.slice(0, 10).reduce((a, b) => a + b, 0) / 50) * 100))}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">嫉妒情绪表现</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {getDetailedAnalysis('jealousy', Math.round((answers.slice(10, 20).reduce((a, b) => a + b, 0) / 50) * 100))}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">情感依赖程度</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {getDetailedAnalysis('dependency', Math.round((answers.slice(20, 30).reduce((a, b) => a + b, 0) / 50) * 100))}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">关系安全感状态</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {getDetailedAnalysis('insecurity', Math.round((answers.slice(30, 37).reduce((a, b) => a + b, 0) / 35) * 100))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 建议和总结 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <i className="fas fa-lightbulb text-purple-600"></i>
                      专业建议
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5"></div>
                        <p>保持适度的关注和关爱，避免过度干涉对方的个人空间和社交圈</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5"></div>
                        <p>建立健康的沟通机制，坦诚表达自己的感受和需求</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5"></div>
                        <p>培养个人兴趣爱好，保持独立性，不要将全部注意力集中在伴侣身上</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5"></div>
                        <p>学会信任和包容，理解并接受伴侣的合理社交需求</p>
                      </div>
                    </div>
                  </div>

                  {/* 重新测试按钮 */}
                  <div className="text-center">
                    <button
                      onClick={restart}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
                    >
                      重新测试
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto py-0 space-y-16">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="w-full h-[400px]">
              <h2 className="text-xl mb-4 font-semibold">{t("about.title")}</h2>
              <p dangerouslySetInnerHTML={{ __html: t("about.content")?.replace(/\n/g, '<br />') || ''}}></p>
            </div>
            <div className="w-full h-[400px]">
              <h2 className="text-xl mb-4 font-semibold">{t("dimensions.title")}</h2>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">{t("dimensions.control")}</h3>
                  <p className="text-sm text-gray-600">{t("dimensions.controlDesc")}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">{t("dimensions.jealousy")}</h3>
                  <p className="text-sm text-gray-600">{t("dimensions.jealousyDesc")}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">{t("dimensions.dependency")}</h3>
                  <p className="text-sm text-gray-600">{t("dimensions.dependencyDesc")}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">{t("dimensions.insecurity")}</h3>
                  <p className="text-sm text-gray-600">{t("dimensions.insecurityDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmbedDialog
        isOpen={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
        embedUrl={embedUrl}
      />
    </div>
  )
}