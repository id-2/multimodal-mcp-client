import { LlmConfig } from "@/features/llm-registry/lib/types";
import { AgentConfig } from "@/features/agent-registry/lib/types";

const DEFAULT_CONFIG: LlmConfig = {
  provider: "gemini",
  config: {
    apiKey: "",
    model: "gemini-pro",
    temperature: 0.7,
    maxTokens: 1000,
  },
};

export async function readLlmConfig(): Promise<LlmConfig> {
  try {
    const config = await import("@config/llm.config.json");
    return config.default || DEFAULT_CONFIG;
  } catch (error) {
    console.error("Error reading LLM config:", error);
    return DEFAULT_CONFIG;
  }
}

const defaultConfig = {
  model: "models/gemini-2.0-flash-exp",
  generationConfig: {
    responseModalities: "audio" as const,
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: "Kore",
        },
      },
    },
  },
};

export async function readAgentConfig(): Promise<{ agents: AgentConfig[] }> {
  try {
    const response = await fetch("/api/config/agent");
    if (!response.ok) {
      throw new Error(
        `Failed to read agent configuration: ${response.statusText}`
      );
    }
    const data = await response.json();

    // Migrate agents to include config field if missing
    const migratedAgents = (data.agents || []).map(
      (agent: Partial<AgentConfig>) => ({
        ...agent,
        config: agent.config || defaultConfig,
        tools: agent.tools || [],
        dependencies: agent.dependencies || [],
      })
    );

    return { agents: migratedAgents };
  } catch (error) {
    console.error("Failed to read agent configuration:", error);
    return { agents: [] };
  }
}

export async function writeAgentConfig(config: {
  agents: AgentConfig[];
}): Promise<void> {
  try {
    const response = await fetch("/api/config/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config, null, 2),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to write agent configuration: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Failed to write agent configuration:", error);
    throw error;
  }
}
