// ImageModal.js

import React from 'react';
import { Modal, Backdrop, Fade, Paper, Box, Button } from '@mui/material';

const ImageModal = ({ isOpen, onClose, images }) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
    >
      <Fade in={isOpen}>
        <Paper>
          {/* Center the images */}
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2}>
            {images.map((image, index) => (
              <img key={index} src={image} alt={`QR Code ${index + 1}`} style={{ maxWidth: '100%', marginBottom: '16px' }} />
            ))}
            {/* Button for instant printing */}
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