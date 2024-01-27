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
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';

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
  const id = props.row?.id ?? 0
  const [code, setCode] = useState(props.row?.code ?? '') // 추가 시 ->  빈값 설정, 수정 시 -> 해당 row 의 값이 저장됨
  const [name, setName] = useState(props.row?.name ?? '')
  const date = toDate(props.row?.installationDate)
  const [photo, setPhoto] = useState(props.row?.photo ?? null);
  // console.log('$$$date =', date, typeof date)
  const [installationDate, setInstallationDate] = useState(date)
  const [stateTime, setStateTime] = useState(new Date()); 
  // console.log('date=', installationDate);
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: acceptedFiles => {
      setPhoto(Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0])
      }))
    }
  });

    return (
      <Dialog open={props.open} onClose={props.onClose}>
              <DialogTitle>{props.title}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  현재 설비 상태를 입력해주세요
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
                    label="점검시간"
                    fullWidth
                    variant="standard"
                    type="date" // Change input type to date
                    value={stateTime}
                    onChange={(ev) => setStateTime(ev.target.value)}
                    />
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {
                        photo ?
                        <p>선택된 파일: {photo.name}</p> :
                        <div>
                            <Button>사진업로드</Button>
                        </div>
                    }
                </div>
                <DialogActions>
                {/* <Button onClick={() => generateQRCode()}>QR 코드 생성</Button> */}
                </DialogActions>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => props.handleClose()}>취소</Button>
              </DialogActions>
            </Dialog>
    );
  }

  export default DialogTag;