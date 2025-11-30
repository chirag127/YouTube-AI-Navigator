import { id as i } from '../../utils/shortcuts/dom.js';
export class PromptsSettings {
    constructor(sm, as) {
        this.sm = sm;
        this.as = as;
    }
    async init() {
        const cfg = this.sm.get('prompts') || {};
        i('prompts-segments-role').value = cfg.segments?.roleDescription || '';
        i('prompts-segments-timing').value = cfg.segments?.timingAccuracyTarget || 2;
        i('prompts-segments-hints').checked = cfg.segments?.enablePatternHints !== false;
        i('prompts-segments-sponsor-range').value =
            cfg.segments?.sponsorDurationRange?.join(',') || '30,90';
        i('prompts-segments-intro-range').value =
            cfg.segments?.introDurationRange?.join(',') || '5,15';
        i('prompts-segments-outro-range').value =
            cfg.segments?.outroDurationRange?.join(',') || '10,30';
        i('prompts-segments-min-short').value = cfg.segments?.minSegmentsShort || 3;
        i('prompts-segments-min-long').value = cfg.segments?.minSegmentsLong || 8;
        i('prompts-segments-threshold').value = cfg.segments?.videoLengthThreshold || 600;
        i('prompts-comprehensive-role').value = cfg.comprehensive?.roleDescription || '';
        i('prompts-comprehensive-bold').checked = cfg.comprehensive?.keywordBoldingEnabled !== false;
        i('prompts-comprehensive-resources').checked =
            cfg.comprehensive?.includeResourcesSection !== false;
        i('prompts-comprehensive-takeaways').checked =
            cfg.comprehensive?.includeActionableTakeaways !== false;
        i('prompts-comprehensive-max-resources').value =
            cfg.comprehensive?.maxResourcesMentioned || 10;
        i('prompts-comprehensive-max-takeaways').value = cfg.comprehensive?.maxTakeaways || 5;
        i('prompts-comments-role').value = cfg.comments?.roleDescription || '';
        i('prompts-comments-spam').checked = cfg.comments?.enableSpamFiltering !== false;
        i('prompts-comments-sentiment').checked = cfg.comments?.enableSentimentLabeling !== false;
        i('prompts-comments-likes').value = cfg.comments?.minLikesForHighEngagement || 10;
        i('prompts-comments-themes').value = cfg.comments?.maxThemes || 7;
        i('prompts-comments-questions').value = cfg.comments?.maxQuestions || 5;
        i('prompts-comments-opportunities').checked =
            cfg.comments?.includeCreatorOpportunities !== false;
        [
            'prompts-segments-role',
            'prompts-segments-timing',
            'prompts-segments-hints',
            'prompts-segments-sponsor-range',
            'prompts-segments-intro-range',
            'prompts-segments-outro-range',
            'prompts-segments-min-short',
            'prompts-segments-min-long',
            'prompts-segments-threshold',
            'prompts-comprehensive-role',
            'prompts-comprehensive-bold',
            'prompts-comprehensive-resources',
            'prompts-comprehensive-takeaways',
            'prompts-comprehensive-max-resources',
            'prompts-comprehensive-max-takeaways',
            'prompts-comments-role',
            'prompts-comments-spam',
            'prompts-comments-sentiment',
            'prompts-comments-likes',
            'prompts-comments-themes',
            'prompts-comments-questions',
            'prompts-comments-opportunities',
        ].forEach(id => i(id)?.addEventListener('change', () => this.as.trigger()));
    }
    async save() {
        const sponsorRange = i('prompts-segments-sponsor-range').value.split(',').map(Number);
        const introRange = i('prompts-segments-intro-range').value.split(',').map(Number);
        const outroRange = i('prompts-segments-outro-range').value.split(',').map(Number);
        this.sm.set('prompts.segments.roleDescription', i('prompts-segments-role').value);
        this.sm.set('prompts.segments.timingAccuracyTarget', Number(i('prompts-segments-timing').value));
        this.sm.set('prompts.segments.enablePatternHints', i('prompts-segments-hints').checked);
        this.sm.set('prompts.segments.sponsorDurationRange', sponsorRange);
        this.sm.set('prompts.segments.introDurationRange', introRange);
        this.sm.set('prompts.segments.outroDurationRange', outroRange);
        this.sm.set('prompts.segments.minSegmentsShort', Number(i('prompts-segments-min-short').value));
        this.sm.set('prompts.segments.minSegmentsLong', Number(i('prompts-segments-min-long').value));
        this.sm.set(
            'prompts.segments.videoLengthThreshold',
            Number(i('prompts-segments-threshold').value)
        );
        this.sm.set('prompts.comprehensive.roleDescription', i('prompts-comprehensive-role').value);
        this.sm.set(
            'prompts.comprehensive.keywordBoldingEnabled',
            i('prompts-comprehensive-bold').checked
        );
        this.sm.set(
            'prompts.comprehensive.includeResourcesSection',
            i('prompts-comprehensive-resources').checked
        );
        this.sm.set(
            'prompts.comprehensive.includeActionableTakeaways',
            i('prompts-comprehensive-takeaways').checked
        );
        this.sm.set(
            'prompts.comprehensive.maxResourcesMentioned',
            Number(i('prompts-comprehensive-max-resources').value)
        );
        this.sm.set(
            'prompts.comprehensive.maxTakeaways',
            Number(i('prompts-comprehensive-max-takeaways').value)
        );
        this.sm.set('prompts.comments.roleDescription', i('prompts-comments-role').value);
        this.sm.set('prompts.comments.enableSpamFiltering', i('prompts-comments-spam').checked);
        this.sm.set('prompts.comments.enableSentimentLabeling', i('prompts-comments-sentiment').checked);
        this.sm.set(
            'prompts.comments.minLikesForHighEngagement',
            Number(i('prompts-comments-likes').value)
        );
        this.sm.set('prompts.comments.maxThemes', Number(i('prompts-comments-themes').value));
        this.sm.set('prompts.comments.maxQuestions', Number(i('prompts-comments-questions').value));
        this.sm.set(
            'prompts.comments.includeCreatorOpportunities',
            i('prompts-comments-opportunities').checked
        );
        await this.sm.save();
    }
}
}
