async function downloadPDF(){
  const target = document.getElementById('export-root') || document.body;

  // Wait for fonts & images so sizes are final
  try { if (document.fonts?.ready) await document.fonts.ready; } catch {}
  await Promise.all([...document.images].filter(i=>!i.complete).map(i=>new Promise(r=>{
    i.addEventListener('load', r, {once:true}); i.addEventListener('error', r, {once:true});
  })));

  document.body.classList.add('exporting');

  // Render the whole node to a single canvas
  const canvas = await html2canvas(target, {
    scale: 2.2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth:  target.scrollWidth,
    windowHeight: target.scrollHeight
  });

  const img = canvas.toDataURL('image/jpeg', 0.98);

  // Build a single-page PDF exactly the canvas size
  const { jsPDF } = window.jspdf;

  // PDF max dimension is ~200 inches. In px units (1px ~ 1/96in) the cap ≈ 19200px.
  const MAX_PX = 19200;
  let pdfW = canvas.width;
  let pdfH = canvas.height;

  if (pdfH > MAX_PX) { // very long docs: scale down to fit the cap
    const s = MAX_PX / pdfH;
    pdfW = Math.floor(pdfW * s);
    pdfH = Math.floor(pdfH * s);
  }

  const pdf = new jsPDF({ unit: 'px', format: [pdfW, pdfH] });
  pdf.addImage(img, 'JPEG', 0, 0, pdfW, pdfH);
  pdf.save('Taha_Yuceses_CV.pdf');

  document.body.classList.remove('exporting');
}