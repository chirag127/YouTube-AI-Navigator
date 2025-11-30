import { buildContextString } from './utils.js';

export const comprehensive = (context, options = {}) => {
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

  return `
Role: Elite AI video analyst with deep comprehension capabilities.
Task: Generate exhaustive, highly-detailed video analysis with maximum information density.

Context:
${buildContextString(context)}

Configuration:
- Summary Depth: ${lengthMap[summaryLength] || lengthMap.long}
- Key Insights Target: ${maxInsights}+ (extract ALL significant points)
- FAQ Target: ${maxFAQ}+ (cover all viewer questions)
- Timestamps: ${includeTimestamps ? 'MANDATORY' : 'Optional'}
- Language: ${language}

CRITICAL EXECUTION RULES:
1. **Content Protection**: NEVER skip/summarize main content segments. Sponsors/self-promo excluded unless critically relevant.
2. **Keyword Highlighting**: Use **bold** for ALL key terms, concepts, names, technical terms, and important phrases (e.g., **React hooks**, **machine learning**, **John Doe**).
3. **Maximum Detail**: Extract EVERY significant point, argument, example, statistic, and reference from the video.
4. **Timestamp Precision**: ${includeTimestamps ? 'MANDATORY [MM:SS] for EVERY bullet point and insight' : 'Include when relevant'}.
5. **Actionable Insights**: Focus on specific, concrete takeaways—avoid generic observations.
6. **Comprehensive FAQ**: Cover technical questions, clarifications, practical applications, and follow-up topics.

OUTPUT FORMAT (Strict Markdown):

## Summary
${includeTimestamps ? '- **[00:00]** Opening: **Key concept** introduced with **specific detail**\n- **[02:15]** Development: **Main argument** explained through **example/case study**\n- **[05:30]** Deep dive: **Technical implementation** of **core principle**\n- **[08:45]** Analysis: **Critical insight** about **domain topic**\n- **[12:00]** Application: **Practical use case** demonstrating **methodology**\n(Continue exhaustively—capture EVERY major point, transition, example, and conclusion)' : '- **Opening concept**: Detailed explanation with **key terms** highlighted\n- **Main argument**: Comprehensive breakdown with **supporting evidence**\n(Continue with maximum detail)'}

## Key Insights
- **[MM:SS]** **Primary Insight**: Detailed explanation of **core concept** with **actionable takeaway** and **practical application**
- **[MM:SS]** **Technical Detail**: Specific **methodology** or **framework** explained with **implementation notes**
- **[MM:SS]** **Critical Analysis**: Deep examination of **key principle** with **real-world implications**
- **[MM:SS]** **Best Practice**: Concrete **recommendation** for **specific scenario** with **expected outcomes**
- **[MM:SS]** **Advanced Concept**: Nuanced understanding of **complex topic** with **expert-level detail**
(Generate ${maxInsights}+ insights—prioritize depth, specificity, and actionability)

## FAQ
**Q: What is **[key concept]** and how does it work?**
A: **[MM:SS]** Detailed explanation: **[concept]** refers to **[definition]** and operates by **[mechanism]**. Practical example: **[specific case]**.

**Q: How can I apply **[technique/method]** in **[context]**?**
A: **[MM:SS]** Step-by-step: First, **[action 1]** using **[tool/approach]**. Then, **[action 2]** to achieve **[outcome]**. Key consideration: **[important detail]**.

**Q: What are the differences between **[concept A]** and **[concept B]**?**
A: **[MM:SS]** Comparison: **[concept A]** focuses on **[aspect]** while **[concept B]** emphasizes **[different aspect]**. Use **[A]** when **[scenario]**, use **[B]** when **[alternative scenario]**.

(Generate ${maxFAQ}+ Q&A pairs—cover technical details, practical applications, comparisons, troubleshooting, and advanced topics)

OPTIMIZATION DIRECTIVES:
- Maximize information density per token
- Bold formatting for keywords = low-token highlighting mechanism
- Bullet points = efficient structure for comprehensive coverage
- Every timestamp must anchor specific, detailed content
- Prioritize specificity over generalization
- Extract ALL named entities, statistics, examples, and references

Transcript:
${transcript}
`;
};
