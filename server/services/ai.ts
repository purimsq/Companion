import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.API_KEY || "default_key" 
});

const SYSTEM_PROMPT = `You are StudyCompanion, a private offline assistant for a single user named Mitchell (Mitch).
You must:
1. Never overwrite user summaries or notes without their approval.
2. Help generate study plans based on deadlines, topic size, and pace level.
3. Remind the user to rest when study time is excessive (especially weekends).
4. Generate summaries and quizzes upon request only. (But sometimes suggest and wait for approval or decline)
5. Match assignment/CAT questions to notes using local embedding.
6. Always be kind, encouraging, and use concise explanations.
7. Never connect to the internet, always work locally unless asked by user.
8. Address the user as "Mitch" in a warm, supportive manner.
9. Be encouraging but not overly enthusiastic - maintain a mature, caring tone.`;

export interface ChatResponse {
  content: string;
  suggestions?: string[];
}

export interface SummaryRequest {
  text: string;
  context?: string;
  maxLength?: number;
}

export interface StudyPlanRequest {
  subjects: string[];
  deadlines: Array<{ subject: string; date: Date; type: string }>;
  pace: number; // 1-80
  availableHours: number;
}

export class AIService {
  async chat(message: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<ChatResponse> {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...(conversationHistory || []).map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content || "";
      
      return {
        content,
        suggestions: this.extractSuggestions(content)
      };
    } catch (error) {
      throw new Error(`AI chat failed: ${error.message}`);
    }
  }

  async generateSummary(request: SummaryRequest): Promise<string> {
    try {
      const prompt = `Please create a concise summary of the following study material for Mitch. 
      Focus on key concepts, important details, and main takeaways. 
      ${request.context ? `Context: ${request.context}` : ''}
      ${request.maxLength ? `Keep it under ${request.maxLength} words.` : ''}
      
      Study Material:
      ${request.text}
      
      Please format the summary in a clear, study-friendly way with bullet points or numbered lists where appropriate.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      throw new Error(`Summary generation failed: ${error.message}`);
    }
  }

  async generateStudyPlan(request: StudyPlanRequest): Promise<any> {
    try {
      const prompt = `Create a personalized study plan for Mitch with the following parameters:
      
      Subjects: ${request.subjects.join(', ')}
      Deadlines: ${request.deadlines.map(d => `${d.subject} (${d.type}) - Due: ${d.date.toDateString()}`).join(', ')}
      Learning Pace: ${request.pace}/80 (1=relaxed, 80=intensive)
      Available Study Hours per Day: ${request.availableHours}
      
      Please respond with a JSON object containing a weekly study schedule that:
      1. Prioritizes subjects with approaching deadlines
      2. Balances study load according to the pace setting
      3. Includes regular breaks and review sessions
      4. Suggests optimal study times based on the material type
      
      Format: { "schedule": [{ "day": "Monday", "sessions": [{ "subject": "Anatomy", "time": "14:30-15:30", "topic": "Nervous System", "type": "study" }] }] }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content || "{}";
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Study plan generation failed: ${error.message}`);
    }
  }

  async findRelevantContent(query: string, documents: Array<{ id: number; content: string; title: string }>): Promise<Array<{ id: number; relevance: number; excerpt: string }>> {
    try {
      const prompt = `Help Mitch find the most relevant study materials for this query: "${query}"
      
      Available documents:
      ${documents.map((doc, idx) => `${idx + 1}. ${doc.title}: ${doc.content.substring(0, 200)}...`).join('\n')}
      
      Please respond with a JSON array of relevant documents ranked by relevance (0-1 score), including a brief excerpt explaining why it's relevant.
      
      Format: [{ "id": 1, "relevance": 0.9, "excerpt": "This section covers..." }]`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content || "{}";
      const result = JSON.parse(content);
      return result.documents || [];
    } catch (error) {
      throw new Error(`Content search failed: ${error.message}`);
    }
  }

  async generateQuiz(topic: string, difficulty: string = "medium", questionCount: number = 5): Promise<any> {
    try {
      const prompt = `Generate a ${difficulty} difficulty quiz for Mitch on the topic: ${topic}
      
      Create ${questionCount} questions that test understanding, not just memorization.
      Include a mix of multiple choice, short answer, and scenario-based questions.
      
      Please respond with a JSON object containing the quiz questions and answers.
      
      Format: { "quiz": { "title": "Quiz Title", "questions": [{ "type": "multiple_choice", "question": "...", "options": ["A", "B", "C", "D"], "correct": "B", "explanation": "..." }] } }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content || "{}";
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Quiz generation failed: ${error.message}`);
    }
  }

  private extractSuggestions(content: string): string[] {
    // Simple extraction of suggestions from AI response
    const suggestions: string[] = [];
    
    if (content.includes("study plan")) {
      suggestions.push("Generate a study plan");
    }
    if (content.includes("quiz") || content.includes("test")) {
      suggestions.push("Create a practice quiz");
    }
    if (content.includes("summary") || content.includes("summarize")) {
      suggestions.push("Summarize this content");
    }
    if (content.includes("break") || content.includes("rest")) {
      suggestions.push("Take a break");
    }
    
    return suggestions;
  }

  async checkForBreakSuggestion(studyMinutes: number, dayOfWeek: string): Promise<string | null> {
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
    const breakThreshold = isWeekend ? 90 : 120; // Suggest breaks sooner on weekends
    
    if (studyMinutes >= breakThreshold) {
      const messages = [
        "Hey Mitch, you've been studying hard! Time for a well-deserved break. 🌟",
        "Great progress today! Your brain will thank you for a short break. ☕",
        "You're doing amazing! Let's take a breather and come back refreshed. 🌱",
        "Study sessions are most effective with regular breaks. You've earned this one! ⭐"
      ];
      
      return messages[Math.floor(Math.random() * messages.length)];
    }
    
    return null;
  }
}

export const aiService = new AIService();
