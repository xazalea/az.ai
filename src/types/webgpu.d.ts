/// <reference types="@webgpu/types" />

interface Window {
  // WebGPU is not yet standard in all environments, ensuring type safety
  navigator: Navigator;
}

