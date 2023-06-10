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
import { toast } from "react-toastify";
import categoryService from "../../service/category.service";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import Shared from "../../utils/shared";
import request from "../../service/request";

const ENDPOINT = "api/book";

const getAll = async (params) => {
    const url = `${ENDPOINT}`;
    return request.get(url, { params }).then((res) => {
        return res;
    });
};

const searchBook = async (searchText) => {
    const url = `${ENDPOINT}/search?keyword=${searchText}`;
    return request.get(url).then((res) => {
        return res;
    });
};

const getById = async (id) => {
    const url = `${ENDPOINT}/byId?id=${id}`;
    return request.get(url).then((res) => {
        return res;
    });
};

const deleteBook = async (id) => {
    const url = `${ENDPOINT}?id=${id}`;
    return request.delete(url).then((res) => {
        return res;
    });
};

const save = async (data) => {
    if (data.id) {
        const url = `${ENDPOINT}`;
        return request.put(url, data).then((res) => {
            return res;
        });
    } else {
        const url = `${ENDPOINT}`;
        return request.post(url, data).then((res) => {
            return res;
        });
    }
};

const bookService = { getAll, getById, deleteBook, save, searchBook };

const Book = () => {
    const classes = productStyle();
    const [filters, setFilters] = useState(defaultFilter);
    const [bookRecords, setBookRecords] = useState({
        pageIndex: 0,
        pageSize: 10,
        totalPages: 1,
        items: [],
        totalItems: 0,
    });
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(0);
    const [categories, setCategories] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        getAllCategories();
    }, []);

    const getAllCategories = async () => {
        await categoryService.getAll().then((res) => {
            if (res) {
                setCategories(res);
            }
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (filters.keyword === "") delete filters.keyword;
            searchAllBooks({ ...filters });
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const searchAllBooks = (filters) => {
        bookService.getAll(filters).then((res) => {
            setBookRecords(res);
        });
    };

    const columns = [
        { id: "name", label: "Book Name", minWidth: 100 },
        { id: "price", label: "Price", minWidth: 100 },
        { id: "category", label: "Category", minWidth: 100 },
    ];

    const onConfirmDelete = () => {
        bookService
            .deleteBook(selectedId)
            .then((res) => {
                toast.success(Shared.messages.DELETE_SUCCESS);
                setOpen(false);
                setFilters({ ...filters, pageIndex: 1 });
            })
            .catch((e) => toast.error(Shared.messages.DELETE_FAIL));
    };

    return (
        <div className={classes.productWrapper}>
            <div className="container">
                <Typography variant="h1">Book Page</Typography>
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
                    <Button
                        type="button"
                        className="btn pink-btn"
                        variant="contained"
                        color="primary"
                        disableElevation
                        onClick={() => navigate("/add-book")}
                    >
                        Add
                    </Button>
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
                            {bookRecords?.items?.map((row, index) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.price}</TableCell>
                                    <TableCell>
                                        {categories.find((c) => c.id === row.categoryId)?.name}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            className="green-btn btn"
                                            variant="contained"
                                            color="primary"
                                            disableElevation
                                            onClick={() => {
                                                navigate(`/edit-book/${row.id}`);
                                            }}
                                        >
                                            Edit
                                        </Button>
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
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!bookRecords.items.length && (
                                <TableRow className="TableRow">
                                    <TableCell colSpan={5} className="TableCell">
                                        <Typography align="center" className="noDataText">
                                            No Books
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
                    count={bookRecords.totalItems}
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
                    title="Delete book"
                    description="Are you sure you want to delete this book?"
                />
            </div>
        </div>
    );
};

export default Book;