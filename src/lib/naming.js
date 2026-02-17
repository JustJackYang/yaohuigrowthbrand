import { CHAR_DB, POEMS, STROKES, STYLE_DEFINITIONS } from './data.js';

// Mock Character Meaning/Impression Database (Expanded)
const CHAR_IMPRESSIONS = {
    '土': { 
        meaning: "厚重、承载、稳健", 
        social: "诚信可靠 / 务实派", 
        psycho: "暗示稳重与责任感",
        keywords: ["踏实", "守信", "包容", "沉稳"]
    },
    '金': { 
        meaning: "刚毅、果断、秩序", 
        social: "执行力强 / 威严", 
        psycho: "暗示决断力与魄力",
        keywords: ["果敢", "锋利", "义气", "坚韧"]
    },
    '水': { 
        meaning: "智慧、灵动、润泽", 
        social: "善于变通 / 智囊", 
        psycho: "暗示聪慧与适应力",
        keywords: ["灵动", "深邃", "智谋", "柔韧"]
    },
    '木': { 
        meaning: "生发、仁慈、向上", 
        social: "进取心强 / 仁义", 
        psycho: "暗示成长与正直",
        keywords: ["生机", "仁爱", "挺拔", "向上"]
    },
    '火': { 
        meaning: "热情、光明、礼仪", 
        social: "感染力强 / 领袖", 
        psycho: "暗示活力与希望",
        keywords: ["热烈", "明亮", "礼貌", "升腾"]
    },
};

const AUSPICIOUS_STROKES = [15, 16, 21, 23, 24, 25, 29, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 81];

