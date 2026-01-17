
import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

const QRCodeGen: React.FC<QRCodeProps> = ({ value, size = 80 }) => {
  // We'll use a public API for QR codes to avoid extra heavy dependencies while maintaining visual fidelity
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <div className="bg-white p-1 border border-gray-200 inline-block">
      <img src={qrUrl} alt="QR Code" crossOrigin="anonymous" width={size} height={size} />
    </div>
  );
};

export default QRCodeGen;
