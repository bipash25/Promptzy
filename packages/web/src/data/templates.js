/**
 * Pre-built Prompt Templates Library
 * Organized by category for common use cases
 */

export const templateCategories = [
    { id: 'coding', name: 'Coding', icon: '💻', color: '#3b82f6' },
    { id: 'writing', name: 'Writing', icon: '✍️', color: '#10b981' },
    { id: 'analysis', name: 'Analysis', icon: '📊', color: '#f59e0b' },
    { id: 'creative', name: 'Creative', icon: '🎨', color: '#ec4899' },
    { id: 'business', name: 'Business', icon: '💼', color: '#8b5cf6' },
    { id: 'learning', name: 'Learning', icon: '📚', color: '#06b6d4' },
];

export const templates = [
    // Coding Templates
    {
        id: 'code-review',
        category: 'coding',
        title: 'Code Review Assistant',
        description: 'Get comprehensive code review feedback',
        content: `Review the following code and provide feedback on:

1. **Code Quality**: Best practices, naming conventions, code organization
2. **Performance**: Potential bottlenecks, optimization opportunities
3. **Security**: Vulnerabilities, input validation, data handling
4. **Maintainability**: Readability, documentation, complexity
5. **Testing**: Edge cases, test coverage suggestions

\`\`\`{{language}}
{{code}}
\`\`\`

Please provide specific, actionable suggestions with code examples where appropriate.`,
        tags: ['coding', 'review', 'quality'],
    },
    {
        id: 'debug-helper',
        category: 'coding',
        title: 'Debug Helper',
        description: 'Get help debugging code issues',
        content: `I'm encountering an issue with my code. Please help me debug it.

**Language/Framework**: {{language}}

**What I'm trying to do**:
{{goal}}

**The code**:
\`\`\`{{language}}
{{code}}
\`\`\`

**Error message or unexpected behavior**:
{{error}}

**What I've already tried**:
{{attempts}}

Please analyze the issue and provide a solution with explanation.`,
        tags: ['coding', 'debug', 'troubleshooting'],
    },
    {
        id: 'code-explanation',
        category: 'coding',
        title: 'Code Explainer',
        description: 'Get detailed explanations of code',
        content: `Explain the following code in detail:

\`\`\`{{language}}
{{code}}
\`\`\`

Please cover:
1. Overall purpose of the code
2. Line-by-line or section-by-section breakdown
3. Key concepts and patterns used
4. Potential improvements or alternative approaches
5. Common gotchas or edge cases to be aware of`,
        tags: ['coding', 'learning', 'explanation'],
    },
    {
        id: 'api-design',
        category: 'coding',
        title: 'API Design Helper',
        description: 'Design RESTful APIs',
        content: `Help me design a RESTful API for the following requirements:

**Resource/Entity**: {{resource}}

**Required Operations**:
{{operations}}

**Business Rules**:
{{rules}}

Please provide:
1. Endpoint structure (methods, paths)
2. Request/response schemas
3. Error handling approach
4. Authentication considerations
5. Example requests and responses`,
        tags: ['coding', 'api', 'design'],
    },

    // Writing Templates
    {
        id: 'blog-outline',
        category: 'writing',
        title: 'Blog Post Outline',
        description: 'Create structured blog post outlines',
        content: `Create a comprehensive outline for a blog post about:

**Topic**: {{topic}}
**Target Audience**: {{audience}}
**Tone**: {{tone}}
**Approximate Word Count**: {{wordCount}}

Please include:
1. Engaging title options (3-5 variations)
2. Hook/introduction approach
3. Main sections with key points
4. Subheadings for each section
5. Call-to-action suggestions
6. SEO keywords to incorporate`,
        tags: ['writing', 'blog', 'content'],
    },
    {
        id: 'email-professional',
        category: 'writing',
        title: 'Professional Email',
        description: 'Draft professional emails',
        content: `Write a professional email for the following situation:

**Purpose**: {{purpose}}
**Recipient**: {{recipient}}
**Key Points to Cover**:
{{keyPoints}}

**Tone**: {{tone}}
**Any Constraints**: {{constraints}}

Please provide a well-structured email with:
- Clear subject line
- Professional greeting
- Concise body with paragraphs
- Appropriate closing`,
        tags: ['writing', 'email', 'professional'],
    },
    {
        id: 'documentation',
        category: 'writing',
        title: 'Technical Documentation',
        description: 'Write clear technical docs',
        content: `Write technical documentation for:

**Subject**: {{subject}}
**Type**: {{type}} (e.g., API docs, user guide, README)
**Target Audience**: {{audience}}

**Key Features/Topics to Cover**:
{{features}}

Please include:
1. Overview/Introduction
2. Prerequisites (if applicable)
3. Step-by-step instructions
4. Code examples
5. Troubleshooting section
6. FAQs`,
        tags: ['writing', 'documentation', 'technical'],
    },

    // Analysis Templates
    {
        id: 'data-analysis',
        category: 'analysis',
        title: 'Data Analysis Framework',
        description: 'Structured data analysis approach',
        content: `Analyze the following data/information:

**Data/Context**:
{{data}}

**Questions to Answer**:
{{questions}}

Please provide:
1. **Summary**: Key findings and observations
2. **Patterns**: Notable trends or patterns
3. **Insights**: Deeper analysis and implications
4. **Recommendations**: Actionable next steps
5. **Limitations**: Caveats or data gaps
6. **Visualizations**: Suggested charts or graphs`,
        tags: ['analysis', 'data', 'insights'],
    },
    {
        id: 'pros-cons',
        category: 'analysis',
        title: 'Pros & Cons Analysis',
        description: 'Balanced pros and cons evaluation',
        content: `Provide a comprehensive pros and cons analysis for:

**Decision/Topic**: {{topic}}

**Context**: {{context}}

**Criteria to Consider**: {{criteria}}

Please structure as:
## Pros
- [List with explanations]

## Cons
- [List with explanations]

## Neutral Factors
- [Considerations that could go either way]

## Recommendation
[Balanced conclusion based on the analysis]`,
        tags: ['analysis', 'decision', 'comparison'],
    },
    {
        id: 'competitor-analysis',
        category: 'analysis',
        title: 'Competitor Analysis',
        description: 'Analyze competitive landscape',
        content: `Conduct a competitor analysis for:

**My Product/Service**: {{product}}
**Competitors**: {{competitors}}
**Industry/Market**: {{market}}

Analyze:
1. **Feature Comparison**: Key features matrix
2. **Pricing**: Pricing models and positioning
3. **Strengths & Weaknesses**: For each competitor
4. **Market Position**: Target audience, brand perception
5. **Opportunities**: Gaps we can exploit
6. **Threats**: Competitive risks to address`,
        tags: ['analysis', 'business', 'competition'],
    },

    // Creative Templates
    {
        id: 'story-premise',
        category: 'creative',
        title: 'Story Premise Generator',
        description: 'Generate creative story ideas',
        content: `Generate a compelling story premise with these elements:

**Genre**: {{genre}}
**Setting**: {{setting}}
**Themes**: {{themes}}
**Mood/Tone**: {{mood}}

Please provide:
1. **Logline**: One-sentence summary
2. **Premise**: 2-3 paragraph expanded concept
3. **Main Character(s)**: Brief descriptions
4. **Central Conflict**: The core problem to overcome
5. **Unique Hook**: What makes this story different
6. **Potential Plot Points**: 5-7 key story beats`,
        tags: ['creative', 'writing', 'story'],
    },
    {
        id: 'brainstorm',
        category: 'creative',
        title: 'Creative Brainstorm',
        description: 'Generate creative ideas',
        content: `Brainstorm creative ideas for:

**Challenge/Topic**: {{topic}}
**Constraints**: {{constraints}}
**Goals**: {{goals}}

Please provide:
1. **10 Conventional Ideas**: Solid, proven approaches
2. **10 Unconventional Ideas**: Creative, outside-the-box
3. **3 Wild Cards**: Crazy ideas that might just work
4. **Combinations**: Mix and match from above
5. **Next Steps**: How to evaluate and develop favorites`,
        tags: ['creative', 'brainstorm', 'ideas'],
    },
    {
        id: 'image-prompt',
        category: 'creative',
        title: 'AI Image Prompt',
        description: 'Generate prompts for image AI',
        content: `Create a detailed image generation prompt for:

**Subject**: {{subject}}
**Style**: {{style}}
**Mood**: {{mood}}
**Additional Details**: {{details}}

Generate prompts for:
1. **DALL-E/Midjourney** (descriptive, artistic)
2. **Stable Diffusion** (technical, with weights)
3. **Simple Version** (concise, key elements only)

Include suggestions for:
- Aspect ratio
- Negative prompts (what to avoid)
- Style modifiers`,
        tags: ['creative', 'ai', 'image'],
    },

    // Business Templates
    {
        id: 'meeting-agenda',
        category: 'business',
        title: 'Meeting Agenda',
        description: 'Structure productive meetings',
        content: `Create a meeting agenda for:

**Meeting Purpose**: {{purpose}}
**Duration**: {{duration}}
**Attendees**: {{attendees}}
**Key Topics**: {{topics}}

Please provide:
1. **Welcome & Objectives** (2-3 min)
2. **Main Discussion Items** with time allocations
3. **Decision Points** that need resolution
4. **Action Items Section**
5. **Next Steps & Follow-up**
6. **Pre-meeting Preparation** (if needed)`,
        tags: ['business', 'meeting', 'productivity'],
    },
    {
        id: 'project-plan',
        category: 'business',
        title: 'Project Plan Outline',
        description: 'Create project plans',
        content: `Create a project plan for:

**Project Name**: {{projectName}}
**Objective**: {{objective}}
**Timeline**: {{timeline}}
**Team/Resources**: {{team}}
**Constraints**: {{constraints}}

Include:
1. **Project Overview**: Goals, scope, success criteria
2. **Milestones**: Key deliverables with dates
3. **Tasks Breakdown**: Major work packages
4. **Dependencies**: What blocks what
5. **Risks**: Potential issues and mitigation
6. **Communication Plan**: Status updates, stakeholders`,
        tags: ['business', 'project', 'planning'],
    },
    {
        id: 'feedback-request',
        category: 'business',
        title: 'Constructive Feedback',
        description: 'Give structured feedback',
        content: `Help me provide constructive feedback for:

**Context**: {{context}}
**What went well**: {{positives}}
**Areas for improvement**: {{improvements}}
**Relationship**: {{relationship}}

Please help me:
1. Frame feedback positively
2. Be specific with examples
3. Suggest actionable improvements
4. Balance criticism with praise
5. End on a forward-looking note`,
        tags: ['business', 'feedback', 'communication'],
    },

    // Learning Templates
    {
        id: 'explain-concept',
        category: 'learning',
        title: 'Explain Like I\'m 5',
        description: 'Simple explanations of complex topics',
        content: `Explain this concept in simple terms:

**Topic**: {{topic}}
**My Current Understanding**: {{currentLevel}}
**Why I Need to Understand This**: {{purpose}}

Please explain:
1. **Simple Analogy**: Relate to everyday experience
2. **Core Concept**: The fundamental idea
3. **Key Components**: Break it down
4. **Common Misconceptions**: What people get wrong
5. **Real-World Example**: Practical application
6. **Next Steps**: How to learn more`,
        tags: ['learning', 'explanation', 'education'],
    },
    {
        id: 'study-guide',
        category: 'learning',
        title: 'Study Guide Creator',
        description: 'Create comprehensive study guides',
        content: `Create a study guide for:

**Subject/Topic**: {{topic}}
**Level**: {{level}}
**Time Available**: {{time}}
**Goal**: {{goal}}

Include:
1. **Key Concepts**: Must-know information
2. **Definitions**: Important terms
3. **Formulas/Rules**: Quick reference
4. **Practice Questions**: Test understanding
5. **Memory Aids**: Mnemonics, associations
6. **Resources**: Further reading/videos`,
        tags: ['learning', 'study', 'education'],
    },
    {
        id: 'interview-prep',
        category: 'learning',
        title: 'Interview Preparation',
        description: 'Prepare for job interviews',
        content: `Help me prepare for an interview:

**Position**: {{position}}
**Company**: {{company}}
**My Background**: {{background}}
**Specific Concerns**: {{concerns}}

Please provide:
1. **Common Questions**: Likely questions with sample answers
2. **Technical Questions**: Role-specific challenges
3. **Behavioral Questions**: STAR method responses
4. **Questions to Ask**: Thoughtful questions for interviewer
5. **Red Flags to Avoid**: Common mistakes
6. **Preparation Checklist**: Day-before tasks`,
        tags: ['learning', 'career', 'interview'],
    },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(categoryId) {
    return templates.filter(t => t.category === categoryId);
}

/**
 * Search templates
 */
export function searchTemplates(query) {
    const lowerQuery = query.toLowerCase();
    return templates.filter(t =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}

/**
 * Get template by ID
 */
export function getTemplateById(id) {
    return templates.find(t => t.id === id);
}

export default templates;
