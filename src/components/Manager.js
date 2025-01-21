import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import '../styles.css';
import LoadingSpinner from './LoadingSpinner';  // Import the spinner component

const Manager = ({ user }) => {
    const [tasksByUser, setTasksByUser] = useState({});
    const [users, setUsers] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [managerNote, setManagerNote] = useState('');
    const [broadAreaOfWork, setBroadAreaOfWork] = useState('');
    const [filterDate, setFilterDate] = useState(new Date());
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [report, setReport] = useState(null);
    const [selectedUser, setSelectedUser] = useState('');
    const [totalEffortHours, setTotalEffortHours] = useState(0);
    const [isLoading, setIsLoading] = useState(false);  // Loading state

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/get_users');
                const sortedUsers = response.data.sort((a, b) => a.user_id.localeCompare(b.user_id));
                setUsers(sortedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const fetchTasksForDate = async (date) => {
        const dateString = date.toISOString().split('T')[0];
        try {
            const response = await axios.get('http://localhost:5000/get_tasks_for_date', {
                params: { user_id: selectedUser, task_date: dateString }
            });
            const { tasks, total_effort_hours } = response.data;
            const groupedTasks = tasks.reduce((acc, task) => {
                if (!acc[task.user_id]) {
                    acc[task.user_id] = [];
                }
                acc[task.user_id].push(task);
                return acc;
            }, {});
            setTasksByUser(groupedTasks);
            setTotalEffortHours(total_effort_hours);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTasksForPeriod = async (fromDate, toDate) => {
        try {
            const response = await axios.get('http://localhost:5000/get_tasks_for_period', {
                params: {
                    from_date: fromDate.toISOString().split('T')[0],
                    to_date: toDate.toISOString().split('T')[0]
                }
            });
            const groupedTasks = response.data.reduce((acc, task) => {
                if (!acc[task.user_id]) {
                    acc[task.user_id] = [];
                }
                acc[task.user_id].push(task);
                return acc;
            }, {});
            setTasksByUser(groupedTasks);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchReport = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get_report', {
                params: {
                    user_id: selectedUser,
                    from_date: fromDate.toISOString().split('T')[0],
                    to_date: toDate.toISOString().split('T')[0]
                }
            });
            setReport(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const sendReport = async () => {
        setIsLoading(true);  // Start loading
        try {
            const response = await axios.post('http://localhost:5000/send_report', {
                user_id: selectedUser,
                from_date: fromDate.toISOString().split('T')[0],
                to_date: toDate.toISOString().split('T')[0],
                role: user.role  // Include the user's role
            });
            alert(response.data.message);
        } catch (error) {
            console.error(error);
            alert(error.response ? error.response.data.message : 'Failed to send report');
        } finally {
            setIsLoading(false);  // Stop loading
        }
    };

    useEffect(() => {
        if (selectedUser) {
            fetchTasksForDate(filterDate);
        }
    }, [filterDate, selectedUser]);

    const addManagerNote = async () => {
        if (!selectedTask) return;

        const noteData = {
            task_id: selectedTask.id,
            manager_note: managerNote,
            broad_area_of_work: broadAreaOfWork
        };
        try {
            await axios.post('http://localhost:5000/add_manager_note', noteData);
            fetchTasksForDate(filterDate);
            setSelectedTask(null);
            setManagerNote('');
            setBroadAreaOfWork('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleTaskSelection = (task) => {
        setSelectedTask(task);
        setManagerNote(task.manager_note || '');
        setBroadAreaOfWork(task.broad_area_of_work || '');
    };

    const convertToDecimalHours = (hours, minutes) => {
        const parsedHours = parseInt(hours) || 0;
        const parsedMinutes = parseInt(minutes) || 0;
        return (parsedHours + parsedMinutes / 60).toFixed(2);
    };

    return (
        <div className="container">
            <h2>Manager Dashboard</h2>
            <div className="form-group">
                <label>Select Employee</label>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                    <option value="">Select</option>
                    {users.map(user => (
                        <option key={user.user_id} value={user.user_id}>{user.user_id}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Filter by Date</label>
                <DatePicker
                    selected={filterDate}
                    onChange={(date) => setFilterDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                />
            </div>
            {Object.keys(tasksByUser).map(userId => (
                <div className="card" key={userId}>
                    <h3 className="card-title">Tasks for {userId}</h3>
                    {tasksByUser[userId].map((task) => (
                        <div key={task.id} className="task-box" onClick={() => handleTaskSelection(task)}>
                            <div className="textwork" id="textdetails">
                                <div id="area">Area of effort:<br /><br />{task.area_of_effort}</div>
                                <div id="othertext">
                                    Effort hours: {convertToDecimalHours(task.effort_hours, task.effort_minutes)} h
                                    <br /><br />
                                    Effort towards: {task.effort_towards}
                                    <br /><br />
                                    Time log type: {task.time_log_type}
                                    <br /><br />
                                    Output file: {task.output_file ? <a href={task.output_file}>{task.output_file}</a> : <span className="no-link">No output file</span>}
                                    <br /><br />
                                    Output location: {task.output_location ? <a href={task.output_location}>{task.output_location}</a> : <span className="no-link">No output location</span>}
                                    <br /><br />
                                    Manager Note: {task.manager_note || 'No note added'}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Manager's Note</label>
                                <input
                                    type="text"
                                    placeholder="Manager Note"
                                    value={managerNote}
                                    onChange={(e) => setManagerNote(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Broad Area of Work</label>
                                <input
                                    type="text"
                                    placeholder="Broad Area of Work"
                                    value={broadAreaOfWork}
                                    onChange={(e) => setBroadAreaOfWork(e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                    {selectedTask && (
                        <button className="button" onClick={addManagerNote}>Save Note</button>
                    )}
                    <h4>Total Effort Hours for {filterDate.toISOString().split('T')[0]}</h4>
                    <p>{totalEffortHours.toFixed(2)} hours</p>
                </div>
            ))}
            <div className="report-section">
                <h3>Generate Report</h3>
                <div className="form-group">
                    <label>From Date</label>
                    <DatePicker
                        selected={fromDate}
                        onChange={(date) => setFromDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>To Date</label>
                    <DatePicker
                        selected={toDate}
                        onChange={(date) => setToDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control"
                    />
                </div>
                <div className='gsreport'>
                    <button className="button" onClick={fetchReport}>Generate Report</button>
                    <button className="button" onClick={sendReport}>Send Report</button>
                </div>
                {isLoading && <LoadingSpinner />}  {/* Display spinner if loading */}
                {report && (
                    <div className="report-result">
                        <h4>Total Effort Hours</h4>
                        <p>{report.total_effort_hours.toFixed(2)} hours</p>
                        <h4>Total Working Days</h4>
                        <p>{report.total_working_days} days</p>
                        <h4>Missed TED Dates</h4>
                        <ul>
                            {report.missed_dates.map((date, index) => (
                                <li key={index}>{date}</li>
                            ))}
                        </ul>
                        <h4>Broad Area of Work and Time Effort Hours</h4>
                        <ul>
                            {report.broad_area_of_work_hours.map((item, index) => (
                                <li key={index}>{item[0]}: {item[1].toFixed(2)} hours</li>
                            ))}
                        </ul>
                        <h4>Less than 8 hours TED Dates</h4>
                        <ul>
                            {report.less_than_8_hours_dates.map((date, index) => (
                                <li key={index}>{date}</li>
                            ))}
                        </ul>
                        <h4>No Files of TED Link Missing Dates</h4>
                        <ul>
                            {report.missing_files_tasks.map((task, index) => (
                                <li key={index}>
                                    <strong>{task[0]}:</strong> {task[1]}
                                </li>
                            ))}
                        </ul>
                        <h4>Effort Towards and Time Effort Hours</h4>
                        <ul>
                            {report.effort_towards_hours.map((item, index) => (
                                <li key={index}>{item[0]}: {item[1].toFixed(2)} hours</li>
                            ))}
                        </ul>
                        <h4>Notes and Additional Notes</h4>
                        {Object.keys(report.notes.reduce((acc, note) => {
                            const date = note[0];
                            if (!acc[date]) {
                                acc[date] = [];
                            }
                            acc[date].push(note);
                            return acc;
                        }, {})).map(date => (
                            <div key={date} className="date-section">
                                <h3>{date}</h3>
                                <table className="notes-table">
                                    <thead>
                                        <tr>
                                            <th>Task Performed</th>
                                            <th>Manager Note</th>
                                            <th>Reviewer Note</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.notes.filter(note => note[0] === date).map((note, index) => (
                                            <tr key={index}>
                                                <td>{note[1]}</td>
                                                <td>{note[2]}</td>
                                                <td>{note[3]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button id="invibutton" className="button" onClick={() => navigate('/invite')}>Send Invitation</button>
        </div>
    );
};

export default Manager;
