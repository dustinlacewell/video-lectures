/* Runs in the page before its own code. Wraps canvas text and image drawing so the sweep can see,
   in screen pixels, every box drawn on the video canvas. Plain JS in a string: it must not be transpiled. */

import { CANVAS_MARK as MARK } from '../shared/session.ts';

export const INSTRUMENT = `(function () {
  var P = CanvasRenderingContext2D.prototype;
  var rec = { on: false, boxes: [] };
  window.__vsSweep = rec;
  function watched(ctx) { return rec.on && ctx.globalAlpha > 0.02 && ctx.canvas && ctx.canvas.hasAttribute && ctx.canvas.hasAttribute('${MARK}'); }
  function push(ctx, kind, label, x0, y0, x1, y1) {
    var m = ctx.getTransform(), xs = [], ys = [];
    [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].forEach(function (p) {
      xs.push(m.a * p[0] + m.c * p[1] + m.e); ys.push(m.b * p[0] + m.d * p[1] + m.f);
    });
    rec.boxes.push({ kind: kind, text: label, x0: Math.min.apply(null, xs), y0: Math.min.apply(null, ys), x1: Math.max.apply(null, xs), y1: Math.max.apply(null, ys) });
  }
  ['fillText', 'strokeText'].forEach(function (name) {
    var orig = P[name];
    P[name] = function (text, x, y, maxWidth) {
      var s = String(text);
      if (watched(this) && s.trim()) {
        var tm = this.measureText(s), l = tm.actualBoundingBoxLeft, r = tm.actualBoundingBoxRight;
        if (maxWidth !== undefined && tm.width > maxWidth) { var k = maxWidth / tm.width; l *= k; r *= k; }
        push(this, 'text', s, x - l, y - tm.actualBoundingBoxAscent, x + r, y + tm.actualBoundingBoxDescent);
      }
      return orig.apply(this, arguments);
    };
  });
  var draw = P.drawImage;
  P.drawImage = function (img) {
    if (watched(this)) {
      var a = arguments, w = img.naturalWidth || img.videoWidth || img.width, h = img.naturalHeight || img.videoHeight || img.height, b;
      if (a.length === 3) b = [a[1], a[2], w, h];
      else if (a.length === 5) b = [a[1], a[2], a[3], a[4]];
      else b = [a[5], a[6], a[7], a[8]];
      push(this, 'image', img.src || img.id || img.tagName || 'image', b[0], b[1], b[0] + b[2], b[1] + b[3]);
    }
    return draw.apply(this, arguments);
  };
})();`;
