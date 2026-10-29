// Fills named text frames from the model details file ("פרטי דגם.txt").
// For every "field: value" line with a value, every text frame named exactly "field" gets the value.
// "\n" in a value becomes a line break. Live Illustrator text only; style of the first character is kept.
// Saves the document. Never touches the die-line or any non-text item.
// arguments: [0] .ai path, [1] details .txt path
var src = arguments[0], detailsPath = arguments[1];

function readPairs(path) {
    var f = new File(path); f.encoding = "UTF-8";
    if (!f.open("r")) throw new Error("cannot read " + path);
    var lines = f.read().split(/\r?\n/), pairs = [];
    f.close();
    for (var i = 0; i < lines.length; i++) {
        var s = lines[i];
        if (/^\s*#/.test(s) || s.indexOf(":") < 0) continue;
        var k = s.substr(0, s.indexOf(":")).replace(/^\s+|\s+$/g, "");
        var v = s.substr(s.indexOf(":") + 1).replace(/^\s+|\s+$/g, "");
        if (k) pairs.push([k, v]);
    }
    return pairs;
}

var doc = app.open(new File(src));
var pairs = readPairs(detailsPath), out = [];
for (var p = 0; p < pairs.length; p++) {
    var key = pairs[p][0], val = pairs[p][1], n = 0;
    if (!val) { out.push("EMPTY   " + key); continue; }
    for (var i = 0; i < doc.textFrames.length; i++) {
        var t = doc.textFrames[i];
        if (t.name != key) continue;
        if (t.layer.locked) { out.push("LOCKED  " + key + " (layer " + t.layer.name + ")"); continue; }
        t.contents = val.replace(/\\n/g, "\r");
        n++;
    }
    out.push((n ? "FILLED  " : "NOFRAME ") + key + (n > 1 ? " x" + n : ""));
}
doc.save();
out.join("\n");
