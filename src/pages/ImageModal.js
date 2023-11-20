import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardMedia,
} from '@mui/material';

const ImageModal = ({ isOpen, onClose, images }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Repair History Images</DialogTitle>
      <DialogContent>
        {images.map((image, index) => (
          <Card key={index} sx={{ maxWidth: 200, marginBottom: 2 }}>
            <CardMedia
              component="img"
              alt={`Image ${index + 1}`}
              height="140"
              image={`data:image/png;base64,${image.photoPath}`}
            />
          </Card>
        ))}
        {images.length === 0 && (
          <Typography variant="body2">No images found for the repair history.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageModal;
