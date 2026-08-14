export type Locale = "en" | "zh";

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  zh: "中文"
};

export const translations = {
  en: {
    portalTitle: "Housing ML Portal",
    propertyForm: "Property Form",
    marketAnalysis: "Market Analysis",
    openPropertyForm: "Open property form",
    openMarketAnalysis: "Open market analysis",
    homeTitle1: "App1 - Property Prediction",
    homeDesc1: "Submit property features and get instant predicted price from the Python backend.",
    homeTitle2: "App2 - Market Analysis",
    homeDesc2: "Explore market segments and run what-if simulation powered by the Java backend.",
    propertyPageTitle: "Property Price Prediction",
    propertyPageIntro: "Fill all required fields to get a predicted house price.",
    marketPageTitle: "Market Analysis",
    marketPageIntro: "Review segment stats and run what-if scenarios against the Java backend.",
    propertyFormTitle: "Property Input Form",
    predictPrice: "Predict Price",
    predictedPrice: "Predicted Price",
    segment: "Segment",
    count: "Count",
    avgPrice: "Avg Price",
    whatIfTitle: "What-if Simulation",
    runWhatIf: "Run What-if",
    current: "Current",
    predicted: "Predicted",
    baseline: "Baseline",
    difference: "Difference",
    processing: "Processing..."
  },
  zh: {
    portalTitle: "房价预测门户",
    propertyForm: "房源录入",
    marketAnalysis: "市场分析",
    openPropertyForm: "打开房源录入",
    openMarketAnalysis: "打开市场分析",
    homeTitle1: "App1 - 房价预测",
    homeDesc1: "填写房屋特征，立即从 Python 后端获取预测价格。",
    homeTitle2: "App2 - 市场分析",
    homeDesc2: "查看市场分段数据，并通过 Java 后端运行情景模拟。",
    propertyPageTitle: "房价预测",
    propertyPageIntro: "填写所有必填字段，即可获取预计房价。",
    marketPageTitle: "市场分析",
    marketPageIntro: "查看分段统计，并通过 Java 后端运行情景模拟。",
    propertyFormTitle: "房源录入表单",
    predictPrice: "预测价格",
    predictedPrice: "预测价格",
    segment: "分段",
    count: "数量",
    avgPrice: "平均价格",
    whatIfTitle: "情景模拟",
    runWhatIf: "运行模拟",
    current: "当前",
    predicted: "预测值",
    baseline: "基准值",
    difference: "差异",
    processing: "处理中..."
  }
} as const;
