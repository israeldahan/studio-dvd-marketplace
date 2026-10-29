// Names text frames by field, so fill_text_frames.jsx can find them.
// The map file has lines "field: current text in the frame" (UTF-8, # = comment).
// A frame is tagged when its text equals the given text (spaces/line breaks ignored),
// or, failing that, when exactly one frame contains it.
// arguments: [0] .ai path (open or openable), [1] map .txt path
var src = arguments[0], mapPath = arguments[1];

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
        if (k && v) pairs.push([k, v]);
    }
    return pairs;
}
function norm(s) { return s.replace(/[\s\r\n‎‏]+/g, ""); }

var doc = app.open(new File(src));
var pairs = readPairs(mapPath), out = [];
for (var p = 0; p < pairs.length; p++) {
    var key = pairs[p][0], want = norm(pairs[p][1]), exact = [], partial = [];
    for (var i = 0; i < doc.textFrames.length; i++) {
        var have = norm(doc.textFrames[i].contents);
        if (have == want) exact.push(doc.textFrames[i]);
        else if (have.indexOf(want) >= 0) partial.push(doc.textFrames[i]);
    }
    var hits = exact.length ? exact : partial;
    if (hits.length == 1) { hits[0].name = key; out.push("OK   " + key); }
    else if (hits.length == 0) out.push("MISS " + key + " (no frame with this text)");
    else out.push("MANY " + key + " (" + hits.length + " frames match, not tagged)");
}
out.join("\n");
