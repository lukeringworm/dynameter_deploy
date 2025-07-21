import { users, type User, type InsertUser, type ADIndexData, type NewsResponse, type RSSArticle } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getADIndexData(): Promise<ADIndexData>;
  getCategoryDetails(categoryKey: string): Promise<any>;
  getNews(): Promise<NewsResponse>;
  getCategoryNews(category: string): Promise<RSSArticle[]>;
  updateMilestones(milestones: any): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;
  private adIndexData: ADIndexData;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Initialize with sample AD Index data
    this.adIndexData = {
      adIndex: 68,
      categories: {
        defense: 74,
        manufacturing: 62,
        energy: 58,
        workforce: 55,
        techPolicy: 61,
        supplyChain: 59
      },
      categoryDetails: {
        manufacturing: {
          name: "Manufacturing Reshoring",
          score: 62,
          change: 1.8,
          icon: "factory",
          color: "orange",
          description: "Tracking domestic manufacturing capacity and job creation through reshoring initiatives",
          currentStatus: "~287,000 reshored jobs announced in 2023; cumulatively ~2 million since 2010",
          milestones: [
            {
              id: "manufacturing-annual-jobs",
              title: "Annual Reshored Jobs Target",
              target: 350000,
              current: 287000,
              unit: "jobs",
              targetDate: "2024-12-31",
              status: "at-risk",
              description: "Achieve 350,000 reshored manufacturing jobs annually"
            },
            {
              id: "manufacturing-cumulative-jobs",
              title: "Cumulative Jobs by 2028",
              target: 3000000,
              current: 2000000,
              unit: "jobs",
              targetDate: "2028-12-31",
              status: "on-track",
              description: "Reach 3 million total reshored jobs by end of 2028"
            }
          ],
          keyMetrics: [
            { label: "2023 Jobs Announced", value: "287K", trend: "+12%" },
            { label: "Total Since 2010", value: "2M", trend: "+15%" },
            { label: "Active Projects", value: "142", trend: "+8%" }
          ]
        },
        defense: {
          name: "Defense Tech Modernization",
          score: 74,
          change: 3.2,
          icon: "shield",
          color: "blue",
          description: "Advancing military technology capabilities and supply chain security",
          currentStatus: "DoD budget ~$1 trillion (FY2026), with R&D increasing to $20B for science, $1.3B for supply chain",
          milestones: [
            {
              id: "defense-major-contracts",
              title: "Major Defense Tech Contracts",
              target: 10,
              current: 6,
              unit: "contracts",
              targetDate: "2026-12-31",
              status: "on-track",
              description: "Deploy 10 new defense-tech contracts ($1B+ each) in AI/autonomous, quantum, hypersonics"
            },
            {
              id: "defense-rd-growth",
              title: "R&D Budget Growth",
              target: 110,
              current: 100,
              unit: "% of baseline",
              targetDate: "2028-12-31",
              status: "on-track",
              description: "Grow S&T/R&D funding by +10% year-over-year through 2028"
            },
            {
              id: "defense-facilities",
              title: "New Industrial Defense Facilities",
              target: 5,
              current: 2,
              unit: "facilities",
              targetDate: "2027-12-31",
              status: "on-track",
              description: "Add 5 new industrial-scale defense facilities (munitions, chips, robotics)"
            }
          ],
          keyMetrics: [
            { label: "FY2026 Budget", value: "$1T", trend: "+8%" },
            { label: "R&D Investment", value: "$20B", trend: "+15%" },
            { label: "Major Contracts", value: "6", trend: "+50%" }
          ]
        },
        energy: {
          name: "Energy & Infrastructure",
          score: 58,
          change: -0.5,
          icon: "zap",
          color: "green",
          description: "Building renewable energy capacity and modernizing grid infrastructure",
          currentStatus: "Renewables ~17% of power generation (wind + solar), 9% of primary energy; outpaced coal",
          milestones: [
            {
              id: "energy-renewable-share",
              title: "Renewable Electricity Share",
              target: 30,
              current: 17,
              unit: "% of generation",
              targetDate: "2027-12-31",
              status: "behind",
              description: "Achieve 30% renewables of electricity generation by 2027"
            },
            {
              id: "energy-capacity-addition",
              title: "Solar + Wind Capacity Addition",
              target: 50,
              current: 28,
              unit: "GW",
              targetDate: "2027-12-31",
              status: "at-risk",
              description: "Build 50 GW additional solar + wind capacity (≈38 GW solar, 12 GW wind)"
            },
            {
              id: "energy-grid-transmission",
              title: "Grid Transmission Capacity",
              target: 100,
              current: 35,
              unit: "GW",
              targetDate: "2030-12-31",
              status: "on-track",
              description: "Deploy 100 GW extra grid transmission capacity per DOE corridor goals"
            }
          ],
          keyMetrics: [
            { label: "Renewable Share", value: "17%", trend: "+2%" },
            { label: "New Capacity 2024", value: "28 GW", trend: "+18%" },
            { label: "Grid Investment", value: "$65B", trend: "+25%" }
          ]
        },
        workforce: {
          name: "Workforce Development",
          score: 55,
          change: 2.1,
          icon: "users",
          color: "purple",
          description: "Developing skilled workforce for advanced manufacturing and technology sectors",
          currentStatus: "Manufacturing apprenticeships rose 83% since 2010, with accelerating placement rates",
          milestones: [
            {
              id: "workforce-apprentices",
              title: "Annual Skilled-Trade Certifications",
              target: 200000,
              current: 145000,
              unit: "apprentices",
              targetDate: "2026-12-31",
              status: "at-risk",
              description: "Certify 200,000 new skilled-trade apprentices or candidates annually"
            },
            {
              id: "workforce-training-centers",
              title: "Public Training Centers",
              target: 100,
              current: 67,
              unit: "centers",
              targetDate: "2027-12-31",
              status: "on-track",
              description: "Launch 100 publicly recognized training centers by 2027"
            },
            {
              id: "workforce-placement-rate",
              title: "Apprentice Job Placement Rate",
              target: 75,
              current: 68,
              unit: "% within 6 months",
              targetDate: "2025-12-31",
              status: "on-track",
              description: "75% job placement rate for apprentices within six months"
            }
          ],
          keyMetrics: [
            { label: "2024 Certifications", value: "145K", trend: "+12%" },
            { label: "Training Centers", value: "67", trend: "+22%" },
            { label: "Placement Rate", value: "68%", trend: "+5%" }
          ]
        },
        techPolicy: {
          name: "Tech Policy Alignment",
          score: 61,
          change: 1.3,
          icon: "gavel",
          color: "indigo",
          description: "Streamlining technology policy for innovation while maintaining security",
          currentStatus: "Bipartisan defense-tech AI funding accelerating, balancing security rules with innovation speed",
          milestones: [
            {
              id: "techpolicy-bipartisan-bills",
              title: "Major Bipartisan Tech Bills",
              target: 3,
              current: 1,
              unit: "bills",
              targetDate: "2026-12-31",
              status: "behind",
              description: "Pass 3 major bipartisan bills (AI R&D, data policy, dual-use tech)"
            },
            {
              id: "techpolicy-innovation-pathways",
              title: "National Innovation Pathways",
              target: 2,
              current: 1,
              unit: "pathways",
              targetDate: "2027-12-31",
              status: "on-track",
              description: "Fast-track 2 national innovation pathways (like DIU) receiving funding"
            },
            {
              id: "techpolicy-export-review-time",
              title: "Export Approval Review Time",
              target: 2,
              current: 3.2,
              unit: "months average",
              targetDate: "2028-12-31",
              status: "at-risk",
              description: "Maintain <2-month average review time for dual-use tech export approvals"
            }
          ],
          keyMetrics: [
            { label: "Bills Passed 2024", value: "1", trend: "0%" },
            { label: "Review Time", value: "3.2 mo", trend: "-15%" },
            { label: "Innovation Programs", value: "1", trend: "+100%" }
          ]
        },
        supplyChain: {
          name: "Supply Chain Sovereignty",
          score: 59,
          change: -1.2,
          icon: "truck",
          color: "red",
          description: "Reducing dependence on critical supply chains and building domestic capacity",
          currentStatus: "Biden admin allocated $1B for rare-earths, grid, battery minerals under IIJA",
          milestones: [
            {
              id: "supplychain-critical-plants",
              title: "Critical Mineral/Semiconductor Plants",
              target: 5,
              current: 2,
              unit: "plants",
              targetDate: "2027-12-31",
              status: "at-risk",
              description: "Bring 5 critical mineral/semiconductor plants online in the U.S."
            },
            {
              id: "supplychain-domestic-sourcing",
              title: "Domestic/Allied Sourcing",
              target: 90,
              current: 72,
              unit: "% of chips & rare earths",
              targetDate: "2028-12-31",
              status: "behind",
              description: "Ensure 90% domestic or ally-sourced for chips and rare earths"
            },
            {
              id: "supplychain-delay-reduction",
              title: "Supply Chain Delay Reduction",
              target: 30,
              current: 12,
              unit: "% reduction",
              targetDate: "2028-12-31",
              status: "behind",
              description: "Cut average supply-chain delay for key components by 30%"
            }
          ],
          keyMetrics: [
            { label: "New Plants 2024", value: "2", trend: "+100%" },
            { label: "Allied Sourcing", value: "72%", trend: "+8%" },
            { label: "IIJA Investment", value: "$1B", trend: "+$1B" }
          ]
        }
      },
      news: [
        {
          category: "defense",
          title: "Anduril wins $180M DoD contract for autonomous defense systems",
          impact_score: 4,
          link: "#",
          description: "Major defense contractor secures significant funding for next-generation autonomous defense capabilities, strengthening national security infrastructure.",
          timestamp: "2 hours ago"
        },
        {
          category: "manufacturing",
          title: "Tesla expands battery factory in Texas, creating 2,000 jobs",
          impact_score: 3,
          link: "#",
          description: "Electric vehicle manufacturer announces major expansion of Gigafactory Texas, boosting domestic battery production capacity and creating thousands of manufacturing jobs.",
          timestamp: "5 hours ago"
        },
        {
          category: "energy",
          title: "Offshore wind project faces regulatory delays",
          impact_score: -2,
          link: "#",
          description: "Key renewable energy infrastructure project experiences setbacks due to regulatory challenges, potentially impacting clean energy transition timeline.",
          timestamp: "1 day ago"
        },
        {
          category: "workforce",
          title: "New STEM apprenticeship program launches in 50+ cities",
          impact_score: 5,
          link: "#",
          description: "National initiative connecting students with technology companies through hands-on apprenticeships, addressing critical skills gap in emerging technologies.",
          timestamp: "2 days ago"
        }
      ],
      trendData: (() => {
        const data = [];
        const today = new Date();
        const scores = [50, 52, 54, 53, 55, 57, 58, 60, 59, 61, 63, 62, 64, 66, 65, 67, 68, 70, 69, 71, 72, 70, 69, 68, 67, 66, 65, 67, 68, 68];
        
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const formattedDate = `${month}/${day}`;
          const isoDate = date.toISOString().split('T')[0];
          
          data.push({
            day: formattedDate,
            score: scores[29 - i],
            date: isoDate
          });
        }
        
        return data;
      })()
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getADIndexData(): Promise<ADIndexData> {
    return this.adIndexData;
  }

  async getCategoryDetails(categoryKey: string): Promise<any> {
    return this.adIndexData.categoryDetails?.[categoryKey] || null;
  }

  async getNews(): Promise<NewsResponse> {
    // Import RSS service to get real-time news data
    const { rssService } = await import('./rssService');
    return rssService.getArticles();
  }

  async getCategoryNews(category: string): Promise<RSSArticle[]> {
    const { rssService } = await import('./rssService');
    return rssService.getCategoryArticles(category as keyof NewsResponse);
  }

  async updateMilestones(milestones: any): Promise<void> {
    // Update milestones in each category
    for (const [category, categoryMilestones] of Object.entries(milestones)) {
      if (this.adIndexData.categoryDetails && this.adIndexData.categoryDetails[category]) {
        this.adIndexData.categoryDetails[category].milestones = categoryMilestones as any;
      }
    }
  }
}

export const storage = new MemStorage();
