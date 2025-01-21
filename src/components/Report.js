import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles.css';

const Report = () => {
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReport = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('http://localhost:5000/get_report', {
                params: {
                    from_date: fromDate.toISOString().split('T')[0],
                    to_date: toDate.toISOString().split('T')[0]
                }
            });
            setReport(response.data);
        } catch (err) {
            setError('Failed to generate the report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time) => {
        return parseFloat(time).toFixed(2);
    };

    return (
        <div className="container report-section">
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
            <button className="button" onClick={fetchReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
            </button>
            {error && <div className="error-message">{error}</div>}
            {report && (
                <div className="report-result">
                    <h4>Total Effort Hours</h4>
                    <p>{report.total_effort_hours.toFixed(2)} hours</p>
                    <h4>Total Working Days</h4>
                    <p>{report.total_working_days} days</p>
                    <h4>Missed Dates</h4>
                    <ul>
                        {report.missed_dates.length > 0 ? (
                            report.missed_dates.map((date, index) => (
                                <li key={index}>{date}</li>
                            ))
                        ) : (
                            <li>No missed dates</li>
                        )}
                    </ul>
                    <h4>Broad Area of Work and Time Effort Hours</h4>
                    <ul>
                        {report.broad_area_of_work_hours.length > 0 ? (
                            report.broad_area_of_work_hours.map((item, index) => (
                                <li key={index}><strong>{item[0]}</strong>: {formatTime(item[1])} hours</li>
                            ))
                        ) : (
                            <li>No data available</li>
                        )}
                    </ul>
                    <h4>Less than 8 hours TED Dates</h4>
                    <ul>
                        {report.less_than_8_hours_dates.length > 0 ? (
                            report.less_than_8_hours_dates.map((date, index) => (
                                <li key={index}>{date}</li>
                            ))
                        ) : (
                            <li>No dates with less than 8 hours</li>
                        )}
                    </ul>
                    <h4>No Files of TED Link Missing Dates</h4>
                    <ul>
                        {report.missing_files_dates.length > 0 ? (
                            report.missing_files_dates.map((date, index) => (
                                <li key={index}>{date}</li>
                            ))
                        ) : (
                            <li>No missing files</li>
                        )}
                    </ul>
                    <h4>Effort Towards and Time Effort Hours</h4>
                    <ul>
                        {report.effort_towards_hours.length > 0 ? (
                            report.effort_towards_hours.map((item, index) => (
                                <li key={index}><strong>{item[0]}</strong>: {formatTime(item[1])} hours</li>
                            ))
                        ) : (
                            <li>No data available</li>
                        )}
                    </ul>
                    <h4>Notes and Additional Notes</h4>
                    <ul>
                        {report.notes.length > 0 ? (
                            report.notes.map((item, index) => (
                                <li key={index}>
                                    <strong>Date</strong>: {item[0]}<br />
                                    <strong>Task Performed</strong>: {item[1]}<br />
                                    <strong>Manager Note</strong>: {item[2]}<br />
                                    <strong>Reviewer Note</strong>: {item[3]}
                                </li>
                            ))
                        ) : (
                            <li>No notes available</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Report;