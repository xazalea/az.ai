export interface PESection {
  name: string;
  virtualSize: number;
  virtualAddress: number;
  sizeOfRawData: number;
  pointerToRawData: number;
  characteristics: number;
  data: Uint8Array;
}

export class BellumKernel {
  private memory: WebAssembly.Memory;

  constructor() {
    this.memory = new WebAssembly.Memory({ initial: 256, maximum: 2048 }); // 16MB - 128MB
  }

  async loadExecutable(buffer: ArrayBuffer) {
    const view = new DataView(buffer);
    
    // 1. DOS Header
    const e_magic = view.getUint16(0, true);
    if (e_magic !== 0x5A4D) { // 'MZ'
      throw new Error("Invalid DOS Signature: Not a valid Windows executable.");
    }

    const e_lfanew = view.getUint32(60, true); // Pointer to PE Header

    // 2. PE Header
    const signature = view.getUint32(e_lfanew, true);
    if (signature !== 0x00004550) { // 'PE\0\0'
      throw new Error("Invalid PE Signature.");
    }

    // File Header
    const machine = view.getUint16(e_lfanew + 4, true);
    if (machine !== 0x8664) { // x64
      throw new Error("Unsupported Architecture: Bellum only supports x86_64 binaries.");
    }

    const numberOfSections = view.getUint16(e_lfanew + 6, true);
    const sizeOfOptionalHeader = view.getUint16(e_lfanew + 20, true);

    // Optional Header
    const magic = view.getUint16(e_lfanew + 24, true);
    if (magic !== 0x20B) { // PE32+ (64-bit)
      throw new Error("Invalid Optional Header Magic: Expected PE32+.");
    }

    const entryPoint = view.getUint32(e_lfanew + 40, true);
    const imageBase = view.getBigUint64(e_lfanew + 48, true);

    console.log(`[BellumKernel] Loaded PE: EntryPoint=0x${entryPoint.toString(16)}, ImageBase=0x${imageBase.toString(16)}`);

    // 3. Section Headers
    const sectionsStart = e_lfanew + 24 + sizeOfOptionalHeader;
    const sections: PESection[] = [];

    for (let i = 0; i < numberOfSections; i++) {
      const offset = sectionsStart + (i * 40);
      
      // Read Name (8 bytes, null padded)
      let name = "";
      for (let j = 0; j < 8; j++) {
        const charCode = view.getUint8(offset + j);
        if (charCode === 0) break;
        name += String.fromCharCode(charCode);
      }

      const virtualSize = view.getUint32(offset + 8, true);
      const virtualAddress = view.getUint32(offset + 12, true);
      const sizeOfRawData = view.getUint32(offset + 16, true);
      const pointerToRawData = view.getUint32(offset + 20, true);
      const characteristics = view.getUint32(offset + 36, true);

      // Extract Data
      const data = new Uint8Array(buffer, pointerToRawData, sizeOfRawData);

      sections.push({
        name,
        virtualSize,
        virtualAddress,
        sizeOfRawData,
        pointerToRawData,
        characteristics,
        data
      });

      console.log(`[BellumKernel] Section: ${name} (VA: 0x${virtualAddress.toString(16)}, Size: ${sizeOfRawData})`);
    }

    return { entryPoint, imageBase, sections };
  }
}

