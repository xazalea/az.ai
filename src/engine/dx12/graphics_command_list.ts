import { D3D12PipelineState } from './pipeline_state';
import { D3D12RootSignature } from './root_signature';
import { D3D12DescriptorHeap } from './descriptor_heap';

export class D3D12GraphicsCommandList {
  private device: GPUDevice;
  private encoder: GPUCommandEncoder;
  private passEncoder: GPURenderPassEncoder | null = null;
  private currentPSO: D3D12PipelineState | null = null;
  private currentRootSignature: D3D12RootSignature | null = null;

  constructor(device: GPUDevice) {
    this.device = device;
    this.encoder = device.createCommandEncoder();
  }

  // Start recording a render pass (Needs SwapChain Texture)
  // In D3D12, this is implicit via OMSetRenderTargets, but WebGPU needs explicit pass
  OMSetRenderTargets(view: GPUTextureView) {
    // Close previous pass if open
    if (this.passEncoder) this.passEncoder.end();

    this.passEncoder = this.encoder.beginRenderPass({
      colorAttachments: [{
        view: view,
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        loadOp: 'clear' as GPULoadOp,
        storeOp: 'store' as GPUStoreOp
      }]
    });
  }

  SetGraphicsRootSignature(rootSig: D3D12RootSignature) {
    this.currentRootSignature = rootSig;
  }

  SetPipelineState(pso: D3D12PipelineState) {
    if (!this.passEncoder) throw new Error("Must be in a render pass to set PSO");
    this.currentPSO = pso;
    this.passEncoder.setPipeline(pso.pipeline);
  }

  SetGraphicsRootDescriptorTable(rootParameterIndex: number, baseDescriptor: any) {
    // This would bind bind groups
    // this.passEncoder?.setBindGroup(rootParameterIndex, ...);
  }

  DrawInstanced(vertexCount: number, instanceCount: number, startVertex: number, startInstance: number) {
    if (!this.passEncoder) throw new Error("Must be in a render pass to draw");
    this.passEncoder.draw(vertexCount, instanceCount, startVertex, startInstance);
  }

  Close(): GPUCommandBuffer {
    if (this.passEncoder) {
      this.passEncoder.end();
      this.passEncoder = null;
    }
    return this.encoder.finish();
  }
  
  Reset() {
    this.encoder = this.device.createCommandEncoder();
    this.passEncoder = null;
  }
}

