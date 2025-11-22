function renderGraph(data, canvas) {
  if (!canvas || !data || data.length === 0) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // Determine min/max for scaling
  let xMin = Number.POSITIVE_INFINITY;
  let xMax = Number.NEGATIVE_INFINITY;
  let yMin = Number.POSITIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;

  data.forEach(point => {
    if (point.x < xMin) xMin = point.x;
    if (point.x > xMax) xMax = point.x;
    if (point.y < yMin) yMin = point.y;
    if (point.y > yMax) yMax = point.y;
  });

  // Padding for axes
  const padding = 40;

  // Map data to canvas coordinates
  function mapX(x) {
    return padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  }
  function mapY(y) {
    return height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);
  }

  // Draw axes
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Y axis
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  // X axis
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Draw labels
  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.fillText(xMin.toFixed(2), padding, height - padding + 15);
  ctx.fillText(xMax.toFixed(2), width - padding - 30, height - padding + 15);
  ctx.fillText(yMax.toFixed(2), padding - 35, padding + 5);
  ctx.fillText(yMin.toFixed(2), padding - 35, height - padding);

  // Draw graph line
  ctx.strokeStyle = '#007bff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((point, i) => {
    const cx = mapX(point.x);
    const cy = mapY(point.y);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.stroke();

  // Draw points with tooltip handlers
  // For simplicity, just draw points
  ctx.fillStyle = '#ff0000';
  data.forEach(point => {
    const cx = mapX(point.x);
    const cy = mapY(point.y);
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fill();
  });
}

export { renderGraph };
