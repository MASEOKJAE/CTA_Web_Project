import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, Box, Button, Modal } from '@mui/material';
import { styled } from '@mui/system';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.grey[500],
  color: theme.palette.common.white,
}));

const HistoryPage = () => {
  const location = useLocation();
  const { state } = location;

  const { equipment, stateInfo } = state;

  const [open, setOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!state || !state.equipment || !state.stateInfo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5" color="error">Invalid state information.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>CTA - History</title>
      </Helmet>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom component="div">
          Equipment Information
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="body1" gutterBottom>Code: {equipment.code}</Typography>
          <Typography variant="body1" gutterBottom>Name: {equipment.name}</Typography>
          <Typography variant="body1" gutterBottom>Installation Date: {new Date(equipment.installationDate).toLocaleString()}</Typography>
          <Typography variant="body1" gutterBottom>Location: {equipment.location}</Typography>
        </Paper>

        <Typography variant="h5" gutterBottom component="div">
          State Information
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>ID</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Shot Time</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Photo Path</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stateInfo.map((info, index) => (
                <TableRow key={index}>
                  <TableCell>{info.id}</TableCell>
                  <TableCell>{info.name}</TableCell>
                  <TableCell>{info.photoName.split("photo_")[1].split(".jpg")[0]}</TableCell>
                  <TableCell>{info.status}</TableCell>
                  <TableCell>
                    <Button variant="outlined" color="primary" onClick={() => {
                      const photoPath = info.photoPath.split('CTA_Web_Project/public')[1];
                      setSelectedPhoto(photoPath);
                      setOpen(true);
                    }}>확인</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

export default HistoryPage;
