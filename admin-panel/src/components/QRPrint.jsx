import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QRPrint({ eser, onKapat }) {
  const canvasRef = useRef(null);
  const printRef = useRef(null);

  const qrUrl = `http://localhost:3001/api/public/bergama/eserler/qr/${eser.qrKodu}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#2C2C2C', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      });
    }
  }, [qrUrl]);

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>QR Kod - ${eser.isim}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
            }
            .card {
              width: 320px;
              padding: 24px;
              border: 2px solid #2C2C2C;
              border-radius: 16px;
              text-align: center;
            }
            .logo {
              font-size: 11px;
              letter-spacing: 3px;
              color: #888;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .belediye {
              font-size: 13px;
              font-weight: bold;
              color: #2C2C2C;
              margin-bottom: 16px;
            }
            canvas {
              display: block;
              margin: 0 auto 16px;
              border-radius: 8px;
            }
            .isim {
              font-size: 18px;
              font-weight: bold;
              color: #2C2C2C;
              margin-bottom: 4px;
            }
            .donem {
              font-size: 11px;
              color: #C0392B;
              margin-bottom: 12px;
            }
            .aciklama {
              font-size: 10px;
              color: #666;
              line-height: 1.5;
              margin-bottom: 16px;
            }
            .divider {
              width: 40px;
              height: 2px;
              background: #C0392B;
              margin: 0 auto 12px;
              border-radius: 1px;
            }
            .hint {
              font-size: 9px;
              color: #aaa;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            @media print {
              body { margin: 0; }
              .card { border-color: #000; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Büyük canvas oluştur (yazdırma kalitesi için)
    QRCode.toCanvas(document.createElement('canvas'), qrUrl, {
      width: 600,
      margin: 3,
      color: { dark: '#2C2C2C', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
    }).then((bigCanvas) => {
      // Üzerine metin ekle
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = 600;
      finalCanvas.height = 720;
      const ctx = finalCanvas.getContext('2d');

      // Arka plan
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 600, 720);

      // QR kod
      ctx.drawImage(bigCanvas, 0, 80, 600, 600);

      // Üst metin
      ctx.fillStyle = '#888888';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('KESİF — BERGAMA BELEDİYESİ', 300, 40);

      // Alt metin — eser adı
      ctx.fillStyle = '#2C2C2C';
      ctx.font = 'bold 22px Arial';
      ctx.fillText(eser.isim, 300, 710);

      // Kırmızı çizgi
      ctx.fillStyle = '#C0392B';
      ctx.fillRect(260, 685, 80, 3);

      // İndir
      const link = document.createElement('a');
      link.download = `qr-${eser.isim.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = finalCanvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">QR Kod</h2>
          <button onClick={onKapat} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>

        {/* Önizleme */}
        <div ref={printRef}>
          <div className="card" style={{ width: '320px', padding: '24px', border: '2px solid #2C2C2C', borderRadius: '16px', textAlign: 'center', margin: '0 auto' }}>
            <div className="logo" style={{ fontSize: '11px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Keşif</div>
            <div className="belediye" style={{ fontSize: '13px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px' }}>Bergama Belediyesi</div>
            <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto 16px', borderRadius: '8px' }} />
            <div className="isim" style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '4px' }}>{eser.isim}</div>
            {eser.donem && <div className="donem" style={{ fontSize: '11px', color: '#C0392B', marginBottom: '12px' }}>{eser.donem}</div>}
            {eser.kisaAciklama && <div className="aciklama" style={{ fontSize: '10px', color: '#666', lineHeight: '1.5', marginBottom: '16px' }}>{eser.kisaAciklama}</div>}
            <div className="divider" style={{ width: '40px', height: '2px', background: '#C0392B', margin: '0 auto 12px', borderRadius: '1px' }}></div>
            <div className="hint" style={{ fontSize: '9px', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>QR kodu okutarak keşfet</div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleDownload}
            className="flex-1 bg-gray-800 text-white rounded-xl py-3 font-semibold text-sm hover:bg-gray-700 transition"
          >
            ⬇ PNG İndir
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-red-700 text-white rounded-xl py-3 font-semibold text-sm hover:bg-red-800 transition"
          >
            🖨 Yazdır
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Bu QR kodu tabelaya yapıştırabilir veya yazdırabilirsiniz.
        </p>
      </div>
    </div>
  );
}
