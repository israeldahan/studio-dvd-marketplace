# עבודה עם Illustrator 2026

## הרצת ExtendScript
```bash
scripts/run_jsx.sh scripts/dump_ai.jsx "/path/file.ai" "/path/out.txt"
```
- ה-script מריץ `osascript` מול `/Applications/Adobe Illustrator 2026/Adobe Illustrator.app` עם `do javascript ... with arguments {...}`. בתוך ה-jsx הארגומנטים זמינים ב-`arguments[0]`, `arguments[1]` וכן הלאה. נבדק ב-29.10.2026 על גרסה 30.8.2, כולל עברית.
- ה-jsx מחזיר מחרוזת, ו-`osascript` מדפיס אותה. ירידות שורה חוזרות כ-`\r`, ולכן ה-script מעביר את הפלט דרך `tr '\r' '\n'`.
- ExtendScript הוא ES3: אין בו `JSON`, `let` או arrow functions. קוראים קבצים עם `File`, ומגדירים `f.encoding = "UTF-8"` לפני הקריאה.

## יחידות וצירים
- 1 מ"מ = 2.834645669 נקודות.
- `geometricBounds` = `[left, top, right, bottom]` בנקודות. ציר Y עולה למעלה, כך ש-top גדול מ-bottom.
- `rulerOrigin` יכול להיות מוזז. משווים מיקומים רק בתוך אותו מסמך.
- תוויות BOND הן במסמך CMYK.

## טקסט עברי
- יוצרים text frame רק ב-Illustrator: `layer.textFrames.add()` או `pointText`. לא מייבאים PDF או SVG עם טקסט.
- כשמחליפים טקסט ב-`tf.contents = "..."`, הסגנון של התו הראשון נשמר. אם בפריים יש כמה סגנונות, מחליפים טווח ולא את כל הפריים.
- בודקים יישור למרכז אחרי החלפה, כי האורך משתנה.

## פתיחה וסגירה
- `app.open(new File(path))` פותח, ואם המסמך כבר פתוח מחזיר אותו.
- סוגרים רק מה שהסקריפט פתח: `doc.close(SaveOptions.DONOTSAVECHANGES)`.
- שומרים עותק בשם חדש: `doc.saveAs(new File(newPath))`.

## ייצוא לתצוגה כשעובדים על מסמך שאינו הפעיל
- `doc.exportFile()` מייצא תמיד את **המסמך הפעיל**, גם כשקוראים לו על מסמך אחר. ב-X2526 זה ייצא בטעות את X2527 של סשן אחר.
- רינדור `.ai` עם `sips` מציג תוכן ישן (PDF compatibility). לא משתמשים בו לבדיקה אחרי שינוי.
- מה שעובד בלי להחליף מסמך פעיל:
```javascript
var o = new ImageCaptureOptions(); o.resolution = 300; o.antiAliasing = true; o.transparency = false;
doc.imageCapture(new File(out), [left, top, right, bottom] /* points */, o);
```
- לא מחליפים את `app.activeDocument` כשסשן אחר עובד ב-Illustrator.
- ב-ExtendScript אין `Array.map`. כותבים לולאה רגילה.

## ייצוא לתצוגה
```javascript
var o = new ExportOptionsPNG24(); o.artBoardClipping = true; o.horizontalScale = o.verticalScale = 150;
doc.artboards.setActiveArtboardIndex(i); doc.exportFile(new File(out), ExportType.PNG24, o);
```
