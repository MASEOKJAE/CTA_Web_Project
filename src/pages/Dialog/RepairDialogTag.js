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
import { useDropzone } from 'react-dropzone';

function RepairDialogTag(props) {
  const id = props.row?.id ?? 0;
  const [code, setCode] = useState(props.data?.code ?? '');
  const [admin, setAdmin] = useState(props.row?.admin ?? '');
  const [repairDate, setRepairDate] = useState(getFormattedDate(new Date())); // Initialize with the current date
  const [status, setStatus] = useState(props.row?.status ?? '');
  const [comment, setComment] = useState(props.row?.comment ?? '');
  const [photo, setPhoto] = useState(props.row?.photo ?? null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: acceptedFiles => {
      setPhoto(Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0])
      }))
    }
  });

  const row = {
    id,
    code,
    admin,
    repairDate,
    status,
    comment,
    photo,
  };

  function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          수리 항목을 추가하기 위해 아래 폼을 작성해주세요
        </DialogContentText>
        {/* <TextField
          margin="dense"
          label="설비 코드"
          fullWidth
          variant="standard"
          value={code}
          onChange={(ev) => setCode(ev.target.value)}
        /> */}
        <TextField
          margin="dense"
          label="관리자 명"
          fullWidth
          variant="standard"
          value={admin}
          onChange={(ev) => setAdmin(ev.target.value)}
        />
        <TextField
          margin="dense"
          label="수리 날짜"
          fullWidth
          variant="standard"
          type="date" // Change input type to date
          value={repairDate}
          onChange={(ev) => setRepairDate(ev.target.value)}
        />
        <TextField
          margin="dense"
          label="설비 상태"
          fullWidth
          variant="standard"
          value={status}
          onChange={(ev) => setStatus(ev.target.value)}
        />
        <TextField
          margin="dense"
          label="관리자 코멘트"
          fullWidth
          variant="standard"
          value={comment}
          onChange={(ev) => setComment(ev.target.value)}
        />
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {
            photo ?
              <p>선택된 파일: {photo.name}</p> :
              <p>클릭하거나 파일을 이곳으로 끌어다 놓으세요.</p>
          }
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.handleClose()}>취소</Button>
        <Button onClick={() => props.handleClose(row)}>확인</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RepairDialogTag;