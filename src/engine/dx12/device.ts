import { D3D12CommandQueue } from './command_queue';

export class D3D12Device {
  private adapter: GPUAdapter | null = null;
  public device: GPUDevice | null = null;

  constructor() {}

  async initialize() {
    if (typeof navigator === 'undefined' || !navigator.gpu) {
      throw new Error("WebGPU not supported on this browser. Please use Chrome Canary or enable WebGPU flags.");
    }

    this.adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance"
    });

    if (!this.adapter) {
      throw new Error("No WebGPU adapter found.");
    }

    this.device = await this.adapter.requestDevice();
    console.log(`[BellumDX] Device Initialized: ${this.adapter.info.description || 'Unknown Adapter'}`);
  }

  createCommandQueue(type: 'DIRECT' | 'COMPUTE' | 'COPY' = 'DIRECT'): D3D12CommandQueue {
    if (!this.device) throw new Error("Device not initialized");
    return new D3D12CommandQueue(this.device, type);
  }

  // Stub for resource creation
  createCommittedResource(desc: GPUTextureDescriptor | GPUBufferDescriptor) {
    if (!this.device) throw new Error("Device not initialized");
    // Logic to determine buffer vs texture based on desc
    return null;
  }
}

