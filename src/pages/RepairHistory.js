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

    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const rowsPerPage = 10;

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
        axios.get(`/api/repairs?code=${equipment.code}`)
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

    const filteredRepairData = repairs
        .filter((state) =>
            state.code.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .reverse();  // 배열의 순서를 뒤집습니다.

    const getCurrentPageData = () => {
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredRepairData.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredRepairData.length / rowsPerPage);


    return (
        <>
            <Helmet>
            </Helmet>
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom component="div">
                    Equipment Information
                </Typography>
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="body1" gutterBottom>코드: {equipment.code}</Typography>
                    <Typography variant="body1" gutterBottom>설비명: {equipment.name}</Typography>
                    <Typography variant="body1" gutterBottom>설치 일자: {new Date(equipment.installationDate).toLocaleString()}</Typography>
                    <Typography variant="body1" gutterBottom>설비 위치: {equipment.location}</Typography>
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
                                <StyledTableCell>설비 ID</StyledTableCell>
                                <StyledTableCell>설비 코드</StyledTableCell>
                                <StyledTableCell>관리자</StyledTableCell>
                                <StyledTableCell>설비 상태</StyledTableCell>
                                <StyledTableCell>특이사항</StyledTableCell>
                                <StyledTableCell>설비 사진</StyledTableCell>
                                <StyledTableCell>수정</StyledTableCell>
                                <StyledTableCell>삭제</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {getCurrentPageData().map((repair, index) => (
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