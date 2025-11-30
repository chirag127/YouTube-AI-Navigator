import { e } from '../../utils/shortcuts/log.js';
import { analyzeSentiment, detectSpam, isQuestion } from '../../utils/patterns/comments.js';
import { sg } from '../../utils/shortcuts/storage.js';
export const comments = async commentList => {
  try {
    if (!commentList || !commentList.length) return '';
    const cfg = await sg('config');
    const pCfg = cfg.config?.prompts?.comments || {};
    const role =
      pCfg.roleDescription ||
      'Elite Community Sentiment Analyst with expertise in YouTube audience psychology and engagement patterns';
    const spamEnabled = pCfg.enableSpamFiltering !== false;
    const sentEnabled = pCfg.enableSentimentLabeling !== false;
    const minLikes = pCfg.minLikesForHighEngagement || 0;
    const maxThemes = pCfg.maxThemes || 7;
    const maxQuestions = pCfg.maxQuestions || 5;
    const opportunitiesEnabled = pCfg.includeCreatorOpportunities !== false;
    const analyzed = commentList.slice(0, 50).map(c => {
      const author = c.author || c.authorText || 'Unknown';
      const content = c.text || c.textDisplay || '';
      const sentiment = sentEnabled ? analyzeSentiment(content) : 'neutral';
      const spam = spamEnabled ? detectSpam(content) : false;
      const question = isQuestion(content);
      return { author, content, sentiment, spam, question, likes: c.likes || 0 };
    });
    const hints = [];
    const sentCounts = { positive: 0, negative: 0, neutral: 0 };
    analyzed.forEach(c => {
      sentCounts[c.sentiment]++;
      if (c.question) hints.push(`Q: ${c.content}`);
      if (c.spam) hints.push(`SPAM: ${c.content}`);
    });
    const filtered = spamEnabled ? analyzed.filter(c => !c.spam) : analyzed;
    const text = filtered
      .map(
        c =>
          `- ${sentEnabled ? `[${c.sentiment.toUpperCase()}] ` : ''}${c.author}: ${c.content} (${c.likes} likes)`
      )
      .join('\n');
    return `Role: ${role}
Task: Analyze comment sentiment, extract key themes, identify controversial topics, and surface actionable insights.

PATTERN DETECTION HINTS (Pre-Analyzed via Regex):
${sentEnabled ? `Sentiment Distribution: Positive=${sentCounts.positive}, Negative=${sentCounts.negative}, Neutral=${sentCounts.neutral}` : 'Sentiment analysis disabled'}
Questions Detected: ${analyzed.filter(c => c.question).length}
${spamEnabled ? `Spam Filtered: ${analyzed.filter(c => c.spam).length}` : 'Spam filtering disabled'}

${hints.length > 0 ? 'Key Patterns:\n' + hints.slice(0, 10).join('\n') : 'No significant patterns detected'}

CONFIGURATION:
- Min Likes for High Engagement: ${minLikes}
- Max Themes: ${maxThemes}
- Max Questions: ${maxQuestions}
- Creator Opportunities: ${opportunitiesEnabled ? 'Enabled' : 'Disabled'}

ANALYSIS PROTOCOL:
1. Sentiment Overview: Provide percentage breakdown (Positive/Negative/Neutral) with confidence level
2. Key Themes: Extract ${maxThemes} recurring topics/opinions (prioritize high-engagement comments)
3. Controversial Topics: Identify polarizing subjects with evidence from comments
4. Top Questions: Surface ${maxQuestions} most common viewer questions (actionable for creator)
5. Engagement Insights: Analyze what resonates (high likes = strong signal)
${opportunitiesEnabled ? '6. Creator Opportunities: Suggest follow-up content based on audience interest' : ''}

OUTPUT FORMAT (Strict Markdown):

## Sentiment Overview
**Distribution**: X% Positive, Y% Negative, Z% Neutral
**Confidence**: High/Medium/Low (based on sample size and clarity)
**Overall Tone**: [Brief 1-sentence summary]

## Key Themes
- **Theme 1**: [Specific topic] - [Evidence from comments with like counts]
- **Theme 2**: [Specific topic] - [Evidence from comments with like counts]
- **Theme 3**: [Specific topic] - [Evidence from comments with like counts]
(Continue for up to ${maxThemes} themes based on data)

## Controversial Topics
- **Topic**: [Specific subject] - [Conflicting viewpoints with examples]
(Only include if genuine controversy exists)

## Top Viewer Questions
1. **Q**: [Specific question from comments]
2. **Q**: [Specific question from comments]
(Include up to ${maxQuestions} most common/important questions)

## Engagement Insights
- **High Engagement** (${minLikes}+ likes): [What comments with most likes discuss]
- **Low Engagement**: [Topics with minimal response]
${sentEnabled ? '- **Audience Sentiment Drivers**: [What triggers positive/negative reactions]' : ''}

${
  opportunitiesEnabled
    ? `## Creator Opportunities
- [Actionable suggestion based on audience interest]
- [Follow-up content idea based on questions]
- [Engagement strategy based on sentiment patterns]

`
    : ''
}OPTIMIZATION DIRECTIVES:
- Prioritize comments with ${minLikes}+ likes, but analyze ALL provided comments regardless of like count
${spamEnabled ? '- Ignore spam/bot comments (pre-filtered)' : ''}
- Focus on substantive feedback over generic praise
- Extract specific, actionable insights
- Use evidence-based analysis (quote comment snippets)

Comments${spamEnabled ? ' (Spam-Filtered)' : ''}${sentEnabled ? ' (Sentiment-Labeled)' : ''}:
${text}`;
  } catch (err) {
    e('Err:Comments', err);
    return '';
  }
};
