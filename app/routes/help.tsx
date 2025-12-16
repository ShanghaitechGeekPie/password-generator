import type { Route } from "./+types/help";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "如何保护你的账户？" },
		{ name: "description", content: "一份指南，讲述了密码管理与安全实践" },
	];
}

import React from 'react';
import { Lock, Shield, Link, AlertTriangle, Key, Maximize, Clock } from 'lucide-react';



// 使用 Lucide-React 图标
const Icon = { Lock, Shield, Link, AlertTriangle, Key, Maximize, Clock };

// --- 数据结构 ---

interface Manager {
  name: string;
  type: 'professional' | 'browser';
  features: string;
  syncMethod: string;
  recommendation: 'strong' | 'moderate' | 'weak';
}

interface LeakChecker {
  name: string;
  url: string;
  description: string;
}

const professionalManagers: Manager[] = [
  {
    name: "Bitwarden",
    type: 'professional',
    features: "开源、端到端加密、支持自托管、免费功能强大。",
    syncMethod: "Bitwarden 云服务（端到端加密）",
    recommendation: 'strong',
  },
  {
    name: "1Password",
    type: 'professional',
    features: "界面友好、安全设计优秀、支持秘密密钥（Secret Key）",
    syncMethod: "1Password 云服务（订阅制）",
    recommendation: 'strong',
  },
];

const browserManagers: Manager[] = [
  {
    name: "Chrome/Google 密码管理器",
    type: 'browser',
    features: "与 Google 生态深度集成，提供安全检查。缺点是同步需要科学上网，可以使用 Edge 平替。",
    syncMethod: "Google 账户同步",
    recommendation: 'moderate',
  },
  {
    name: "Firefox",
    type: 'browser',
    features: "使用 Firefox 账户同步密码，支持主密码保护。",
    syncMethod: "Firefox 账户同步",
    recommendation: 'moderate',
  },
  {
    name: "Safari (配合 iCloud 钥匙串)",
    type: 'browser',
    features: "深度集成于 Apple 生态，安全性高，但在非 Apple 设备上受限。",
    syncMethod: "iCloud 同步",
    recommendation: 'moderate',
  },
  {
    name: "系统内置密码管理器",
    type: 'browser',
    features: "大部分手机和 macOS 均提供内置密码管理功能，适合轻度用户。缺点是跨平台支持有限。",
    syncMethod: "系统同步",
    recommendation: 'weak',
  },
];

const leakCheckers: LeakChecker[] = [
  {
    name: "Have I Been Pwned (HIBP)",
    url: "https://haveibeenpwned.com/Passwords",
    description: "通过密码散列值（不发送原始密码）检查您的密码是否出现在已知数据泄露事件中。",
  },
  {
    name: "Google 密码安全检查",
    url: "https://myaccount.google.com/security-checkup",
    description: "检查您 Google 账户中存储的密码是否存在泄露、重复使用或过于简单的问题。",
  },
];

// --- 辅助组件 ---

