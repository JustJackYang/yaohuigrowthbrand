import { CHAR_DB, POEMS, STROKES, STYLE_DEFINITIONS, MALE_ONLY_CHARS, MODERN_AUSPICIOUS_CHARS, BAD_NAME_CHARS, HOMOPHONE_BLACKLIST } from './data.js';

// Dynamic Impression Generator
const getDynamicImpression = (wx1, wx2, sancaiScore, totalStroke) => {
    const wuxingTraits = {
        '木': { keyword: '仁爱', trait: '正直向上', career: '教育/艺术/医疗' },
        '火': { keyword: '礼仪', trait: '热情开朗', career: '科技/餐饮/演艺' },
        '土': { keyword: '信誉', trait: '稳重踏实', career: '建筑/农业/管理' },
        '金': { keyword: '义气', trait: '果敢坚毅', career: '金融/法律/军警' },
        '水': { keyword: '智慧', trait: '聪慧灵动', career: '贸易/物流/智库' }
    };

    const t1 = wuxingTraits[wx1] || { keyword: '独特', trait: '个性鲜明', career: '自由职业' };
    const t2 = wuxingTraits[wx2] || t1;

    // Social Impression
    let social = `👀 **第一印象**\n`;
    social += `${t1.keyword}与${t2.keyword}并存，给人以“${t1.trait}${wx1 !== wx2 ? '且' + t2.trait : ''}”的观感。\n`;
    if (totalStroke > 30) {
        social += `名字气场宏大，易在群体中建立威信，适合领导者或专业人士。`;
    } else {
        social += `名字亲切随和，易获得他人信任与好感，人缘极佳。`;
    }

    // Psychological & Career
    let psycho = `🧠 **潜意识与发展**\n`;
    psycho += `**性格暗示**：${t1.trait}，做事${wx2 === '金' || wx2 === '火' ? '风风火火' : '沉稳有序'}。\n`;
    psycho += `**职业方向**：适合向${t1.career}或${t2.career}领域发展。\n`;
    
    // Age Suitability based on Sancai
    // Heaven (Youth/Elders), Person (Middle Age/Self), Earth (Middle-Late/Juniors)
    // Simplified: Person is the core.
    let age = `**年龄适配**：\n`;
    if (sancaiScore >= 5) {
        age += `少年运势顺遂（得长辈助），中年事业有成（基础稳固），晚年安享富贵。全龄段皆宜。`;
    } else if (sancaiScore <= -5) {
        age += `少年时期需磨砺心性，中年后凭借自身努力可开创局面。属大器晚成型。`;
    } else {
        age += `青年时期平稳发展，中年后运势渐入佳境。适合稳扎稳打。`;
    }
    
    psycho += age;

    return { social, psycho };
};

const AUSPICIOUS_STROKES = [1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 21, 23, 24, 25, 29, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 81];

const getWugeElementByStroke = (n) => {
    const mod = Math.abs(Number(n) || 0) % 10;
    if (mod === 1 || mod === 2) return '木';
    if (mod === 3 || mod === 4) return '火';
    if (mod === 5 || mod === 6) return '土';
    if (mod === 7 || mod === 8) return '金';
    return '水';
};

const isGenerating = (from, to) => {
    const generating = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    return generating[from] === to;
};

const isControlling = (from, to) => {
    const controlling = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
    return controlling[from] === to;
};

const isHanChar = (c) => /^[\u3400-\u4DBF\u4E00-\u9FFF]$/.test(String(c || ''));
const isBannedChar = (c) => Array.isArray(BAD_NAME_CHARS) && BAD_NAME_CHARS.includes(c);

const checkHomophones = (surname, char1, char2) => {
    const badList = HOMOPHONE_BLACKLIST[surname];
    if (!badList) return;
    
    if (badList.includes(char1)) {
        throw new Error(`名字「${surname}${char1}」可能包含不雅谐音`);
    }
    
    if (char2) {
        // Check full name combinations if needed (e.g. Yang Wei)
        // Check char2 specifically
        if (badList.includes(char2)) {
             throw new Error(`名字「${surname}...${char2}」可能包含不雅谐音`);
        }
        
        // Simple heuristic for 2-char names: Check if char1+char2 forms a bad word?
        // Since we don't have pinyin, we rely on the blacklist being comprehensive for single chars relative to surname
    }
};

