    import React, { useState, useEffect } from 'react';
    import { DataGrid } from '@mui/x-data-grid';
    import { Button, CircularProgress, Box, Typography } from '@mui/material';
    import axios from 'axios';
    import API_ENDPOINTS from '../config/apiConfig';
    import { useParams } from 'react-router-dom';
    import { useNavigate } from 'react-router-dom';

    const LeadsTable = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 20,
    });
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const { leadId } = useParams();
    // Fetch leads from API
    const fetchLeads = async () => {
        setLoading(true);
        try {
        const response = await axios.get(API_ENDPOINTS.LEADS, {
            params: {
            page: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            },
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
        setLeads(response.data.items);
        } catch (error) {
        console.error('Error fetching leads:', error);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [paginationModel]);

    // Columns for DataGrid
    const columns = [
        { field: 'leadName', headerName: 'Lead Name', width: 200 },
        { field: 'assignedTo', headerName: 'Assigned To', width: 200 },
        {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        renderCell: (params) => (
            <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleViewClick(params.row)}
            >
            View
            </Button>
        ),
        },
    ];

    // Handle View button click
    const handleViewClick = (lead) => {
        console.log("lead--------",lead);
        navigate(`/punch/${lead?.id}`);
    };

    // Format leads data for DataGrid
    const rows = leads.map((lead) => {

        console.log("lead",lead);
        // Safely get assignedTo name
        const assignedToName = lead.assignedTo && lead.assignedTo.name 
        ? lead.assignedTo.name 
        : 'Unassigned';
        
        return {
        id: lead._id,
        leadName: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'N/A',
        // assignedTo:  lead?.assignedTo?.name,
        assignedTo: lead?.assignedTo && lead?.assignedTo?.name ? lead?.assignedTo?.name : 'Unassigned',
        // ...lead,
        };
    });

    return (
        <Box sx={{ height: 600, width: '100%' }}>
        <Typography variant="h4" gutterBottom>
            Leads
        </Typography>
        {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
            </Box>
        ) : (
            <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[20, 50, 100]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={27} // Update with total from API
            paginationMode="server"
            />
        )}
        </Box>
    );
    };

    export default LeadsTable;
