import React, { useState, useMemo } from 'react';
import { Shield, Key, RefreshCw, CheckCircle, Eye, EyeOff, ArrowRight, Wand2, Lock } from 'lucide-react';

// --- Types ---
interface Inputs {
  basePassword: string;
  masterKey: string;
  generatedResult: string;
}

interface Risk {
  type: string;
  index: number;
  len: number;
  msg: string;
}

interface ValidationReport {
  isValid: boolean;
  score: number;
  errors: string[];
}

const PasswordTool: React.FC = () => {
  // --- State ---
  const [inputs, setInputs] = useState<Inputs>({
    basePassword: '',
    masterKey: '',
    generatedResult: ''
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  // --- Logic: Constants & Helpers ---
  const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const NUMBERS = '0123456789';
  const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ALL_CHARS = LOWERCASE + UPPERCASE + NUMBERS + SPECIAL_CHARS;

  // Helper: Simple deterministic random number generator based on seed
  const mulberry32 = (a: number) => {
    return function (): number {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
  }

  // Generate a numeric seed from a string
  const getSeedFromString = (str: string): number => {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  // Helper: Check for sequential characters or generic risks (No user info)
  const findRisks = (str: string): Risk[] => {
    const risks: Risk[] = [];
    if (!str || str.length < 3) return risks;

    const lowerStr = str.toLowerCase();

    // 1. Identical 3+ chars (e.g. "aaa")
    const identicalMatch = str.match(/(.)\1\1/);
    if (identicalMatch && identicalMatch.index !== undefined) {
      risks.push({ type: 'repeat', index: identicalMatch.index, len: 3, msg: '重复字符 (如 aaa)' });
    }

    // 2. Sequences (123, abc)
    for (let i = 0; i <= str.length - 3; i++) {
      const sub = lowerStr.substring(i, i + 3);
      const isNumSeq = NUMBERS.includes(sub) || NUMBERS.split('').reverse().join('').includes(sub);
      const isLetSeq = LOWERCASE.includes(sub) || LOWERCASE.split('').reverse().join('').includes(sub);

      if (isNumSeq || isLetSeq) {
        risks.push({ type: 'sequence', index: i, len: 3, msg: isNumSeq ? '连续数字 (如 123)' : '连续字母 (如 abc)' });
      }
    }
    return risks;
  };

  // --- Logic: Validation Engine (Used for display) ---
  const validatePassword = (pwd: string): ValidationReport => {
    const report: ValidationReport = { isValid: false, score: 0, errors: [] };
    if (!pwd) return report;

    // Rules
    if (pwd.length < 8) report.errors.push('长度不足8位');

    const types = [/[A-Z]/, /[a-z]/, /[0-9]/, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/];
    const typeNames = ['大写', '小写', '数字', '特殊字符'];
    const missing = types.map((regex, i) => regex.test(pwd) ? null : typeNames[i]).filter(Boolean);
    if (missing.length > 0) report.errors.push(`缺少: ${missing.join(', ')}`);

    const risks = findRisks(pwd);
    risks.forEach(r => report.errors.push(`包含${r.msg}`));

    report.isValid = report.errors.length === 0;
    report.score = report.isValid ? 100 : Math.max(0, 100 - report.errors.length * 20);
    return report;
  };

  const validationReport = useMemo(() => validatePassword(inputs.basePassword), [inputs.basePassword]);
  const generatedReport = useMemo(() => validatePassword(inputs.generatedResult), [inputs.generatedResult]); // Unused but kept for logic consistency if needed later

  // --- Logic: Map & Fix Generation ---
  const generateMappedPassword = () => {
    const { basePassword, masterKey } = inputs;
    if (!basePassword || !masterKey) return;

    // Seed from Master Key (口令控制变化)
    const seedVal = getSeedFromString(masterKey);
    const rng = mulberry32(seedVal);

    // Step 1: Mapping (混淆)
    let chars = basePassword.split('');
    let mappedChars = chars.map((char, idx) => {
      const shift = Math.floor(rng() * 10) + 1;
      const charCode = char.charCodeAt(0);
      // Pool selection based on char type
      const pool = /[a-zA-Z]/.test(char) ? (LOWERCASE + UPPERCASE) : (NUMBERS + SPECIAL_CHARS);
      // Map based on pool
      const newIndex = (pool.indexOf(char) + shift + idx) % pool.length;
      if (pool.indexOf(char) === -1) return ALL_CHARS[(charCode + shift) % ALL_CHARS.length];
      return pool[newIndex];
    });

    // Step 2: Identification & Replacement (识别危险并替换)
    let currentPwd = mappedChars.join('');
    let attempts = 0;

    while (attempts < 10) {
      let risks = findRisks(currentPwd);
      let missingTypes: string[] = [];

      // Check missing types
      if (!/[A-Z]/.test(currentPwd)) missingTypes.push(UPPERCASE);
      if (!/[a-z]/.test(currentPwd)) missingTypes.push(LOWERCASE);
      if (!/[0-9]/.test(currentPwd)) missingTypes.push(NUMBERS);
      if (!/[!@#$%^&*]/.test(currentPwd)) missingTypes.push(SPECIAL_CHARS);

      if (risks.length === 0 && missingTypes.length === 0 && currentPwd.length >= 8) {
        break; // All good
      }

      let pwdArr = currentPwd.split('');

      // 2a. Fix Risks (破坏连续或重复)
      for (let risk of risks) {
        const targetIdx = Math.min(risk.index + 1, pwdArr.length - 1);
        const replacePool = SPECIAL_CHARS + NUMBERS;
        pwdArr[targetIdx] = replacePool[Math.floor(rng() * replacePool.length)];
      }

      // 2b. Fix Missing Types (补齐字符)
      if (risks.length === 0 && missingTypes.length > 0) {
        missingTypes.forEach((pool, i) => {
          const targetIdx = (pwdArr.length - 1 - i + pwdArr.length) % pwdArr.length;
          pwdArr[targetIdx] = pool[Math.floor(rng() * pool.length)];
        });
      }

      // 2c. Length check padding
      while (pwdArr.length < 8) {
        pwdArr.push(ALL_CHARS[Math.floor(rng() * ALL_CHARS.length)]);
      }

      currentPwd = pwdArr.join('');
      attempts++;
    }

    setInputs(prev => ({ ...prev, generatedResult: currentPwd }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">GeekPie_ Password Generator</h1>
          </div>
          <p className="text-blue-100">
            输入你好记的旧密码，配合一个“变换口令”，为您生成符合高强度要求的全新密码。
            <br />
            无需记忆乱码，记住口令即可。
            <br />
            本方案只用于临时生成，并非<b>最佳方案</b>，推荐使用<b>更长的密码配合密码管理和同步工具</b>来管理和保存你的密码。
            例如使用<b>浏览器的密码管理和同步</b>功能，只需登录账号即可跨系统同步。
            <br />
            同时，校内 ids 也支持绑定生物识别设备，支持使用安全密钥免密码登录。
          </p>
        </div>

        {/* Main Content */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left: Input & Controls */}
          <div className="space-y-8">

            {/* Section 1: Base Password */}
            <div>
              <label className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-2">
                <span>1. 原始基础密码</span>
                <span className="text-xs font-normal text-slate-400">你现在用的密码</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-lg font-mono"
                  placeholder="例如: MyP@ssword123"
                  value={inputs.basePassword}
                  onChange={(e) => setInputs({ ...inputs, basePassword: e.target.value })}
                />
                <button
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Live Audit of Base Password */}
              {inputs.basePassword && (
                <div className="mt-3 text-sm animate-fade-in">
                  {validationReport.isValid ? (
                    <div className="text-green-600 flex items-center gap-1.5 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                      <CheckCircle size={16} />
                      <span>原密码格式较好</span>
                    </div>
                  ) : (
                    <div className="text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                      <div className="font-semibold text-xs uppercase tracking-wide opacity-80 mb-1">原密码存在弱点 (将在生成中自动修复)</div>
                      <div className="flex flex-wrap gap-2">
                        {validationReport.errors.map((e, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-0.5 rounded border border-amber-200 shadow-sm">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 2: Master Key */}
            <div>
              <label className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-2">
                <span>2. 变换口令 (Master Key)</span>
                <span className="text-xs font-normal text-slate-400">控制密码变化的钥匙</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white font-medium"
                  placeholder="例如: 2025Spring"
                  value={inputs.masterKey}
                  onChange={(e) => setInputs({ ...inputs, masterKey: e.target.value })}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 ml-1">
                提示: 定期更换这个口令（如每年一次），就能在不换“基础密码”的情况下生成全新密码。
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={generateMappedPassword}
                disabled={!inputs.basePassword || !inputs.masterKey}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98]
                            ${(!inputs.basePassword || !inputs.masterKey)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200'}`}
              >
                <Wand2 className="w-6 h-6" />
                立即生成新密码
              </button>
            </div>
          </div>

          {/* Right: Visualization & Result */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Shield size={200} />
            </div>

            {!inputs.generatedResult ? (
              <div className="text-center text-slate-400 max-w-xs relative z-10">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                  <RefreshCw className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-600 mb-2">准备就绪</h3>
                <p className="text-sm leading-relaxed opacity-70">
                  输入左侧信息后，我们将为您计算出一个符合所有安全规则（无重复、含大写等）的强密码。
                </p>
              </div>
            ) : (
              <div className="w-full space-y-8 animate-fade-in relative z-10">

                {/* Process Flow */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-sm text-slate-500 px-2">
                    <span>原始输入</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-400 line-through text-xs">
                      {'*'.repeat(inputs.basePassword.length)}
                    </span>
                  </div>

                  {/* Arrow Connector */}
                  <div className="relative h-8 w-full flex items-center justify-center">
                    <div className="absolute h-px bg-slate-200 w-full z-0"></div>
                    <div className="bg-slate-50 px-2 z-10 text-slate-400 text-xs flex items-center gap-1">
                      <ArrowRight size={14} /> 混淆 & 清洗
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      已自动优化以下规则
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 强制包含大写/小写
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 强制包含特殊符号
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 移除连续字符 (abc, 123)
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 移除重复字符 (aaa)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result Box */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold text-slate-700">最终生成密码</label>
                    <span className="text-xs text-slate-400">{inputs.generatedResult.length} 位字符</span>
                  </div>
                  <div className="relative group">
                    <div className="w-full bg-slate-800 text-white font-mono text-2xl py-6 px-4 rounded-xl break-all shadow-xl tracking-wider text-center border-2 border-slate-700 group-hover:border-indigo-500 transition-colors cursor-text select-all">
                      {inputs.generatedResult}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(inputs.generatedResult)}
                      className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-md backdrop-blur-md transition-all border border-white/10"
                    >
                      复制
                    </button>
                  </div>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    * 只要输入相同的原始密码和口令，结果永远一致
                  </p>
                </div>
              </div>
            )}
          </div>
          <p className="text-center text-xs w-full col-span-2 text-muted-foreground">
            本网站不会存储您的密码，推荐使用密码管理器保存您的密码
            <br/>
            网站由 GeekPie_ 学生社团维护，您可以 <a href="https://github.com/ShanghaitechGeekPie/password-generator" className='underline'>审查我们的代码</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordTool;