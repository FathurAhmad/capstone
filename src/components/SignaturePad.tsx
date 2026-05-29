"use client";

import { useRef, useImperativeHandle, forwardRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

export interface SignaturePadRef {
  getSignatureBase64: () => string | null;
  isEmpty: () => boolean;
  clear: () => void;
}

interface SignaturePadProps {
  label: string;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(({ label }, ref) => {
  const padRef = useRef<SignatureCanvas | null>(null);
  const [containerWidth, setContainerWidth] = useState(300);

  // Fungsi untuk mendapatkan ukuran dinamis container agar canvas responsive
  const updateWidth = () => {
    const parent = document.getElementById(`sig-container-${label.replace(/\s+/g, '')}`);
    if (parent) {
      setContainerWidth(parent.offsetWidth - 2); // -2 untuk border
    }
  };

  useEffect(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [label]);

  useImperativeHandle(ref, () => ({
    getSignatureBase64: () => {
      if (!padRef.current || padRef.current.isEmpty()) return null;
      return padRef.current.getTrimmedCanvas().toDataURL("image/png");
    },
    isEmpty: () => {
      return padRef.current ? padRef.current.isEmpty() : true;
    },
    clear: () => {
      padRef.current?.clear();
    }
  }));

  return (
    <div className="flex flex-col mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-bold text-gray-700 uppercase">{label}</label>
        <button 
          onClick={() => padRef.current?.clear()} 
          className="text-xs text-red-500 font-semibold hover:underline"
        >
          Bersihkan
        </button>
      </div>
      
      <div 
        id={`sig-container-${label.replace(/\s+/g, '')}`} 
        className="w-full bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-inner"
      >
        <SignatureCanvas 
          ref={padRef}
          penColor="#1a3a7c"
          canvasProps={{
            width: containerWidth, 
            height: 150, 
            className: "sigCanvas cursor-crosshair"
          }}
          backgroundColor="white"
        />
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">Tanda tangan di dalam area kotak di atas</p>
    </div>
  );
});

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;
