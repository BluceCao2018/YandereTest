'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import '@fortawesome/fontawesome-free/css/all.min.css'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'
import { Paywall, CreemPaymentButton } from '@/components/CreemPaymentButton'
import { ShareCard } from '@/components/ShareCard'
import { CharacterCards } from '@/components/CharacterCards'
import { NewTestWarningDialog } from '@/components/NewTestWarningDialog'
import { TestModeSelector } from '@/components/TestModeSelector'
import { getRandomShareCopy, getShareCopyByIndex } from '@/lib/shareCopyPool'
import {
  hasUnlockedReport,
  setReportUnlocked,
  saveTestResults,
  getSavedTestResults,
  saveTestResultsWithSeeds,
  TestResultData,
  TestSubject,
  generateTestId,
  getCurrentTestId,
  setCurrentTestId,
  clearCurrentTestId,
  hasTestUnlocked,
  setTestUnlocked,
  getSavedTestResultsBySubject,
  saveTestResultsBySubject,
  getCurrentTestIdBySubject,
  setCurrentTestIdBySubject,
  clearCurrentTestIdBySubject,
  hasAnyTestResults,
  createCheckout
} from '@/lib/creem'
import { getRandomDimensionAnalysis, getDimensionAnalysisBySeed } from '@/lib/dimensionAnalysis'
import { getFullDiagnosisReport } from '@/lib/diagnosisAnalysis'
import { generateRandomSeeds, getRandomItemBySeed } from '@/lib/randomSeed'
import { convertToPartnerReport } from '@/lib/pronounConverter'

