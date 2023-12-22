import React, { useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogContentText, 
    TextField, 
    DialogActions, 
    Button,
} from '@mui/material';
import axios from 'axios';

// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
import { DatePicker } from '@mui/lab/DatePicker';
import { LocalizationProvider } from '@mui/lab/LocalizationProvider';
// import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
// import dayjs from 'dayjs';
import { format } from 'date-fns';
// import { AdapterDateFns } from '@mui/lab/AdapterDateFns';

function toDate (date) {
  // console.log('toDate:', date)
  // console.log('toDate: typeof date =', typeof date)
  if (date) {
    if (typeof date === 'string') {
      return new Date(date)
    }
    return date
  }
  return new Date()
}

function DialogTag(props) {
  // const row = Object.assign({}, props.row ?? {
  //   code: '',
  //   name: '',
  //   installationDate: '',
  //   location: ''
  // })
  // console.log('currentRow: ', props.row)
  const id = props.row?.id ?? 0
  const [code, setCode] = useState(props.row?.code ?? '') // 추가 시 ->  빈값 설정, 수정 시 -> 해당 row 의 값이 저장됨
  const [name, setName] = useState(props.row?.name ?? '')
  const date = toDate(props.row?.installationDate)
  // console.log('$$$date =', date, typeof date)
  const [installationDate, setInstallationDate] = useState(date)
  const [location, setLocation] = useState(props.row?.location ?? '')
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [isQrCodeModalOpen, setQrCodeModalOpen] = useState(false);

  // console.log('date=', installationDate);
  const row = {
    id, code, name, installationDate, location
  }
  // const createQR = async () => {
  //   const response = await axios.get('http://localhost:3001/runQRpy');
  //   console.log(response.data);
  // }
  const generateQRCode = async () => {
    try {
      // Make an Axios POST request to trigger QR code generation
      const response = await axios.post('/runQRpy', {
        code,
        name,
        installationDate,
        location,
      });

      // Handle the response if needed
      console.log(response.data);

      // Open the modal or take further actions as needed
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  };
  
  
  
  const fetchAndDisplayQRCode = async (code) => {
    try {
      // Fetch QR code image from the server
      const qrCodeImageURL = `/QRcodes/${code}.png`;

      // Display QR code image in the modal
      setQrCodeImage(qrCodeImageURL);
      setQrCodeModalOpen(true);
    } catch (error) {
      console.error('Error fetching QR code image:', error);
    }
  };
    return (
      <Dialog open={props.open} onClose={props.onClose}>
              <DialogTitle>{props.title}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  장치를 추가하기 위해 아래 폼을 작성해주세요
                </DialogContentText>
                <TextField 
                  margin="dense"
                  label="설비코드"
                  fullWidth
                  variant="standard"
                  // value={props.value1}
                  // value={row.code}
                  value={code}
                  // onChange={(ev) => row.code = ev.target.value }
                  onChange={(ev) => setCode(ev.target.value) }
                />
                <TextField 
                  margin="dense"
                  label="설비명"
                  fullWidth
                  variant="standard" 
                  // value={row.name}
                  value={name}
                  // onChange={(ev) => row.name = ev.target.value}
                  onChange={(ev) => setName(ev.target.value)}
                />
                <TextField 
                  margin="dense"
                  label="설치 일자"
                  fullWidth
                  variant="standard"
                  type="date"
                  value={format(new Date(installationDate), 'yyyy-MM-dd')} // Convert to Date object
                  onChange={(ev) => setInstallationDate(ev.target.value)}
                />
                 {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DatePicker']}>
                    <DatePicker label="Basic date picker" />
                  </DemoContainer>
                </LocalizationProvider> */}
                {/* <DatePicker /> */}
                
                <TextField 
                  margin="dense"
                  label="설치 위치"
                  fullWidth
                  variant="standard"
                  // value={row.location}
                  value={location}
                  // onChange={(ev) => row.location = ev.target.value}
                  onChange={(ev) => setLocation(ev.target.value)}
                />
                <DialogActions>
                <Button onClick={() => generateQRCode()}>QR 코드 생성</Button>
                </DialogActions>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => props.handleClose()}>취소</Button>
                <Button onClick={() => props.handleClose(row)}>{props.confirm}</Button>
              </DialogActions>
            </Dialog>
    );
  }

  export default DialogTag;