export function calculateNameScore(surname, char1, char2, bazi, source) {
    if (!isHanChar(char1) || isBannedChar(char1)) {
        throw new Error(`名字包含不建议用字：「${char1}」`);
    }
    if (char2 && (!isHanChar(char2) || isBannedChar(char2))) {
        throw new Error(`名字包含不建议用字：「${char2}」`);
    }
    
    // Check Homophones
    checkHomophones(surname, char1, char2);

    const s0 = STROKES[surname] || 0;
    const s1 = STROKES[char1] || 0;
    const s2 = STROKES[char2] || 0;
    const total = s0 + s1 + s2;
    
    // Scoring Logic (Total 100)
    let wuxingScore = 0; // Max 40
    let strokeScore = 0; // Max 30
    let culturalScore = 0; // Max 20
    let meaningScore = 10; // Max 10 (Base score for meaningful characters)

    // 1. Wuxing Analysis
    const favored = bazi.favorable && bazi.favorable.length > 0 ? bazi.favorable : ['土', '金'];
    const getWuxing = (c) => {
        for (const [wx, chars] of Object.entries(CHAR_DB)) {
            if (chars.includes(c)) return wx;
        }
        return '未知';
    };
    
    const wx1 = getWuxing(char1);
    const wx2 = char2 ? getWuxing(char2) : wx1; // If single char, treat as doubled or neutral
    
    // Detailed Wuxing Analysis Text
    let baziAnalysis = "";
    const wuxingText = [];
    
    // Extract Day Master Element from string "Jia(Wood)" -> "Wood"
    const dmElement = bazi.dayMaster.match(/\((.)\)/)?.[1] || '';
    const isStrong = bazi.strongOrWeak === '身旺';

    if (favored.includes(wx1)) {
        wuxingScore += 20;
        wuxingText.push(`「${char1}」(${wx1}) 为喜用神`);
    } else if (wx1 !== '未知') {
        wuxingScore += 10;
        wuxingText.push(`「${char1}」(${wx1}) 五行相生`);
    }
    
    if (char2) {
        if (favored.includes(wx2)) {
            wuxingScore += 20;
            wuxingText.push(`「${char2}」(${wx2}) 为喜用神`);
        } else if (wx2 !== '未知') {
            wuxingScore += 10;
            wuxingText.push(`「${char2}」(${wx2}) 五行相生`);
        }
    } else {
        wuxingScore *= 2; 
    }
    
    // Construct Relationship Logic
    let relationText = "";
    if (dmElement) {
        if (wx1 === dmElement || wx2 === dmElement) {
             relationText = isStrong ? "⚠️ 增强日主(忌)" : "✅ 帮扶日主(喜)";
        } else {
             // Simplified relationship logic
             const generating = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
             const controlling = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
             
             if (generating[dmElement] === wx1 || generating[dmElement] === wx2) {
                 relationText = "✅ 食伤泄秀(才华)";
             } else if (controlling[dmElement] === wx1 || controlling[dmElement] === wx2) {
                 relationText = "✅ 财星/官星(事业)";
             } else if (generating[wx1] === dmElement || generating[wx2] === dmElement) {
                 relationText = isStrong ? "⚠️ 印星生身(忌)" : "✅ 印星护身(贵人)";
             }
        }
    }

    baziAnalysis = `日主${bazi.dayMaster}，${bazi.strongOrWeak}。\n${wuxingText.join("，")}。\n${relationText}。整体平衡度：${favored.includes(wx1) && (char2 ? favored.includes(wx2) : true) ? "⭐⭐⭐ 完美" : "⭐⭐ 良好"}`;

    // 2. Stroke Analysis
    let strokeAnalysis = "";
    const personStroke = s0 + s1; // 人格
    const earthStroke = char2 ? s1 + s2 : s1 + 1;  // 地格
    const totalStroke = total;    // 总格
    const heavenStroke = s0 + 1; // 天格
    const sancai = {
        heaven: getWugeElementByStroke(heavenStroke),
        person: getWugeElementByStroke(personStroke),
        earth: getWugeElementByStroke(earthStroke)
    };
    let sancaiScore = 0;
    if (isGenerating(sancai.heaven, sancai.person)) sancaiScore += 5;
    if (isGenerating(sancai.person, sancai.earth)) sancaiScore += 5;
    if (isControlling(sancai.heaven, sancai.person)) sancaiScore -= 5;
    if (isControlling(sancai.person, sancai.earth)) sancaiScore -= 5;

    if (AUSPICIOUS_STROKES.includes(total)) {
        strokeScore += 30;
        strokeAnalysis = `总格${total}(大吉) - 运势亨通`;
    } else {
        strokeScore += 15;
        strokeAnalysis = `总格${total}(中平) - 守成之象`;
    }
    
    strokeAnalysis += ` | 人格${personStroke}(${AUSPICIOUS_STROKES.includes(personStroke) ? '吉' : '平'}) | 地格${earthStroke}(${AUSPICIOUS_STROKES.includes(earthStroke) ? '吉' : '平'})`;
    strokeAnalysis += ` | 三才:${sancai.heaven}${sancai.person}${sancai.earth}(${sancaiScore >= 5 ? '顺生' : sancaiScore <= -5 ? '相克' : '平'})`;
    strokeScore += Math.max(-5, Math.min(10, sancaiScore));

    // 3. Cultural Source
    let culturalAnalysis = "";
    if (source) {
        culturalScore += 10;
        // Parse source like "Li Bai <Jing Ye Si>"
        culturalAnalysis = `📜 典籍出处\n“${source.text}”\n—— ${source.source}。\n富有${wx1}${char2 ? wx2 : ''}之意象，意境深远。`;
    } else {
        culturalScore += 8;
        culturalAnalysis = "💡 现代组合\n字义稳重，朗朗上口，符合现代审美习惯。";
    }

    const totalScore = wuxingScore + strokeScore + culturalScore + meaningScore;
    
    let level = '一般';
    let summary = "";
    if (totalScore >= 90) {
        level = '⭐⭐⭐⭐⭐ (完美)';
        summary = "✅ **终极推荐**\n此名五行大补，数理全吉，且有文化出处。是难得的“三位一体”好名。";
    } else if (totalScore >= 80) {
        level = '⭐⭐⭐⭐ (优秀)';
        summary = "✅ **优选好名**\n五行平衡，数理吉祥。适合长期使用，助力人生运势。";
    } else if (totalScore >= 70) {
        level = '⭐⭐⭐ (良好)';
        summary = "⭕ **尚可备选**\n虽无大碍，但亮点不足。建议结合个人喜好选择。";
    } else {
        summary = "⚠️ **建议慎选**\n存在五行或数理上的短板，可能不够完美。";
    }

    // 4. Social & Psychology (Dynamic Generation)
    const { social, psycho } = getDynamicImpression(wx1, wx2, sancaiScore, totalStroke);
    const socialAnalysis = social;
    const psychologyAnalysis = psycho;

    return {
       surname,
       char1,
       char2,
       fullName: surname + char1 + (char2 || ''),
       strokes: { surname: s0, char1: s1, char2: s2, total },
       wuxing: [wx1, wx2],
       score: totalScore,
       scoreDetails: { wuxing: wuxingScore, stroke: strokeScore, cultural: culturalScore, meaning: meaningScore },
       analysis: {
           baziMatch: baziAnalysis,
           culturalDepth: culturalAnalysis,
           phonetic: `🔊 **音律建议**\n建议避免“全同调/全仄/全平”，优先选择抑扬起伏、读起来顺口的组合。`, 
           stroke: strokeAnalysis,
           social: socialAnalysis,
           psychology: psychologyAnalysis,
           summary: summary
       },
       source: source ? { text: source.text, source: source.source } : undefined,
       recommendationLevel: level,
       styleTags: source?.styles || []
    };
}

