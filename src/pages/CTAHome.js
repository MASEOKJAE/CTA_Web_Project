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
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Iconify from '../components/iconify';
import DialogTag from './DialogTag';
import ImageModal from './ImageModal';
import './CTAHome.css';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'name', label: '코드', alignRight: false },
    { id: 'company', label: '설비명', alignRight: false },
    { id: 'role', label: '설치일자', alignRight: false },
    { id: 'isVerified', label: '설치위치', alignRight: false },
    { id: 'latestInspectionDate', label: '최종 점검일', alignRight: false },
    { id: 'isDefective', label: '수리필요여부', alignRight: false },
    { id: 'repairmentHistory', label: '수리 이력', alignRight: false },
    { id: 'inspectionHistory', label: '설비 상태', alignRight: false },
    { id: 'qr', label: 'QR code', alignRight: false },
    { id: 'edit', label: '수정', alignRight: false },
    { id: 'delete', label: '삭제', alignRight: false },
];

export default function DashboardAppPage() {
    const [openCreate, setOpenCreate] = useState(false);
    const [equipmentData, setEquipmentData] = useState([]);
    const [editRow, setEditRow] = useState(null);
    const [repairStatus, setRepairStatus] = useState({});
    const [qrCodeImage, setQrCodeImage] = useState('');
    const [isQrCodeModalOpen, setQrCodeModalOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const navigate = useNavigate();

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

    const handleClickOpenCreate = () => {
        setOpenCreate(true);
    }

    // const handleCloseCreate = async (row) => {
    //     setOpenCreate(false);

    //     if (row && row.installationDate) {
    //         row.installationDate = new Date(row.installationDate).toISOString().split('T')[0];
            
    //         try {
    //             const response = await axios.post('/api/equipment', row, {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //             });

    //             const data = response.data;

    //             setEquipmentData([...equipmentData, data.result]);
    //             console.log('Equipment added successfully:', data.message);
                
    //             window.location.reload();
    //         } catch (error) {
    //             console.error('Error adding equipment:', error);
    //         }
    //     }
    // };
    // const handleQrCodeConfirmation = async (code) => {
    //     try {
    //       // Fetch the QR code image from the server
    //       const response = await fetch(`/api/getQRCodeImage/${code}`);
          
    //       if (response.ok) {
    //         // If the response is successful, set the QR code image and open the modal
    //         const imageBlob = await response.blob();
    //         setQrCodeImage(URL.createObjectURL(imageBlob));
    //         setQrCodeModalOpen(true);
    //       } else {
    //         // If there is an error in fetching the image, log an error
    //         console.error('Error fetching QR code image:', response.statusText);
    //       }
    //     } catch (error) {
    //       // If there is a general error, log an error
    //       console.error('Error fetching QR code image:', error);
    //     }
    //   };

    // const handleCloseCreate = async (row) => {
    //     setOpenCreate(false);
    
    //     let code; // Declare the 'code' variable here
    
    //     if (row && row.installationDate) {
    //         row.installationDate = new Date(row.installationDate).toISOString().split('T')[0];
    
    //         try {
    //             const response = await axios.post('/api/equipment', row, {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //             });
    
    //             const data = response.data;
    
    //             setEquipmentData([...equipmentData, data.result]);
    //             console.log('Equipment added successfully:', data.message);
    
    //             // Capture the 'code' value here
    //             code = data.result.code;
    //         } catch (error) {
    //             console.error('Error adding equipment:', error);
    //         } finally {
    //             // This block will be executed regardless of success or error
    //             window.location.reload();
    //             // Now you can safely call handleQrCodeConfirmation with the captured 'code'
    //             if (code) {
    //                 handleQrCodeConfirmation(code);
    //             }
    //         }
    //     }
    // };
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
    
            try {
                const response = await axios.post('/api/equipment', row, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                const data = response.data;
    
                setEquipmentData([...equipmentData, data.result]);
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
                window.location.reload();
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

    // 해당 설비 state 상세 정보 확인
    const handleStatusConfirmation = async (equipment) => {
        try {
            const response = await axios.get(`/api/state?name=${equipment.code}`);
            const stateInfo = response.data;

            if (stateInfo.length > 0) {
                navigate('/dashboard/history', { state: { equipment, stateInfo }, replace: true });
            } else {
                alert(`${equipment.name}에 대한 정보가 존재하지 않습니다.`);
            }
        } catch (error) {
            console.error('Error fetching state information:', error);
        }
    };

    // const handleQrCodeConfirmation = (code) => {
    //     setQrCodeImage(`/assets/QRcodes/${code}.png`);
    //     setQrCodeModalOpen(true);
    // };
    // const handleQrCodeConfirmation = async (code) => {
    //     try {
    //         const response = await axios.get(`/api/getQRCodeImage/${code}`, { responseType: 'arraybuffer' });
    
    //         // Convert the array buffer to a Blob
    //         const qrCodeBlob = new Blob([response.data], { type: 'image/png' });
    
    //         // Create a data URL from the Blob
    //         const qrCodeImageUrl = URL.createObjectURL(qrCodeBlob);
    
    //         setQrCodeImage(qrCodeImageUrl);
    //         setQrCodeModalOpen(true);
    //     } catch (error) {
    //         console.error('Error fetching QR code image:', error);
    //     }
    // };

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
    }, []);

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

    return (
        <>
            <Helmet>
                <title> CTA </title>
            </Helmet>

            <Container>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        안녕하세요 김소현님
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
                                        <TableCell>{equipment.code}</TableCell>
                                        <TableCell>{equipment.name}</TableCell>
                                        <TableCell>{new Date(equipment.installationDate).toLocaleString()}</TableCell>
                                        <TableCell>{equipment.location}</TableCell>
                                        <TableCell align="left">최종 점검일</TableCell>
                                        <TableCell align="left">{repairStatus[equipment.code]}</TableCell>
                                        <TableCell align="left">
                                            <Button variant="text">
                                                확인
                                            </Button>
                                        </TableCell>
                                        <TableCell align="left"><Button variant="text" onClick={() => handleStatusConfirmation(equipment)}>확인</Button></TableCell>
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
