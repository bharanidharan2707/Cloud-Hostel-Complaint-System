const API_URL = 'http://localhost:5000/api/complaints';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('complaint-form');
    const alertContainer = document.getElementById('alert-container');
    const formCard = document.getElementById('form-card');
    const successCard = document.getElementById('success-card');
    const submitBtn = document.getElementById('submit-btn');
    const newComplaintBtn = document.getElementById('new-complaint-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset alerts
        alertContainer.innerHTML = '';
        
        // Get values
        const studentName = document.getElementById('studentName').value.trim();
        const email = document.getElementById('email').value.trim();
        const hostelBlock = document.getElementById('hostelBlock').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();

        // Basic Validation
        if (!studentName || !email || !hostelBlock || !category || !description) {
            showAlert('Please fill in all fields.', 'error');
            return;
        }

        const complaintData = {
            studentName,
            email,
            hostelBlock,
            category,
            description
        };

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loader"></span> Submitting...';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(complaintData)
            });

            const data = await response.json();

            if (response.ok) {
                // Show success view
                formCard.classList.add('d-none');
                successCard.classList.remove('d-none');
                document.getElementById('display-id').innerText = data.id;
                form.reset();
            } else {
                showAlert(data.error || 'Failed to submit complaint.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('A network error occurred. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Submit Complaint';
        }
    });

    newComplaintBtn.addEventListener('click', () => {
        successCard.classList.add('d-none');
        formCard.classList.remove('d-none');
        alertContainer.innerHTML = '';
    });

    function showAlert(message, type) {
        const div = document.createElement('div');
        div.className = `alert alert-${type}`;
        div.innerText = message;
        alertContainer.appendChild(div);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            div.remove();
        }, 5000);
    }
});
