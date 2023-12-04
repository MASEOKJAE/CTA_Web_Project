import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { React, useState, useEffect } from 'react';
import axios from 'axios';
// @mui
import {
    Card,
    Table,
    Stack,
    Paper,
    Button,
    Popover,
    Checkbox,
    TableRow,
    MenuItem,
    TableBody,
    TableCell,
    Container,
    Typography,
    IconButton,
    TableContainer,
    TablePagination,
    Dialog,
} from '@mui/material';
// components
import { UserListHead } from '../sections/@dashboard/user';
import Iconify from '../components/iconify';
// sections
import {
    AppTasks,
    AppNewsUpdate,
    AppOrderTimeline,
    AppCurrentVisits,
    AppWebsiteVisits,
    AppTrafficBySite,
    AppWidgetSummary,
    AppCurrentSubject,
    AppConversionRates,
} from '../sections/@dashboard/app';
import DialogTag from './DialogTag';
import ImageModal from './ImageModal';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'name', label: '코드', alignRight: false },
    { id: 'company', label: '설비명', alignRight: false },
    { id: 'role', label: '설치일자', alignRight: false },
    { id: 'isVerified', label: '설치위치', alignRight: false },
    { id: 'status', label: '최신 상태', alignRight: false },
    { id: 'latestInspectionDate', label: '최종 점검일', alignRight: false },
    { id: 'isDefective', label: '수리필요여부', alignRight: false },
    { id: 'repairmentHistory', label: '수리 이력', alignRight: false },
    { id: 'inspectionHistory', label: '점검 이력', alignRight: false },
    { id: 'edit', label: '수정', alignRight: false },
    { id: 'delete', label: '삭제', alignRight: false },

];