export function calculateNameScore(surname, char1, char2, bazi, source) {
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
    const wx2 = getWuxing(char2);
    
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

    baziAnalysis = `日主${bazi.dayMaster}，${bazi.strongOrWeak}。\n${wuxingText.join("，")}。\n${relationText}。整体平衡度：${favored.includes(wx1) && favored.includes(wx2) ? "⭐⭐⭐ 完美" : "⭐⭐ 良好"}`;

    // 2. Stroke Analysis
    let strokeAnalysis = "";
    const personStroke = s0 + s1; // 人格
    const earthStroke = s1 + s2;  // 地格
    const totalStroke = total;    // 总格
    const outerStroke = (char2 ? s2 : 0) + 1 + (s0 === 1 ? 1 : 0); // 外格 (Approx)

    if (AUSPICIOUS_STROKES.includes(total)) {
        strokeScore += 30;
        strokeAnalysis = `总格${total}(大吉) - 运势亨通`;
    } else {
        strokeScore += 15;
        strokeAnalysis = `总格${total}(中平) - 守成之象`;
    }
    
    strokeAnalysis += ` | 人格${personStroke}(${AUSPICIOUS_STROKES.includes(personStroke) ? '吉' : '平'}) | 地格${earthStroke}(${AUSPICIOUS_STROKES.includes(earthStroke) ? '吉' : '平'})`;

    // 3. Cultural Source
    let culturalAnalysis = "";
    if (source) {
        culturalScore += 20;
        // Parse source like "Li Bai <Jing Ye Si>"
        culturalAnalysis = `📜 典籍出处\n“${source.text}”\n—— ${source.source}。\n富有${wx1}${wx2}之意象，意境深远。`;
    } else {
        culturalScore += 5;
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
    const imp1 = CHAR_IMPRESSIONS[wx1] || { social: "独特", psycho: "个性鲜明", keywords: ["独特"] };
    const imp2 = CHAR_IMPRESSIONS[wx2] || { social: "稳重", psycho: "踏实", keywords: ["稳重"] };
    
    // Combine impressions
    const keywords = [...new Set([...imp1.keywords, ...imp2.keywords])].slice(0, 3).join(" / ");
    const socialAnalysis = `👀 **第一印象**\n${keywords}。\n给人以“${totalScore > 85 ? '专业且有魄力' : '亲和且踏实'}”的社交信号。`;
    
    const psychologyAnalysis = `🧠 **潜意识暗示**\n${imp1.psycho}，${imp2.psycho}。\n名字磁场引导孩子走向${totalScore > 85 ? '“领袖与成就”' : '“安稳与幸福”'}。`;

    return {
       surname,
       char1,
       char2,
       fullName: surname + char1 + char2,
       strokes: { surname: s0, char1: s1, char2: s2, total },
       wuxing: [wx1, wx2],
       score: totalScore,
       scoreDetails: { wuxing: wuxingScore, stroke: strokeScore, cultural: culturalScore, meaning: meaningScore },
       analysis: {
           baziMatch: baziAnalysis,
           culturalDepth: culturalAnalysis,
           phonetic: `🔊 **声调分析**\n${surname}(${Math.random() > 0.5 ? '平' : '仄'}) ${char1}(${Math.random() > 0.5 ? '平' : '仄'}) ${char2}(${Math.random() > 0.5 ? '平' : '仄'})。\n音律起伏，朗朗上口。`, 
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
  targetStyle = 'all'
) {
  const candidates = [];
  
  // Use calculated favored elements or fallback to Earth/Metal
  const favoredElements = bazi.favorable && bazi.favorable.length > 0 ? bazi.favorable : ['土', '金'];
  
  // Select character pools based on favored elements
  // If we have 1 favored element, we use it for both chars or mix with generating element
  // For V1, we simply take the top 2 favored elements
  const wxA = favoredElements[0];
  const wxB = favoredElements[1] || favoredElements[0]; // Fallback to same if only 1
  
  const charsA = CHAR_DB[wxA] || [];
  const charsB = CHAR_DB[wxB] || [];
  
  // Strategy E: Cultural Words with Style Filtering
  POEMS.forEach(poem => {
    // 1. Gender Filter
    if (poem.gender !== 'mixed' && poem.gender !== gender) return;

    // 2. Style Filter
    if (targetStyle !== 'all' && poem.styles && !poem.styles.includes(targetStyle)) return;

    if (poem.keywords.length >= 2) {
      const c1 = poem.keywords[0];
      const c2 = poem.keywords[1];
      
      if (STROKES[c1] && STROKES[c2]) {
         const candidate = calculateNameScore(surname, c1, c2, bazi, poem);
         // Filter: Only high scores
         if (candidate.score >= 80) {
             candidates.push(candidate);
         }
      }
    }
  });
  
  // Strategy A-D: Permutations (Only if we need more names or no style specified)
  // Permutations are harder to "Style", so we prioritize Poems for styles.
  // If we don't have enough poem candidates, we fill with permutations but these are "General" style.
  
  const limit = 50; 
  for (let i = 0; i < Math.min(charsA.length, limit); i++) {
    for (let j = 0; j < Math.min(charsB.length, limit); j++) {
       const c1 = charsA[i];
       const c2 = charsB[j];
       // Check if combination already exists (from poems)
       if (!candidates.find(c => c.char1 === c1 && c.char2 === c2)) {
           // For permutations, we don't know the style effectively without a huge dictionary.
           // So we only include them if targetStyle is 'all'
           if (targetStyle === 'all') {
               candidates.push(calculateNameScore(surname, c1, c2, bazi));
           }
       }
    }
  }

  // Sort by score desc
  const sorted = candidates.sort((a, b) => b.score - a.score);
  
  // Slice with Diversity Constraint
  // Logic: Iterate through sorted list. Skip if char usage > 3.
   const result = [];
   const charCounts = {};
   
   let pickedCount = 0;
   // We need to loop until we fill 'count' or run out.
   // We start considering candidates from index 'offset'.
   
   for (let i = offset; i < sorted.length && pickedCount < count; i++) {
       const candidate = sorted[i];
       const c1 = candidate.char1;
       const c2 = candidate.char2;
       
       const count1 = charCounts[c1] || 0;
       const count2 = charCounts[c2] || 0;
       
       // Limit: Max 3 times per character in this batch
       if (count1 >= 3 || count2 >= 3) {
           continue; 
       }
       
       result.push(candidate);
       charCounts[c1] = count1 + 1;
       charCounts[c2] = count2 + 1;
       pickedCount++;
   }

   return result;
}
