// Lists every stroked path of a die-line PDF (color, stroke width, point count, bounds in mm).
// Black 0.72 = cut, red = fold, thin black = dimensions. Read-only: never modifies the die-line.
// arguments: [0] die-line .pdf/.ai path, [1] output .txt path
var MM = 2.834645669;
var src = arguments[0], outPath = arguments[1];

function colorName(c) {
    try {
        if (c.typename == "RGBColor") return Math.round(c.red) + "/" + Math.round(c.green) + "/" + Math.round(c.blue);
        if (c.typename == "CMYKColor") return "cmyk" + Math.round(c.cyan) + "/" + Math.round(c.magenta) + "/" + Math.round(c.yellow) + "/" + Math.round(c.black);
        if (c.typename == "GrayColor") return "gray" + Math.round(c.gray);
        if (c.typename == "SpotColor") return "spot:" + c.spot.name;
        return c.typename;
    } catch (e) { return "?"; }
}

function alreadyOpen(path) {
    for (var i = 0; i < app.documents.length; i++) {
        try { if (app.documents[i].fullName.fsName == new File(path).fsName) return app.documents[i]; } catch (e) {}
    }
    return null;
}

var doc = alreadyOpen(src);
var openedHere = !doc;
if (!doc) doc = app.open(new File(src));

var out = ["# " + doc.name], counts = {}, glyphs = [];
for (var i = 0; i < doc.pathItems.length; i++) {
    var p = doc.pathItems[i];
    if (!p.stroked) continue;
    var g = p.geometricBounds, col = colorName(p.strokeColor), w = p.strokeWidth.toFixed(2);
    counts[col + " w=" + w] = (counts[col + " w=" + w] || 0) + 1;
    // small shapes = outlined letters of the die-maker's details line (plus a few holes/notches)
    if ((g[2] - g[0]) / MM < 12 && (g[1] - g[3]) / MM < 12) glyphs.push([(g[0] + g[2]) / 2 / MM, (g[1] + g[3]) / 2 / MM]);
    out.push(col + " w=" + w + " n=" + p.pathPoints.length +
        " L" + (g[0] / MM).toFixed(2) + " T" + (g[1] / MM).toFixed(2) +
        " R" + (g[2] / MM).toFixed(2) + " B" + (g[3] / MM).toFixed(2) +
        " width=" + ((g[2] - g[0]) / MM).toFixed(2) + " height=" + ((g[1] - g[3]) / MM).toFixed(2));
}
var pageW = doc.width / MM;
if (openedHere) doc.close(SaveOptions.DONOTSAVECHANGES);

// Orientation hint: the details line ("... Date ... IB file") is a dense strip of letters.
// A tall narrow strip means the die-line arrived rotated; for ib-design it sits on the right -> rotate 90 CCW.
function densest(axis) {
    var bins = {}, best = null;
    for (var i = 0; i < glyphs.length; i++) {
        var b = Math.floor(glyphs[i][axis] / 3);
        bins[b] = (bins[b] || 0) + 1;
        if (best === null || bins[b] > bins[best]) best = b;
    }
    return best === null ? [0, 0] : [bins[best], best * 3 + 1.5];
}
var byX = densest(0), byY = densest(1), hint;
if (byX[0] > 2 * byY[0]) hint = "details line is VERTICAL at x=" + byX[1].toFixed(0) + "mm (page width " + pageW.toFixed(0) + "mm, " +
    (byX[1] > pageW / 2 ? "right side -> rotate the whole die-line 90 CCW" : "left side -> unusual, ask before rotating") + ")";
else if (byY[0] > 2 * byX[0]) hint = "details line is HORIZONTAL -> no rotation needed if it reads normally";
else hint = "details line not detected -> check the rendered image";

var f = new File(outPath); f.encoding = "UTF-8"; f.lineFeed = "Unix"; f.open("w"); f.write(out.join("\n")); f.close();
var summary = [];
for (var k in counts) summary.push(counts[k] + " x " + k);
"wrote " + (out.length - 1) + " lines to " + outPath + "\n" + summary.join("\n") + "\nORIENTATION: " + hint;
