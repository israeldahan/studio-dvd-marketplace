# studio-dvd-marketplace

מרקטפלייס פרטי של סטודיו DVD לתוספים של Claude Code.

## תוספים

| תוסף | מה הוא עושה |
|---|---|
| `label-builder` | הסקיל `build-label` בונה תווית לדגם חדש על שבלונת חיתוך ב-Illustrator 2026: פותח את השבלונה, מכין מפת אזורים לאישור, מאתר את החומרים ובונה תווית בסיס עם טקסט חי. |

## התקנה מ-GitHub

```
/plugin marketplace add israeldahan/studio-dvd-marketplace
/plugin install label-builder@studio-dvd
```

עדכון אחרי push חדש:

```
/plugin marketplace update studio-dvd
```

## מבנה

```
.claude-plugin/marketplace.json          רשימת התוספים במרקטפלייס
plugins/label-builder/
  .claude-plugin/plugin.json
  skills/build-label/
    SKILL.md                             השלבים והחוקים
    references/                          טעויות מהעבר, מבנה תיקיות, קריאת שבלונה, Illustrator, פרופיל לקוח
    assets/                              תבנית "פרטי דגם", מילים אסורות לכל לקוח
    scripts/                             הרצת ExtendScript, רינדור, מיפוי, מילוי טקסטים, בדיקת תיקייה
```

## הוספת לקוח חדש

1. יוצרים קובץ `references/clients/<לקוח>.md` לפי המבנה של `bond.md`.
2. יוצרים `assets/clients/<לקוח>/forbidden-words.txt`. הקובץ יכול להיות ריק.
3. מריצים את הבדיקה עם `--client <לקוח>`.
