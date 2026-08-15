# Interview Tasks: Fullstack / 全栈面试任务

> Source / 来源：[Interview Tasks Fullstack.pdf](Interview%20Tasks%20Fullstack.pdf)
>
> This document is a bilingual, structured transcription of the original interview tasks.
> 本文档是原始面试任务的中英双语结构化整理版。

---

## Task 1: Housing Price Prediction Model API / 任务 1：房价预测模型 API

### Objective / 目标

**EN:** Build, containerise, and deploy a simple regression model that predicts housing prices based on the provided features and attached dataset.

**中文：** 基于提供的特征和附件数据集，构建、容器化并部署一个用于预测房价的简单回归模型。

### Requirements / 功能要求

#### API Endpoints / API 接口

1. **`predict`**
   - **EN:** Accept housing features and return price predictions. Both single and batch inputs must be supported.
   - **中文：** 接收房屋特征并返回价格预测结果，同时支持单条输入和批量输入。

2. **`model-info`**
   - **EN:** Return model coefficients and performance metrics.
   - **中文：** 返回模型系数和性能评估指标。

3. **`health`**
   - **EN:** Provide a simple health-check endpoint.
   - **中文：** 提供一个简单的健康检查接口。

### Technical Constraints / 技术约束

| Requirement | English | 中文 |
|---|---|---|
| Python | Python 3.12 or later | Python 3.12 或更高版本 |
| API framework | FastAPI | FastAPI |
| Machine learning | Scikit-learn | Scikit-learn |

### Deliverables / 交付物

1. **Source code in GitHub**
   **GitHub 上的源代码**

2. **Dockerfile**
   **Dockerfile 容器构建文件**

3. **Ability to demonstrate the application live during the interview through Swagger/OpenAPI**
   **能够在面试期间通过 Swagger/OpenAPI 进行现场演示**

---

## Task 2: Multi-Application Next.js Portal / 任务 2：多应用 Next.js 门户

### Objective / 目标

**EN:** Create a unified Next.js portal that hosts two independent applications with different backend technologies. Both applications must be capable of interacting with the machine-learning model from Task 1.

**中文：** 创建一个统一的 Next.js 门户，用于承载两个采用不同后端技术的独立应用。两个应用都必须能够与任务 1 中的机器学习模型交互。

## 1. Portal Structure Requirements / 门户结构要求

### 1.1 Unified Navigation and Layout / 统一导航与布局

1. **EN:** Implement a shared layout with navigation between the applications.
   **中文：** 实现共享布局，并支持在两个应用之间导航。

2. **EN:** Use the Next.js App Router for routing between and within the applications.
   **中文：** 使用 Next.js App Router 实现应用之间以及应用内部的路由。

3. **EN:** Create a consistent design system across both applications.
   **中文：** 为两个应用创建一致的设计系统。

4. **EN:** Properly handle loading and error states at the layout level.
   **中文：** 在布局层正确处理加载状态和错误状态。

## 2. App 1: Property Value Estimator — Python Backend / 应用 1：房产价值估算器 — Python 后端

### 2.1 Frontend / 前端

1. **Property details form / 房产信息表单**
   - **EN:** Create a form for entering all property fields required by the model.
   - **中文：** 创建表单，用于输入模型所需的全部房产字段。

2. **Client-side validation / 客户端校验**
   - **EN:** Implement client-side validation with appropriate error messages.
   - **中文：** 实现客户端数据校验，并提供恰当的错误提示。

3. **Prediction presentation / 预测结果展示**
   - **EN:** Display prediction results in both tabular format and a visual chart.
   - **中文：** 同时以表格和可视化图表的形式展示预测结果。

4. **Estimate history / 估算历史**
   - **EN:** Implement a history feature that shows previous estimates.
   - **中文：** 实现历史记录功能，用于展示之前的估算结果。

5. **Property comparison / 房产对比**
   - **EN:** Create a comparison view for analysing multiple properties side by side.
   - **中文：** 创建对比视图，以便并排分析多个房产。

### 2.2 Backend — Python / 后端 — Python

1. **EN:** Handle form submissions.
   **中文：** 处理表单提交。

2. **EN:** Integrate with the regression-model container from Task 1.
   **中文：** 集成任务 1 中的回归模型容器。

3. **EN:** Implement data validation and error handling.
   **中文：** 实现数据校验和错误处理。

## 3. App 2: Property Market Analysis — Java Backend / 应用 2：房产市场分析 — Java 后端

### 3.1 Frontend / 前端

1. **Interactive dashboard / 交互式仪表盘**
   - **EN:** Create an interactive dashboard with property-market visualisations.
   - **中文：** 创建包含房产市场可视化内容的交互式仪表盘。

