import JSZip from 'jszip';

export class APKLoader {
  async load(file: File) {
    console.log(`[BellumAndroid] Loading APK: ${file.name}`);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      let manifest: ArrayBuffer | null = null;
      let classesDex: ArrayBuffer[] = [];
      
      // JSZip uses async API
      const manifestFile = zip.file("AndroidManifest.xml");
      if (manifestFile) {
         console.log("[BellumAndroid] Found Manifest");
         manifest = await manifestFile.async("arraybuffer");
      }

      // Find classes.dex
      for (const filename in zip.files) {
         if (filename === "classes.dex" || filename.match(/classes\d*\.dex/)) {
            console.log(`[BellumAndroid] Found Bytecode: ${filename}`);
            const data = await zip.files[filename].async("arraybuffer");
            classesDex.push(data);
         }
      }
      
      if (classesDex.length === 0) {
          throw new Error("Invalid APK: classes.dex not found");
      }
      
      return { manifest, classesDex };
    } catch (error: any) {
      console.error("[BellumAndroid] APK Load Error:", error);
      throw new Error(`Failed to load APK: ${error.message}`);
    }
  }
}
