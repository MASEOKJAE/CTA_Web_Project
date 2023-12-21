const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const db = require('./db');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 4001;
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let colorDetectResult = '0'; // colorDetect.py의 결과를 저장할 변수를 선언
let mcName = '';               // 설비명 저장

const watcher = chokidar.watch('/home/ubuntu/WorkSpace/CTA_Web_Project/public/assets/pimage', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

watcher
  .on('add', path => {
    console.log(`File ${path} has been added`);

    const command1 = `python3 /home/ubuntu/WorkSpace/CTA_Web_Project/public/test/colorDetect.py ${path}`;
    exec(command1, (error, stdout, stderr) => {
      if (error) {
        console.log(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Stdout: ${stdout}`);
      colorDetectResult = stdout.trim(); // Python 스크립트의 결과를 저장하고 줄바꿈 문자를 제거

      // command1이 완료된 후 command2 실행
      const command2 = `python3 /home/ubuntu/WorkSpace/CTA_Web_Project/public/test/qr.py ${path}`;
      exec(command2, (error, stdout, stderr) => {
        if (error) {
          console.log(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`Stderr: ${stderr}`);
          return;
        }
        console.log(`Stdout: ${stdout}`);
        mcName = stdout.trim(); // Python 스크립트의 결과를 저장하고 줄바꿈 문자를 제거

        // colorDetect.py 실행 후 state 테이블에 데이터 추가
        const status = colorDetectResult === '1' ? '점검 필요' : '정상';
        const photoName = path.split('/').pop(); // 경로에서 파일 이름만 추출
        const sql = 'INSERT INTO state (name, photoName, status, photoPath) VALUES (?, ?, ?, ?)';

        db.query(sql, [mcName, photoName, status, path], (err, result) => {
          if (err) {
            console.error('Error adding state:', err);
          } else {
            console.log('State added successfully', result);

            // DB 업로드 후 변수 초기화
            mcName = '';
          }
        });
      });
    });
  })
  .on('error', error => console.log(`Watcher error: ${error}`));

app.post('/runQRpy', (req, res) => {
  const { code, name, installationDate, location } = req.body;

  const python = spawn('python3', ['/home/ubuntu/WorkSpace/CTA_Web_Project/python_files/qr.py', code]);
  python.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    res.send(data.toString());
  });
  python.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    res.status(500).send(data.toString());
  });
});

// 라우트 설정
app.get('/api/colorDetectResult', (req, res) => {
  res.send({ result: colorDetectResult });
});

app.get('/', (req, res) => {
  console.log('/root');
});

app.put('/api/colorDetectResult/reset', (req, res) => {
  colorDetectResult = '0';
  res.send({ result: 'OK' });
});

console.log('colorDetect 상태 관리 통과!!!');

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
    [equipmentId, name, installationDate, location], function (err, rows, fields) {
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

// state 테이블
app.get('/api/state', (req, res) => {
  const name = req.query.name;

  // 여기에 설비명(name)을 사용하여 state 정보를 데이터베이스에서 가져오는 코드를 작성해야 합니다.
  const sql = 'SELECT * FROM state WHERE name = ?';

  db.query(sql, [name], (err, data) => {
    if (err) {
      console.error('Error fetching state information:', err);
      res.status(500).send('Internal Server Error');
    } else {
      // 여기에서 가져온 state 정보를 클라이언트에게 응답으로 보냅니다.
      res.send(data); // 여러 개의 state가 반환될 수 있지만 일단 첫 번째 것만 보냄
    }
  });
});

// app.post('/api/state', (req, res) => {
//   const stateInfo = req.body; // stateInfo 객체 받기
//   console.log("!!!!!!!난 잘 있어요~~!!!!!!!!", stateInfo);

//   const sql = 'SELECT * FROM state WHERE name = ?';

//   db.query(sql, [stateInfo.name], (err, data) => {
//     if (err) {
//       console.error('Error fetching state information:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       // 여기에서 가져온 state 정보를 클라이언트에게 응답으로 보냅니다.
//       res.send(data[0]); // 여러 개의 state가 반환될 수 있지만 일단 첫 번째 것만 보냄
//     }
//   });
// });

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
app.put('/api/equipment/:id', (req, res) => {
  const equipmentId = parseFloat(req.params.id);
  const name = req.body.name;
  const installationDate = req.body.installationDate;
  const location = req.body.location;

  // Review your database update logic here...

  db.query(
    "UPDATE equipment SET id = ?, name = ?, installationDate = ?, location = ? WHERE id = ?",
    [equipmentId, name, installationDate, location, equipmentId],
    function (err, rows, fields) {
      if (!err) {
        console.log("DB 수정 성공!!!");
        res.sendStatus(200);
      } else {
        console.log("DB 수정 실패…");
        console.log(err);
        res.sendStatus(500);
      }
    }
  );
});

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