export function generateNames(
  surname,
  bazi,
  count = 10,
  offset = 0,
  gender = 'male',
  targetStyle = 'all',
  nameLength = 2,
  sourcePreference = 'balanced'
) {
  const candidates = [];
  
  // Use calculated favored elements or fallback to Earth/Metal
  const favoredElements = bazi.favorable && bazi.favorable.length > 0 ? bazi.favorable : ['土', '金'];
  
  // Select character pools based on favored elements
  // If we have 1 favored element, we use it for both chars or mix with generating element
  const wxA = favoredElements[0];
  const wxB = favoredElements[1] || favoredElements[0]; // Fallback to same if only 1
  
  const normalizeChar = (c) => (typeof c === 'string' ? c.trim() : '');
  const isValidChar = (c) => {
    const ch = normalizeChar(c);
    if (!ch || ch.length !== 1) return false;
    if (/\s/.test(ch)) return false;
    if (!isHanChar(ch)) return false;
    if (isBannedChar(ch)) return false;
    const strokes = STROKES[ch];
    if (!strokes) return false;
    // Cap stroke count to avoid super complex chars
    if (strokes >= 31) return false;
    if (gender === 'female' && Array.isArray(MALE_ONLY_CHARS) && MALE_ONLY_CHARS.includes(ch)) return false;
    return true;
  };

  const uniq = (arr) => Array.from(new Set((arr || []).map(normalizeChar).filter(Boolean)));

  const baseA = uniq(CHAR_DB[wxA] || []).filter(isValidChar);
  const baseB = uniq(CHAR_DB[wxB] || []).filter(isValidChar);
  const modern = uniq([...(MODERN_AUSPICIOUS_CHARS?.[gender] || []), ...(MODERN_AUSPICIOUS_CHARS?.mixed || [])]).filter(isValidChar);
  const styleKeywords = targetStyle !== 'all'
    ? uniq(STYLE_DEFINITIONS?.[gender]?.[targetStyle]?.keywords || []).filter(isValidChar)
    : [];

  const charsA = uniq([...styleKeywords, ...modern, ...baseA]).filter(isValidChar);
  const charsB = uniq([...styleKeywords, ...modern, ...baseB]).filter(isValidChar);
  
  const safePoems = Array.isArray(POEMS) ? POEMS : [];
  const poemEnabled = sourcePreference !== 'modern';

  // 1. Generate from Poems
  if (poemEnabled) safePoems.forEach(poem => {
    // Gender Filter
    if (poem.gender !== 'mixed' && poem.gender !== gender) return;
    // Style Filter
    if (targetStyle !== 'all' && poem.styles && !poem.styles.includes(targetStyle)) return;

    if (poem.keywords.length >= 2) {
      const c1 = normalizeChar(poem.keywords[0]);
      const c2 = normalizeChar(poem.keywords[1]);
      
      if (!isValidChar(c1) || !isValidChar(c2)) return;

      try {
        const candidate = calculateNameScore(surname, c1, c2, bazi, poem);
        const bias = sourcePreference === 'classic' ? 2 : 0;
        const styleBias = (styleKeywords.includes(c1) ? 1 : 0) + (styleKeywords.includes(c2) ? 1 : 0);
        candidate.score = Math.min(100, Math.max(0, candidate.score + bias + styleBias));
        candidates.push(candidate);
      } catch (e) {}
    }
  });
  
  const limit = 60; // Inner loop limit

  if (Number(nameLength) === 1) {
    const pool = uniq([...styleKeywords, ...modern, ...charsA, ...charsB]).filter(isValidChar);
    for (let i = 0; i < Math.min(pool.length, 200); i++) {
      const c1 = pool[i];
      try {
        const candidate = calculateNameScore(surname, c1, '', bazi);
        const bias = sourcePreference === 'modern' ? 2 : 0;
        const styleBias = styleKeywords.includes(c1) ? 2 : 0;
        candidate.score = Math.min(100, Math.max(0, candidate.score + bias + styleBias));
        candidates.push(candidate);
      } catch (e) {}
    }
  } else {
    // 2. Generate combinations
    for (let i = 0; i < Math.min(charsA.length, limit); i++) {
      for (let j = 0; j < Math.min(charsB.length, limit); j++) {
        const c1 = charsA[i];
        const c2 = charsB[j];

        if (!isValidChar(c1) || !isValidChar(c2)) continue;
        if (c1 === c2) continue; // Avoid repeating chars like "Yang Yang" unless intentional

        try {
            const candidate = calculateNameScore(surname, c1, c2, bazi);
            const bias = sourcePreference === 'modern' ? 2 : 0;
            const styleBias = (styleKeywords.includes(c1) ? 1 : 0) + (styleKeywords.includes(c2) ? 1 : 0);
            candidate.score = Math.min(100, Math.max(0, candidate.score + bias + styleBias));
            candidates.push(candidate);
        } catch (e) {
            // e.g. Homophone error, skip
        }
      }
    }
  }

  // De-duplicate
  const uniqueMap = new Map();
  for (const c of candidates) {
    const key = `${c.char1}|${c.char2 || ''}`;
    const existing = uniqueMap.get(key);
    if (!existing || (typeof c.score === 'number' && c.score > existing.score)) {
      uniqueMap.set(key, c);
    }
  }

  // Sort
  const sorted = Array.from(uniqueMap.values()).sort((a, b) => b.score - a.score);

  // Pagination with diversity check
  const diverse = [];
  const usedFullNames = new Set();
  const charCounts = {};

  const desired = Math.max(0, Number(offset) || 0) + Math.max(0, Number(count) || 0);
  const softCap = desired + 80;

  for (let i = 0; i < sorted.length; i++) {
    const candidate = sorted[i];
    const fullNameKey = candidate.fullName;
    if (usedFullNames.has(fullNameKey)) continue;

    const c1 = candidate.char1;
    const c2 = candidate.char2 || '';
    const count1 = charCounts[c1] || 0;
    const count2 = c2 ? (charCounts[c2] || 0) : 0;

    // Diversity limit: reduced to 2 to force more variety
    if (count1 >= 3 || (c2 && count2 >= 3)) continue;

    diverse.push(candidate);
    usedFullNames.add(fullNameKey);
    charCounts[c1] = count1 + 1;
    if (c2) charCounts[c2] = count2 + 1;

    if (diverse.length >= softCap) break;
  }

  const start = Math.max(0, Number(offset) || 0);
  const end = start + Math.max(0, Number(count) || 0);
  return diverse.slice(start, end);
}
