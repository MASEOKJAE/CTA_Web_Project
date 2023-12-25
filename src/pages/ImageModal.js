import React, { useState, useEffect } from 'react';
import { Modal, Backdrop, Fade, Paper, Box, Button } from '@mui/material';

const ImageModal = ({ isOpen, onClose, images, qrCode }) => {
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [isQrCodeModalOpen, setQrCodeModalOpen] = useState(false);

  const fetchAndDisplayQRCode = async (code) => {
    try {
      const qrCodeImageURL = `/api/getQRCodeImage/${code}`;
      setQrCodeImage(qrCodeImageURL);
      setQrCodeModalOpen(true);
    } catch (error) {
      console.error('Error fetching QR code image:', error);
    }
  };

  useEffect(() => {
    if (qrCode && isOpen) {
      // Call fetchAndDisplayQRCode when qrCode is available and the modal is open
      fetchAndDisplayQRCode(qrCode);
    }
  }, [qrCode, isOpen]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
    >
      <Fade in={isOpen}>
        <Paper>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2}>
            {images.map((image, index) => (
              <img key={index} src={image} alt={`QR Code ${index + 1}`} style={{ maxWidth: '100%', marginBottom: '16px' }} />
            ))}

            {qrCodeImage && (
              <img src={qrCodeImage} alt="Fetched QR Code" style={{ maxWidth: '100%', marginBottom: '16px' }} />
            )}

            <Button variant="contained" onClick={() => window.print()}>
              QR Code 인쇄
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default ImageModal;