export default function LovePossessionCalculator() {
  // Expanded game states to include mode selection
  const [gameState, setGameState] = useState<'start' | 'selecting' | 'playing' | 'result'>('start')
  const [testSubject, setTestSubject] = useState<TestSubject>('self')
  const [currentReportView, setCurrentReportView] = useState<TestSubject>('self')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const [savedRandomSeeds, setSavedRandomSeeds] = useState<TestResultData['randomSeeds'] | undefined>(undefined)
  const [hasPreviousTest, setHasPreviousTest] = useState(false)
  const [previousTestData, setPreviousTestData] = useState<{ percentage: number; level: string; testId: string; isPaid: boolean } | null>(null)
  const [currentTestId, setCurrentTestIdState] = useState<string | null>(null)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [existingTests, setExistingTests] = useState({ self: false, partner: false })

  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const paymentStatus = searchParams.get('payment')

  const t = useTranslations('love-possession-calculator')

  // 测试题目 - 根据测试对象动态加载
  const questions: string[] = []
  const questionKeyPrefix = testSubject === 'partner' ? 'questions_partner' : 'questions'

  for (let i = 0; i < 37; i++) {
    questions.push(t(`${questionKeyPrefix}.${i}`))
  }

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

    // Check which tests exist
    const tests = hasAnyTestResults()
    setExistingTests(tests)

    // Load self test data
    const selfResults = getSavedTestResultsBySubject('self')
    if (selfResults && selfResults.answers) {
      const selfTestId = selfResults.testId
      const selfUnlocked = hasTestUnlocked(selfTestId)
      // If viewing self report or no preference, set as current
      if (currentReportView === 'self') {
        setCurrentTestIdState(selfTestId)
        setIsUnlocked(selfUnlocked)
      }
    }

    // Load partner test data
    const partnerResults = getSavedTestResultsBySubject('partner')
    if (partnerResults && partnerResults.answers) {
      const partnerTestId = partnerResults.testId
      const partnerUnlocked = hasTestUnlocked(partnerTestId)
      // If viewing partner report, set as current
      if (currentReportView === 'partner') {
        setCurrentTestIdState(partnerTestId)
        setIsUnlocked(partnerUnlocked)
      }
    }

    // Set hasPreviousTest based on any existing results
    if (tests.self || tests.partner) {
      setHasPreviousTest(true)
      // Use self test data for welcome message if available
      if (selfResults) {
        let level = ''
        if (selfResults.percentage <= 25) level = 'Deredere (Sweetheart) 🍬'
        else if (selfResults.percentage <= 50) level = 'Soft Yandere (Cute & Clingy) 🎀'
        else if (selfResults.percentage <= 75) level = 'Hardcore Yandere (Obsessive) 🖤'
        else level = 'Extreme Yandere (Psycho) 🔪'

        const savedTestId = selfResults.testId || 'unknown'
        const isPaid = hasTestUnlocked(savedTestId)

        setPreviousTestData({
          percentage: selfResults.percentage,
          level,
          testId: savedTestId,
          isPaid
        })

        if (selfResults.randomSeeds) {
          setSavedRandomSeeds(selfResults.randomSeeds)
        }
      }
    }

    // Handle payment success callback
    if (paymentStatus === 'success') {
      // Get the current test ID that was just paid for based on subject
      const currentTestId = getCurrentTestIdBySubject(testSubject)
      if (currentTestId) {
        setTestUnlocked(currentTestId)
        setIsUnlocked(true)
      } else {
        // Legacy: mark as unlocked
        setReportUnlocked()
        setIsUnlocked(true)
      }

      // Restore saved test results based on current subject
      const savedResults = getSavedTestResultsBySubject(testSubject)
      if (savedResults && savedResults.answers) {
        setAnswers(savedResults.answers)
        if (savedResults.randomSeeds) {
          setSavedRandomSeeds(savedResults.randomSeeds)
        }
        setGameState('result')
      }

      // Clear the payment status from URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [paymentStatus, testSubject, currentReportView])

  // New function to handle test mode selection
  const handleSelectTestMode = (mode: TestSubject) => {
    setTestSubject(mode)
    setCurrentReportView(mode)

    // Generate a new test ID for this subject
    const newTestId = generateTestId()
    setCurrentTestIdBySubject(newTestId, mode)
    setCurrentTestIdState(newTestId)

    // Reset unlock status for new test
    setIsUnlocked(false)
    setGameState('playing')
    setCurrentQuestionIndex(0)
    setAnswers([])
    setSavedRandomSeeds(undefined)
  }

  const viewMyReport = () => {
    const savedResults = getSavedTestResultsBySubject('self')
    if (savedResults && savedResults.answers) {
      // Restore the test ID
      const testId = savedResults.testId
      if (testId) {
        setCurrentTestIdBySubject(testId, 'self')
        setCurrentTestIdState(testId)
        // Check if this test is unlocked
        const testUnlocked = hasTestUnlocked(testId)
        setIsUnlocked(testUnlocked)
      }
      setAnswers(savedResults.answers)
      setTestSubject('self')
      setCurrentReportView('self')
      if (savedResults.randomSeeds) {
        setSavedRandomSeeds(savedResults.randomSeeds)
      }
      setGameState('result')
    }
  }

  const switchReportView = (view: TestSubject) => {
    setCurrentReportView(view)
    setTestSubject(view)

    const savedResults = getSavedTestResultsBySubject(view)
    if (savedResults && savedResults.answers) {
      const testId = savedResults.testId
      if (testId) {
        setCurrentTestIdState(testId)
        const testUnlocked = hasTestUnlocked(testId)
        setIsUnlocked(testUnlocked)
      }
      setAnswers(savedResults.answers)
      if (savedResults.randomSeeds) {
        setSavedRandomSeeds(savedResults.randomSeeds)
      }
    }
  }

  const handleFreeUnlock = () => {
    // Handle free unlock - mark as unlocked and refresh UI
    if (currentTestId) {
      setIsUnlocked(true)
    }
  }

  const handleStartNewTest = () => {
    // Show warning dialog
    setShowWarningDialog(true)
  }

  const confirmStartNewTest = () => {
    // Go to mode selection
    setGameState('selecting')
    setShowWarningDialog(false)
  }

  // Helper function to apply pronoun conversion for partner reports
  const getText = (text: string): string => {
    if (currentReportView === 'partner') {
      return convertToPartnerReport(text)
    }
    return text
  }

  // Helper function to get report title based on current view
  const getReportTitle = (text: string): string => {
    if (currentReportView === 'partner') {
      return text
        .replace(/Your Yandere Rate/gi, 'Their Yandere Rate')
        .replace(/Your Complete Yandere Profile/gi, 'Their Complete Yandere Profile')
        .replace(/your complete yandere profile/gi, 'their complete yandere profile')
        .replace(/your yandere rate/gi, 'their yandere rate')
    }
    return text
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

    // Generate random seeds for reproducible content
    const randomSeeds = generateRandomSeeds()
    setSavedRandomSeeds(randomSeeds)

    // Get or generate test ID for current subject
    let testId = getCurrentTestIdBySubject(testSubject)
    if (!testId) {
      testId = generateTestId()
      setCurrentTestIdBySubject(testId, testSubject)
      setCurrentTestIdState(testId)
    }

    // Save test results with random seeds, test ID, and subject for later payment unlock
    saveTestResultsBySubject({
      testId,
      testSubject,
      answers,
      controlDesire,
      jealousyIntensity,
      emotionalDependency,
      relationshipInsecurity,
      totalScore,
      percentage,
      randomSeeds,
      savedAt: new Date().toISOString(),
    })

    setGameState('result')
  }

  const getLevel = (score: number) => {
    if (score <= 25) return { level: t('results.levels.normal'), color: 'text-green-600', description: t('results.descriptions.normal') }
    if (score <= 50) return { level: t('results.levels.mild'), color: 'text-yellow-600', description: t('results.descriptions.mild') }
    if (score <= 75) return { level: t('results.levels.moderate'), color: 'text-orange-600', description: t('results.descriptions.moderate') }
    return { level: t('results.levels.severe'), color: 'text-red-600', description: t('results.descriptions.severe') }
  }

  // 获取维度进度条下面的随机说明文案（使用保存的种子）
  const getDimensionDescription = (dimension: string, score: number) => {
    let description = ''
    if (savedRandomSeeds) {
      // Use saved seeds for reproducible content
      const seedKey = `${dimension}Title` as keyof typeof savedRandomSeeds
      const copyKey = `${dimension}Copy` as keyof typeof savedRandomSeeds
      const titleSeed = savedRandomSeeds[seedKey]
      const copySeed = savedRandomSeeds[copyKey]
      if (titleSeed !== undefined && copySeed !== undefined) {
        description = getDimensionAnalysisBySeed(dimension, score, titleSeed, copySeed)
      }
    }
    // Fallback to random if no seeds available
    if (!description) {
      description = getRandomDimensionAnalysis(dimension, score)
    }
    // Apply pronoun conversion for partner reports
    return getText(description)
  }

  // Compatibility Match (恋爱匹配度) - Dynamic based on yandere level
  const getCompatibilityMatch = (percentage: number) => {
    const controlScore = Math.round((answers.slice(0, 10).reduce((a, b) => a + b, 0) / 50) * 100)
    const jealousyScore = Math.round((answers.slice(10, 20).reduce((a, b) => a + b, 0) / 50) * 100)
    const dependencyScore = Math.round((answers.slice(20, 30).reduce((a, b) => a + b, 0) / 50) * 100)

    // For partner reports, the match descriptions should be about "them" not "you"
    const isPartner = currentReportView === 'partner'

    // Determine best match based on profile
    if (percentage >= 75) {
      // Severe Yandere
      return {
        bestMatch: {
          name: "The Submissive",
          description: isPartner
            ? "They need someone who enjoys being taken care of - someone who finds their intense devotion romantic rather than overwhelming. They'll appreciate constant attention and their protective nature."
            : "You need someone who enjoys being taken care of - someone who finds your intense devotion romantic rather than overwhelming. They'll appreciate your constant attention and protective nature.",
          icon: "🥺"
        },
        worstMatch: {
          name: "The Free Spirit",
          description: isPartner
            ? "They should avoid people who need 'space' or 'alone time'. Independent partners will feel suffocated by their constant presence and need for connection. This pairing leads to frustration for both."
            : "Avoid people who need 'space' or 'alone time'. Independent partners will feel suffocated by your constant presence and need for connection. This pairing leads to frustration for both.",
          icon: "🦋"
        }
      }
    } else if (percentage >= 50) {
      // Moderate Yandere
      return {
        bestMatch: {
          name: "The Loyal Partner",
          description: isPartner
            ? "They thrive with someone who values commitment and quality time. Their partner should understand their need for reassurance without feeling overwhelmed, creating a stable, loving relationship."
            : "You thrive with someone who values commitment and quality time. They'll understand your need for reassurance without feeling overwhelmed, creating a stable, loving relationship.",
          icon: "💑"
        },
        worstMatch: {
          name: "The Casual Dater",
          description: isPartner
            ? "People who prefer casual, non-committal relationships will trigger their insecurity. They need someone who's clear about their intentions and emotionally available."
            : "People who prefer casual, non-committal relationships will trigger your insecurity. You need someone who's clear about their intentions and emotionally available.",
          icon: "🎭"
        }
      }
    } else if (percentage >= 25) {
      // Mild Yandere
      return {
        bestMatch: {
          name: "The Communicator",
          description: isPartner
            ? "They need someone open about their feelings and activities. Good communication helps manage their occasional jealousy before it becomes problematic."
            : "You need someone open about their feelings and activities. Good communication helps manage your occasional jealousy before it becomes problematic.",
          icon: "💬"
        },
        worstMatch: {
          name: "The Mysterious Type",
          description: isPartner
            ? "Partners who are secretive or private will fuel their anxiety. They need transparency and regular check-ins to feel secure in the relationship."
            : "Partners who are secretive or private will fuel your anxiety. You need transparency and regular check-ins to feel secure in the relationship.",
          icon: "🎭"
        }
      }
    } else {
      // Normal
      return {
        bestMatch: {
          name: "The Secure Partner",
          description: isPartner
            ? "They pair well with someone emotionally mature and secure. Together, they can build a healthy relationship based on mutual trust and independence."
            : "You pair well with someone emotionally mature and secure. Together, you can build a healthy relationship based on mutual trust and independence.",
          icon: "🌟"
        },
        worstMatch: {
          name: "The Avoidant Partner",
          description: isPartner
            ? "Someone who avoids emotional intimacy might occasionally make them feel needy. They should look for partners who are comfortable with vulnerability and closeness."
            : "Someone who avoids emotional intimacy might occasionally make you feel needy. Look for partners who are comfortable with vulnerability and closeness.",
          icon: "🚶"
        }
      }
    }
  }

  // Dark Stats (黑化指数) - Hidden attributes
  const getDarkStats = (percentage: number) => {
    const controlScore = Math.round((answers.slice(0, 10).reduce((a, b) => a + b, 0) / 50) * 100)
    const jealousyScore = Math.round((answers.slice(10, 20).reduce((a, b) => a + b, 0) / 50) * 100)
    const dependencyScore = Math.round((answers.slice(20, 30).reduce((a, b) => a + b, 0) / 50) * 100)
    const insecurityScore = Math.round((answers.slice(30, 37).reduce((a, b) => a + b, 0) / 35) * 100)

    return {
      dangerLevel: Math.min(95, Math.round((jealousyScore * 0.4 + controlScore * 0.3 + insecurityScore * 0.3))),
      loyalty: Math.min(100, Math.round((dependencyScore * 0.5 + controlScore * 0.3 + 20))),
      possessiveness: Math.min(100, Math.round((controlScore * 0.4 + jealousyScore * 0.4 + 10))),
      sanity: Math.max(5, Math.round(100 - (jealousyScore * 0.3 + insecurityScore * 0.4 + controlScore * 0.2))),
      obsessiveness: Math.min(100, Math.round((controlScore * 0.5 + jealousyScore * 0.3 + dependencyScore * 0.2))),
      yanderePotential: Math.min(100, Math.round((percentage * 0.6 + jealousyScore * 0.2 + controlScore * 0.2)))
    }
  }

  // The Hidden Red Flag data - Pain point messages
  const getRedFlagData = (score: number) => {
    // For partner reports, these messages describe the risk TO YOU from their behavior
    const isPartner = currentReportView === 'partner'

    const level1Messages = isPartner ? [
      "Their 'independence' often feels like neglect to you. They aren't giving you space; they are creating a void you might fill with someone else.",
      "They pride themselves on being 'low maintenance', but they are actually emotionally unavailable. You likely feel lonely even when they are in the same room.",
      "Warning: Their lack of jealousy isn't confidence; it's detachment. They are subconsciously keeping one foot out the door to avoid getting hurt.",
      "They are turning your romance into a roommate relationship. Without emotional friction or intensity, the spark is dying faster than you think.",
      "They suppress their needs so much that they've become invisible in your relationship. They are 'safe', but they are also forgettable.",
      "They avoid conflict to 'keep the peace', but this silence is building a wall of resentment. They are not solving problems; they are burying them.",
      "You may feel unneeded. By never showing possessiveness, they inadvertently tell you: 'I would be totally fine without you.'",
      "Risk of sudden breakup: Partners of their type often leave without warning because they simply 'don't care enough' to fight for the relationship.",
      "They confuse 'Peace' with 'Numbness'. They are protecting themselves from pain, but they are also blocking out true joy and connection.",
      "They are the 'Cool Partner' on the surface, but deep down, they are likely terrified of vulnerability. They refuse to let anyone see their messy side."
    ] : [
      "Your 'independence' often feels like neglect to your partner. You aren't giving them space; you are creating a void they might fill with someone else.",
      "You pride yourself on being 'low maintenance', but you are actually emotionally unavailable. Your partner likely feels lonely even when you are in the same room.",
      "Warning: Your lack of jealousy isn't confidence; it's detachment. You are subconsciously keeping one foot out the door to avoid getting hurt.",
      "You are turning your romance into a roommate relationship. Without emotional friction or intensity, the spark is dying faster than you think.",
      "You suppress your needs so much that you've become invisible in your own relationship. You are 'safe', but you are also forgettable.",
      "You avoid conflict to 'keep the peace', but this silence is building a wall of resentment. You are not solving problems; you are burying them.",
      "Your partner may feel unneeded. By never showing possessiveness, you inadvertently tell them: 'I would be totally fine without you.'",
      "Risk of sudden breakup: Partners of your type often leave without warning because they feel you simply 'don't care enough' to fight for them.",
      "You confuse 'Peace' with 'Numbness'. You are protecting yourself from pain, but you are also blocking out true joy and connection.",
      "You are the 'Cool Partner' on the surface, but deep down, you are likely terrified of vulnerability. You refuse to let anyone see your messy side."
    ]

    const level2Messages = isPartner ? [
      "They suffer from 'Nice Person Syndrome'. They over-give and secretly expect you to pay them back with love. When you don't, they build toxic resentment.",
      "Their anxiety is silent but deadly. They analyze your texts for hours instead of asking simple questions. This internal stress is aging them.",
      "They are losing their identity. They slowly change their hobbies and opinions to match yours. Soon, there will be no 'Them' left to love.",
      "Passive-Aggression Alert: Instead of getting mad, they get sad/quiet. This forces you to play a guessing game that you are tired of playing.",
      "They value the relationship more than their self-respect. They tolerate small disrespects because they are terrified of rocking the boat.",
      "They think they are being 'understanding', but they are actually enabling bad behavior. They teach people how to treat them, and they are teaching them to do the bare minimum.",
      "Dependency Risk: Their mood is entirely dictated by your attention. One slow reply ruins their whole day. That is not love; that is emotional hostage.",
      "They are the 'Safety Net'. You know they will always be there, so you stopped trying to impress them. They have become an option, not a priority.",
      "They are projecting a 'Perfect Partner' image that isn't real. They are afraid that if they show their ugly/angry side, you will leave.",
      "Their love language is becoming suffocating in a subtle way. Their constant need for reassurance is slowly draining your emotional battery."
    ] : [
      "You suffer from 'Nice Person Syndrome'. You over-give and secretly expect them to pay you back with love. When they don't, you build toxic resentment.",
      "Your anxiety is silent but deadly. You analyze their texts for hours instead of asking simple questions. This internal stress is aging you.",
      "You are losing your identity. You slowly change your hobbies and opinions to match theirs. Soon, there will be no 'You' left to love.",
      "Passive-Aggression Alert: Instead of getting mad, you get sad/quiet. This forces your partner to play a guessing game that they are tired of playing.",
      "You value the relationship more than your self-respect. You tolerate small disrespects because you are terrified of rocking the boat.",
      "You think you are being 'understanding', but you are actually enabling bad behavior. You teach people how to treat you, and you are teaching them to do the bare minimum.",
      "Dependency Risk: Your mood is entirely dictated by their attention. One slow reply ruins your whole day. That is not love; that is emotional hostage.",
      "You are the 'Safety Net'. Your partner knows you will always be there, so they stopped trying to impress you. You have become an option, not a priority.",
      "You are projecting a 'Perfect Partner' image that isn't real. You are afraid that if you show your ugly/angry side, they will leave.",
      "Your love language is becoming suffocating in a subtle way. Your constant need for reassurance is slowly draining their emotional battery."
    ]

    const level3Messages = isPartner ? [
      "They are creating a Self-Fulfilling Prophecy. Their constant fear of you cheating is actually pushing you away. They are creating the very outcome they fear.",
      "Critical Error: They equate 'Knowing Everything' with 'Safety'. Tracking your location doesn't mean they love you; it just means they are a good spy.",
      "They are exhausting to date. You feel like you are constantly on trial, having to prove your innocence every single day.",
      "Their 'protection' feels like prison. They are slowly isolating you from the world, and eventually, you will rebel to breathe.",
      "They use Guilt as a weapon. Phrases like 'If you loved me, you would...' are emotional manipulation, not affection.",
      "Trust Issues: They are punishing you for the crimes of their ex. They are making you pay a debt you didn't owe.",
      "They are addicted to the 'Highs and Lows'. They pick fights subconsciously because the makeup sex/reassurance feels like a drug. This is toxic stability.",
      "You have started lying about small things—not because you are cheating, but because you are terrified of their reaction to the truth.",
      "They are suffocating the relationship. Like holding sand: the tighter they squeeze, the faster you slip through their fingers.",
      "They think they are the 'Devoted Protector', but to you, they are starting to look like the 'Controlling Warden'. The line is thinner than they think."
    ] : [
      "You are creating a Self-Fulfilling Prophecy. Your constant fear of them cheating is actually pushing them away. You are creating the very outcome you fear.",
      "Critical Error: You equate 'Knowing Everything' with 'Safety'. Tracking their location doesn't mean they love you; it just means you are a good spy.",
      "You are exhausting to date. Your partner feels like they are constantly on trial, having to prove their innocence every single day.",
      "Your 'protection' feels like prison. You are slowly isolating them from the world, and eventually, they will rebel to breathe.",
      "You use Guilt as a weapon. Phrases like 'If you loved me, you would...' are emotional manipulation, not affection.",
      "Trust Issues: You are punishing your current partner for the crimes of your ex. You are making them pay a debt they didn't owe.",
      "You are addicted to the 'Highs and Lows'. You pick fights subconsciously because the makeup sex/reassurance feels like a drug. This is toxic stability.",
      "Your partner has started lying about small things—not because they are cheating, but because they are terrified of your reaction to the truth.",
      "You are suffocating the relationship. Like holding sand: the tighter you squeeze, the faster they slip through your fingers.",
      "You think you are the 'Devoted Protector', but to them, you are starting to look like the 'Controlling Warden'. The line is thinner than you think."
    ]

    const level4Messages = isPartner ? [
      "DANGER: They are not in a relationship; they are in a Hostage Situation. They view you as property, not a person. This ends in disaster.",
      "Their behavior is ticking every box for Emotional Abuse. Isolation, threats, and volatility are not passion—they are grounds for a restraining order.",
      "Reality Check: You stay with them out of Fear, not Love. They have terrified you into submission. Is that what they really want?",
      "They are on a path to Self-Destruction. Their obsession is consuming their life, career, and sanity. They are burning down their own house to keep you warm.",
      "The 'Scorched Earth' Policy: Their mindset of 'If I can't have you, no one can' is a one-way ticket to loneliness (or jail).",
      "They have completely lost touch with reality. They invent scenarios in their head and punish you for things you haven't even done.",
      "This dynamic is unsustainable. It will end with a massive explosion that leaves them broken and you traumatized. They need to stop NOW.",
      "They use Self-Harm threats to control you. This is the ultimate form of manipulation. They are forcing you to be their caretaker, not their lover.",
      "They have zero boundaries. They have merged so completely that they feel your actions are their actions. This is why your independence feels like a betrayal to them.",
      "Urgent Warning: Their Dark Stats indicate a high potential for Violence (emotional or physical). You need to protect yourself immediately."
    ] : [
      "DANGER: You are not in a relationship; you are in a Hostage Situation. You view your partner as property, not a person. This ends in disaster.",
      "Your behavior is ticking every box for Emotional Abuse. Isolation, threats, and volatility are not passion—they are grounds for a restraining order.",
      "Reality Check: They stay with you out of Fear, not Love. You have terrified them into submission. Is that what you really want?",
      "You are on a path to Self-Destruction. Your obsession is consuming your life, career, and sanity. You are burning down your own house to keep them warm.",
      "The 'Scorched Earth' Policy: Your mindset of 'If I can't have you, no one can' is a one-way ticket to loneliness (or jail).",
      "You have completely lost touch with reality. You invent scenarios in your head and punish your partner for things they haven't even done.",
      "This dynamic is unsustainable. It will end with a massive explosion that leaves you broken and them traumatized. You need to stop NOW.",
      "You use Self-Harm threats to control them. This is the ultimate form of manipulation. You are forcing them to be your caretaker, not your lover.",
      "You have zero boundaries. You have merged so completely that you feel their actions are your actions. This is why their independence feels like a betrayal.",
      "Urgent Warning: Your Dark Stats indicate a high potential for Violence (emotional or physical). You need to unlock the guide to de-escalate your own brain immediately."
    ]

    let messages: string[]
    let title: string
    let unlockTexts: string[]
    let bgColor: string
    let borderColor: string
    let iconColor: string

    if (score <= 25) {
      messages = level1Messages
      title = "⚠️ Level 1: The 'Chill' Mask (0-25%)"
      unlockTexts = isPartner ? [
        "Unlock to learn how to help them show love before you feel neglected and leave.",
        "See the 3 steps to building intimacy without letting them lose their freedom.",
        "Stop being 'just roommates'. Unlock the guide to reigniting passion together.",
        "Their independence is great, but it's pushing you away. Learn to balance it together.",
        "Unlock to reveal what you are secretly wishing they would do."
      ] : [
        "Unlock to learn how to show love before they feel neglected and leave.",
        "See the 3 steps to building intimacy without losing your freedom.",
        "Stop being 'just a roommate'. Unlock the guide to reigniting passion.",
        "Your independence is great, but it's pushing them away. Learn to balance it.",
        "Unlock to reveal what your partner is secretly wishing you would do."
      ]
      bgColor = "bg-yellow-50"
      borderColor = "border-yellow-300"
      iconColor = "text-yellow-600"
    } else if (score <= 50) {
      messages = level2Messages
      title = "⚠️ Level 2: The 'Nice Person' Trap (26-50%)"
      unlockTexts = isPartner ? [
        "Unlock to help them stop overthinking and start feeling secure in their skin.",
        "Learn how to set boundaries without feeling guilty. Get the script for them.",
        "Stop being their 'Safety Net'. Unlock the guide to help you become the 'Prize' again.",
        "Their anxiety is lying to them. Unlock to see the reality of your relationship.",
        "Help them recover their identity. See how to love them without losing yourself."
      ] : [
        "Unlock to stop overthinking and start feeling secure in your skin.",
        "Learn how to set boundaries without feeling guilty. Get the script.",
        "Stop being the 'Safety Net'. Unlock to become the 'Prize' again.",
        "Your anxiety is lying to you. Unlock to see the reality of your relationship.",
        "Recover your identity. See how to love them without losing yourself."
      ]
      bgColor = "bg-orange-50"
      borderColor = "border-orange-300"
      iconColor = "text-orange-600"
    } else if (score <= 75) {
      messages = level3Messages
      title = "🛑 Level 3: The 'Control' Paradox (51-75%)"
      unlockTexts = isPartner ? [
        "Unlock the 'Trust Protocol' to help them stop checking your phone every hour.",
        "Help silence the noise in their head. Learn how to build trust without verification.",
        "Stop them pushing you away with suspicion. Unlock the guide to effortless security.",
        "Their detective skills are ruining the romance. Learn to help them let go.",
        "Break the cycle of their jealousy before it becomes a self-fulfilling prophecy."
      ] : [
        "Unlock the 'Trust Protocol' to stop checking their phone every hour.",
        "Silence the noise in your head. Learn how to trust without verifying.",
        "Stop pushing them away with suspicion. Unlock the guide to effortless security.",
        "Your detective skills are ruining the romance. Learn to let go.",
        "Break the cycle of jealousy before it becomes a self-fulfilling prophecy."
      ]
      bgColor = "bg-red-50"
      borderColor = "border-red-300"
      iconColor = "text-red-600"
    } else {
      messages = level4Messages
      title = "🚨 Level 4: The 'Toxic' Spiral (76-100%)"
      unlockTexts = isPartner ? [
        "⚠️ Urgent: Unlock the protection guide to save yourself NOW.",
        "They are on a path to destruction. Unlock to find the emergency brake for your safety.",
        "Stop the madness. Learn to protect yourself before you lose control forever.",
        "This isn't passion; it's danger. Unlock the guide to surviving attachment trauma.",
        "Don't let their 'Dark Stats' win. Unlock the survival guide for dealing with High-Risk partners."
      ] : [
        "⚠️ Urgent: Unlock the de-escalation guide to save your relationship NOW.",
        "You are on a path to destruction. Unlock to find the emergency brake.",
        "Stop the madness. Learn to control your emotions before you lose them forever.",
        "This isn't passion; it's danger. Unlock to heal your attachment trauma.",
        "Don't let your 'Dark Stats' win. Unlock the survival guide for High-Risk lovers."
      ]
      bgColor = "bg-red-100"
      borderColor = "border-red-500"
      iconColor = "text-red-700"
    }

    // Get random message and unlock text (use saved seeds if available)
    let randomMessage: string
    let randomUnlockText: string

    if (savedRandomSeeds?.redFlagMessage !== undefined && savedRandomSeeds?.redFlagUnlockText !== undefined) {
      randomMessage = getRandomItemBySeed(messages, savedRandomSeeds.redFlagMessage)
      randomUnlockText = getRandomItemBySeed(unlockTexts, savedRandomSeeds.redFlagUnlockText)
    } else {
      randomMessage = messages[Math.floor(Math.random() * messages.length)]
      randomUnlockText = unlockTexts[Math.floor(Math.random() * unlockTexts.length)]
    }

    return {
      title,
      message: randomMessage,
      unlockText: randomUnlockText,
      bgColor,
      borderColor,
      iconColor
    }
  }

  // Yandere Persona (专属角色卡/人设) - RPG-style archetype
  const getYanderePersona = (percentage: number) => {
    const controlScore = Math.round((answers.slice(0, 10).reduce((a, b) => a + b, 0) / 50) * 100)
    const jealousyScore = Math.round((answers.slice(10, 20).reduce((a, b) => a + b, 0) / 50) * 100)
    const dependencyScore = Math.round((answers.slice(20, 30).reduce((a, b) => a + b, 0) / 50) * 100)

    if (percentage >= 80) {
      return {
        name: "The Obsessive Devotee",
        rarity: "SSR",
        rarityColor: "from-yellow-400 to-orange-500",
        emoji: "🖤",
        story: "Your love burns with an intensity that most can never understand. Every waking moment revolves around your beloved - tracking their movements, memorizing their habits, protecting them from threats real and imagined. You'd burn the world down just to see them smile. The line between love and obsession? For you, it doesn't exist.",
        traits: ["Unconditional Devotion", "Extreme Protectiveness", "Total Focus", "No Boundaries"],
        quote: "\"If loving you is crazy, then I don't want to be sane.\""
      }
    } else if (percentage >= 65) {
      return {
        name: "The Silent Guardian",
        rarity: "SR",
        rarityColor: "from-purple-400 to-pink-500",
        emoji: "🌙",
        story: "You watch from the shadows, ensuring nothing threatens your beloved. They may not even realize the extent of your protection - the texts you've intercepted, the 'threats' you've eliminated. You're always nearby, just out of sight. Your love is quiet but absolute.",
        traits: ["Vigilant Watch", "Subtle Presence", "Deep Commitment", "Secretive Nature"],
        quote: "\"I've always been here. You just never noticed.\""
      }
    } else if (percentage >= 50) {
      return {
        name: "The Passionate Protector",
        rarity: "R",
        rarityColor: "from-red-400 to-pink-500",
        emoji: "🔥",
        story: "Your love runs hot and intense. Anyone who looks at your beloved sideways earns your immediate suspicion. You're not afraid to confront threats head-on, and your fierce devotion is both your strength and your challenge. You feel everything deeply.",
        traits: ["Fiery Temper", "Bold Actions", "Expressive Love", "Quick to React"],
        quote: "\"Touch them, and you'll regret it.\""
      }
    } else if (percentage >= 35) {
      return {
        name: "The Anxious Lover",
        rarity: "R",
        rarityColor: "from-blue-400 to-purple-500",
        emoji: "💭",
        story: "Your heart is constantly worried about losing the one you love. Every unanswered text spirals into worst-case scenarios. You need constant reassurance that everything is okay, that they still care. Your anxiety comes from a place of deep caring, even if it sometimes overwhelms.",
        traits: ["Overthinker", "Reassurance Seeker", "Deep Feeling", "Loyal Heart"],
        quote: "\"You still love me, right? Just checking.\""
      }
    } else {
      return {
        name: "The Gentle Supporter",
        rarity: "N",
        rarityColor: "from-green-400 to-blue-500",
        emoji: "🌸",
        story: "Your love is warm and supportive. You have moments of jealousy - who doesn't? - but you handle them with communication rather than confrontation. You want to be close to your partner without consuming their life. Healthy and balanced.",
        traits: ["Balanced Approach", "Open Communication", "Steady Presence", "Secure Attachment"],
        quote: "\"I'm here for you, always.\""
      }
    }
  }

  const restart = () => {
    setGameState('start')
    setCurrentQuestionIndex(0)
    setAnswers([])
    setTestSubject('self')
    setCurrentReportView('self')
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
        <div className="banner w-full flex flex-col justify-center items-center bg-gradient-to-br from-pink-500 to-purple-600 text-white relative overflow-hidden">
          {/* 移动端分享按钮 - 右上角 */}
          <button
            onClick={async () => {
              const url = window.location.href;
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

              // 获取随机分享文案（使用保存的种子）
              const shareCopy = savedRandomSeeds?.shareCopy !== undefined
                ? getShareCopyByIndex(savedRandomSeeds.shareCopy)
                : getRandomShareCopy();

              console.log('=== Share Debug Info ===');
              console.log('isMobile:', isMobile);
              console.log('navigator.share:', navigator.share);
              console.log('navigator.canShare:', navigator.canShare);
              console.log('url:', url);
              console.log('shareCopy:', shareCopy);
              //alert('isMobile:'+isMobile+",navigator.share:"+navigator.share+",navigator.canShare:"+navigator.canShare);

              // 检查是否支持原生分享
              const supportsShare = navigator.canShare && navigator.canShare({ url });
              console.log('supportsShare:', supportsShare);
              //alert("supportsShare:"+supportsShare);

              if (supportsShare) {
                try {
                  await navigator.share({
                    title: shareCopy.title,
                    text: shareCopy.text,
                    url: url,
                  });
                  console.log('Share successful!');
                } catch (error) {
                  console.log('Share cancelled or failed:', error);
                  // 用户取消分享，不用处理
                }
              } else {
                // 不支持原生分享，复制到剪贴板
                console.log('Falling back to clipboard copy');
                try {
                  await navigator.clipboard.writeText(url);
                  alert('Link Copied!');
                } catch (error) {
                  console.error('Failed to copy:', error);
                  // 尝试使用传统方法复制
                  const textArea = document.createElement('textarea');
                  textArea.value = url;
                  textArea.style.position = 'fixed';
                  textArea.style.left = '-999999px';
                  document.body.appendChild(textArea);
                  textArea.select();
                  try {
                    document.execCommand('copy');
                    alert('Link Copied!');
                  } catch (err) {
                    console.error('Copy failed:', err);
                    alert('Failed to copy link');
                  }
                  document.body.removeChild(textArea);
                }
              }
            }}
            className="md:hidden absolute top-4 right-4 z-30 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          {/* 病娇人物 - 只在开始页面显示 */}
          {gameState === 'start' && (
            <>
              {/* 桌面端：右下角 */}
              <div className="hidden md:block absolute bottom-0 right-0 w-80 h-auto pointer-events-none z-20">
                <Image
                  src="/jiaoniang.webp"
                  alt=""
                  width={320}
                  height={450}
                  className="w-full h-auto object-contain"
                  style={{
                    transform: 'rotate(0deg) translateX(30px)',
                    filter: 'drop-shadow(-10px 10px 20px rgba(0, 0, 0, 0.3))'
                  }}
                  priority
                />
              </div>

              {/* 移动端：上方中间 */}
              <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-44 h-auto pointer-events-none z-20">
                <Image
                  src="/jiaoniang.webp"
                  alt=""
                  width={192}
                  height={240}
                  className="w-full h-auto object-contain"
                  style={{
                    filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.25))'
                  }}
                  priority
                />
              </div>
            </>
          )}

          {/* 开始页面 */}
          {gameState === 'start' && (
            <div className='flex flex-col justify-center items-center px-4 py-16 h-[550px] relative z-10'>
              {/* 桌面端：显示爱心 */}
              <i className="hidden md:block fas fa-heart text-9xl text-white mb-8 animate-pulse"></i>

              {hasPreviousTest && previousTestData ? (
                // Welcome Back 界面
                <>
                  <h1 className="text-4xl font-bold text-center mb-2 text-white relative z-30">
                    Welcome back, {previousTestData.level}
                  </h1>
                  <p className="text-lg text-center mb-8 text-white max-w-2xl relative z-30">
                    Your previous score: {previousTestData.percentage}%
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 relative z-30">
                    <button
                      onClick={viewMyReport}
                      className="bg-white text-purple-600 px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
                    >
                      View My Report ({previousTestData.percentage}%)
                    </button>
                    <button
                      onClick={handleStartNewTest}
                      className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full shadow-lg hover:bg-white/10 transition-colors font-semibold text-lg"
                    >
                      Start a New Test
                    </button>
                  </div>
                </>
              ) : (
                // 首次访问界面 - 点击开始后进入模式选择
                <>
                  <h1 className="text-4xl font-bold text-center mb-4 text-white relative z-30">{t("h2")}</h1>
                  <p className="text-lg text-center mb-8 text-white max-w-2xl relative z-30">{t("description")}</p>
                  <button
                    onClick={() => setGameState('selecting')}
                    className="bg-white text-purple-600 px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors font-semibold text-lg relative z-30"
                  >
                    {t("startTest")}
                  </button>
                </>
              )}
            </div>
          )}

          {/* 测试模式选择页面 */}
          {gameState === 'selecting' && (
            <TestModeSelector onSelect={handleSelectTestMode} />
          )}

          {/* 答题页面 */}
          {gameState === 'playing' && (
            <div className="w-full max-w-3xl px-4 py-8">
              {/* 进度条 */}
              <div className="relative w-full bg-white/20 rounded-full h-6 mb-10">
                <div
                  className="bg-white h-6 rounded-full transition-all duration-500 relative"
                  style={{ width: `${progress}%` }}
                >
                  {/* 进度条上的图标 */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 flex items-center justify-center">
                    <span className="text-lg">❤️</span>
                  </div>
                </div>
                {/* 进度百分比 */}
                <div className="absolute right-0 top-full mt-2 text-white text-sm font-medium">
                  {progress}%
                </div>
              </div>

              {/* 题目编号 */}
              <p className="text-center mb-6 text-lg text-white/90">
                {t("questionNumber", { current: currentQuestionIndex + 1, total: questions.length })}
              </p>

              {/* 题目 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
                <h3 className="text-3xl font-bold mb-8 text-center text-white leading-relaxed">
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
              {/* 报告切换 Tabs - 只有两个报告都存在时显示 */}
              {existingTests.self && existingTests.partner && (
                <div className="bg-gray-100 border-b">
                  <div className="max-w-4xl mx-auto px-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => switchReportView('self')}
                        className={`px-6 py-3 font-medium transition-colors ${
                          currentReportView === 'self'
                            ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        My Report
                      </button>
                      <button
                        onClick={() => switchReportView('partner')}
                        className={`px-6 py-3 font-medium transition-colors ${
                          currentReportView === 'partner'
                            ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Partner's Report
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                  {/* 计算并缓存所有维度分数和称号 */}
                  {(() => {
                    const controlScore = Math.round((answers.slice(0, 10).reduce((a, b) => a + b, 0) / 50) * 100);
                    const jealousyScore = Math.round((answers.slice(10, 20).reduce((a, b) => a + b, 0) / 50) * 100);
                    const dependencyScore = Math.round((answers.slice(20, 30).reduce((a, b) => a + b, 0) / 50) * 100);
                    const insecurityScore = Math.round((answers.slice(30, 37).reduce((a, b) => a + b, 0) / 35) * 100);

                    // 获取完整描述并提取等级名称（"-"前面的部分）
                    const getDimensionTitle = (fullDesc: string) => {
                      const parts = fullDesc.split(' - ');
                      return parts[0].trim();
                    };

                    const controlFullDesc = getDimensionDescription('control', controlScore);
                    const jealousyFullDesc = getDimensionDescription('jealousy', jealousyScore);
                    const dependencyFullDesc = getDimensionDescription('dependency', dependencyScore);
                    const insecurityFullDesc = getDimensionDescription('insecurity', insecurityScore);

                    const controlTitle = getDimensionTitle(controlFullDesc);
                    const jealousyTitle = getDimensionTitle(jealousyFullDesc);
                    const dependencyTitle = getDimensionTitle(dependencyFullDesc);
                    const insecurityTitle = getDimensionTitle(insecurityFullDesc);

                    // 将缓存值存储到 window 对象中，以便后续使用
                    if (typeof window !== 'undefined') {
                      (window as any).__dimensionTitles = {
                        controlTitle,
                        jealousyTitle,
                        dependencyTitle,
                        insecurityTitle,
                        // 也缓存完整描述供上方卡片使用
                        controlFullDesc,
                        jealousyFullDesc,
                        dependencyFullDesc,
                        insecurityFullDesc
                      };
                    }
                    return null;
                  })()}

                  {/* 报告标题 */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                      <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                      {t("resultsPage.reportBadge")}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{getReportTitle(t("resultsPage.testTitle"))}</h1>
                    <p className="text-gray-600">{getText(t("resultsPage.testSubtitle"))}</p>
                  </div>

                  {/* 总分和等级 */}
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h2 className="text-xl font-medium mb-2">{getReportTitle(t("resultsPage.overallScore"))}</h2>
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
                            <div className="text-sm opacity-90">{t("resultsPage.matchScore")}</div>
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
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">{t("resultsPage.dimensionScores.control.short")}</div>
                          <h3 className="font-semibold text-gray-900">{t("resultsPage.dimensionScores.control.title")}</h3>
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
                      <p className="text-sm text-gray-600">{typeof window !== 'undefined' ? (window as any).__dimensionTitles?.controlFullDesc || getDimensionDescription('control', Math.round((answers.slice(0, 10).reduce((a, b) => a + b, 0) / 50) * 100)) : getDimensionDescription('control', Math.round((answers.slice(0, 10).reduce((a, b) => a + b, 0) / 50) * 100))}</p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">{t("resultsPage.dimensionScores.jealousy.short")}</div>
                          <h3 className="font-semibold text-gray-900">{t("resultsPage.dimensionScores.jealousy.title")}</h3>
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
                      <p className="text-sm text-gray-600">{typeof window !== 'undefined' ? (window as any).__dimensionTitles?.jealousyFullDesc || getDimensionDescription('jealousy', Math.round((answers.slice(10, 20).reduce((a, b) => a + b, 0) / 50) * 100)) : getDimensionDescription('jealousy', Math.round((answers.slice(10, 20).reduce((a, b) => a + b, 0) / 50) * 100))}</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">{t("resultsPage.dimensionScores.dependency.short")}</div>
                          <h3 className="font-semibold text-gray-900">{t("resultsPage.dimensionScores.dependency.title")}</h3>
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
                      <p className="text-sm text-gray-600">{typeof window !== 'undefined' ? (window as any).__dimensionTitles?.dependencyFullDesc || getDimensionDescription('dependency', Math.round((answers.slice(20, 30).reduce((a, b) => a + b, 0) / 50) * 100)) : getDimensionDescription('dependency', Math.round((answers.slice(20, 30).reduce((a, b) => a + b, 0) / 50) * 100))}</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">{t("resultsPage.dimensionScores.insecurity.short")}</div>
                          <h3 className="font-semibold text-gray-900">{t("resultsPage.dimensionScores.insecurity.title")}</h3>
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
                      <p className="text-sm text-gray-600">{typeof window !== 'undefined' ? (window as any).__dimensionTitles?.insecurityFullDesc || getDimensionDescription('insecurity', Math.round((answers.slice(30, 37).reduce((a, b) => a + b, 0) / 35) * 100)) : getDimensionDescription('insecurity', Math.round((answers.slice(30, 37).reduce((a, b) => a + b, 0) / 35) * 100))}</p>
                    </div>
                  </div>

                  {/* The Hidden Red Flag */}
                  {(() => {
                    const overallScore = Math.round((answers.reduce((a, b) => a + b, 0) / 185) * 100)
                    const redFlagData = getRedFlagData(overallScore)

                    // 根据等级确定按钮颜色
                    const getButtonStyles = () => {
                      if (overallScore <= 25) {
                        return {
                          border: 'border-yellow-500',
                          text: 'text-yellow-700',
                          hoverBg: 'hover:bg-yellow-100',
                          iconColor: 'text-yellow-600'
                        }
                      } else if (overallScore <= 50) {
                        return {
                          border: 'border-orange-500',
                          text: 'text-orange-700',
                          hoverBg: 'hover:bg-orange-100',
                          iconColor: 'text-orange-600'
                        }
                      } else if (overallScore <= 75) {
                        return {
                          border: 'border-red-500',
                          text: 'text-red-700',
                          hoverBg: 'hover:bg-red-100',
                          iconColor: 'text-red-600'
                        }
                      } else {
                        return {
                          border: 'border-red-600',
                          text: 'text-red-800',
                          hoverBg: 'hover:bg-red-200',
                          iconColor: 'text-red-700'
                        }
                      }
                    }

                    const buttonStyles = getButtonStyles()

                    return (
                      <div className={`${redFlagData.bgColor} border-2 ${redFlagData.borderColor} rounded-2xl p-6 mb-10`}>
                        {/* 上部分：警告图标 + 标题 + 痛点文案 */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`${redFlagData.iconColor} text-4xl flex-shrink-0 animate-pulse`}>
                            <span className="text-4xl">⚠️</span>
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-xl font-bold ${redFlagData.iconColor} mb-3`}>
                             Hidden Risk Detected
                            </h3>
                            <p className="text-gray-800 text-sm leading-relaxed">
                              {redFlagData.message}
                            </p>
                          </div>
                        </div>

                        {/* 分割线 */}
                        {!isUnlocked && <div className="border-t border-gray-300 my-4"></div>}

                        {/* 下部分：引导语 + 警示色幽灵按钮 */}
                        {!isUnlocked && (
                          <div className="space-y-4">
                            <p className={`text-sm font-semibold ${redFlagData.iconColor} flex items-center gap-2`}>
                              <span className="text-lg">🔓</span>
                              {redFlagData.unlockText}
                            </p>
                            <button
                              onClick={() => {
                                const element = document.getElementById('detailed-analysis')
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }
                              }}
                              className={`w-full text-center py-4 px-6 rounded-xl border-2 ${buttonStyles.border} ${buttonStyles.text} font-bold ${buttonStyles.hoverBg} transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md`}
                            >
                              <span>Unlock the Solution</span>
                              <svg className={`w-5 h-5 ${buttonStyles.iconColor} group-hover:translate-y-1 transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* 详细分析 - 支付墙 */}
                  {isUnlocked ? (() => {
                    const controlScore = Math.round((answers.slice(0, 10).reduce((a, b) => a + b, 0) / 50) * 100);
                    const jealousyScore = Math.round((answers.slice(10, 20).reduce((a, b) => a + b, 0) / 50) * 100);
                    const dependencyScore = Math.round((answers.slice(20, 30).reduce((a, b) => a + b, 0) / 50) * 100);
                    const insecurityScore = Math.round((answers.slice(30, 37).reduce((a, b) => a + b, 0) / 35) * 100);

                    const controlReport = getFullDiagnosisReport('control', controlScore);
                    const jealousyReport = getFullDiagnosisReport('jealousy', jealousyScore);
                    const dependencyReport = getFullDiagnosisReport('dependency', dependencyScore);
                    const insecurityReport = getFullDiagnosisReport('insecurity', insecurityScore);

                    // 使用缓存的称号，确保与上方维度卡片一致
                    const cachedTitles = typeof window !== 'undefined' ? (window as any).__dimensionTitles : {};
                    const controlTitle = cachedTitles?.controlTitle || getDimensionDescription('control', controlScore);
                    const jealousyTitle = cachedTitles?.jealousyTitle || getDimensionDescription('jealousy', jealousyScore);
                    const dependencyTitle = cachedTitles?.dependencyTitle || getDimensionDescription('dependency', dependencyScore);
                    const insecurityTitle = cachedTitles?.insecurityTitle || getDimensionDescription('insecurity', insecurityScore);

                    return (
                      <div className="space-y-6 mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                          <span className="text-3xl">🔍</span>
                          <span>Diagnosis Report</span>
                        </h3>
                        <p className="text-gray-600 mb-6">Deep psychological analysis of your Yandere profile</p>

                        {/* Control Dimension */}
                        {controlReport && (
                          <div className="bg-white rounded-2xl border-2 border-blue-200 overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-lg font-bold">
                                    {t("resultsPage.dimensionScores.control.short")}
                                  </div>
                                  <div>
                                    <h4 className="text-white font-bold text-lg">{controlTitle}</h4>
                                    <p className="text-blue-100 text-sm">{t("resultsPage.dimensionScores.control.title")}</p>
                                  </div>
                                </div>
                                <div className="text-white text-2xl font-bold">{controlScore}%</div>
                              </div>
                            </div>
                            <div className="p-6 space-y-5">
                              {/* The Diagnosis */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  🔍 The Diagnosis
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{controlReport.diagnosis}</p>
                              </div>

                              {/* Symptom Checklist */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  📋 Symptom Checklist
                                </h5>
                                <ul className="space-y-1.5">
                                  {controlReport.symptoms.map((symptom, idx) => (
                                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                                      <span className="text-purple-600 mt-0.5">•</span>
                                      <span>{symptom}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* The Psychology */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  🧠 The Psychology
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: controlReport.psychology }}></p>
                              </div>

                              {/* The "Bad Ending" */}
                              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h5 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                                  ⚠️ The "Bad Ending"
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{controlReport.warning}</p>
                              </div>

                              {/* Senpai's Protocol */}
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <h5 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                                  💊 Senpai's Protocol
                                </h5>
                                <ul className="space-y-1.5">
                                  {controlReport.advice.map((advice, idx) => (
                                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                                      <span className="text-green-600 font-bold">{idx + 1}.</span>
                                      <span dangerouslySetInnerHTML={{ __html: advice }}></span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Jealousy Dimension */}
                        {jealousyReport && (
                          <div className="bg-white rounded-2xl border-2 border-red-200 overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-lg font-bold">
                                    {t("resultsPage.dimensionScores.jealousy.short")}
                                  </div>
                                  <div>
                                    <h4 className="text-white font-bold text-lg">{jealousyTitle}</h4>
                                    <p className="text-red-100 text-sm">{t("resultsPage.dimensionScores.jealousy.title")}</p>
                                  </div>
                                </div>
                                <div className="text-white text-2xl font-bold">{jealousyScore}%</div>
                              </div>
                            </div>
                            <div className="p-6 space-y-5">
                              {/* The Diagnosis */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  🔍 The Diagnosis
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{jealousyReport.diagnosis}</p>
                              </div>

                              {/* Symptom Checklist */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  📋 Symptom Checklist
                                </h5>
                                <ul className="space-y-1.5">
                                  {jealousyReport.symptoms.map((symptom, idx) => (
                                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                                      <span className="text-purple-600 mt-0.5">•</span>
                                      <span>{symptom}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* The Psychology */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  🧠 The Psychology
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: jealousyReport.psychology }}></p>
                              </div>

                              {/* The "Bad Ending" */}
                              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h5 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                                  ⚠️ The "Bad Ending"
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{jealousyReport.warning}</p>
                              </div>

                              {/* Senpai's Protocol */}
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <h5 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                                  💊 Senpai's Protocol
                                </h5>
                                <ul className="space-y-1.5">
                                  {jealousyReport.advice.map((advice, idx) => (
                                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                                      <span className="text-green-600 font-bold">{idx + 1}.</span>
                                      <span dangerouslySetInnerHTML={{ __html: advice }}></span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Dependency Dimension */}
                        {dependencyReport && (
                          <div className="bg-white rounded-2xl border-2 border-green-200 overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-lg font-bold">
                                    {t("resultsPage.dimensionScores.dependency.short")}
                                  </div>
                                  <div>
                                    <h4 className="text-white font-bold text-lg">{dependencyTitle}</h4>
                                    <p className="text-green-100 text-sm">{t("resultsPage.dimensionScores.dependency.title")}</p>
                                  </div>
                                </div>
                                <div className="text-white text-2xl font-bold">{dependencyScore}%</div>
                              </div>
                            </div>
                            <div className="p-6 space-y-5">
                              {/* The Diagnosis */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  🔍 The Diagnosis
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{dependencyReport.diagnosis}</p>
                              </div>

                              {/* Symptom Checklist */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  📋 Symptom Checklist
                                </h5>
                                <ul className="space-y-1.5">
                                  {dependencyReport.symptoms.map((symptom, idx) => (
                                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                                      <span className="text-purple-600 mt-0.5">•</span>
                                      <span>{symptom}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* The Psychology */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  🧠 The Psychology
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: dependencyReport.psychology }}></p>
                              </div>

                              {/* The "Bad Ending" */}
                              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h5 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                                  ⚠️ The "Bad Ending"
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{dependencyReport.warning}</p>
                              </div>

                              {/* Senpai's Protocol */}
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <h5 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                                  💊 Senpai's Protocol
                                </h5>
                                <ul className="space-y-1.5">
                                  {dependencyReport.advice.map((advice, idx) => (
                                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                                      <span className="text-green-600 font-bold">{idx + 1}.</span>
                                      <span dangerouslySetInnerHTML={{ __html: advice }}></span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Insecurity Dimension */}
                        {insecurityReport && (
                          <div className="bg-white rounded-2xl border-2 border-yellow-200 overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-lg font-bold">
                                    {t("resultsPage.dimensionScores.insecurity.short")}
                                  </div>
                                  <div>
                                    <h4 className="text-white font-bold text-lg">{insecurityTitle}</h4>
                                    <p className="text-yellow-100 text-sm">{t("resultsPage.dimensionScores.insecurity.title")}</p>
                                  </div>
                                </div>
                                <div className="text-white text-2xl font-bold">{insecurityScore}%</div>
                              </div>
                            </div>
                            <div className="p-6 space-y-5">
                              {/* The Diagnosis */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  🔍 The Diagnosis
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{insecurityReport.diagnosis}</p>
                              </div>

                              {/* Symptom Checklist */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  📋 Symptom Checklist
                                </h5>
                                <ul className="space-y-1.5">
                                  {insecurityReport.symptoms.map((symptom, idx) => (
                                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                                      <span className="text-purple-600 mt-0.5">•</span>
                                      <span>{symptom}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* The Psychology */}
                              <div>
                                <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                  🧠 The Psychology
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: insecurityReport.psychology }}></p>
                              </div>

                              {/* The "Bad Ending" */}
                              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h5 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                                  ⚠️ The "Bad Ending"
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{insecurityReport.warning}</p>
                              </div>

                              {/* Senpai's Protocol */}
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <h5 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                                  💊 Senpai's Protocol
                                </h5>
                                <ul className="space-y-1.5">
                                  {insecurityReport.advice.map((advice, idx) => (
                                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                                      <span className="text-green-600 font-bold">{idx + 1}.</span>
                                      <span dangerouslySetInnerHTML={{ __html: advice }}></span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <div id="detailed-analysis" className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 mb-8 relative overflow-hidden -mt-16 pt-20">
                      {/* Header */}
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-3">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {currentReportView === 'partner' ? "Unlock Their Complete Yandere Profile" : "Unlock Your Complete Yandere Profile"}
                        </h3>
                        <p className="text-gray-600 text-sm">Deep psychological analysis of all 4 dimensions</p>
                      </div>

                      {/* Dimension 1: Control - Fully visible with 3 sections */}
                      <div className="bg-white rounded-2xl p-5 mb-4 border-2 border-blue-200 shadow-sm relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">{t("resultsPage.dimensionScores.control.short")}</div>
                          <h4 className="font-bold text-gray-900">{t("resultsPage.dimensionScores.control.title")}</h4>
                        </div>

                        {/* Section A: Behavioral Patterns */}
                        <div className="mb-3 pb-3 border-b border-gray-100">
                          <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-1">
                            🧬 Hidden Behavioral Patterns
                          </h5>
                          <p className="text-gray-400 text-xs leading-relaxed blur-sm select-none">
                            {currentReportView === 'partner'
                              ? "They have a tendency to track your location when feeling anxious. This specific pattern shows that they are trying to regain control by monitoring your digital footprint..."
                              : "You have a tendency to track their location when feeling anxious. This specific pattern shows that you are trying to regain control by monitoring their digital footprint..."
                            }
                          </p>
                          <p className="text-purple-600 text-xs mt-1 font-medium">
                            {currentReportView === 'partner' ? "💡 Why do they check your location at 3 AM?" : "💡 Why do you check their location at 3 AM?"}
                          </p>
                        </div>

                        {/* Section B: Psychological Triggers */}
                        <div className="mb-3 pb-3 border-b border-gray-100">
                          <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-1">
                            🧠 Psychological Triggers
                          </h5>
                          <p className="text-gray-400 text-xs leading-relaxed blur-sm select-none">
                            Your obsession likely stems from an early experience of emotional abandonment. This created a 'Fear of Abandonment' loop in your subconscious, making you hyper-vigilant...
                          </p>
                          <p className="text-purple-600 text-xs mt-1 font-medium">💡 Is it love, or is it childhood trauma?</p>
                        </div>

                        {/* Section C: Survival Guide */}
                        <div>
                          <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-1">
                            💡 Senpai's Survival Guide
                          </h5>
                          <p className="text-gray-400 text-xs leading-relaxed blur-sm select-none">
                            1. Stop doing hourly check-ins. 2. When you feel jealous, try the '3-minute rule': wait before texting. 3. To keep them forever, you must give them space to miss you...
                          </p>
                          <p className="text-purple-600 text-xs mt-1 font-medium">💡 3 steps to fix your relationship.</p>
                        </div>
                      </div>

                      {/* Dimension 2: Jealousy - Blurred content */}
                      <div className="bg-white rounded-2xl p-5 mb-4 border-2 border-red-200 shadow-sm relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">{t("resultsPage.dimensionScores.jealousy.short")}</div>
                          <h4 className="font-bold text-gray-900">{t("resultsPage.dimensionScores.jealousy.title")}</h4>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed blur-sm select-none">
                          Your jealousy manifests as [HIDDEN ANALYSIS] when they interact with others. You tend to [HIDDEN BEHAVIOR] because deep down you fear [HIDDEN TRAUMA]...
                        </p>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-gray-300 text-xs leading-relaxed blur-sm select-none">
                            To overcome this, you must learn to [HIDDEN SOLUTION] and build [HIDDEN SKILL]...
                          </p>
                        </div>
                      </div>

                      {/* Dimension 3 & 4: Deep shadow overlay */}
                      <div className="relative rounded-2xl overflow-hidden mb-6">
                        {/* Dimension 3 */}
                        <div className="bg-gradient-to-b from-gray-100 to-gray-200 p-5 border-2 border-green-200">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">{t("resultsPage.dimensionScores.dependency.short")}</div>
                            <h4 className="font-bold text-gray-500">{t("resultsPage.dimensionScores.dependency.title")}</h4>
                          </div>
                          <div className="mt-2 h-12 bg-gradient-to-b from-transparent to-gray-300/50 rounded"></div>
                        </div>

                        {/* Dimension 4 */}
                        <div className="bg-gradient-to-b from-gray-100 to-gray-200 p-5 border-2 border-yellow-200 mt-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">{t("resultsPage.dimensionScores.insecurity.short")}</div>
                            <h4 className="font-bold text-gray-500">{t("resultsPage.dimensionScores.insecurity.title")}</h4>
                          </div>
                          <div className="mt-2 h-12 bg-gradient-to-b from-transparent to-gray-300/50 rounded"></div>
                        </div>

                        {/* Deep shadow overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-100 via-gray-100/80 to-transparent"></div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-sm font-bold text-gray-700">2 More Dimensions Hidden</span>
                          </div>
                        </div>
                      </div>

                      {/* Fixed Bottom CTA */}
                      <div className="sticky bottom-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-5 shadow-lg">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-center">
                            <p className="text-white font-bold text-base mb-1">Unlock Complete Yandere Profile</p>
                            <p className="text-pink-100 text-xs">All 4 dimensions deep analysis + personalized survival guide</p>
                          </div>
                          <CreemPaymentButton
                            testResults={{ answers }}
                            testId={currentTestId || undefined}
                            onFreeUnlock={handleFreeUnlock}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 建议和总结 - 支付墙 */}
                  {/* {isUnlocked ? (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <i className="fas fa-lightbulb text-purple-600"></i>
                        {t("resultsPage.suggestions.title")}
                      </h3>
                      <div className="space-y-3 text-sm text-gray-700">
                        {['0', '1', '2', '3'].map((index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5"></div>
                            <p>{t(`resultsPage.suggestions.items.${index}`) as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 mb-8">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                          <i className="fas fa-lightbulb text-purple-600"></i>
                          {t("resultsPage.suggestions.title")}
                        </h3>
                        <p className="text-gray-700 mb-6">Get personalized recommendations based on your unique Yandere profile</p>
                        <CreemPaymentButton testResults={{ answers }} />
                      </div>
                    </div>
                  )} */}

                  {/* ========== YANDERE PERSONA CARD (FREE FOR ALL) ========== */}
                  {(() => {
                    const percentage = Math.round((answers.reduce((a, b) => a + b, 0) / 185) * 100)
                    const persona = getYanderePersona(percentage)

                    return (
                      <div className="rounded-2xl overflow-hidden mb-8 border-2 border-purple-300">
                        {/* Header with rarity */}
                        <div className={`bg-gradient-to-r ${persona.rarityColor} p-6 text-white`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-5xl">{persona.emoji}</span>
                              <div>
                                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-2">
                                  {persona.rarity} RARITY
                                </div>
                                <h3 className="text-2xl font-bold">{persona.name}</h3>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold">{percentage}%</div>
                              <div className="text-sm opacity-90">Yandere Level</div>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-6">
                          {/* Story */}
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              {currentReportView === 'partner' ? 'Their Story' : 'Your Story'}
                            </h4>
                            <p className="text-gray-700 leading-relaxed text-sm italic">{getText(persona.story)}</p>
                          </div>

                          {/* Quote */}
                          <div className="bg-white rounded-xl p-4 mb-6 border-l-4 border-purple-500">
                            <p className="text-gray-800 font-medium text-lg">"{persona.quote.replace(/"/g, '')}"</p>
                          </div>

                          {/* Traits */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              Character Traits
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {persona.traits.map((trait, idx) => (
                                <span key={idx} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                                  {trait}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* ========== PREMIUM MODULES (Paid Content) ========== */}

                  {/* 1. Compatibility Match - LOCKED STATE */}
                  {!isUnlocked && (
                    <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl p-8 mb-8 border-2 border-pink-200 relative overflow-hidden">
                      {/* Lock overlay */}
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors"></div>

                      <div className="relative">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                          <span className="text-3xl">💕</span>
                          <span>Compatibility Match</span>
                        </h3>
                        <p className="text-gray-600 mb-6 text-sm">
                          {currentReportView === 'partner'
                            ? "Who's their true love? And who will destroy them?"
                            : "Who's your true love? And who will destroy you?"
                          }
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Best Match - Silhouette */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                              {/* Mystery silhouette avatar */}
                              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/20"></div>
                                <svg className="w-8 h-8 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-green-700 text-lg flex items-center gap-2">
                                  ❤️ Best Match: ???
                                </h4>
                              </div>
                            </div>
                            {/* Redacted description bars */}
                            <div className="space-y-2">
                              <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded h-4 w-full animate-pulse"></div>
                              <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded h-4 w-4/5 animate-pulse"></div>
                              <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded h-4 w-3/5 animate-pulse"></div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-green-200">
                              <p className="text-xs text-green-600 italic flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Unlock to see your soulmate
                              </p>
                            </div>
                          </div>

                          {/* Worst Match - Silhouette */}
                          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                              {/* Mystery silhouette avatar with warning */}
                              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/20"></div>
                                <svg className="w-8 h-8 text-red-900" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-red-700 text-lg flex items-center gap-2">
                                  💔 Worst Match: ???
                                </h4>
                              </div>
                            </div>
                            {/* Redacted description bars */}
                            <div className="space-y-2">
                              <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded h-4 w-full animate-pulse"></div>
                              <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded h-4 w-4/5 animate-pulse"></div>
                              <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded h-4 w-3/5 animate-pulse"></div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-red-200">
                              <p className="text-xs text-red-600 italic flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Unlock to see who will ruin you
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Center CTA - Payment Button */}
                        <div className="mt-6 text-center">
                          <CreemPaymentButton
                            testResults={{ answers }}
                            testId={currentTestId || undefined}
                            onFreeUnlock={handleFreeUnlock}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Dark Stats - LOCKED STATE */}
                  {!isUnlocked && (
                    <div className="bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
                      {/* Animated scan lines */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                          animation: 'scan 2s linear infinite'
                        }}></div>
                      </div>

                      <div className="relative">
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                          <span className="text-3xl">🎭</span>
                          <span>Dark Stats</span>
                          <span className="ml-2 px-3 py-1 bg-red-600/80 text-xs font-bold rounded border border-red-500">CLASSIFIED</span>
                        </h3>
                        <p className="text-purple-300 mb-6 text-sm">
                          {currentReportView === 'partner' ? "Their true danger level has been redacted" : "Your true danger level has been redacted"}
                        </p>

                        <div className="grid md:grid-cols-2 gap-8">
                          {/* Radar Chart - Empty/Scanning */}
                          <div className="flex flex-col items-center">
                            <div className="relative w-64 h-64">
                              {/* Background circles */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-full border border-purple-400/20 rounded-full"></div>
                              </div>
                              <div className="absolute inset-8 flex items-center justify-center">
                                <div className="w-full h-full border border-purple-400/20 rounded-full"></div>
                              </div>
                              <div className="absolute inset-16 flex items-center justify-center">
                                <div className="w-full h-full border border-purple-400/20 rounded-full"></div>
                              </div>
                              <div className="absolute inset-24 flex items-center justify-center">
                                <div className="w-full h-full border border-purple-400/20 rounded-full"></div>
                              </div>

                              {/* Scanning animation */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1 h-32 bg-gradient-to-t from-transparent via-purple-500 to-transparent origin-bottom animate-spin opacity-50"></div>
                              </div>

                              {/* RESTRICTED Stamp */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="border-4 border-red-600 px-4 py-2 rounded transform -rotate-12 bg-red-900/40 backdrop-blur-sm">
                                  <span className="text-red-500 font-bold text-sm tracking-wider">RESTRICTED</span>
                                </div>
                              </div>

                              {/* Question marks at stat positions */}
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                                <text x="50" y="15" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">?</text>
                                <text x="85" y="35" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold">?</text>
                                <text x="85" y="70" textAnchor="middle" fill="#a855f7" fontSize="8" fontWeight="bold">?</text>
                                <text x="50" y="90" textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="bold">?</text>
                                <text x="15" y="70" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">?</text>
                                <text x="15" y="35" textAnchor="middle" fill="#ec4899" fontSize="8" fontWeight="bold">?</text>
                              </svg>
                            </div>
                          </div>

                          {/* Stats List - Redacted */}
                          <div className="space-y-4">
                            {[
                              { label: 'Danger Level', color: 'red' },
                              { label: 'Loyalty', color: 'green' },
                              { label: 'Possessiveness', color: 'purple' },
                              { label: 'Sanity', color: 'blue' },
                              { label: 'Obsessiveness', color: 'orange' },
                              { label: 'Yandere', color: 'pink' }
                            ].map((stat) => (
                              <div key={stat.label} className="flex items-center gap-4">
                                <div className="w-28 text-right">
                                  <span className={`text-${stat.color}-400 font-semibold text-sm`}>{stat.label}</span>
                                </div>
                                <div className="flex-1 bg-purple-950/50 rounded-full h-6 border border-purple-800 relative overflow-hidden">
                                  {/* Striped pattern */}
                                  <div
                                    className="h-full rounded-full absolute inset-0"
                                    style={{
                                      background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.03) 5px, rgba(255,255,255,0.03) 10px)'
                                    }}
                                  ></div>
                                  <span className="absolute inset-0 flex items-center justify-end pr-3 text-red-500 font-bold text-sm">
                                    ??%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom warning - Payment Button */}
                        <div className="mt-6 text-center">
                          <CreemPaymentButton
                            testResults={{ answers }}
                            testId={currentTestId || undefined}
                            onFreeUnlock={handleFreeUnlock}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {isUnlocked && (() => {
                    const percentage = Math.round((answers.reduce((a, b) => a + b, 0) / 185) * 100)
                    const compatibility = getCompatibilityMatch(percentage)
                    const darkStats = getDarkStats(percentage)

                    return (
                      <>
                        {/* 1. Compatibility Match */}
                        <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl p-8 mb-8 border-2 border-pink-200">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="text-3xl">💕</span>
                            <span>Compatibility Match</span>
                          </h3>
                          <p className="text-gray-700 mb-6 text-sm">Based on your Yandere profile, here's your ideal match... and who to avoid!</p>

                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Best Match */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-3xl">{compatibility.bestMatch.icon}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-green-800 text-lg">❤️ Best Match</h4>
                                  </div>
                                  <p className="text-sm font-semibold text-green-700">{compatibility.bestMatch.name}</p>
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{compatibility.bestMatch.description}</p>
                              <div className="mt-4 pt-4 border-t border-green-200">
                                <div className="flex items-center gap-2 text-xs text-green-600">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>High compatibility potential</span>
                                </div>
                              </div>
                            </div>

                            {/* Worst Match */}
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-300">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-3xl">{compatibility.worstMatch.icon}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-red-800 text-lg">💔 Worst Match</h4>
                                  </div>
                                  <p className="text-sm font-semibold text-red-700">{compatibility.worstMatch.name}</p>
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{compatibility.worstMatch.description}</p>
                              <div className="mt-4 pt-4 border-t border-red-200">
                                <div className="flex items-center gap-2 text-xs text-red-600">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  <span>High conflict potential</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Dark Stats (黑化指数) + Radar Chart */}
                        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 mb-8 text-white">
                          <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                            <span className="text-3xl">🎭</span>
                            <span>Dark Stats</span>
                          </h3>
                          <p className="text-purple-200 mb-6 text-sm">
                            {currentReportView === 'partner'
                              ? "The hidden attributes that define their Yandere nature..."
                              : "The hidden attributes that define your Yandere nature..."
                            }
                          </p>

                          <div className="grid md:grid-cols-2 gap-8">
                            {/* Radar Chart */}
                            <div className="flex flex-col items-center">
                              <div className="relative w-64 h-64">
                                {/* Background circles */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-full h-full border border-purple-400/30 rounded-full"></div>
                                </div>
                                <div className="absolute inset-8 flex items-center justify-center">
                                  <div className="w-full h-full border border-purple-400/30 rounded-full"></div>
                                </div>
                                <div className="absolute inset-16 flex items-center justify-center">
                                  <div className="w-full h-full border border-purple-400/30 rounded-full"></div>
                                </div>
                                <div className="absolute inset-24 flex items-center justify-center">
                                  <div className="w-full h-full border border-purple-400/30 rounded-full"></div>
                                </div>

                                {/* Stat bars (simulated radar) */}
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                                  {/* Danger Level - Top */}
                                  <line x1="50" y1="50" x2="50" y2={50 - (darkStats.dangerLevel / 100) * 40} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                                  {/* Loyalty - Top Right */}
                                  <line x1="50" y1="50" x2={50 + (darkStats.loyalty / 100) * 35} y2={50 - (darkStats.loyalty / 100) * 20} stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
                                  {/* Possessiveness - Bottom Right */}
                                  <line x1="50" y1="50" x2={50 + (darkStats.possessiveness / 100) * 35} y2={50 + (darkStats.possessiveness / 100) * 20} stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
                                  {/* Sanity - Bottom */}
                                  <line x1="50" y1="50" x2="50" y2={50 + (darkStats.sanity / 100) * 40} stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                                  {/* Obsessiveness - Bottom Left */}
                                  <line x1="50" y1="50" x2={50 - (darkStats.obsessiveness / 100) * 35} y2={50 + (darkStats.obsessiveness / 100) * 20} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                                  {/* Yandere Potential - Top Left */}
                                  <line x1="50" y1="50" x2={50 - (darkStats.yanderePotential / 100) * 35} y2={50 - (darkStats.yanderePotential / 100) * 20} stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />

                                  {/* Dots at ends */}
                                  <circle cx="50" cy={50 - (darkStats.dangerLevel / 100) * 40} r="3" fill="#ef4444" />
                                  <circle cx={50 + (darkStats.loyalty / 100) * 35} cy={50 - (darkStats.loyalty / 100) * 20} r="3" fill="#22c55e" />
                                  <circle cx={50 + (darkStats.possessiveness / 100) * 35} cy={50 + (darkStats.possessiveness / 100) * 20} r="3" fill="#a855f7" />
                                  <circle cx="50" cy={50 + (darkStats.sanity / 100) * 40} r="3" fill="#3b82f6" />
                                  <circle cx={50 - (darkStats.obsessiveness / 100) * 35} cy={50 + (darkStats.obsessiveness / 100) * 20} r="3" fill="#f59e0b" />
                                  <circle cx={50 - (darkStats.yanderePotential / 100) * 35} cy={50 - (darkStats.yanderePotential / 100) * 20} r="3" fill="#ec4899" />
                                </svg>
                              </div>
                            </div>

                            {/* Stats List */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="w-28 text-right">
                                  <span className="text-red-400 font-semibold">Danger Level</span>
                                </div>
                                <div className="flex-1 bg-purple-800/50 rounded-full h-6">
                                  <div className="bg-gradient-to-r from-red-500 to-orange-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${darkStats.dangerLevel}%` }}>
                                    <span className="text-xs font-bold text-white">{darkStats.dangerLevel}%</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="w-28 text-right">
                                  <span className="text-green-400 font-semibold">Loyalty</span>
                                </div>
                                <div className="flex-1 bg-purple-800/50 rounded-full h-6">
                                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${darkStats.loyalty}%` }}>
                                    <span className="text-xs font-bold text-white">{darkStats.loyalty}%</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="w-28 text-right">
                                  <span className="text-purple-400 font-semibold">Possessiveness</span>
                                </div>
                                <div className="flex-1 bg-purple-800/50 rounded-full h-6">
                                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${darkStats.possessiveness}%` }}>
                                    <span className="text-xs font-bold text-white">{darkStats.possessiveness}%</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="w-28 text-right">
                                  <span className="text-blue-400 font-semibold">Sanity</span>
                                </div>
                                <div className="flex-1 bg-purple-800/50 rounded-full h-6">
                                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${darkStats.sanity}%` }}>
                                    <span className="text-xs font-bold text-white">{darkStats.sanity}%</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="w-28 text-right">
                                  <span className="text-yellow-400 font-semibold">Obsessiveness</span>
                                </div>
                                <div className="flex-1 bg-purple-800/50 rounded-full h-6">
                                  <div className="bg-gradient-to-r from-yellow-500 to-amber-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${darkStats.obsessiveness}%` }}>
                                    <span className="text-xs font-bold text-white">{darkStats.obsessiveness}%</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="w-28 text-right">
                                  <span className="text-pink-400 font-semibold">Yandere Potential</span>
                                </div>
                                <div className="flex-1 bg-purple-800/50 rounded-full h-6">
                                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${darkStats.yanderePotential}%` }}>
                                    <span className="text-xs font-bold text-white">{darkStats.yanderePotential}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  })()}

                  {/* 重新测试和分享按钮 */}
                  <div className="text-center space-y-4">
                    {/* 分享按钮 */}
                    <button
                      onClick={() => setShowShareCard(true)}
                      className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Generate Share Image
                    </button>

                    {/* 重新测试按钮 */}
                    {/* <button
                      onClick={restart}
                      className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                    >
                      {t("resultsPage.restartTest")}
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 角色卡片展示 - 只在开始页面显示 */}
      {gameState === 'start' && <CharacterCards onStartTest={() => setGameState('selecting')} />}

      <div className="container mx-auto py-0 space-y-16">
        {/* 四个维度 - 仪表盘样式横向排列 - 只在开始页面显示 */}
        {gameState === 'start' && (
          <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t("dimensions.title")}
            </h2>
          </div>

          {/* 四个维度横向排列 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {/* 控制欲望 - 锁链图标 */}
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8 2 6 5 6 8V12H5C4.44772 12 4 12.4477 4 13V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V13C20 12.4477 19.5523 12 19 12H18V8C18 5 16 2 12 2ZM12 4C14.5 4 16 6 16 8V12H8V8C8 6 9.5 4 12 4Z" fill="currentColor"/>
                    <path d="M8 14V18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 14V18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16 14V18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{t("dimensions.control")}</h3>
                <p className="text-sm text-gray-600 leading-snug">{t("dimensions.controlDesc")}</p>
              </div>
            </div>

            {/* 嫉妒强度 - 破碎的心 + 火焰 */}
            <div className="group bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-red-500/30">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" opacity="0.3"/>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M8 8L16 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16 8L8 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 5L14 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M10 6L13 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{t("dimensions.jealousy")}</h3>
                <p className="text-sm text-gray-600 leading-snug">{t("dimensions.jealousyDesc")}</p>
              </div>
            </div>

            {/* 情感依赖 - 锁住的心 */}
            <div className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/30">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                    <circle cx="12" cy="12" r="2" fill="white"/>
                    <path d="M7 12V17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M17 12V17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="7" cy="12" r="1.5" fill="white"/>
                    <circle cx="17" cy="12" r="1.5" fill="white"/>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{t("dimensions.dependency")}</h3>
                <p className="text-sm text-gray-600 leading-snug">{t("dimensions.dependencyDesc")}</p>
              </div>
            </div>

            {/* 关系不安全感 - 匕首/刀 */}
            <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border border-yellow-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-yellow-500/30">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M7.5 16.5L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 18L7.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18 6L16.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5 21L8 18L17 9L14 6L6 14L3 17L5 21Z" fill="currentColor"/>
                    <path d="M14 6L17 3L21 7L18 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 18L12 14" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{t("dimensions.insecurity")}</h3>
                <p className="text-sm text-gray-600 leading-snug">{t("dimensions.insecurityDesc")}</p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Pricing / What You Get - 只在开始页面显示 */}
        {gameState === 'start' && (
          <div className="container mx-auto px-4 py-16 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                What You'll Get
              </h2>
              <p className="text-gray-600">Choose your level of self-discovery</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 左边：免费版 */}
              <div className="bg-gray-50 rounded-3xl p-8 border-2 border-gray-200 relative">
                <div className="text-center mb-6">
                  <div className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-bold mb-3">
                    FREE
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Result</h3>
                  <p className="text-gray-500 text-sm">Get a quick overview of your Yandere level</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm"><strong>Yandere Score:</strong> See your overall percentage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm"><strong>Your Archetype:</strong> Get your title (e.g., "Soft Yandere")</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm"><strong>4 Dimension Scores:</strong> See your levels in Control, Jealousy, etc.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm"><strong>Shareable Character Card:</strong> Get the viral image for social media</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-400 text-sm">No Deep Analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-400 text-sm">No Hidden Stats</span>
                  </li>
                </ul>

                <button
                  onClick={() => setGameState('selecting')}
                  className="w-full mt-6 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Start Free Test
                </button>
              </div>

              {/* 右边：付费版 */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 border-2 border-pink-300 relative overflow-hidden">
                {/* 发光效果 */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>

                {/* 热门标签 */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span className="animate-pulse">🔥</span>
                    MOST POPULAR
                  </div>
                </div>

                <div className="text-center mb-6 relative">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm font-bold mb-3 shadow-lg">
                    $2.99
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Full Report</h3>
                  <p className="text-gray-600 text-sm">Unlock your complete psychological profile</p>
                </div>

                <ul className="space-y-3 relative">
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🌟</span>
                    <span className="text-gray-700 text-sm"><strong>Everything in Free</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🔓</span>
                    <span className="text-gray-700 text-sm"><strong>1,500+ Word Deep Analysis:</strong> Detailed psychology & behavioral breakdown for ALL 4 dimensions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🔓</span>
                    <span className="text-gray-700 text-sm"><strong>Dark Stats Dashboard:</strong> Reveal your hidden "Danger", "Loyalty", & "Sanity" levels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🔓</span>
                    <span className="text-gray-700 text-sm"><strong>Compatibility Match:</strong> Find out your Best & Worst romantic partners</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🔓</span>
                    <span className="text-gray-700 text-sm"><strong>Senpai's Survival Guide:</strong> Actionable advice to save your relationship</span>
                  </li>
                </ul>

                <button
                  onClick={() => setGameState('selecting')}
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all shadow-md relative"
                >
                  <span className="relative z-10">Unlock Full Report</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 rounded-xl opacity-0 hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* About 部分 - 左右分栏布局 - 只在开始页面显示 */}
        {gameState === 'start' && (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 border border-purple-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* 左侧：About 文字 */}
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <i className="fas fa-info-circle"></i>
                  {t("about.title")}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                  {t("about.title")}
                </h2>
                <p
                  className="text-gray-700 leading-relaxed text-base"
                  dangerouslySetInnerHTML={{ __html: t("about.content")?.replace(/\n/g, '<br />') || ''}}
                ></p>

                {/* 快速统计 */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">37</div>
                    <div className="text-xs text-gray-600">{t("questions.0") ? "Questions" : "题目"}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-600 mb-1">4</div>
                    <div className="text-xs text-gray-600">Aspects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">100%</div>
                    <div className="text-xs text-gray-600">Private</div>
                  </div>
                </div>
              </div>

              {/* 右侧：报告预览图 */}
              <div className="order-1 md:order-2">
                <div className="relative">
                  {/* 装饰性背景 */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl blur-2xl opacity-20"></div>

                  {/* 模拟报告卡片 */}
                  <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                    {/* 报告标题 */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="text-sm font-semibold text-gray-900">Test Report</div>
                    </div>

                    {/* 模拟雷达图区域 */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-4">
                      <div className="flex items-center justify-center">
                        <div className="relative w-40 h-40">
                          {/* 装饰圆环 */}
                          <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                          <div className="absolute inset-4 border-4 border-pink-200 rounded-full"></div>
                          <div className="absolute inset-8 border-4 border-purple-300 rounded-full"></div>

                          {/* 中心分数 */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">77%</div>
                              <div className="text-xs text-gray-600 mt-1">Score</div>
                            </div>
                          </div>

                          {/* 模拟数据点 */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full"></div>
                        </div>
                      </div>

                      {/* 维度标签 */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">Obsessive Control</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-gray-600">Extreme Jealousy</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">Total Devotion</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-600">Protective Aggression</span>
                        </div>
                      </div>
                    </div>

                    {/* 模拟详细分析条目 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-xs font-bold text-blue-600">Ctrl</div>
                        <div className="flex-1 h-2 bg-blue-200 rounded-full">
                          <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center text-xs font-bold text-red-600">Jlsy</div>
                        <div className="flex-1 h-2 bg-red-200 rounded-full">
                          <div className="w-2/3 h-full bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center text-xs font-bold text-green-600">Dep</div>
                        <div className="flex-1 h-2 bg-green-200 rounded-full">
                          <div className="w-1/2 h-full bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* 模糊提示 */}
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                      <p className="text-xs text-gray-500">
                        <i className="fas fa-lock mr-1"></i>
                        Complete the test to unlock your full report
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      <EmbedDialog
        isOpen={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
        embedUrl={embedUrl}
      />

      {/* Share Card */}
      {showShareCard && (() => {
        const percentage = Math.round((answers.reduce((a, b) => a + b, 0) / 185) * 100)
        const level = getLevel(percentage)
        const persona = getYanderePersona(percentage)
        const darkStats = getDarkStats(percentage)

        return (
          <ShareCard
            score={percentage}
            level={level.level}
            persona={persona}
            darkStats={darkStats}
            onClose={() => setShowShareCard(false)}
          />
        )
      })()}

      {/* New Test Warning Dialog */}
      <NewTestWarningDialog
        isOpen={showWarningDialog}
        onClose={() => setShowWarningDialog(false)}
        onConfirm={confirmStartNewTest}
        isPaidUser={previousTestData?.isPaid || false}
        currentScore={previousTestData?.percentage || 0}
      />
    </div>
  )
}