import { buildContextString } from './utils.js';

export const comprehensive = async (context, options = {}) => {
  const cfg = await chrome.storage.sync.get('config');
  const pCfg = cfg.config?.prompts?.comprehensive || {};
  const {
    summaryLength = 'long',
    maxInsights = 15,
    maxFAQ = 10,
    includeTimestamps = true,
    language = 'en',
  } = options;
  const transcript =
    context.transcript && context.transcript.length > 0
      ? typeof context.transcript === 'string'
        ? context.transcript
        : JSON.stringify(context.transcript)
      : 'No transcript available. Analyze based on Context (Metadata, Lyrics, Comments).';
  const lengthMap = {
    short: '3-5 detailed bullet points',
    medium: '8-12 comprehensive bullet points',
    long: '15-25 exhaustive bullet points',
  };
  const role =
    pCfg.roleDescription ||
    'Elite AI Video Analyst - Senior Content Strategist with 20+ years analyzing educational, entertainment, and technical content';
  const resourcesEnabled = pCfg.includeResourcesSection !== false;
  const takeawaysEnabled = pCfg.includeActionableTakeaways !== false;
  const maxResources = pCfg.maxResourcesMentioned || 10;
  const maxTakeaways = pCfg.maxTakeaways || 5;
  return `Role: ${role}
Task: Generate EXHAUSTIVE, MAXIMUM-DETAIL video analysis with HIGHEST information density per token.

${buildContextString(context)}

CONFIGURATION:
- Summary Depth: ${lengthMap[summaryLength] || lengthMap.long}
- Key Insights Target: ${maxInsights}+ (extract ALL significant points)
- FAQ Target: ${maxFAQ}+ (cover all viewer questions)
- Timestamps: ${includeTimestamps ? 'MANDATORY [MM:SS] for EVERY point' : 'Optional'}
- Language: ${language}

CRITICAL EXECUTION RULES:
1. **Maximum Detail**: Extract EVERY significant point, argument, example, statistic, reference from video.
2. **Timestamp Precision**: ${includeTimestamps ? 'MANDATORY [MM:SS] for EVERY bullet point and insight' : 'Include when relevant'}.
3. **Actionable Insights**: Focus on specific, concrete takeaways - avoid generic observations.
4. **Comprehensive FAQ**: Cover technical questions, clarifications, practical applications, follow-up topics.
5. **Information Density**: Maximize content per token - every sentence must add value.
6. **Structured Hierarchy**: Use clear sections, subsections, and logical flow.

BEST PRACTICES (November 2025 Standards):
- **Summary Structure**: Opening context → Main arguments → Supporting evidence → Conclusions → Actionable takeaways
- **Key Insights Format**: [Timestamp] **Primary Concept**: Detailed explanation with **technical specifics**, **practical application**, and **expected outcomes**
- **FAQ Structure**: Technical depth → Practical how-to → Comparisons → Troubleshooting → Advanced topics
- **Keyword Strategy**: Bold ALL named entities, technical terms, frameworks, methodologies, statistics, key concepts
- **Timestamp Anchoring**: Every major point must have precise [MM:SS] reference for verification

OUTPUT FORMAT (Strict Markdown):

## Summary
${includeTimestamps ? '- **[00:00]** Opening: **Key concept** introduced with **specific detail** and **context**\n- **[02:15]** Development: **Main argument** explained through **example/case study** with **supporting evidence**\n- **[05:30]** Deep dive: **Technical implementation** of **core principle** using **specific methodology**\n- **[08:45]** Analysis: **Critical insight** about **domain topic** with **real-world implications**\n- **[12:00]** Application: **Practical use case** demonstrating **methodology** with **expected outcomes**\n- **[15:30]** Advanced concepts: **Complex topic** broken down with **step-by-step explanation**\n- **[18:00]** Conclusion: **Key takeaways** summarized with **actionable recommendations**\n(Continue exhaustively - capture EVERY major point, transition, example, conclusion)' : '- **Opening concept**: Detailed explanation with **key terms** highlighted and **context provided**\n- **Main argument**: Comprehensive breakdown with **supporting evidence** and **practical examples**\n- **Technical details**: Specific **methodologies** and **frameworks** explained with **implementation notes**\n(Continue with maximum detail)'}

## Key Insights
- **[MM:SS]** **Primary Insight**: Detailed explanation of **core concept** with **actionable takeaway** and **practical application**. Example: **[specific case]** demonstrates **[principle]** resulting in **[outcome]**.
- **[MM:SS]** **Technical Detail**: Specific **methodology** or **framework** explained with **implementation notes**. Key consideration: **[important detail]** affects **[aspect]**.
- **[MM:SS]** **Critical Analysis**: Deep examination of **key principle** with **real-world implications**. Comparison: **[approach A]** vs **[approach B]** shows **[difference]**.
- **[MM:SS]** **Best Practice**: Concrete **recommendation** for **specific scenario** with **expected outcomes**. Warning: **[common mistake]** leads to **[problem]**.
- **[MM:SS]** **Advanced Concept**: Nuanced understanding of **complex topic** with **expert-level detail**. Application: **[technique]** in **[context]** achieves **[result]**.
- **[MM:SS]** **Statistical Evidence**: **[Data point]** from **[source]** supports **[claim]**. Trend: **[pattern]** indicates **[insight]**.
- **[MM:SS]** **Case Study**: **[Real-world example]** illustrates **[principle]**. Outcome: **[result]** achieved through **[method]**.
(Generate ${maxInsights}+ insights - prioritize depth, specificity, actionability, technical accuracy)

## FAQ
**Q: What is **[key concept]** and how does it work?**
A: **[MM:SS]** Detailed explanation: **[concept]** refers to **[definition]** and operates by **[mechanism]**. Practical example: **[specific case]** demonstrates **[application]**. Key components: **[element 1]**, **[element 2]**, **[element 3]**.

**Q: How can I apply **[technique/method]** in **[context]**?**
A: **[MM:SS]** Step-by-step: First, **[action 1]** using **[tool/approach]** to achieve **[intermediate goal]**. Then, **[action 2]** to reach **[outcome]**. Key consideration: **[important detail]** affects **[aspect]**. Common pitfall: **[mistake]** - avoid by **[solution]**.

**Q: What are the differences between **[concept A]** and **[concept B]**?**
A: **[MM:SS]** Comparison: **[concept A]** focuses on **[aspect]** and excels at **[use case]**, while **[concept B]** emphasizes **[different aspect]** and suits **[alternative use case]**. Use **[A]** when **[scenario]**, use **[B]** when **[alternative scenario]**. Trade-offs: **[A]** offers **[benefit]** but **[limitation]**, **[B]** provides **[benefit]** but **[limitation]**.

**Q: What are common mistakes when implementing **[topic]**?**
A: **[MM:SS]** Top mistakes: 1) **[Error 1]** - causes **[problem]**, fix with **[solution]**. 2) **[Error 2]** - leads to **[issue]**, prevent by **[approach]**. 3) **[Error 3]** - results in **[consequence]**, avoid through **[method]**.

**Q: What advanced techniques exist for **[topic]**?**
A: **[MM:SS]** Advanced approaches: **[Technique 1]** - **[description]** with **[benefit]** and **[use case]**. **[Technique 2]** - **[description]** with **[advantage]** and **[application]**. Expert tip: **[insight]** improves **[aspect]** by **[amount/degree]**.

(Generate ${maxFAQ}+ Q&A pairs - cover technical details, practical applications, comparisons, troubleshooting, advanced topics, edge cases)

${
  resourcesEnabled
    ? `## Additional Resources (if mentioned)
- **[Resource Name]**: **[Description]** - **[Why relevant]** - **[Where to find]**
(Include up to ${maxResources} books, tools, frameworks, websites, courses mentioned in video)

`
    : ''
}${
    takeawaysEnabled
      ? `## Actionable Takeaways
1. **[Immediate Action]**: **[What to do]** to achieve **[outcome]**
2. **[Next Step]**: **[How to proceed]** for **[goal]**
3. **[Long-term Strategy]**: **[Approach]** to reach **[objective]**
(${maxTakeaways} concrete, implementable actions)

`
      : ''
  }OPTIMIZATION DIRECTIVES:
- Maximize information density per token
- Bold formatting = low-token highlighting mechanism
- Bullet points = efficient structure for comprehensive coverage
- Every timestamp anchors specific, detailed content
- Prioritize specificity over generalization
- Extract ALL named entities, statistics, examples, references
- Use hierarchical structure for complex topics
- Include quantitative data when available
- Provide context for technical terms
- Link related concepts explicitly

Transcript:
${transcript}`;
};
