const express = require('express');
const swe = require('swisseph');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());

swe.set_ephe_path(path.join(__dirname, 'ephe'));

app.get('/api/planets', (req, res) => {
  const { date, time } = req.query;
  if (!date || !time) return res.status(400).json({ error: 'date, time 파라미터 필요' });

  const [Y, M, D] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const hour = h + mi / 60;
  const jd = swe.julday(Y, M, D, hour);

  const map = {
    0: 'Sun', 1:'Moon', 2:'Mercury', 3:'Venus',
    4:'Mars', 5:'Jupiter', 6:'Saturn', 7:'Uranus',
    8:'Neptune', 9:'Pluto'
  };

  const result = {}, total = Object.keys(map).length;
  let done = 0;
  for (let pid in map) {
    swe.calc_ut(jd, parseInt(pid), (flag, r) => {
      result[map[pid]] = r.longitude.toFixed(2);
      if (++done === total) res.json(result);
    });
  }
});

const PORT = process.env.PORT||3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));