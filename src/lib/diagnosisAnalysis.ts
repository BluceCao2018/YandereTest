// 诊断分析 - Diagnosis Analysis
// 基于从 analysis.jsonc 导入的详细诊断数据

export interface DiagnosisLevel {
  title: string;
  diagnosis: string;
  symptoms: string[];
  psychology: string;
  warning: string;
  advice: string[];
}

export interface DiagnosisAnalysis {
  level_1: DiagnosisLevel; // 0-25%
  level_2: DiagnosisLevel; // 26-50%
  level_3: DiagnosisLevel; // 51-75%
  level_4: DiagnosisLevel; // 76-100%
}

// 导入 JSON 数据
import analysisData from '../../data/json/en/tools/analysis.json';

// 类型守卫：检查是否是有效的 DiagnosisAnalysis
function isValidDiagnosisAnalysis(data: any): data is DiagnosisAnalysis {
  return (
    data &&
    typeof data === 'object' &&
    'level_1' in data &&
    'level_2' in data &&
    'level_3' in data &&
    'level_4' in data
  );
}

// 转换 JSON 数据为我们的格式
const diagnosisAnalyses: Record<string, DiagnosisAnalysis> = {};

// 处理 control_analysis
if (isValidDiagnosisAnalysis(analysisData.control_analysis)) {
  diagnosisAnalyses.control = analysisData.control_analysis;
}

// 处理 jealousy_analysis
if (isValidDiagnosisAnalysis(analysisData.jealousy_analysis)) {
  diagnosisAnalyses.jealousy = analysisData.jealousy_analysis;
}

// 处理 devotion_analysis (映射到 dependency)
if (isValidDiagnosisAnalysis(analysisData.devotion_analysis)) {
  diagnosisAnalyses.dependency = analysisData.devotion_analysis;
}

// 处理 aggression_analysis (映射到 insecurity)
if (isValidDiagnosisAnalysis(analysisData.aggression_analysis)) {
  diagnosisAnalyses.insecurity = analysisData.aggression_analysis;
}

/**
 * 根据维度和分数获取详细的诊断分析
 * @param dimension 维度名称 ('control' | 'jealousy' | 'dependency' | 'insecurity')
 * @param score 分数 (0-100)
 * @returns 诊断分析数据，如果未找到则返回 null
 */
export function getDiagnosisAnalysis(dimension: string, score: number): DiagnosisLevel | null {
  const analysis = diagnosisAnalyses[dimension];
  if (!analysis) return null;

  let level: DiagnosisLevel;

  if (score <= 25) {
    level = analysis.level_1;
  } else if (score <= 50) {
    level = analysis.level_2;
  } else if (score <= 75) {
    level = analysis.level_3;
  } else {
    level = analysis.level_4;
  }

  return level;
}

/**
 * 获取维度的等级键（用于国际化等场景）
 * @param score 分数 (0-100)
 * @returns 等级键 ('level_1' | 'level_2' | 'level_3' | 'level_4')
 */
export function getLevelKey(score: number): 'level_1' | 'level_2' | 'level_3' | 'level_4' {
  if (score <= 25) return 'level_1';
  if (score <= 50) return 'level_2';
  if (score <= 75) return 'level_3';
  return 'level_4';
}

/**
 * 获取诊断报告的完整数据
 * @param dimension 维度名称
 * @param score 分数
 * @returns 包含标题、诊断、症状、心理学分析、预警和建议的完整对象
 */
export function getFullDiagnosisReport(dimension: string, score: number): {
  title: string;
  diagnosis: string;
  symptoms: string[];
  psychology: string;
  warning: string;
  advice: string[];
} | null {
  const analysis = getDiagnosisAnalysis(dimension, score);
  if (!analysis) return null;

  return {
    title: analysis.title,
    diagnosis: analysis.diagnosis,
    symptoms: analysis.symptoms,
    psychology: analysis.psychology,
    warning: analysis.warning,
    advice: analysis.advice
  };
}
