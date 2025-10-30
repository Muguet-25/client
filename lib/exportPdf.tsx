'use client';

import React from 'react';

export async function exportCurrentPageAsPdf(filename: string = 'report.pdf') {
  const [{ pdf, Document: PDFDocument, Page: PDFPage, Image: PDFImage, View }, htmlToImage] = await Promise.all([
    import('@react-pdf/renderer'),
    import('html-to-image'),
  ]);

  const target: HTMLElement = document.body;

  // html-to-image로 페이지를 PNG로 변환 (oklab 등 최신 색상 함수에도 안전)
  const dataUrl = await htmlToImage.toPng(target, {
    pixelRatio: 2,
    cacheBust: true,
    style: { transform: 'none' },
  });

  // 원본 이미지 크기
  const img = new window.Image();
  img.src = dataUrl;
  await new Promise((res) => (img.onload = res));
  const srcW = img.naturalWidth || 2480;
  const srcH = img.naturalHeight || 3508;

  // A4 사이즈 (pt)
  const PAGE_W = 595.28; // 210mm
  const PAGE_H = 841.89; // 297mm
  const MARGIN = 24; // pt
  const availW = PAGE_W - MARGIN * 2;
  const availH = PAGE_H - MARGIN * 2;

  const scale = Math.min(availW / srcW, availH / srcH);
  const renderW = Math.max(1, srcW * scale);
  const renderH = Math.max(1, srcH * scale);

  const doc = (
    <PDFDocument>
      <PDFPage size={[PAGE_W, PAGE_H]}>
        <View style={{ width: PAGE_W, height: PAGE_H, padding: MARGIN, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
          <PDFImage src={dataUrl} style={{ width: renderW, height: renderH }} />
        </View>
      </PDFPage>
    </PDFDocument>
  );

  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
