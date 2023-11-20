// server.js

const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 4001;
const bodyParser = require('body-parser');

// CORS 허용 설정
// const corsOptions = {
//     origin: 'http://13.125.227.132:3000',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     optionsSuccessStatus: 204,
//     credentials: true, // 인증 정보 (쿠키, HTTP 인증)를 포함하려면 true로 설정
//   };



app.use(cors());
app.get('/', (req, res)=>{
    console.log('/root');
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


console.log('여기 지나가는지 확인 111');

// MySQL 연결 확인
db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});


// 라우트 설정 (데이터 가져오기)
app.get('/api/equipment', (req, res) => {
  const sql = 'SELECT * FROM equipment'; // users 테이블에서 데이터 가져오기
  console.log("get 하러 왔다!!");
  db.query(sql, (err, data) => {
    if (err) {
      console.error('Error fetching user list:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(data);
      console.log(data)
    }
  });
});

// 라우트 설정 (설비 추가)
app.post('/api/equipment', (req, res) => {
    const { code, name, installationDate, location } = req.body;
  
    const sql = 'INSERT INTO equipment (code, name, installationDate, location) VALUES (?, ?, ?, ?)';
  
    db.query(sql, [code, name, installationDate, location], (err, result) => {
      if (!err) {
        res.send({ message: 'Equipment added successfully', result });
      } else {
        console.error('Error adding equipment:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  });


app.post('/api/equipment/:id', (req, res) => {
  const equipmentId = parseFloat(req.params.id);
  const name = req.body.name;
  const installationDate = req.body.installationDate;
  const location = req.body.location;

  db.query("UPDATE equipment SET id = ?, name = ?, installationDate = ?, location = ? WHERE id = ?", 
      [equipmentId, name, installationDate, location], function(err, rows, fields) {
      if (!err) {
          console.log("DB 수정 성공!!!");
          res.sendStatus(200);
      } else {
          console.log("DB 수정 실패…")
          console.log(err);
          res.sendStatus(500);
      }
  });
});

  
// 라우트 설정 (설비 삭제)
app.delete('/api/equipment/:id', (req, res) => {
  const equipmentID = req.params.id;
  console.log(`Delete equipment ID : ${equipmentID}`);

  db.query("DELETE FROM equipment WHERE id = ?", [equipmentID], (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      //console.log(`Deleted Token ID : ${tokenId}`);
      res.sendStatus(200);
    }
  });
});

// 라우트 설정 (설비 수정)
// app.put('/api/equipment/:id', (req, res) => {
//   const equipmentId = parseFloat(req.params.id);
//   const name = req.body.name;
//   const installationDate = req.body.installationDate;
//   const location = req.body.location;

//   // Review your database update logic here...

//   db.query(
//     "UPDATE equipment SET id = ?, name = ?, installationDate = ?, location = ? WHERE id = ?",
//     [equipmentId, name, installationDate, location, equipmentId],
//     function (err, rows, fields) {
//       if (!err) {
//         console.log("DB 수정 성공!!!");
//         res.sendStatus(200);
//       } else {
//         console.log("DB 수정 실패…");
//         console.log(err);
//         res.sendStatus(500);
//       }
//     }
//   );
// });

// Add a new endpoint to fetch images for a specific repair history
app.get('/api/equipment/:id/repair-history/images', (req, res) => {
  const equipmentId = parseFloat(req.params.id);

  // Retrieve images for the specified repair history (adjust this based on your database structure)
  db.query("SELECT photoPath FROM state WHERE id = ?", [equipmentId], (err, rows) => {
    if (!err) {
      const images = rows.map(row => ({
        photoPath: row.photoPath.toString('base64'), // Convert the LONGBLOB to base64 for sending to the client
      }));
      res.json({ images });
    } else {
      console.error('Error fetching repair history images:', err);
      res.sendStatus(500);
    }
  });
});


// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
