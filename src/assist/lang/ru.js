const sqlite = require('better-sqlite3');

const db = sqlite('./var/lang/ru.db');

const query = db.prepare(`
    SELECT DISTINCT forms.text
    FROM forms
    JOIN lemmas ON forms.lemma = lemmas.id
    WHERE lemmas.text = ?
`)

const getAllForms = (lemma) => query.all(lemma.toLowerCase()).map(row => row.text)

module.exports.getAllForms = getAllForms
