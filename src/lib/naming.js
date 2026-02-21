import { CHAR_DB, POEMS, STROKES, STYLE_DEFINITIONS, MALE_ONLY_CHARS, FEMALE_ONLY_CHARS, MODERN_AUSPICIOUS_CHARS, BAD_NAME_CHARS, HOMOPHONE_BLACKLIST } from './data.js';
import { CHAR_ATTRIBUTES, PARTICLES } from './char_attributes.js';

// Dynamic Impression Generator
const getDynamicImpression = (wx1, wx2, sancaiScore, totalStroke, fullName) => {
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
    let age = `**📅 人生阶段推演**：\n`;
    const nameLabel = fullName ? `“${fullName}”小朋友` : '宝宝';
    
    if (sancaiScore >= 5) {
        age += `👶 **幼年 (0-12岁)**：${nameLabel}性格乖巧听话，深受长辈和老师喜爱，学业起步顺遂。\n`;
        age += `🧑 **青年 (18-30岁)**：步入社会后贵人运强，容易获得提拔，事业发展如鱼得水。\n`;
        age += `👴 **中晚年**：根基稳固，家庭和睦，晚年生活富足安康。全龄段皆宜。`;
    } else if (sancaiScore <= -5) {
        age += `👶 **幼年 (0-12岁)**：${nameLabel}小时候可能比较调皮或有主见，需要家长耐心引导，磨砺心性。\n`;
        age += `🧑 **青年 (18-30岁)**：早期打拼可能会遇到一些挑战，但正是这些经历会让他/她变得更强大。\n`;
        age += `👴 **中晚年**：属于大器晚成型，中年后凭自身实力开创局面，晚景优渥。`;
    } else {
        age += `👶 **幼年 (0-12岁)**：${nameLabel}成长环境平稳，无大起大落，度过快乐童年。\n`;
        age += `🧑 **青年 (18-30岁)**：运势平稳上升，适合稳扎稳打，在专业领域深耕细作。\n`;
        age += `👴 **中晚年**：付出终有回报，中年后运势渐入佳境，生活安逸。`;
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
        if (badList.includes(char2)) {
             throw new Error(`名字「${surname}...${char2}」可能包含不雅谐音`);
        }
    }
};

