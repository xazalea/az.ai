export enum D3D12_RESOURCE_DIMENSION {
  UNKNOWN = 0,
  BUFFER = 1,
  TEXTURE1D = 2,
  TEXTURE2D = 3,
  TEXTURE3D = 4,
}

export interface D3D12ResourceDesc {
  Dimension: D3D12_RESOURCE_DIMENSION;
  Alignment: number;
  Width: number;
  Height: number;
  DepthOrArraySize: number;
  MipLevels: number;
  Format: GPUTextureFormat;
  SampleDesc: { Count: number; Quality: number };
  Layout: string;
  Flags: number;
}

export class D3D12Resource {
  private device: GPUDevice;
  public buffer: GPUBuffer | null = null;
  public texture: GPUTexture | null = null;
  public desc: D3D12ResourceDesc;

  constructor(device: GPUDevice, desc: D3D12ResourceDesc) {
    this.device = device;
    this.desc = desc;

    if (desc.Dimension === D3D12_RESOURCE_DIMENSION.BUFFER) {
      this.createBuffer();
    } else if (desc.Dimension === D3D12_RESOURCE_DIMENSION.TEXTURE2D) {
      this.createTexture();
    }
  }

  private createBuffer() {
    // Map D3D12 Heap Properties to WebGPU usage
    // Simplified: Assuming GENERIC_READ logic for now
    this.buffer = this.device.createBuffer({
      size: this.desc.Width,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.UNIFORM | GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.INDEX,
      mappedAtCreation: false,
    });
    console.log(`[BellumDX] Created Buffer Resource (${this.desc.Width} bytes)`);
  }

  private createTexture() {
    this.texture = this.device.createTexture({
      size: {
        width: this.desc.Width,
        height: this.desc.Height,
        depthOrArrayLayers: this.desc.DepthOrArraySize
      },
      mipLevelCount: this.desc.MipLevels,
      sampleCount: this.desc.SampleDesc.Count,
      dimension: '2d',
      format: this.desc.Format,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    });
    console.log(`[BellumDX] Created Texture Resource (${this.desc.Width}x${this.desc.Height})`);
  }

  map(): ArrayBuffer {
    if (!this.buffer) throw new Error("Cannot map non-buffer resource");
    // WebGPU mapping is async and more complex (mapAsync). 
    // D3D12 Map is synchronous.
    // This is a major architectural mismatch that requires the JIT to handle 'await' or use a shared array buffer if possible.
    console.warn("[BellumDX] Resource mapping requested. This is a stub.");
    return new ArrayBuffer(this.desc.Width);
  }

  unmap() {
    if (this.buffer) {
        // this.buffer.unmap();
    }
  }
}