export default function DashboardAppPage() {
    const theme = useTheme();

    const [userList, setUserList] = useState([])

    const [order, setOrder] = useState('asc');

    const [selected, setSelected] = useState([]);

    const [orderBy, setOrderBy] = useState('name');

    const [openCreate, setOpenCreate] = useState(false);

    const [equipmentData, setEquipmentData] = useState([]);

    const [editRow, setEditRow] = useState(null);

    // 설비추가 다이얼로그 열기
    const handleClickOpenCreate = () => {
        // console.log('handleClickOpenCreate')
        setOpenCreate(true); // 다이얼로그 열기
    }

    // 설비추가 다이얼로그 닫기
    const handleCloseCreate = async (row) => {
        setOpenCreate(false);

        // row가 전달되었을 때만 서버에 데이터 전송
        if (row && row.installationDate) {
            row.installationDate = new Date(row.installationDate).toISOString().split('T')[0];
            try {
                // 서버로 데이터 전송 (예: /api/equipment 경로 사용)
                const response = await axios.post('/api/equipment', row, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = response.data;

                // 서버에서 받은 데이터를 기존 리스트에 추가
                setEquipmentData([...equipmentData, data.result]);

                console.log('Equipment added successfully:', data.message);

                // Refresh the page
                window.location.reload();
            } catch (error) {
                console.error('Error adding equipment:', error);
            }
        }
    };


    // 설비 삭제
    const handleItemDelete = (id) => {
        console.log("id : ", id);
        // 서버 요청 (code와 함께)
        axios.delete(`/api/equipment/${id}`)
            .then(() => {
                alert("Successful delete");
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // // 설비 내용 삭제 전 물어보기
    // const handleOpenDelete = (equipment) => {    
    //   if (window.confirm("정말로 삭제하시겠습니까?")) {
    //     handleItemDelete(equipment.code);
    //   }
    // }

    // 설비내용 수정
    const handleCloseEdit = (row) => {
        if (row) {

            row.installationDate = new Date(row.installationDate).toISOString().split('T')[0];

            // 새로운 equipmentData를 만들어서 기존 데이터를 복제
            const newEquipmentData = [...equipmentData];

            // 수정된 행의 인덱스 찾기
            const index = newEquipmentData.findIndex((equipment) => equipment.id === row.id);

            // 수정된 행으로 기존 데이터를 업데이트
            newEquipmentData[index] = row;

            // 상태 업데이트
            setEquipmentData(newEquipmentData);

            // 서버 요청
            axios.put(`/api/equipment/${row.id}`, row)
                .then(response => {
                    console.log('Response:', response.data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }

        // 다이얼로그 닫기
        setEditRow(null);
    };


    // 설비 내용 수정
    const handleOpenEditDialog = (row) => {
        setEditRow(row);
    }

    const [isModalOpen, setModalOpen] = useState(false);
    const [modalImages, setModalImages] = useState([]);
    // 수리이력 사진 띄우기
    // Update your component to fetch and display images
    const repairPhoto = async (equipmentId) => {
        try {
            // Fetch images for the specified repair history
            const response = await axios.get(`/api/equipment/${equipmentId}/repair-history/images`);
            const { images } = response.data;

            // Display images in the modal
            setModalImages(images);
            setModalOpen(true);
        } catch (error) {
            console.error('Error fetching repair history images:', error);
        }
    };

    useEffect(() => {
        axios.get('/api/equipment')
            .then((response) => {
                console.log("데이터 가져오는 중!!!");
                setEquipmentData(response.data);
            })
            .catch((error) => {
                console.error("데이터를 가져오는 중 오류 발생:", error);
            });
    }, []);


    // 이미지 검출 결과 상시 확인
    useEffect(() => {
        const fetchColorDetectResult = async () => {
            try {
                // Fetch color detect result from the server
                const response = await axios.get('/api/colorDetectResult');
                const { result } = response.data;
                
                console.log("제발!!!! -> " + result);
    
                // If the result is 1, show an alert
                if (result === '1') {
                    alert('설비에 문제가 발생했습니다!!');
                    await axios.put('/api/colorDetectResult/reset');
                }
            } catch (error) {
                console.error('Error fetching color detect result:', error);
            }
        };
    
        // Call the function every 5 seconds
        const intervalId = setInterval(fetchColorDetectResult, 5000);
    
        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

        // 이미지 검출 결과 상시 확인
        // useEffect(() => {
        //     const fetchColorDetectResult = async () => {
        //         try {
        //             // Fetch color detect result from the server
        //             const response = await axios.get('/api/colorDetectResult');
        //             const { result } = response.data;
        
        //             // If the result is 1, show an alert
        //             if (result === '1') {
        //                 // Show a confirmation dialog and check the user's response
        //                 if (window.confirm('설비에 문제가 발생했습니다!!')) {
        //                     // If the user clicked 'OK', send a request to the server
        //                     axios.post('/api/colorDetectResult/reset');
        //                 }
        //             }
        //         } catch (error) {
        //             console.error('Error fetching color detect result:', error);
        //         }
        //     };
        
        //     // Call the function every 5 seconds
        //     const intervalId = setInterval(fetchColorDetectResult, 5000);
        
        //     // Clear interval on component unmount
        //     return () => clearInterval(intervalId);
        // }, []);  
    

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
                    <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleClickOpenCreate}>
                        설비 추가
                    </Button>
                    {/* 사용자사 설비 추가 버튼 클릭 후 DialogTag 그림 */}
                    {openCreate && <DialogTag
                        open={openCreate}
                        // onClose={handleCloseCreate} 
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
                                        <TableCell align="left">최신상태</TableCell>
                                        <TableCell align="left">최종 점검일</TableCell>
                                        <TableCell align="left">불필요</TableCell>
                                        <TableCell align="left">
                                            <Button variant="text" onClick={() => repairPhoto(equipment.id)}>확인</Button>
                                            <ImageModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} images={modalImages} />
                                        </TableCell>
                                        <TableCell align="left"><Button variant="text">확인</Button></TableCell>
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


                        </Table>
                    </TableContainer>
                </Card>
            </Container>
            {editRow && <DialogTag
                open={!!editRow}
                // onClose={handleCloseEdit} 
                title={'수정하기'}
                row={editRow}
                handleClose={handleCloseEdit}
                confirm={'수정하기'}
            />}
        </>
    );
}
