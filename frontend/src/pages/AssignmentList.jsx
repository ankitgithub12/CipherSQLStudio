import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/AssignmentList.scss';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/assignments');
        setAssignments(response.data);
      } catch (err) {
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) {
    return <div className="loader">Loading Assignments...</div>;
  }

  return (
    <div className="assignment-list">
      <h2 className="assignment-list__header">Available Assignments</h2>
      <div className="assignment-grid">
        {assignments.map(assignment => (
          <div key={assignment._id} className="assignment-card">
            <h3 className="assignment-card__title">{assignment.title}</h3>
            <span className={`assignment-card__badge assignment-card__badge--${assignment.description.toLowerCase()}`}>
              {assignment.description}
            </span>
            <p className="assignment-card__question">{assignment.question}</p>
            <div className="assignment-card__footer">
              <Link to={`/assignment/${assignment._id}`} className="assignment-card__btn">
                Attempt Challenge ➔
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentList;
