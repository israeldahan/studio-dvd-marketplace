// Maps an .ai label file: artboards, layers, text frames (name, font, size, contents), placed/raster items.
// Read-only. Leaves the document open (it is the working file).
// arguments: [0] .ai path, [1] output .txt path
var MM = 2.834645669;
var src = arguments[0], outPath = arguments[1];

var doc = app.open(new File(src));
function mm(g) {
    return "L" + (g[0] / MM).toFixed(1) + " T" + (g[1] / MM).toFixed(1) + " R" + (g[2] / MM).toFixed(1) + " B" + (g[3] / MM).toFixed(1);
}

var out = ["# " + doc.name + " color=" + doc.documentColorSpace];
for (var a = 0; a < doc.artboards.length; a++) out.push("ARTBOARD " + a + " " + doc.artboards[a].name + " " + mm(doc.artboards[a].artboardRect));
for (var l = 0; l < doc.layers.length; l++) {
    var L = doc.layers[l];
    out.push("LAYER '" + L.name + "' locked=" + L.locked + " visible=" + L.visible + " items=" + L.pageItems.length);
}
for (var i = 0; i < doc.textFrames.length; i++) {
    var t = doc.textFrames[i], font = "";
    try { font = t.textRange.characterAttributes.textFont.name + " " + t.textRange.characterAttributes.size; } catch (e) {}
    out.push("TEXT name='" + t.name + "' layer='" + t.layer.name + "' " + mm(t.geometricBounds) + " " + font +
        " :: " + t.contents.replace(/[\r\n]+/g, " \\n "));
}
for (var i = 0; i < doc.placedItems.length; i++) {
    var p = doc.placedItems[i], file = "missing";
    try { file = p.file.fsName; } catch (e) {}
    out.push("PLACED " + mm(p.geometricBounds) + " " + file);
}
out.push("RASTER count=" + doc.rasterItems.length);

var f = new File(outPath); f.encoding = "UTF-8"; f.lineFeed = "Unix"; f.open("w"); f.write(out.join("\n")); f.close();
"wrote " + out.length + " lines to " + outPath + " (" + doc.textFrames.length + " text frames)";
