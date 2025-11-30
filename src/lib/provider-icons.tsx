import React from 'react';
import { 
  Brain, Zap, Sparkles, Code, Globe, Rocket, 
  Cpu, Database, Image as ImageIcon, Video, 
  Layers, Box, Circle, Hexagon, Square
} from 'lucide-react';

export interface ProviderIconProps {
  provider: string;
  className?: string;
}

// Map providers to themed icons
export const getProviderIcon = (provider: string) => {
  const lowerProvider = provider.toLowerCase();
  
  // Use themed icons that fit the dark aesthetic
  if (lowerProvider.includes('openai') || lowerProvider.includes('gpt')) {
    return Brain; // OpenAI - Brain icon
  } else if (lowerProvider.includes('anthropic') || lowerProvider.includes('claude')) {
    return Sparkles; // Anthropic - Sparkles for creativity
  } else if (lowerProvider.includes('google') || lowerProvider.includes('gemini') || lowerProvider.includes('gemma')) {
    return Globe; // Google - Globe icon
  } else if (lowerProvider.includes('meta') || lowerProvider.includes('llama')) {
    return Layers; // Meta - Layers icon
  } else if (lowerProvider.includes('mistral') || lowerProvider.includes('mixtral') || lowerProvider.includes('pixtral')) {
    return Rocket; // Mistral - Rocket for speed
  } else if (lowerProvider.includes('deepseek')) {
    return Code; // DeepSeek - Code icon
  } else if (lowerProvider.includes('qwen')) {
    return Zap; // Qwen - Zap for speed
  } else if (lowerProvider.includes('xai') || lowerProvider.includes('grok')) {
    return Hexagon; // xAI - Hexagon
  } else if (lowerProvider.includes('groq')) {
    return Cpu; // Groq - CPU for performance
  } else if (lowerProvider.includes('glm')) {
    return Box; // GLM - Box
  } else if (lowerProvider.includes('kimi')) {
    return Circle; // Kimi - Circle
  } else if (lowerProvider.includes('deepinfra')) {
    return Database; // DeepInfra - Database
  } else if (lowerProvider.includes('nvidia') || lowerProvider.includes('nemotron')) {
    return Cpu; // NVIDIA - CPU
  } else if (lowerProvider.includes('microsoft') || lowerProvider.includes('phi')) {
    return Square; // Microsoft - Square
  } else if (lowerProvider.includes('stability') || lowerProvider.includes('flux') || lowerProvider.includes('sdxl')) {
    return ImageIcon; // Stability AI - Image icon
  } else if (lowerProvider.includes('black-forest') || lowerProvider.includes('runway') || lowerProvider.includes('pika')) {
    return Video; // Video generation - Video icon
  } else {
    return Zap; // Default - Zap icon
  }
};

export const ProviderIcon: React.FC<ProviderIconProps> = ({ provider, className = "w-3.5 h-3.5" }) => {
  const Icon = getProviderIcon(provider);
  return <Icon className={className} />;
};

