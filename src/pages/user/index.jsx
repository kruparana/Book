import React, { useEffect, useState } from "react";
import { productStyle } from "./style";
import { defaultFilter, RecordsPerPage } from "../../constant/constant";
import { useNavigate } from "react-router-dom";
import { Typography, TextField } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Button } from "@mui/material";
import userService from "../../service/user.service";
import { toast } from "react-toastify";
import { useAuthContext } from "../../context/auth";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import Shared from "../../utils/shared";

const User = () => {
    const classes = productStyle();
    const authContext = useAuthContext();
    const [filters, setFilters] = useState(defaultFilter);
    const [userList, setUserList] = useState({
        pageIndex: 0,
        pageSize: 10,
        totalPages: 1,
        items: [],
        totalItems: 0,
    });
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (filters.keyword === "") delete filters.keyword;
            getAllUsers({ ...filters });
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const getAllUsers = async (filters) => {
        await userService.getAllUsers(filters).then((res) => {
            if (res) {
                setUserList(res);
            }
        });
    };

    const columns = [
        { id: "firstName", label: "First Name", minWidth: 100 },
        { id: "lastName", label: "Last Name", minWidth: 100 },
        {
            id: "email",
            label: "Email",
            minWidth: 170,
        },
        {
            id: "roleName",
            label: "Role",
            minWidth: 130,
        },
        {
            id: "password",
            label: "Password",
            minWidth: 130,
        },
    ];

    const onConfirmDelete = async () => {
        await userService
            .deleteUser(selectedId)
            .then((res) => {
                if (res) {
                    toast.success(Shared.messages.DELETE_SUCCESS);
                    setOpen(false);
                    setFilters({ ...filters });
                }
            })
            .catch((e) => toast.error(Shared.messages.DELETE_FAIL));
    };

    return (
        <div className={classes.productWrapper}>
            <div className="container">
                <Typography variant="h1">User</Typography>
                <div className="btn-wrapper">
                    <TextField
                        id="text"
                        name="text"
                        placeholder="Search..."
                        variant="outlined"
                        inputProps={{ className: "small" }}
                        onChange={(e) => {
                            setFilters({ ...filters, keyword: e.target.value, pageIndex: 1 });
                        }}
                    />
                </div>
                <TableContainer>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {userList?.items?.map((row, index) => (
                                <TableRow key={`${index}-${row.id}-${row.email}`}>
                                    <TableCell>{row.firstName}</TableCell>
                                    <TableCell>{row.lastName}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>{row.role}</TableCell>
                                    <TableCell>{row.password}</TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            className="green-btn btn"
                                            variant="contained"
                                            color="primary"
                                            disableElevation
                                            onClick={() => {
                                                navigate(`/edit-user/${row.id}`);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        {row.id !== authContext.user.id && (
                                            <Button
                                                type="button"
                                                className="btn pink-btn"
                                                variant="contained"
                                                color="primary"
                                                disableElevation
                                                onClick={() => {
                                                    setOpen(true);
                                                    setSelectedId(row.id ?? 0);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!userList?.items?.length && (
                                <TableRow className="TableRow">
                                    <TableCell colSpan={5} className="TableCell">
                                        <Typography align="center" className="noDataText">
                                            No Users
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={RecordsPerPage}
                    component="div"
                    count={userList?.totalItems || 0}
                    rowsPerPage={filters.pageSize || 0}
                    page={filters.pageIndex - 1}
                    onPageChange={(e, newPage) => {
                        setFilters({ ...filters, pageIndex: newPage + 1 });
                    }}
                    onRowsPerPageChange={(e) => {
                        setFilters({
                            ...filters,
                            pageIndex: 1,
                            pageSize: Number(e.target.value),
                        });
                    }}
                />

                <ConfirmationDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    onConfirm={() => onConfirmDelete()}
                    title="Delete user"
                    description={Shared.messages.USER_DELETE}
                />
            </div>
        </div>
    );
};

export default User;