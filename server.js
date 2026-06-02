const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// index.html ፋይልን ለተጫዋቾች ማቅረቢያ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ለዲፖዚትና ዊዝድሮው የፈጠራ ስራዎች የሚሆኑ ኤፒአይዎች
app.post('/api/login', (req, res) => {
    res.json({ id: req.body.userId, name: req.body.username || "ተጫዋች", balance: 10.00 });
});

app.post('/api/deposit', (req, res) => {
    res.json({ success: true, msg: "ገንዘብ በተሳካ ሁኔታ ገቢ ሆኗል!", newBalance: 110.00 });
});

app.post('/api/withdraw', (req, res) => {
    res.json({ success: true, newBalance: 0.00 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`==== PLUS BINGO SERVER LIVE ====`);
    console.log(`ሰርቨሩ በፖርት ${PORT} ላይ በተሳካ ሁኔታ ተነስቷል!`);
});
