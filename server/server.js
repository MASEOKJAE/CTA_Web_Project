const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const db = require('./db');
const fs = require('fs');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 4001;
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');  // 비밀번호 해시를 위한 패키지 
require('dotenv').config({ path: '../.env' });
const SECRET_KEY = process.env.SECRET_KEY;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let colorDetectResult = '0'; // colorDetect.py의 결과를 저장할 변수를 선언
let mcName = '';               // 설비명 저장

const watcher = chokidar.watch('/home/ubuntu/WorkSpace/CTA_Web_Project/public/assets/pimage', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true,
});

watcher
  .on('add', path => {
    console.log(`File ${path} has been added`);

    setTimeout(() => {
      const command1 = `python3 /home/ubuntu/WorkSpace/CTA_Web_Project/public/test/tempDetect.py ${path}`;
      exec(command1, (error, stdout, stderr) => {
        if (error) {
          console.log(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log('지금 컬러 디텍팅 처리에서 문제 발생')
          console.log(`Stderr: ${stderr}`);
          return;
        }
        console.log(`Stdout: ${stdout}`);
        var tempDetectResult = stdout.trim(); // Python 스크립트의 결과를 저장하고 줄바꿈 문자를 제거

        if(tempDetectResult > 60)
          colorDetectResult = 1;
        else
          colorDetectResult = 0;

        // command1이 완료된 후 command2 실행
        const command2 = `python3 /home/ubuntu/WorkSpace/CTA_Web_Project/public/test/qr.py ${path}`;
        exec(command2, (error, stdout, stderr) => {
          if (error) {
            console.log(`Error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.log('지금 qr 처리에서 문제 발생')
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
    }, 3000); // 3초 후에 실행
  })
  .on('error', error => console.log(`Watcher error: ${error}`));

  app.post('/runQRpy', async (req, res) => {
    const { code, name, installationDate, location } = req.body;
  
    // Execute the python script to generate QR code
    const command = `python3 /home/ubuntu/WorkSpace/CTA_Web_Project/python_files/qr.py ${code}`;
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.log(`Error: ${error.message}`);
        res.status(500).send(error.message);
      } else if (stderr) {
        console.log(`Stderr: ${stderr}`);
        res.status(500).send(stderr);
      } else {
        try {
          // Read the QR code image file
          const imageFileName = `${code}.png`;
          const imagePath = `/home/ubuntu/WorkSpace/CTA_Web_Project/public/assets/QRcodes/${imageFileName}`;
  
          const imageBuffer = await fs.promises.readFile(imagePath);
  
          // Save the image to the database
          const sql = 'INSERT INTO equipment (code, name, installationDate, location, qr_code) VALUES (?, ?, ?, ?, ?)';
          const values = [code, name, installationDate, location, imageBuffer];
  
          db.query(sql, values, (dbErr, result) => {
            if (dbErr) {
              console.error('Error inserting into database:', dbErr);
              res.status(500).send(dbErr.toString());
            } else {
              console.log('Database updated successfully');
              res.send(stdout.trim());
            }
          });
        } catch (imageError) {
          console.error('Error reading QR code image:', imageError);
          res.status(500).send(imageError.toString());
        }
      }
    });
  });


  app.get('/api/getQRCodeImage/:code', (req, res) => {
  const code = req.params.code;

  const query = 'SELECT qr_code FROM equipment WHERE code = ?';

  db.query(query, [code], (error, results) => {
    if (error) {
      console.error('Error retrieving QR code image:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    } else {
      if (results.length > 0 && results[0].qr_code) {
        // Send the QR code image data
        res.send(results[0].qr_code);
      } else {
        res.status(404).json({ error: 'Not Found', message: 'QR code image not found' });
      }
    }
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
      // console.log(data)
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

// 서버에서 모든 Repair 정보를 가져오는 GET 요청
app.get('/api/repairs', (req, res) => {
  const code = req.query.code;
  const sql = 'SELECT * FROM repair WHERE code = ?';

  db.query(sql, [code], (err, data) => {
    if (err) {
      console.error('Error getting repair data:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(data);
    }
  });
});

// Repair 정보를 추가하는 POST 요청
app.post('/api/repairs', (req, res) => {
  const { code, admin, repairDate, status, comment, photo } = req.body;
  const sql = 'INSERT INTO repair (code, admin, repairDate, status, comment, photo) VALUES (?, ?, ?, ?, ?, ?)';

  db.query(sql, [code, admin, repairDate, status, comment, photo], (error, results) => {
    if (error) {
      console.error('Error adding repair data:', error);
      res.status(500).send(error.toString());
    } else {
      res.json(results);
    }
  });
});

// Repair 정보를 수정하는 PUT 요청
app.put('/api/repairs/:id', (req, res) => {
  const { code, admin, repairDate, status, comment, photo } = req.body;
  const id = req.params.id;
  const sql = 'UPDATE repair SET code = ?, admin = ?, repairDate = ?, status = ?, comment = ?, photo = ? WHERE id = ?';

  db.query(sql, [code, admin, repairDate, status, comment, photo, id], (error, results) => {
    if (error) {
      console.error('Error updating repair data:', error);
      res.status(500).send(error.toString());
    } else {
      res.json(results);
    }
  });
});

// Repair 정보를 삭제하는 DELETE 요청
app.delete('/api/repairs/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM repair WHERE id = ?';

  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error deleting repair data:', error);
      res.status(500).send(error.toString());
    } else {
      res.json(results);
    }
  });
});

// 로그인
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM userInfo WHERE username = ?`;
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length > 0) {
      const user = results[0];

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
        // 디버깅: 로그인 성공 시 서버 콘솔에 토큰 및 사용자 정보 출력
        console.log('Login successful. User:', user);
        console.log('Access Token:', accessToken);

        res.json({ success: true, message: 'Login successful', user, accessToken });
      } else {
        // 디버깅: 비밀번호 불일치 시 서버 콘솔에 에러 메시지 출력
        console.error('Invalid credentials. Password does not match.');
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      // 디버깅: 사용자가 존재하지 않을 때 서버 콘솔에 에러 메시지 출력
      console.error('Invalid credentials. User not found.');
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});


// 사용자 정보 가져오기
app.get('/api/user', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('No token provided');
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('Invalid token', err);
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({ error: 'Token expired' });
      } else {
        res.status(401).json({ error: 'Invalid token' });
      }
      return;
    }    

    const query = `SELECT * FROM userInfo WHERE id = ?`;
    db.query(query, [decoded.id], (err, results) => {
      if (err || results.length === 0) {
        console.error('Invalid user or database error', err);
        res.status(401).json({ error: 'Invalid user' });
        return;
      }

      const user = results[0];
      // console.log('User info retrieved successfully:', user);
      res.json({ user });
    });
  });
});

// 토큰 갱신
app.post('/silent-refresh', (req, res) => {
  const { token } = req.body;

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      console.error('Invalid token', err);
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const query = `SELECT * FROM userInfo WHERE id = ?`;
    db.query(query, [decoded.id], (err, results) => {
      if (err || results.length === 0) {
        console.error('Invalid user or database error', err);
        res.status(401).json({ error: 'Invalid user' });
        return;
      }

      const newToken = jwt.sign({ id: decoded.id }, SECRET_KEY, { expiresIn: '24h' });
      console.log('Token refreshed successfully:', newToken);
      res.json({ accessToken: newToken });
    });
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});