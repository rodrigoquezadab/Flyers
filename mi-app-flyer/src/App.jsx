import React, { useState, useRef, useEffect } from 'react';
import './App.css'; // Asegúrate de tener este archivo aunque esté vacío
import { jsPDF } from 'jspdf';

const PAGE_SIZES = {
  A3: { width: 3508, height: 4960 },
  A4: { width: 2480, height: 3508 },
  A5: { width: 1748, height: 2480 },
  A6: { width: 1240, height: 1748 },
  Carta: { width: 2550, height: 3300 },
  MediaCarta: { width: 1650, height: 2550 },
  Oficio: { width: 2550, height: 4200 },
  Tabloide: { width: 3300, height: 5100 },
};

function App() {
  const [image, setImage] = useState(null);
  const [config, setConfig] = useState({
    pageSize: 'A4',
    orientation: 'vertical',
    fillMode: 'contain',
    showRuler: true,
    showGuides: true,
    guidesColor: '#0096ff',
    exportFormat: 'jpg',
    exportName: 'flyer-export',
    rows: 1,
    cols: 1,
    quality: 0.8
  });
  const [fileSize, setFileSize] = useState(0);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const drawContent = (canvas, isPreview = false) => {
    const ctx = canvas.getContext('2d');
    let { width, height } = PAGE_SIZES[config.pageSize];

    if (config.orientation === 'horizontal') {
      const temp = width;
      width = height;
      height = temp;
    }

    const showRuler = isPreview && config.showRuler;
    const rulerThickness = 280;
    const offset = showRuler ? rulerThickness : 0;

    canvas.width = width + offset;
    canvas.height = height + offset;

    const cellWidth = width / config.cols;
    const cellHeight = height / config.rows;

    if (showRuler) {
       ctx.fillStyle = '#1e1e1e'; 
       ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    ctx.translate(offset, offset);

    if (showRuler) {
       ctx.shadowColor = 'rgba(0,0,0,0.8)';
       ctx.shadowBlur = 30;
       ctx.shadowOffsetX = 10;
       ctx.shadowOffsetY = 10;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.shadowColor = 'transparent';

    if (image) {
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (config.fillMode === 'stretch') {
            ctx.drawImage(image, c * cellWidth, r * cellHeight, cellWidth, cellHeight);
          } else if (config.fillMode === 'cover') {
            const scale = Math.max(cellWidth / image.width, cellHeight / image.height);
            const x = c * cellWidth + (cellWidth - image.width * scale) / 2;
            const y = r * cellHeight + (cellHeight - image.height * scale) / 2;
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
            ctx.clip();
            ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
            ctx.restore();
          } else {
            const scale = Math.min(cellWidth / image.width, cellHeight / image.height);
            const x = c * cellWidth + (cellWidth - image.width * scale) / 2;
            const y = r * cellHeight + (cellHeight - image.height * scale) / 2;
            ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
          }
        }
      }
    }

    if (config.showGuides) {
       ctx.strokeStyle = config.guidesColor;
       ctx.setLineDash([20, 20]);
       ctx.lineWidth = 4;
       ctx.beginPath();
       for (let r = 1; r < config.rows; r++) {
         ctx.moveTo(0, r * cellHeight);
         ctx.lineTo(width, r * cellHeight);
       }
       for (let c = 1; c < config.cols; c++) {
         ctx.moveTo(c * cellWidth, 0);
         ctx.lineTo(c * cellWidth, height);
       }
       ctx.stroke();
       ctx.setLineDash([]);
    }

    ctx.restore();

    if (showRuler) {
       const pixelsPerCm = 300 / 2.54; 
       
       ctx.fillStyle = '#aaa';
       ctx.font = 'bold 90px sans-serif';
       
       ctx.textAlign = 'center';
       ctx.textBaseline = 'bottom';
       for (let cm = 0; cm * pixelsPerCm <= width; cm++) {
           const x = cm * pixelsPerCm + offset;
           const is10 = cm % 10 === 0;
           const is5 = cm % 5 === 0;
           const markHeight = is10 ? 140 : is5 ? 90 : 50;
           ctx.fillRect(x - 3, offset - markHeight, 6, markHeight);
           if ((is10 || is5) && cm !== 0) {
               ctx.fillText(cm.toString(), x, offset - markHeight - 15);
           }
       }
       
       ctx.textAlign = 'right';
       ctx.textBaseline = 'middle';
       for (let cm = 0; cm * pixelsPerCm <= height; cm++) {
           const y = cm * pixelsPerCm + offset;
           const is10 = cm % 10 === 0;
           const is5 = cm % 5 === 0;
           const markWidth = is10 ? 140 : is5 ? 90 : 50;
           ctx.fillRect(offset - markWidth, y - 3, markWidth, 6);
           if ((is10 || is5) && cm !== 0) {
               ctx.fillText(cm.toString(), offset - markWidth - 20, y);
           }
       }
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    drawContent(canvasRef.current, true);

    if (image) {
      const offCanvas = document.createElement('canvas');
      drawContent(offCanvas, false);
      offCanvas.toBlob((blob) => {
        setFileSize((blob.size / 1024).toFixed(2));
      }, config.exportFormat === 'png' ? 'image/png' : 'image/jpeg', config.quality);
    }
  }, [image, config]);

  const downloadImage = () => {
    if (!image) return;
    const offCanvas = document.createElement('canvas');
    drawContent(offCanvas, false);

    const finalName = config.exportName.trim() || 'flyer-export';

    if (config.exportFormat === 'pdf') {
       try {
          const pdf = new jsPDF({
            orientation: config.orientation === 'vertical' ? 'p' : 'l',
            unit: 'px',
            format: [offCanvas.width, offCanvas.height]
          });
          const imgData = offCanvas.toDataURL('image/jpeg', config.quality);
          pdf.addImage(imgData, 'JPEG', 0, 0, offCanvas.width, offCanvas.height);
          pdf.save(`${finalName}.pdf`);
       } catch (err) {
          alert("Hubo un error al exportar como PDF: " + err.message);
       }
       return;
    }

    const mimeType = config.exportFormat === 'png' ? 'image/png' : 'image/jpeg';
    const extension = config.exportFormat === 'png' ? 'png' : 'jpg';

    offCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${finalName}.${extension}`;
      a.click();
    }, mimeType, config.quality);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Creador de Flyers</h1>
      <input type="file" onChange={handleImageUpload} accept="image/*" />

      <div style={{ margin: '20px 0', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={config.pageSize} onChange={(e) => setConfig({ ...config, pageSize: e.target.value })}>
          {Object.keys(PAGE_SIZES).map(size => <option key={size} value={size}>{size}</option>)}
        </select>
        <select value={config.orientation} onChange={(e) => setConfig({ ...config, orientation: e.target.value })}>
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
        </select>
        <select value={config.fillMode} onChange={(e) => setConfig({ ...config, fillMode: e.target.value })}>
          <option value="contain">Ajustar (Centrar Proporcional)</option>
          <option value="stretch">Estirar (Llenar celda sin proporción)</option>
          <option value="cover">Cubrir (Llenar y recortar sobrante)</option>
        </select>
        <select value={config.exportFormat} onChange={(e) => setConfig({ ...config, exportFormat: e.target.value })}>
          <option value="jpg">Descargar: JPG</option>
          <option value="png">Descargar: PNG</option>
          <option value="pdf">Descargar: PDF</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#2a2a2a', border: '1px solid #444', padding: '4px 10px', borderRadius: '4px' }}>
          <input type="checkbox" checked={config.showRuler} onChange={(e) => setConfig({ ...config, showRuler: e.target.checked })} id="ruler" />
          <label htmlFor="ruler">Reglas (cm)</label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#2a2a2a', border: '1px solid #444', padding: '4px 10px', borderRadius: '4px' }}>
          <input type="checkbox" checked={config.showGuides} onChange={(e) => setConfig({ ...config, showGuides: e.target.checked })} id="guides" />
          <label htmlFor="guides">Guías</label>
          <input type="color" value={config.guidesColor} onChange={(e) => setConfig({ ...config, guidesColor: e.target.value })} style={{ width: '25px', height: '25px', padding: '0', border: 'none', cursor: 'pointer', background: 'transparent' }} title="Color de las guías de corte" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label>Filas:</label>
          <input type="number" min="1" max="10" value={config.rows} onChange={(e) => setConfig({ ...config, rows: parseInt(e.target.value) || 1 })} style={{ width: '50px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label>Columnas:</label>
          <input type="number" min="1" max="10" value={config.cols} onChange={(e) => setConfig({ ...config, cols: parseInt(e.target.value) || 1 })} style={{ width: '50px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label>Calidad:</label>
          <input type="range" min="0.1" max="1" step="0.1" value={config.quality} onChange={(e) => setConfig({ ...config, quality: parseFloat(e.target.value) })} />
          <span>{config.quality}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginTop: '15px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #333' }}>
        <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'nowrap', minWidth: '160px' }}>Peso estimado: <strong>{fileSize} KB</strong></p>
        <input 
          type="text" 
          value={config.exportName} 
          onChange={(e) => setConfig({ ...config, exportName: e.target.value })} 
          placeholder="Nombre del archivo..." 
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: '#e0e0e0', flex: '1 1 200px', fontSize: '14px' }}
        />
        <button onClick={downloadImage} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background 0.2s', flex: '1 1 150px', textAlign: 'center' }} onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'} onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}>
          Descargar Archivo
        </button>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', backgroundColor: 'white' }} />
      </div>
    </div>
  );
}

export default App;