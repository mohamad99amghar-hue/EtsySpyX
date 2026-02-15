
import OpenAI from 'openai';
import { prisma } from '../utils/db';
import { decrypt } from '../utils/crypto';

export class AiService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getClient() {
    const integration = await prisma.integration.findUnique({
      where: { userId: this.userId }
    });

    if (!integration || !integration.aiApiKeyEnc) {
      throw new Error('AI Provider not configured. Please add your API key in Integrations.');
    }

    const apiKey = decrypt(integration.aiApiKeyEnc);
    
    // Simple factory for now. Can expand to Claude/Anthropic if needed.
    return new OpenAI({ apiKey });
  }

  async runAnalysis(type: 'keyword' | 'listing_optimize' | 'shop_spy', input: any) {
    try {
      const client = await this.getClient();
      
      let systemPrompt = "You are an expert Etsy SEO and eCommerce strategist.";
      let userPrompt = JSON.stringify(input);

      if (type === 'keyword') {
        systemPrompt += ` Analyze the following keyword data. Return JSON with:
        {
          "kpis": [{"label": "Demand", "value": "0-100"}, {"label": "Competition", "value": "0-100"}, {"label": "Profit", "value": "$X"}],
          "tables": [{"title": "Related Tags", "headers": ["Tag", "Score"], "rows": [["tag1", "90"]]}],
          "summary": "Short strategic summary",
          "actions": ["Action 1", "Action 2"]
        }`;
      } else if (type === 'listing_optimize') {
        systemPrompt += ` Optimize this listing. Return JSON with:
        {
          "title": "Optimized Title (max 140 chars)",
          "tags": ["tag1", "tag2"... 13 total],
          "description": "Sales copy...",
          "score": 95
        }`;
      }

      const completion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'gpt-3.5-turbo', // Cost-effective default, can be upgraded
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content || '{}';
      const result = JSON.parse(content);

      // Save Run
      const run = await prisma.aiRun.create({
        data: {
          userId: this.userId,
          type,
          inputJson: JSON.stringify(input),
          outputJson: content,
          status: 'COMPLETED'
        }
      });

      return {
        runId: run.id,
        ...result
      };

    } catch (error: any) {
      console.error('AI Service Error:', error);
      throw new Error(error.message || 'AI processing failed');
    }
  }
}
