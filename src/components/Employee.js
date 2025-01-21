import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles.css';
import LoadingSpinner from './LoadingSpinner';  // Import the spinner component

const Employee = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [editTask, setEditTask] = useState(null);
    const [areaOfEffort, setAreaOfEffort] = useState('');
    const [effortHours, setEffortHours] = useState('');
    const [effortMinutes, setEffortMinutes] = useState('');
    const [effortTowards, setEffortTowards] = useState('Brand Building');
    const [timeLogType, setTimeLogType] = useState('Billable');
    const [outputFile, setOutputFile] = useState('');
    const [outputLocation, setOutputLocation] = useState('');
    const [filterDate, setFilterDate] = useState(new Date());
    const [currentDate, setCurrentDate] = useState(new Date());
    const [totalEffortHours, setTotalEffortHours] = useState(0);
    const [emailMessage, setEmailMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);  // Loading state

    const fetchTasksForDate = async (date) => {
        const dateString = date.toISOString().split('T')[0];
        try {
            const response = await axios.get('http://localhost:5000/get_tasks_for_date', {
                params: { user_id: user.user_id, task_date: dateString }
            });
            setTasks(response.data.tasks);
            setTotalEffortHours(response.data.total_effort_hours);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTasksForDate(currentDate);
    }, [currentDate]);

    useEffect(() => {
        const interval = setInterval(() => {
            const today = new Date();
            if (today.toISOString().split('T')[0] !== currentDate.toISOString().split('T')[0]) {
                setCurrentDate(today);
                setFilterDate(today);
                fetchTasksForDate(today);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [currentDate]);

    const addTask = async () => {
        if (filterDate.toISOString().split('T')[0] !== currentDate.toISOString().split('T')[0]) {
            alert('You can only add tasks for the current day');
            return;
        }

        const newTask = {
            user_id: user.user_id,
            area_of_effort: areaOfEffort,
            effort_hours: parseInt(effortHours) || 0,
            effort_minutes: parseInt(effortMinutes) || 0,
            effort_towards: effortTowards,
            time_log_type: timeLogType,
            output_file: outputFile,
            output_location: outputLocation,
            task_date: filterDate.toISOString().split('T')[0]
        };
        try {
            await axios.post('http://localhost:5000/add_task', newTask);
            fetchTasksForDate(filterDate);
            setAreaOfEffort('');
            setEffortHours('');
            setEffortMinutes('');
            setEffortTowards('Brand Building');
            setTimeLogType('Billable');
            setOutputFile('');
            setOutputLocation('');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert(error.response.data.message);
            } else {
                console.error(error);
            }
        }
    };

    const updateTask = async () => {
        if (filterDate.toISOString().split('T')[0] !== currentDate.toISOString().split('T')[0]) {
            alert('You can only edit tasks for the current day');
            return;
        }

        const updatedTask = {
            task_id: editTask.id,
            area_of_effort: areaOfEffort,
            effort_hours: parseInt(effortHours) || 0,
            effort_minutes: parseInt(effortMinutes) || 0,
            effort_towards: effortTowards,
            time_log_type: timeLogType,
            output_file: outputFile,
            output_location: outputLocation
        };
        try {
            await axios.put('http://localhost:5000/update_task', updatedTask);
            fetchTasksForDate(filterDate);
            setEditTask(null);
            setAreaOfEffort('');
            setEffortHours('');
            setEffortMinutes('');
            setEffortTowards('Brand Building');
            setTimeLogType('Billable');
            setOutputFile('');
            setOutputLocation('');
        } catch (error) {
            console.error(error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await axios.delete('http://localhost:5000/delete_task', { params: { task_id: taskId } });
            fetchTasksForDate(filterDate);
        } catch (error) {
            console.error(error);
        }
    };

    const startEditTask = (task) => {
        const taskDate = new Date(task.task_date);
        const today = new Date();
        if (taskDate.toDateString() !== today.toDateString()) {
            alert('You can only edit tasks for the current day');
            return;
        }
        setEditTask(task);
        setAreaOfEffort(task.area_of_effort);
        setEffortHours(task.effort_hours);
        setEffortMinutes(task.effort_minutes);
        setEffortTowards(task.effort_towards);
        setTimeLogType(task.time_log_type);
        setOutputFile(task.output_file);
        setOutputLocation(task.output_location);
    };

    const cancelEditTask = () => {
        setEditTask(null);
        setAreaOfEffort('');
        setEffortHours('');
        setEffortMinutes('');
        setEffortTowards('Brand Building');
        setTimeLogType('Billable');
        setOutputFile('');
        setOutputLocation('');
    };

    const sendEmailReport = async () => {
        setIsLoading(true);  // Start loading
        try {
            const response = await axios.post('http://localhost:5000/send_report', { 
                user_id: user.user_id, 
                task_date: currentDate.toISOString().split('T')[0],
                role: user.role  // Include the user's role
            });
            setEmailMessage(response.data.message);
        } catch (error) {
            console.error(error);
            setEmailMessage(error.response ? error.response.data.message : 'Failed to send report');
        } finally {
            setIsLoading(false);  // Stop loading
        }
    };

    const convertToDecimalHours = (hours, minutes) => {
        const parsedHours = parseInt(hours) || 0;
        const parsedMinutes = parseInt(minutes) || 0;
        return (parsedHours + parsedMinutes / 60).toFixed(2);
    };

    const handleEffortHoursChange = (e) => {
        const value = e.target.value;
        setEffortHours(value === '' ? '' : Math.max(0, parseInt(value)));
    };

    const handleEffortMinutesChange = (e) => {
        const value = e.target.value;
        setEffortMinutes(value === '' ? '' : Math.max(0, Math.min(59, parseInt(value))));
    };

    return (
        <div className="container employee-dashboard">
            <h2>Employee Dashboard</h2>
            <div>
                <DatePicker
                    selected={filterDate}
                    onChange={(date) => {
                        setFilterDate(date);
                        fetchTasksForDate(date);
                    }}
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                />
            </div>
            <div className="card">
                <div id='forminput'>
                    <div className="left-group">
                        <div className="form-group">
                            <label>Effort Hours</label>
                            <input
                                type="number"
                                placeholder="Enter hours"
                                value={effortHours}
                                onChange={handleEffortHoursChange}
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Effort Minutes</label>
                            <input
                                type="number"
                                placeholder="Enter minutes"
                                value={effortMinutes}
                                onChange={handleEffortMinutesChange}
                                min="0"
                                max="59"
                            />
                        </div>
                        <div className="form-group">
                            <label>Effort Towards</label>
                            <select value={effortTowards} onChange={(e) => setEffortTowards(e.target.value)}>
                                <option value="Brand Building">Brand Building</option>
                                <option value="Capacity Building">Capacity Building</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Time Log Type</label>
                            <select value={timeLogType} onChange={(e) => setTimeLogType(e.target.value)}>
                                <option value="Billable">Billable</option>
                                <option value="Non-Billable">Non-Billable</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Output File</label>
                            <input
                                type="text"
                                placeholder="Enter output file"
                                value={outputFile}
                                onChange={(e) => setOutputFile(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Output Location</label>
                            <input
                                type="text"
                                placeholder="Enter output location"
                                value={outputLocation}
                                onChange={(e) => setOutputLocation(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="area-of-effort-group">
                        <div className="form-group">
                            <div>
                                <label>Area of Effort</label>
                                <textarea
                                    id="atext"
                                    placeholder="Enter area of effort"
                                    value={areaOfEffort}
                                    onChange={(e) => setAreaOfEffort(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {editTask ? (
                    <>
                        <button className="button" onClick={updateTask}>Update Task</button>
                        <button className="button" onClick={cancelEditTask}>Cancel</button>
                    </>
                ) : (
                    <button className="button" onClick={addTask}>Add Task</button>
                )}
            </div>
            <div className="task-list">
                <h3 className="card-title">Your Tasks</h3>
                {tasks.map((task) => (
                    <div key={task.id} className="task-box">
                        <p id='textdetails'>
                            <div id='area'>Area of effort:<br /><br />{task.area_of_effort}</div>
                            <div id='othertext'>
                                <br />Effort hours: {convertToDecimalHours(task.effort_hours, task.effort_minutes)} h
                                <br /> <br />Effort towards: {task.effort_towards}
                                <br /> <br />Time log type: {task.time_log_type}
                                <br /> <br />Output file: {task.output_file || 'No output file'}
                                <br /> <br />Output location: {task.output_location || 'No output location'}
                                <br /> <br />Date: {task.task_date || 'No date'}
                            </div>
                        </p>
                        <button className="button" onClick={() => startEditTask(task)}>Edit</button>
                        <button className="button" onClick={() => deleteTask(task.id)}>Delete</button>
                    </div>
                ))}
            </div>
            <h4>Total Effort Hours for {filterDate.toISOString().split('T')[0]}</h4>
            <p>{totalEffortHours.toFixed(2)} hours</p>
            <button className="button" onClick={sendEmailReport}>Send Report</button>
            {isLoading && <LoadingSpinner />}  {/* Display spinner if loading */}
            {emailMessage && <p>{emailMessage}</p>}
        </div>
    );
};

export default Employee;
