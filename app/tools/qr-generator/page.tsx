"use client";

import { useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

const PRESETS = [
  { label: 'Tiket Rusak', value: 'TIKET-RUSAK-001' },
  { label: 'Printer Error', value: 'ERROR-PRINTER-E01' },
  { label: 'Internet Down', value: 'INTERNET-DOWN-001' },
  { label: 'Sistem Down', value: 'SISTEM-DOWN-001' },
];

export default function QRGeneratorPage() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [generatedText, setGeneratedText] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    if (!text.trim()) {
      alert('Isi teks atau URL dulu!');
      return;
    }
    setGeneratedText(text.trim());
  };

  const handleDownload = useCallback(() => {
    if (!generatedText) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <rect width="${size}" height="${size}" fill="${bgColor}" />
        <g transform="translate(16, 16)">
          ${generateSvgPaths(generatedText, size - 32, fgColor)}
        </g>
      </svg>
    `;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qrcode-${Date.now()}.png`;
      downloadLink.href = pngUrl;
      downloadLink.click();
    };

    img.src = url;
  }, [generatedText, size, fgColor, bgColor]);

  // Simple SVG path generation for QR code download
  function generateSvgPaths(data: string, qrSize: number, color: string): string {
    // This is a simplified version - the actual QR rendering is done by qrcode.react
    // For download, we use the canvas approach
    return '';
  }

  // Better download using the rendered SVG element
  const handleDownloadBetter = useCallback(() => {
    if (!generatedText || !qrRef.current) return;

    const svgElement = qrRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = size + 64;
      canvas.height = size + 64;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 32, 32, size, size);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qrcode-${Date.now()}.png`;
      downloadLink.href = pngUrl;
      downloadLink.click();

      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [generatedText, size, bgColor]);

  const applyPreset = (value: string) => {
    setText(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/"
            className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
          >
            ← Kembali ke Beranda
          </Link>

          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              🔲 QR Code Generator
            </h1>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              Generate QR code untuk tiket, error code, URL, atau teks lainnya.
              <span className="font-semibold"> Tinggal ketik, langsung jadi!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              📝 Input
            </h2>

            {/* Presets */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Preset Cepat
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => applyPreset(preset.value)}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Teks atau URL
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Contoh: TIKET-RUSAK-001, https://example.com, dll"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Size */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Ukuran: {size}px
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Warna QR
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                    {fgColor}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Warna Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                    {bgColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all text-lg flex items-center justify-center gap-2"
            >
              🔲 Generate QR Code
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              📤 Output
            </h2>

            {generatedText ? (
              <div className="space-y-4">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div
                    ref={qrRef}
                    className="bg-white p-8 rounded-xl shadow-lg inline-block"
                  >
                    <QRCodeSVG
                      value={generatedText}
                      size={size}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>

                {/* Generated Text Preview */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                    Teks yang di-generate:
                  </p>
                  <p className="text-sm font-mono text-zinc-900 dark:text-white break-all">
                    {generatedText}
                  </p>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownloadBetter}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  📥 Download PNG
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-6xl mb-4 text-zinc-300 dark:text-zinc-600">
                  🔲
                </div>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Ketik teks lalu klik "Generate QR Code"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