const SectionTitle: React.FC<{ icon: keyof typeof Icon, title: string, subtitle: string }> = ({ icon, title, subtitle }) => {
  const IconComponent = Icon[icon];
  return (
    <div className="flex items-center space-x-3 mb-6 border-b pb-2">
      <IconComponent className="w-8 h-8 text-indigo-600" />
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
};

const ManagerCard: React.FC<{ manager: Manager }> = ({ manager }) => (
  <div className={`p-4 rounded-xl shadow-md transition duration-300 hover:shadow-lg
    ${manager.type === 'professional' ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        {manager.type === 'professional' ? <Icon.Shield className="w-5 h-5 mr-2 text-indigo-500" /> : <Icon.Key className="w-5 h-5 mr-2 text-gray-500" />}
        {manager.name}
      </h3>
    </div>
    <p className="text-sm text-gray-600 mb-2">{manager.features}</p>
    <div className="flex text-xs text-gray-500">
      <Icon.Link className="w-3 h-3 mr-1 mt-0.5" />
      <span>同步：{manager.syncMethod}</span>
    </div>
  </div>
);

// --- 主组件 ---

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-700">
          <Icon.Lock className="w-8 h-8 inline-block mr-2 align-top" />
          密码安全指南
        </h1>
        <p className="text-gray-500 mt-2">保护您的账户，从理解密码科学开始。</p>
      </header>

      {/* -------------------- 密码管理与同步 -------------------- */}
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl space-y-10">

        <section>
          <SectionTitle 
            icon="Shield" 
            title="一、密码管理与同步推荐" 
            subtitle="选择专业的工具，实现安全、便捷的跨平台同步。" 
          />
          
          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-700">
            🥇 推荐的专业第三方密码管理器
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            专业工具采用端到端加密，并提供强大的安全审计功能，是管理重要密码的首选。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {professionalManagers.map((m) => (
              <ManagerCard key={m.name} manager={m} />
            ))}
          </div>

          <p className="text-sm mb-4 text-gray-600 ">
            如果您不熟悉上面的管理器如何操作，欢迎观看我们在学子论坛上分享的教程视频：
			<a 
			  href="【GeekPie - 技术宅的 101 种“偷懒”方式】 【精准空降到 27:06】 https://www.bilibili.com/video/BV1LMSnBGERP/?share_source=copy_web&vd_source=50592f7c1273c7de582c79ab086ac522&t=1626"
			  target="_blank"
			  className="text-blue-500 underline"
			>
			  《GeekPie - 技术宅的 101 种“偷懒”方式》跳伞 27:00 左右
			</a>
			。或者直接前往信息学院 1B-203 的 GeekPie 赛博诊所，我们会提供一对一的指导和帮助！
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-700">
            🌐 浏览器/系统内置密码管理（辅助选择）
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            适用于普通账户，但其安全功能和跨平台能力通常不如专业管理器。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {browserManagers.map((m) => (
              <ManagerCard key={m.name} manager={m} />
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
            <p className="font-semibold flex items-center"><Icon.AlertTriangle className="w-4 h-4 mr-2" /> 重要建议</p>
            <p className="text-sm">
              无论您选择哪种管理器， <b>主密码 (Master Password，通常是进入你密码管理器的密码)</b>  必须是您最长、最复杂的密码，切勿在其他任何地方使用。
            </p>
          </div>
        </section>

        {/* -------------------- 安全密码生成 -------------------- */}
        <section>
          <SectionTitle 
            icon="Maximize" 
            title="二、如何生成一个安全的密码" 
            subtitle="安全性取决于长度和字符集的组合，即密码的熵值。" 
          />

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-700 flex items-center">
            <Icon.Clock className="w-5 h-5 mr-2" /> 为什么短密码不安全？—— 密码熵值
          </h3>

          <p className="text-gray-600 mb-4">
            密码的安全性由 <b>熵值 (Entropy)</b>  决定。熵值越高，密码被暴力破解所需的时间越长。即使包含随机字符，短密码的熵值也太低。
          </p>

          <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-center mb-6 shadow-inner">
            <p className="text-lg font-mono text-indigo-700">
              {/* LaTeX for Entropy formula, using $...$ for display math */}
              熵值 (bits) = L × log₂(C)
            </p>
            <p className="text-xs text-gray-500 mt-2">
              L：密码长度 (Length)；C：使用的字符集大小 (Character Set Size)
            </p>
          </div>

          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200 text-left text-sm font-medium text-gray-700">
                <th className="p-3">示例密码</th>
                <th className="p-3">长度/字符集</th>
                <th className="p-3">熵值 (bits)</th>
                <th className="p-3">估计破解时间*</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-black">
              <tr className="hover:bg-red-50">
                <td className="p-3 font-mono text-sm">A1$g</td>
                <td className="p-3 text-sm">4位, 混合字符 (C≈94)</td>
                <td className="p-3 font-semibold text-red-600">约 26 bits</td>
                <td className="p-3 text-red-600"> <b>几小时</b> </td>
              </tr>
              <tr className="hover:bg-green-50">
                <td className="p-3 font-mono text-sm">I-love-secure-passwords</td>
                <td className="p-3 text-sm">24位, 只含小写字母 (C=26)</td>
                <td className="p-3 font-semibold text-green-700">约 112 bits</td>
                <td className="p-3 text-green-700"> <b>数万年</b> </td>
              </tr>
            </tbody>
          </table>
          
          <p className="text-sm text-gray-500 mt-3">
            * 估计破解时间基于现代消费级硬件和常用的暴力破解算法。
          </p>

          <div className="mt-6 p-4 bg-indigo-50 border-l-4 border-indigo-400 text-indigo-800 rounded">
            <p className="font-semibold flex items-center"><Icon.Key className="w-4 h-4 mr-2" /> 最佳实践</p>
            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
              <li>长度至上：您的密码长度应 <b>至少 14 位</b> ，推荐 16 位以上。</li>
              <li>使用密码生成器：利用密码管理器内置的生成器创建真正随机、高熵的密码。</li>
              <li>为每个网站使用独一无二的密码。</li>
            </ul>
          </div>
        </section>
        
        {/* -------------------- 检查密码泄露 -------------------- */}
        <section>
          <SectionTitle 
            icon="AlertTriangle" 
            title="三、查找自己的密码是否被泄漏" 
            subtitle="定期检查您的账户凭证是否已暴露在公开的数据库泄露事件中。" 
          />

          <div className="space-y-4">
            {leakCheckers.map((checker) => (
              <div key={checker.name} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800">{checker.name}</h3>
                <p className="text-sm text-gray-700 mt-1">{checker.description}</p>
                <a 
                  href={checker.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center mt-2 transition"
                >
                  前往检查
                  <Icon.Link className="w-3 h-3 ml-1" />
                </a>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-gray-600">
             <b>注意：</b>  当使用 HIBP 检查密码时，系统只会发送您的密码的加密散列值，不会泄露您的原始密码。
          </p>
        </section>
        
      </div>
    </div>
  );
};

export default App;