const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

let users = {};
let usedReferences = new Set(); 

app.post('/api/login', (req, res) => {
    const { userId, username } = req.body;
    if (!userId) return res.status(400).json({ error: "የተጠቃሚ መለያ ያስፈልጋል" });
    if (!users[userId]) {
        users[userId] = { id: userId, name: username || "ተጫዋች", balance: 10.00, hasDeposited: false, isBonusUser: true };
    }
    res.json(users[userId]);
});

app.post('/api/deposit', (req, res) => {
    const { userId, referenceText } = req.body;
    const user = users[userId];
    if (!user) return res.status(404).json({ error: "ተጠቃሚው አልተገኘም" });

    const refMatch = referenceText.match(/(?:TXN|FT|Ref|ቁጥር)[:\s]+([A-Z0-9]{10,18})/i);
    const amtMatch = referenceText.match(/(?:Amt|Amount|ብር|መጠን)[:\s]+([0-9]+(?:\.[0-9]+)?)/i);

    if (!refMatch || !amtMatch) {
        return res.status(400).json({ error: "የተሳሳተ መልእክት! እባክዎ የቴሌብር መልእክቱን ሙሉ በሙሉ ኮፒ አድርገው ያስገቡ።" });
    }

    const refNo = refMatch[1].toUpperCase();
    const amount = parseFloat(amtMatch[1]);

    if (usedReferences.has(refNo)) return res.status(400).json({ error: "ይህ የሪፈረንስ ቁጥር አስቀድሞ ጥቅም ላይ ውሏል!" });
    if (amount < 100 || amount > 10000) return res.status(400).json({ error: "ዲፖዚት መደረግ የሚችለው ከ100 እስከ 10,000 ብር ብቻ ነው።" });

    usedReferences.add(refNo);
    user.balance += amount;
    user.hasDeposited = true; 
    user.isBonusUser = false;

    res.json({ success: true, newBalance: user.balance, msg: `${amount} ብር አውቶማቲክ ገቢ ሆኗል!` });
});

app.post('/api/withdraw', (req, res) => {
    const { userId, amount, phoneNumber } = req.body;
    const user = users[userId];
    if (!user) return res.status(404).json({ error: "ተጠቃሚው አልተገኘም" });

    if (user.isBonusUser && !user.hasDeposited) {
        return res.status(403).json({ error: "በነፃ 10 ብር ቦነስ ያሸነፉትን ገንዘብ ለማውጣት መጀመሪያ 100 ብር ዲፖዚት ማድረግ አለብዎት።" });
    }
    if (amount < 100 || amount > 10000) return res.status(400).json({ error: "ማውጣት የሚችሉት ከ100 እስከ 10,000 ብር ብቻ ነው።" });
    if (user.balance < amount) return res.status(400).json({ error: "በቂ ቀሪ ሂሳብ የሎትም!" });

    user.balance -= amount;
    res.json({ success: true, newBalance: user.balance, msg: "የማውጣት ጥያቄዎ ቀርቧል።" });
});

server.listen(3000, () => console.log('PLUS BINGO Backend Active on Port 3000'));
