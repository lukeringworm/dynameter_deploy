import OpenAI from 'openai';
import { storage } from './storage';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

interface MilestoneUpdate {
  category: string;
  newMilestones: Array<{
    title: string;
    target: string;
    current: string;
    description: string;
    completed: boolean;
  }>;
}

export class MilestoneService {
  async checkAndUpdateMilestones(): Promise<boolean> {
    if (!openai) {
      console.log('OpenAI API key not available, skipping milestone updates');
      return false;
    }

    try {
      const adData = await storage.getADIndexData();
      const allCompleted = this.areAllMilestonesCompleted(adData);

      if (!allCompleted) {
        return false;
      }

      console.log('All milestones completed! Generating new milestones...');
      const newMilestones = await this.generateNewMilestones(adData);
      
      if (newMilestones) {
        await storage.updateMilestones(newMilestones);
        console.log('Successfully updated milestones with new targets');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating milestones:', error);
      return false;
    }
  }

  private areAllMilestonesCompleted(adData: any): boolean {
    if (!adData.categoryDetails) return false;
    
    const categories = ['defense', 'manufacturing', 'energy', 'workforce', 'techPolicy', 'supplyChain'];
    
    for (const category of categories) {
      const categoryData = adData.categoryDetails[category];
      if (!categoryData || !categoryData.milestones || !Array.isArray(categoryData.milestones)) {
        continue;
      }
      
      for (const milestone of categoryData.milestones) {
        if (!milestone.completed) {
          return false;
        }
      }
    }
    
    return true;
  }

  private async generateNewMilestones(adData: any): Promise<any> {
    const prompt = `You are a strategic analyst for American Dynamism. All current milestones have been achieved! 

Generate ambitious but achievable new milestones for the next phase. Consider:
1. Current scores: Defense (${adData.categories.defense}), Manufacturing (${adData.categories.manufacturing}), Energy (${adData.categories.energy}), Workforce (${adData.categories.workforce}), Tech Policy (${adData.categories.techPolicy}), Supply Chain (${adData.categories.supplyChain})
2. Recent global developments and emerging challenges
3. Next-level targets that push American competitiveness further
4. Measurable, time-bound objectives

For each category, provide 2-3 new milestones that are:
- More ambitious than current achievements
- Specific and measurable
- Relevant to current geopolitical and economic context
- Achievable within 2-5 years

Current milestone examples for reference:
- Defense: 500K new tech jobs, $200B R&D investment
- Manufacturing: 350K reshored jobs, 25% critical supply chains
- Energy: 30% renewable capacity, 15 new nuclear plants

Respond with valid JSON in this exact format:
{
  "defense": [
    {
      "title": "Next-Gen Defense Innovation",
      "target": "1M tech jobs by 2027",
      "current": "750K jobs",
      "description": "Expand defense technology workforce to maintain technological superiority",
      "completed": false
    }
  ],
  "manufacturing": [...],
  "energy": [...],
  "workforce": [...],
  "techPolicy": [...],
  "supplyChain": [...]
}`;

    try {
      const response = await openai!.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      });

      const responseText = response.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      // Parse and validate the response
      const newMilestones = JSON.parse(responseText);
      
      // Validate structure
      const requiredCategories = ['defense', 'manufacturing', 'energy', 'workforce', 'techPolicy', 'supplyChain'];
      for (const category of requiredCategories) {
        if (!newMilestones[category] || !Array.isArray(newMilestones[category])) {
          throw new Error(`Invalid milestone structure for category: ${category}`);
        }
      }

      return newMilestones;
    } catch (error) {
      console.error('Failed to generate new milestones:', error);
      return null;
    }
  }

  // Manual trigger for milestone update (for admin panel)
  async forceUpdateMilestones(): Promise<boolean> {
    if (!openai) {
      throw new Error('OpenAI API key not available');
    }

    try {
      const adData = await storage.getADIndexData();
      const newMilestones = await this.generateNewMilestones(adData);
      
      if (newMilestones) {
        await storage.updateMilestones(newMilestones);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in force update milestones:', error);
      throw error;
    }
  }
}

export const milestoneService = new MilestoneService();