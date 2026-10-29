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

var out = ["# " + doc.name], counts = {};
for (var i = 0; i < doc.pathItems.length; i++) {
    var p = doc.pathItems[i];
    if (!p.stroked) continue;
    var g = p.geometricBounds, col = colorName(p.strokeColor), w = p.strokeWidth.toFixed(2);
    counts[col + " w=" + w] = (counts[col + " w=" + w] || 0) + 1;
    out.push(col + " w=" + w + " n=" + p.pathPoints.length +
        " L" + (g[0] / MM).toFixed(2) + " T" + (g[1] / MM).toFixed(2) +
        " R" + (g[2] / MM).toFixed(2) + " B" + (g[3] / MM).toFixed(2) +
        " width=" + ((g[2] - g[0]) / MM).toFixed(2) + " height=" + ((g[1] - g[3]) / MM).toFixed(2));
}
if (openedHere) doc.close(SaveOptions.DONOTSAVECHANGES);

var f = new File(outPath); f.encoding = "UTF-8"; f.lineFeed = "Unix"; f.open("w"); f.write(out.join("\n")); f.close();
var summary = [];
for (var k in counts) summary.push(counts[k] + " x " + k);
"wrote " + (out.length - 1) + " lines to " + outPath + "\n" + summary.join("\n");