2. **Market filters / 市场筛选器**
   - **EN:** Implement filters for analysing different property segments.
   - **中文：** 实现筛选功能，用于分析不同的房产细分市场。

3. **What-if analysis / What-if 假设分析**
   - **EN:** Build a What-if analysis tool that uses the machine-learning model.
   - **中文：** 构建一个使用机器学习模型的 What-if 假设分析工具。

4. **Data export / 数据导出**
   - **EN:** Provide CSV and PDF export options.
   - **中文：** 提供 CSV 和 PDF 数据导出选项。

5. **Responsive data tables / 响应式数据表格**
   - **EN:** Create responsive data tables with sorting and filtering.
   - **中文：** 创建支持排序和筛选的响应式数据表格。

### 3.2 Backend — Java / 后端 — Java

1. **EN:** Create REST API endpoints for market analysis.
   **中文：** 创建用于市场分析的 REST API 接口。

2. **EN:** Generate aggregate statistics from the housing dataset.
   **中文：** 基于房屋数据集生成聚合统计数据。

3. **EN:** Integrate with the machine-learning model container from Task 1.
   **中文：** 集成任务 1 中的机器学习模型容器。

4. **EN:** Implement caching for performance optimisation.
   **中文：** 实现缓存以优化性能。

## 4. Technical Requirements / 技术要求

### 4.1 Next.js Implementation / Next.js 实现

1. **EN:** Use the App Router.
   **中文：** 使用 App Router。

2. **EN:** Use Server Components and Client Components appropriately.
   **中文：** 合理使用 Server Components 和 Client Components。

3. **EN:** Use React Server Components for initial data loading.
   **中文：** 使用 React Server Components 完成初始数据加载。

4. **EN:** Implement appropriate data-fetching strategies.
   **中文：** 实现合理的数据获取策略。

5. **EN:** Create custom hooks for shared functionality.
   **中文：** 为共享功能创建自定义 Hooks。

### 4.2 UI/UX Requirements / UI/UX 要求

1. **EN:** Create responsive layouts using Tailwind CSS.
   **中文：** 使用 Tailwind CSS 创建响应式布局。

2. **EN:** Implement accessible UI components that follow WCAG guidelines.
   **中文：** 实现遵循 WCAG 指南的无障碍 UI 组件。

3. **EN:** Use appropriate loading states and error boundaries.
   **中文：** 使用恰当的加载状态和错误边界。

4. **EN:** Create smooth transitions between pages and application states.
   **中文：** 在页面和应用状态切换之间实现流畅的过渡。

5. **EN:** Design a cohesive UI that follows modern design principles.
   **中文：** 设计遵循现代设计原则且风格统一的用户界面。

### 4.3 State Management and Data Flow / 状态管理与数据流

1. **EN:** Implement appropriate client-side state management.
   **中文：** 实现适当的客户端状态管理。

2. **EN:** Handle form state effectively with validation.
   **中文：** 有效管理表单状态并实现数据校验。

3. **EN:** Create efficient data-fetching patterns.
   **中文：** 创建高效的数据获取模式。

4. **EN:** Properly manage API communication and error states.
   **中文：** 正确管理 API 通信和错误状态。

### 4.4 Code Quality and Organisation / 代码质量与组织

1. **EN:** Structure the codebase according to Next.js best practices.
   **中文：** 按照 Next.js 最佳实践组织代码库结构。

## 5. Technical Constraints / 技术约束

| Technology | Requirement | 中文要求 |
|---|---|---|
| Python | Python 3.12 or later | Python 3.12 或更高版本 |
| Python backend | FastAPI | FastAPI |
| Java | Java 21 | Java 21 |
| Java backend | Spring Boot 3.4.4 | Spring Boot 3.4.4 |

## 6. Deliverables / 交付物

1. **Source code in GitHub**
   **GitHub 上的源代码**

2. **Ability to demonstrate the complete solution live during the interview**
   **能够在面试期间现场演示完整解决方案**

---

## Requirement Summary / 要求摘要

| Area | English | 中文 |
|---|---|---|
| Task 1 | Containerised housing-price regression API | 容器化的房价回归预测 API |
| Portal | Unified Next.js portal with shared navigation and layout | 具有共享导航和布局的统一 Next.js 门户 |
| App 1 | Property estimator with Python backend | 使用 Python 后端的房产价值估算器 |
| App 2 | Market-analysis dashboard with Java backend | 使用 Java 后端的市场分析仪表盘 |
| ML integration | Both applications integrate with the Task 1 model | 两个应用都集成任务 1 的模型 |
| Frontend | App Router, RSC, Tailwind CSS, accessibility, state and error handling | App Router、RSC、Tailwind CSS、无障碍、状态与错误处理 |
| Delivery | GitHub source code and live interview demonstration | GitHub 源代码和面试现场演示 |
