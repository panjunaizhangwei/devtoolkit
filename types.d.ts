declare module "browser-image-compression" {
  interface Options {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    fileType?: string;
    initialQuality?: number;
    alwaysKeepResolution?: boolean;
    libURL?: string;
    libPath?: string;
    signal?: AbortSignal;
    onProgress?: (percent: number) => void;
  }
  function imageCompression(file: File, options: Options): Promise<File>;
  export default imageCompression;
}

declare module "jsqr" {
  interface QRCode {
    data: string;
    binaryData: number[];
    location: {
      topLeft: { x: number; y: number };
      topRight: { x: number; y: number };
      bottomLeft: { x: number; y: number };
      bottomRight: { x: number; y: number };
    };
  }
  function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: { inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth" }
  ): QRCode | null;
  export default jsQR;
}