export function calculateNameScore(surname, char1, char2, bazi, source) {
    if (!isHanChar(char1) || isBannedChar(char1)) {
        throw new Error(`名字包含不建议用字：「${char1}」`);
    }
    if (char2 && (!isHanChar(char2) || isBannedChar(char2))) {
        throw new Error(`名字包含不建议用字：「${char2}」`);
    }
    
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
    const wx2 = char2 ? getWuxing(char2) : wx1;
    
    // Detailed Wuxing Analysis Text
    let baziAnalysis = "";
    const wuxingText = [];
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
    
    let relationText = "";
    if (dmElement) {
        if (wx1 === dmElement || wx2 === dmElement) {
             relationText = isStrong ? "⚠️ 增强日主(忌)" : "✅ 帮扶日主(喜)";
        } else {
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

    // 3. Cultural & Phonetic Analysis (Updated)
    let culturalAnalysis = "";
    let phoneticAnalysis = "";

    // Phonetic Logic
    const t1 = CHAR_ATTRIBUTES[char1]?.tone;
    const t2 = char2 ? CHAR_ATTRIBUTES[char2]?.tone : null;
    
    const pz = (t) => {
        if (!t) return '?';
        return (t === 1 || t === 2) ? '平' : '仄';
    };

    if (t1) {
       const tonePattern = `${pz(t1)}${t2 ? pz(t2) : ''}`;
       // For 3 chars (Surname + Name), technically we should check full flow, but here we focus on the name part
       phoneticAnalysis = `🔊 **音律分析**\n音调为“${t1}声${t2 ? '、'+t2+'声' : ''}” [${tonePattern}]。`;
       if (char2) {
          if (pz(t1) !== pz(t2)) phoneticAnalysis += "\n✅ 平仄搭配，抑扬顿挫，朗朗上口。";
          else phoneticAnalysis += "\n⚠️ 虽为同调，但韵律和谐，读音响亮。"; 
       } else {
          phoneticAnalysis += "\n✅ 单字有力，余音绕梁。";
       }
    } else {
       phoneticAnalysis = `🔊 **音律分析**\n声韵优美，读音响亮（暂无详细声调数据）。`;
    }

    // Cultural Logic
    if (source) {
        culturalScore += 10;
        culturalAnalysis = `📜 **典籍出处**\n“${source.text}”\n—— ${source.source}。\n富有${wx1}${char2 ? wx2 : ''}之意象，意境深远。`;
    } else {
        const m1 = CHAR_ATTRIBUTES[char1]?.meaning;
        const m2 = char2 ? CHAR_ATTRIBUTES[char2]?.meaning : null;
        
        if (m1 || m2) {
            culturalScore += 8;
            culturalAnalysis = "💡 **寓意解析**\n";
            if (m1) culturalAnalysis += `🔹 **${char1}**：${m1}。\n`;
            if (m2) culturalAnalysis += `🔹 **${char2}**：${m2}。\n`;
            culturalAnalysis += "\n✨ **综合评价**：二字结合，寓意美好，气韵生动。";
        } else {
            culturalScore += 5;
            culturalAnalysis = "💡 **现代组合**\n字义稳重，朗朗上口，符合现代审美习惯。";
        }
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

    const { social, psycho } = getDynamicImpression(wx1, wx2, sancaiScore, totalStroke, surname + char1 + (char2 || ''));
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
           phonetic: phoneticAnalysis, 
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
  
  const favoredElements = bazi.favorable && bazi.favorable.length > 0 ? bazi.favorable : ['土', '金'];
  
  const wxA = favoredElements[0];
  const wxB = favoredElements[1] || favoredElements[0];
  
  const normalizeChar = (c) => (typeof c === 'string' ? c.trim() : '');
  const isValidChar = (c) => {
    const ch = normalizeChar(c);
    if (!ch || ch.length !== 1) return false;
    if (/\s/.test(ch)) return false;
    if (!isHanChar(ch)) return false;
    if (isBannedChar(ch)) return false;
    
    // NEW: Filter out particles to avoid meaningless names
    if (PARTICLES.includes(ch)) return false;

    const strokes = STROKES[ch];
    if (!strokes) return false;
    if (strokes >= 31) return false;
    if (gender === 'female' && Array.isArray(MALE_ONLY_CHARS) && MALE_ONLY_CHARS.includes(ch)) return false;
    if (gender === 'male' && Array.isArray(FEMALE_ONLY_CHARS) && FEMALE_ONLY_CHARS.includes(ch)) return false;
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
    if (poem.gender !== 'mixed' && poem.gender !== gender) return;
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
  
  const limit = 60;

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
        if (c1 === c2) continue;

        try {
            const candidate = calculateNameScore(surname, c1, c2, bazi);
            const bias = sourcePreference === 'modern' ? 2 : 0;
            const styleBias = (styleKeywords.includes(c1) ? 1 : 0) + (styleKeywords.includes(c2) ? 1 : 0);
            candidate.score = Math.min(100, Math.max(0, candidate.score + bias + styleBias));
            candidates.push(candidate);
        } catch (e) {
        }
      }
    }
  }

  const uniqueMap = new Map();
  for (const c of candidates) {
    const key = `${c.char1}|${c.char2 || ''}`;
    const existing = uniqueMap.get(key);
    if (!existing || (typeof c.score === 'number' && c.score > existing.score)) {
      uniqueMap.set(key, c);
    }
  }

  const sorted = Array.from(uniqueMap.values()).sort((a, b) => b.score - a.score);

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
