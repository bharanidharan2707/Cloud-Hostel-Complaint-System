const API_URL = 'http://localhost:5000/api/complaints';

document.addEventListener('DOMContentLoaded', () => {
    const complaintsBody = document.getElementById('complaints-body');
    const statusFilter = document.getElementById('status-filter');
    const alertContainer = document.getElementById('alert-container');

    // Fetch and display complaints
    const fetchComplaints = async (status = '') => {
        try {
            complaintsBody.innerHTML = '<tr><td colspan="7" class="text-center"><span class="loader"></span> Loading...</td></tr>';
            
            let url = API_URL;
            if (status) {
                url += `?status=${status}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                renderTable(data);
            } else {
                showAlert(data.error || 'Failed to fetch complaints.', 'error');
                complaintsBody.innerHTML = '<tr><td colspan="7" class="text-center text-error">Failed to load data.</td></tr>';
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
            showAlert('Network error. Ensure backend is running.', 'error');
            complaintsBody.innerHTML = '<tr><td colspan="7" class="text-center text-error">Network Error</td></tr>';
        }
    };

    const renderTable = (complaints) => {
        if (complaints.length === 0) {
            complaintsBody.innerHTML = '<tr><td colspan="7" class="text-center">No complaints found.</td></tr>';
            return;
        }

        complaintsBody.innerHTML = '';
        
        complaints.forEach(complaint => {
            const date = new Date(complaint.createdAt._seconds * 1000 || complaint.createdAt).toLocaleDateString();
            
            let statusClass = '';
            if (complaint.status === 'Pending') statusClass = 'status-pending';
            else if (complaint.status === 'In Progress') statusClass = 'status-progress';
            else if (complaint.status === 'Resolved') statusClass = 'status-resolved';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${date}</td>
                <td>
                    <strong>${complaint.studentName}</strong><br>
                    <small style="color: var(--text-light)">${complaint.email}</small>
                </td>
                <td>${complaint.hostelBlock}</td>
                <td>${complaint.category}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${complaint.description}">
                    ${complaint.description}
                </td>
                <td>
                    <select class="status-select" data-id="${complaint.id}" style="padding: 0.25rem; border-radius: 4px;">
                        <option value="Pending" ${complaint.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-danger btn-delete" data-id="${complaint.id}" style="padding: 0.4rem 0.8rem; font-size: 0.875rem;">Delete</button>
                </td>
            `;
            complaintsBody.appendChild(tr);
        });

        // Add event listeners for new elements
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', handleStatusChange);
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    };

    const handleStatusChange = async (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        const originalValue = Array.from(e.target.options).find(opt => opt.defaultSelected)?.value || 'Pending';

        try {
            e.target.disabled = true;
            const response = await fetch(`${API_URL}/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                showAlert('Status updated successfully.', 'success');
                // Update default selected to the new value so if it fails later we can revert
                Array.from(e.target.options).forEach(opt => {
                    if (opt.value === newStatus) opt.defaultSelected = true;
                    else opt.defaultSelected = false;
                });
            } else {
                showAlert('Failed to update status.', 'error');
                e.target.value = originalValue; // revert
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showAlert('Network error.', 'error');
            e.target.value = originalValue; // revert
        } finally {
            e.target.disabled = false;
        }
    };

    const handleDelete = async (e) => {
        if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
            return;
        }

        const btn = e.target;
        const id = btn.getAttribute('data-id');

        try {
            btn.disabled = true;
            btn.innerText = 'Deleting...';
            
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAlert('Complaint deleted successfully.', 'success');
                // Refresh list
                fetchComplaints(statusFilter.value);
            } else {
                showAlert('Failed to delete complaint.', 'error');
                btn.disabled = false;
                btn.innerText = 'Delete';
            }
        } catch (error) {
            console.error('Error deleting complaint:', error);
            showAlert('Network error.', 'error');
            btn.disabled = false;
            btn.innerText = 'Delete';
        }
    };

    statusFilter.addEventListener('change', (e) => {
        fetchComplaints(e.target.value);
    });

    function showAlert(message, type) {
        const div = document.createElement('div');
        div.className = `alert alert-${type}`;
        div.innerText = message;
        alertContainer.appendChild(div);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            div.remove();
        }, 3000);
    }

    // Initial fetch
    fetchComplaints();
});
