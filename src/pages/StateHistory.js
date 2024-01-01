import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, Box, Button, Modal } from '@mui/material';
import { styled, Stack } from '@mui/system';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.grey[500],
  color: theme.palette.common.white,
}));

const StateHistoryPage = () => {
  const location = useLocation();
  const { state } = location;

  const { equipment, stateInfo } = state;

  const [open, setOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 10;

  if (!state || !state.equipment || !state.stateInfo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5" color="error">Invalid state information.</Typography>
      </Box>
    );
  }

  const filteredStateData = stateInfo
    .filter((state) =>
      state.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .reverse();  // 배열의 순서를 뒤집습니다.

  const getCurrentPageData = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredStateData.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredStateData.length / rowsPerPage);

  return (
    <>
      <Helmet>
        <title>CTA 설비 상태</title>
      </Helmet>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom component="div">
          설비 정보
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="body1" gutterBottom>코드: {equipment.code}</Typography>
          <Typography variant="body1" gutterBottom>설비명: {equipment.name}</Typography>
          <Typography variant="body1" gutterBottom>설치 일자: {new Date(equipment.installationDate).toLocaleString()}</Typography>
          <Typography variant="body1" gutterBottom>위치: {equipment.location}</Typography>
        </Paper>

        <Typography variant="h5" gutterBottom component="div">
          State Information
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>설비 ID</StyledTableCell>
                <StyledTableCell>설비명</StyledTableCell>
                <StyledTableCell>점검 시간</StyledTableCell>
                <StyledTableCell>설비 상태</StyledTableCell>
                <StyledTableCell>설비 사진</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getCurrentPageData().map((stateInfo, index) => (
                <TableRow key={index}>
                  <TableCell>{stateInfo.id}</TableCell>
                  <TableCell>{stateInfo.name}</TableCell>
                  <TableCell>{stateInfo.photoName.split("photo_")[1].split(".jpg")[0]}</TableCell>
                  <TableCell>{stateInfo.status}</TableCell>
                  <TableCell>
                    <Button variant="outlined" color="primary" onClick={() => {
                      const photoPath = stateInfo.photoPath.split('CTA_Web_Project/public')[1];
                      setSelectedPhoto(photoPath);
                      setOpen(true);
                    }}>확인</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Stack direction="row" justifyContent="center" alignItems="center" mt={2}>
            <Button
              disabled={page === 0}
              onClick={() => setPage((prevPage) => prevPage - 1)}
            >
              이전
            </Button>
            <Typography>{`${page + 1} / ${totalPages}`}</Typography>
            <Button
              disabled={page === totalPages - 1}
              onClick={() => setPage((prevPage) => prevPage + 1)}
            >
              다음
            </Button>
          </Stack>
        </TableContainer>
      </Container>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <img src={selectedPhoto} alt="Not Founded" />
        </Box>
      </Modal>
    </>
  );
};

export default StateHistoryPage;
