import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserListHead } from '../sections/@dashboard/user';
import axios from 'axios';
import {
    Card,
    Table,
    Stack,
    Button,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    IconButton,
    TableContainer,
    TextField,
    TablePagination,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Iconify from '../components/iconify';
import DialogTag from './Dialog/DialogTag';
import ImageModal from './ImageModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CTAHome.css';
import useAuth from '../auth/useAuth';

const TABLE_HEAD = [
    { id: 'stateLight', label: '', alignRight: false },
    { id: 'name', label: '코드', alignRight: false },
    { id: 'company', label: '설비명', alignRight: false },
    { id: 'role', label: '설치 일자', alignRight: false },
    { id: 'isVerified', label: '설치 위치', alignRight: false },
    { id: 'latestInspectionDate', label: '최종 점검일', alignRight: false },
    { id: 'isDefective', label: '수리 필요여부', alignRight: false },
    { id: 'repairmentHistory', label: '수리 이력', alignRight: false },
    { id: 'inspectionHistory', label: '설비 상태', alignRight: false },
    { id: 'qr', label: '큐알코드', alignRight: false },
    { id: 'edit', label: '수정', alignRight: false },
    { id: 'delete', label: '삭제', alignRight: false },
];

export default function CTAHomePage() {
    const [openCreate, setOpenCreate] = useState(false);
    const [equipmentData, setEquipmentData] = useState([]);
    const [editRow, setEditRow] = useState(null);
    const [repairDoneStatus, setRepairDoneStatus] = useState({});
    const [repairStatus, setRepairStatus] = useState({});
    const [qrCodeImage, setQrCodeImage] = useState('');
    const [isQrCodeModalOpen, setQrCodeModalOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth(); // useAuth 훅에서 user 정보 가져오기

    // user 정보가 없을 경우 로그인 페이지로 리다이렉트 또는 다른 처리
    // useEffect(() => {
    //     console.log('User in CTAHome:', user);
    //     if (!user) {
    //         navigate('/login');
    //     }
    // }, [user, navigate]);

    const filteredEquipmentData = equipmentData.filter((equipment) =>
        equipment.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 0);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const fetchRepairStatus = async () => {
            try {
                const response = await axios.get('/api/equipment');
                const equipmentData = response.data;
                const statusData = {};

                for (const equipment of equipmentData) {
                    const statusResponse = await axios.get(`/api/state?name=${equipment.code}`);
                    const statusInfo = statusResponse.data;

                    if (statusInfo.length > 0) {
                        const latestStatus = statusInfo[statusInfo.length - 1].status;
                        statusData[equipment.code] = latestStatus;
                    } else {
                        statusData[equipment.code] = '현장 확인 필요';
                    }
                }

                setRepairStatus(statusData);
            } catch (error) {
                console.error('Error fetching repair status:', error);
            }
        };

        fetchRepairStatus();
    }, []);

    useEffect(() => {
        const fetchRepairDoneStatus = async () => {
            try {
                const response = await axios.get('/api/equipment');
                const equipmentData = response.data;
                const statusData = {};

                for (const equipment of equipmentData) {
                    const statusDoneResponse = await axios.get(`/api/repairs/${equipment.code}`);
                    const statusInfo = statusDoneResponse.data;

                    if (statusInfo.length > 0) {
                        const latestStatus = statusInfo[statusInfo.length - 1].repairDate;
                        statusData[equipment.code] = latestStatus;
                    } else {
                        statusData[equipment.code] = '점검 정보 없음';
                    }
                }

                setRepairDoneStatus(statusData);
            } catch (error) {
                console.error('Error fetching repair status:', error);
            }
        };

        fetchRepairDoneStatus();
    }, []);

    const handleClickOpenCreate = () => {
        setOpenCreate(true);
    }

    const generateAndSaveQRCode = async (code) => {
        try {
            // Fetch the QR code image from the server
            const response = await fetch(`/api/generateQRCode/${code}`);

            if (response.ok) {
                // If the response is successful, set the QR code image and open the modal
                const imageBlob = await response.blob();
                const qrCodeImageURL = URL.createObjectURL(imageBlob);

                setQrCodeImage(qrCodeImageURL);
                setQrCodeModalOpen(true);

                // Save the QR code image URL to the database (you may need to adjust this logic based on your backend)
                await axios.put(`/api/equipment/${code}`, {
                    qr_code: qrCodeImageURL,
                });
            } else {
                // If there is an error in fetching the image, log an error
                console.error('Error generating or fetching QR code image:', response.statusText);
            }
        } catch (error) {
            // If there is a general error, log an error
            console.error('Error generating or fetching QR code image:', error);
        }
    };

    const handleCloseCreate = async (row) => {
        let code;

        if (row && row.installationDate) {
            row.installationDate = new Date(row.installationDate).toISOString().split('T')[0];

            // Check if the code already exists in the table
            const codeExistsInTable = equipmentData.some(equipment => equipment.code === row.code);

            if (codeExistsInTable) {
                // If the code already exists in the table, show a notification and do not proceed with adding
                toast.error(`Equipment with code ${row.code} already exists in the table.`);
            } else {
                try {
                    // Add the equipment to the table (assuming the table is updated locally)
                    setEquipmentData([...equipmentData, row]);

                    // Add the equipment to the database
                    const response = await axios.post('/api/equipment', row, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    const data = response.data;

                    console.log('Equipment added successfully:', data.message);

                    code = data.result.code;
                } catch (error) {
                    console.error('Error adding equipment:', error);
                } finally {
                    if (code) {
                        handleQrCodeConfirmation(code);
                    }

                    // Close the DialogTag when the process is complete
                    setOpenCreate(false);
                }
            }
        } else {
            // Close the DialogTag when "취소" button is clicked
            setOpenCreate(false);
        }
    };


    const handleItemDelete = (id) => {
        axios.delete(`/api/equipment/${id}`)
            .then(() => {
                alert("Successful delete");
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleCloseEdit = (row) => {
        if (row) {
            row.installationDate = new Date(row.installationDate).toISOString().split('T')[0];
            const newEquipmentData = [...equipmentData];
            const index = newEquipmentData.findIndex((equipment) => equipment.id === row.id);
            newEquipmentData[index] = row;

            setEquipmentData(newEquipmentData);

            axios.put(`/api/equipment/${row.id}`, row)
                .then(response => {
                    console.log('Response:', response.data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }

        setEditRow(null);
    };

    const handleOpenEditDialog = (row) => {
        setEditRow(row);
    }

    const handleFixConfirmation = async (equipment) => {
        navigate('/dashboard/fixhistory', { state: { equipment }, replace: true });
    }

    // 상태에 따른 색상을 반환하는 함수를 만듭니다.
    const getStatusColor = (status) => {
        switch (status) {
            case '점검 필요':
                return 'red';
            case '현장 확인 필요':
                return 'orange';
            case '정상':
                return 'green';
            default:
                return 'gray';
        }
    };

    // 상태에 따른 원을 표시하는 컴포넌트를 만듭니다.
    const StatusIndicator = ({ status }) => {
        const color = getStatusColor(status);
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    boxShadow: '0px 0px 5px 0px rgba(0, 0, 0, 0.3)', // 그림자 효과 추가
                    border: '1px solid #ddd', // 테두리 추가
                    // padding: '15px', // 패딩 추가
                }}
            />
        );
    };


    // 해당 설비 state 상세 정보 확인
    const handleStateConfirmation = async (equipment) => {
        try {
            const response = await axios.get(`/api/state?name=${equipment.code}`);
            const stateInfo = response.data;

            if (stateInfo.length > 0) {
                navigate('/dashboard/statehistory', { state: { equipment, stateInfo }, replace: true });
            } else {
                alert(`${equipment.name}에 대한 정보가 존재하지 않습니다.`);
            }
        } catch (error) {
            console.error('Error fetching state information:', error);
        }
    };

    const handleQrCodeConfirmation = async (code, equipmentData) => {
        try {
            // Fetch the QR code image from the server
            const response = await fetch(`/api/getQRCodeImage/${code}`);

            if (response.ok) {
                // If the response is successful, set the QR code image and open the modal
                const imageBlob = await response.blob();
                const qrCodeImageURL = URL.createObjectURL(imageBlob);

                setQrCodeImage(qrCodeImageURL);
                setQrCodeModalOpen(true);

                // Save the QR code image to the database (you may need to adjust this logic based on your backend)
                await axios.put(`/api/equipment/${code}`, {
                    qr_code: qrCodeImageURL,
                    // ... other fields from equipmentData that you want to save
                });
            } else {
                // If there is an error in fetching the image, log an error
                console.error('Error fetching QR code image:', response.statusText);
            }
        } catch (error) {
            // If there is a general error, log an error
            console.error('Error fetching QR code image:', error);
        }
    };

    useEffect(() => {
        axios.get('/api/equipment')
            .then((response) => {
                setEquipmentData(response.data);
            })
            .catch((error) => {
                console.error("데이터를 가져오는 중 오류 발생:", error);
            });
    }, [user]);

    useEffect(() => {
        const fetchColorDetectResult = async () => {
            try {
                const response = await axios.get('/api/colorDetectResult');
                const { result } = response.data;

                if (result === '1') {
                    alert('설비에 문제가 발생했습니다!!');
                    await axios.put('/api/colorDetectResult/reset');
                }
            } catch (error) {
                console.error('Error fetching color detect result:', error);
            }
        };

        const intervalId = setInterval(fetchColorDetectResult, 5000);

        return () => clearInterval(intervalId);
    }, []);
    const changePage = (event, newPage) => {
        console.log('New Page:', newPage);
        setPage(newPage);
    };
    
    const changeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        console.log('New Rows Per Page:', newRowsPerPage);
        setRowsPerPage(newRowsPerPage);
        setPage(0);  // 페이지를 첫 페이지로 설정
    };
    useEffect(() => {
        console.log('Current Page:', page);
        console.log('Current Rows Per Page:', rowsPerPage);
    }, [page, rowsPerPage]);
    

    return (
        <>
            <Helmet>
                <title> CTA </title>
            </Helmet>

            <Container>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        안녕하세요, {user ? user.username : 'Guest'} 님
                    </Typography>
                    {/* <Button className="addEquipmentButton" variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleClickOpenCreate}>
                        설비 추가
                    </Button> */}
                    <p className={`addEquipmentButton ${isScrolled ? 'h_event2' : ''}`} onClick={handleClickOpenCreate}>
                        설비 추가
                    </p>

                    {openCreate && <DialogTag
                        open={openCreate}
                        title={'추가하기'}
                        handleClose={handleCloseCreate}
                        confirm={'추가하기'}
                    />}

                </Stack>

                <Card>
                    <TableContainer sx={{ minWidth: 800 }}>
                        <Table>
                            <UserListHead
                                headLabel={TABLE_HEAD}
                            />

                            <TableBody>
                                {equipmentData.map((equipment, index) => (
                                    <TableRow key={index}>
                                        <TableCell><StatusIndicator status={repairStatus[equipment.code]} /></TableCell>
                                        <TableCell>{equipment.code}</TableCell>
                                        <TableCell>{equipment.name}</TableCell>
                                        <TableCell>{new Date(equipment.installationDate).toLocaleString()}</TableCell>
                                        <TableCell>{equipment.location}</TableCell>
                                        <TableCell align="center">{repairDoneStatus[equipment.code]}</TableCell>
                                        <TableCell align="center">{repairStatus[equipment.code]}</TableCell>
                                        <TableCell align="center">
                                            <Button variant="text" onClick={() => handleFixConfirmation(equipment)}>
                                                확인
                                            </Button>
                                        </TableCell>
                                        <TableCell align="left"><Button variant="text" onClick={() => handleStateConfirmation(equipment)}>
                                            확인
                                        </Button>
                                        </TableCell>
                                        <TableCell align="left"><Button variant="text" onClick={() => handleQrCodeConfirmation(equipment.code)}>
                                            확인
                                        </Button>
                                        </TableCell>
                                        <TableCell align="left">
                                            <IconButton variant="text" onClick={() => handleOpenEditDialog(equipment)}>
                                                <Iconify icon={'material-symbols:edit'} />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell align="left">
                                            <IconButton variant="text" onClick={() => handleItemDelete(equipment.id)}>
                                                <Iconify icon={'material-symbols:delete'} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            {isQrCodeModalOpen && (
                                <ImageModal isOpen={isQrCodeModalOpen} onClose={() => setQrCodeModalOpen(false)} images={[qrCodeImage]} />
                            )}
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredEquipmentData.length}  // 정확한 행 수로 설정
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={changePage}
                        onRowsPerPageChange={changeRowsPerPage}
                    />


                </Card>
            </Container>
            {editRow && <DialogTag
                open={!!editRow}
                title={'수정하기'}
                row={editRow}
                handleClose={handleCloseEdit}
                confirm={'수정하기'}
            />}
        </>
    );
}
