import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Container, Stack, Typography, Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, Box, Button, IconButton } from '@mui/material';
import Iconify from '../components/iconify';
import { styled } from '@mui/system';
import DialogRepair from './Dialog/RepairDialogTag';
import axios from 'axios';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
    backgroundColor: theme.palette.grey[500],
    color: theme.palette.common.white,
}));

const RepairHistoryPage = () => {
    const location = useLocation();
    const { state } = location;
    const [openRepair, setOpenRepair] = useState(false);
    const { equipment } = state;
    const [repairs, setRepairs] = useState([]);
    const [editRow, setEditRow] = useState(null);

    const handleClickOpenCreate = () => {
        setOpenRepair(true);
    }

    const handleOpenModifyDialog = (row) => {
        setEditRow(row);
    }

    const handleDeleteRepair = (repairId) => {
        // Implement the logic for deleting the repair record with the given ID
        console.log(`Delete repair with ID: ${repairId}`);
        axios.delete(`/api/repairs/${repairId}`)
            .then(() => {
                alert("Successful repair page delete");
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        axios.get(`/api/repairs/${equipment.code}`)
            .then(response => {
                setRepairs(response.data);
            })
            .catch(error => {
                console.error('Error fetching repairs:', error);
            });
    }, []);

    const handleCloseRepair = async (row) => {
        if (row && row.repairDate) {
            row.repairDate = new Date(row.repairDate).toISOString().split('T')[0];
            row.code = equipment.code;

            try {
                const response = await axios.post('/api/repairs', row, {
                    headers: { 'Content-Type': 'application/json' },
                });

            } catch (error) {
                console.error('Error adding repair:', error);
            } finally {
                setOpenRepair(false);
                window.location.reload();
            }
        } else {
            setOpenRepair(false);
        }
    };

    const handleCloseModify = async (row) => {
        if (row) {
            // Convert date to the required format
            row.repairDate = new Date(row.repairDate).toISOString().split('T')[0];
            row.code = equipment.code;

            // Clone the current repairs data
            const newRepairsData = [...repairs];

            // Find the index of the repair to be modified
            const index = newRepairsData.findIndex((repair) => repair.id === row.id);

            // Update the repair at the found index
            newRepairsData[index] = row;

            // Set the updated data to state
            setRepairs(newRepairsData);

            try {
                // Send a request to update the repair data on the server
                const response = await axios.put(`/api/repairs/${row.id}`, row);

                // Log the response data (adjust as needed)
                console.log('Response:', response.data);
            } catch (error) {
                // Handle error (adjust as needed)
                console.error('Error:', error);
            }
        }

        // Close the edit dialog
        setEditRow(null);
    };


    return (
        <>
            <Helmet>
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
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h5" gutterBottom component="div">
                        Repair Records
                    </Typography>
                    <Button variant="outlined" color="primary" onClick={handleClickOpenCreate}>
                        수리일지 작성
                    </Button>
                    {openRepair && (
                        <DialogRepair
                            open={openRepair}
                            title={'Repair'}
                            handleClose={handleCloseRepair}
                            confirm={'Confirm'}
                            // Pass equipment code to the dialog
                            data={{ code: equipment.code }}
                        />
                    )}
                </Stack>
                <TableContainer component={Paper} sx={{ mb: 4 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>ID</StyledTableCell>
                                <StyledTableCell>Code</StyledTableCell>
                                <StyledTableCell>Admin</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Comment</StyledTableCell>
                                <StyledTableCell>Photo</StyledTableCell>
                                <StyledTableCell>Modify</StyledTableCell>
                                <StyledTableCell>Delete</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {repairs.map((repair, index) => (
                                <TableRow key={index}>
                                    <TableCell>{repair.id}</TableCell>
                                    <TableCell>{repair.code}</TableCell>
                                    <TableCell>{repair.admin}</TableCell>
                                    <TableCell>{repair.status}</TableCell>
                                    <TableCell>{repair.comment}</TableCell>
                                    {/* Display photo - adjust the path accordingly */}
                                    <TableCell>
                                        {repair.photo && (
                                            <img
                                                src={`/api/repairs/photo/${repair.id}`}
                                                alt={`Repair ${repair.id}`}
                                                style={{ width: '50px', height: '50px' }}
                                            />
                                        )}
                                    </TableCell>
                                    {/* Modify record */}
                                    <TableCell>
                                        <IconButton variant="text" onClick={() => handleOpenModifyDialog(repair)}>
                                            <Iconify icon={'material-symbols:edit'} />
                                        </IconButton>
                                    </TableCell>
                                    {/* Delete record */}
                                    <TableCell>
                                        <IconButton variant="text" onClick={() => handleDeleteRepair(repair.id)}>
                                            <Iconify icon={'material-symbols:delete'} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
            {editRow && <DialogRepair
                open={!!editRow}
                title={'수정하기'}
                row={editRow}
                handleClose={handleCloseModify}
                confirm={'수정하기'}
            />}
        </>
    );
};

export default RepairHistoryPage;