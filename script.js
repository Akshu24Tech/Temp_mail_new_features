document.addEventListener('DOMContentLoaded', function() {
    // Make sure all DOM elements exist before accessing them
    const themeToggle = document.getElementById('themeToggle');
    const emailAddressContainer = document.querySelector('.email-address-container');
    const emailAddress = document.querySelector('.email-address');
    const timerElement = document.getElementById('timer');
    const refreshBtn = document.querySelector('.refresh-action');
    const changeBtn = document.querySelector('.change-action');
    const deleteBtn = document.querySelector('.delete-action');
    const copyBtn = document.querySelector('.copy-btn');
    const copyActionBtn = document.querySelector('.copy-action');
    
    // Initialize email data object
    let emailData = {
        totalReceived: 0,
        lastReceived: null,
        senders: {},
        frequency: [0, 0, 0, 0, 0] // Last 5 days
    };
    
    // Theme toggle functionality
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('i');
        
        // Check for saved theme preference or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
        
        // Toggle theme when clicked
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
        
        function updateThemeIcon(theme) {
            if (themeIcon) {
                if (theme === 'dark') {
                    themeIcon.className = 'fas fa-sun';
                } else {
                    themeIcon.className = 'fas fa-moon';
                }
            }
        }
    }
    
    // Email expiry timer functionality
    let timerInterval;
    let timeLeft = 600; // 10 minutes in seconds
    
    function startTimer() {
        if (!timerElement) return;
        
        // Clear any existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Reset timer state
        timeLeft = 600;
        if (emailAddressContainer) {
            emailAddressContainer.classList.remove('email-expired');
        }
        timerElement.classList.remove('expiring');
        
        // Update timer display
        updateTimerDisplay();
        
        // Start the countdown
        timerInterval = setInterval(function() {
            timeLeft--;
            
            if (timeLeft <= 60) { // Last minute
                timerElement.classList.add('expiring');
            }
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                emailExpired();
            }
            
            updateTimerDisplay();
        }, 1000);
    }
    
    function updateTimerDisplay() {
        if (!timerElement) return;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function emailExpired() {
        if (emailAddressContainer) {
            emailAddressContainer.classList.add('email-expired');
        }
        showToast('Email address has expired. Click refresh to generate a new one.');
    }
    
    function generateNewEmail() {
        if (!emailAddress) return;
        
        // Array of possible domains
        const domains = ['harinv.com', 'tempmail.org', 'disposable.com', 'mailinator.com', 'throwaway.com'];
        
        // Generate random username (5-8 characters + 4 digits)
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let username = '';
        
        // Generate random username part
        const usernameLength = Math.floor(Math.random() * 4) + 5; // 5-8 characters
        for (let i = 0; i < usernameLength; i++) {
            username += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Add 4 random digits
        for (let i = 0; i < 4; i++) {
            username += Math.floor(Math.random() * 10);
        }
        
        // Select random domain
        const domain = domains[Math.floor(Math.random() * domains.length)];
        
        // Set new email address
        emailAddress.textContent = `${username}@${domain}`;
        
        // Restart timer
        startTimer();
    }
    
    // Copy email address functionality
    function copyToClipboard() {
        if (!emailAddress) return;
        
        navigator.clipboard.writeText(emailAddress.textContent)
            .then(() => {
                showToast('Email address copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                showToast('Failed to copy email address');
            });
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', copyToClipboard);
    }
    
    if (copyActionBtn) {
        copyActionBtn.addEventListener('click', copyToClipboard);
    }
    
    // Function to clear the inbox
    function clearInbox() {
        // Remove all emails from the list
        const emailList = document.querySelector('.email-list');
        if (emailList) {
            emailList.innerHTML = '';
        }
        
        // Show the empty inbox message
        const emptyInbox = document.querySelector('.empty-inbox');
        if (emptyInbox) {
            emptyInbox.style.display = 'flex';
        }
        
        // Reset analytics for the new email
        emailData.totalReceived = 0;
        emailData.lastReceived = null;
        emailData.senders = {};
        emailData.frequency = [0, 0, 0, 0, 0];
        updateAnalytics();
    }
    
    // Function to check for new emails
    function checkForNewEmails() {
        // In a real app, this would be an API call to fetch emails
        const emptyInbox = document.querySelector('.empty-inbox');
        const inbox = document.querySelector('.inbox');
        
        if (!inbox) return;
        
        // Simulate API response with sample emails
        const sampleEmails = [
            { sender: 'notifications@service.com', subject: 'Your account has been verified', id: 'email1' },
            { sender: 'newsletter@updates.com', subject: 'Weekly newsletter: Latest tech news', id: 'email2' }
        ];
        
        if (sampleEmails.length > 0) {
            // Remove empty inbox message if there are emails
            if (emptyInbox) {
                emptyInbox.style.display = 'none';
            }
            
            // Get or create email list container
            let emailList = document.querySelector('.email-list');
            if (!emailList) {
                emailList = document.createElement('div');
                emailList.className = 'email-list';
                inbox.appendChild(emailList);
            }
            
            // Clear existing emails
            emailList.innerHTML = '';
            
            // Add emails to the list
            sampleEmails.forEach(email => {
                const emailItem = document.createElement('div');
                emailItem.className = 'email-item';
                emailItem.dataset.id = email.id;
                
                emailItem.innerHTML = `
                    <div class="sender">${email.sender}</div>
                    <div class="subject">${email.subject}</div>
                    <div class="view">
                        <button class="view-btn"><i class="fas fa-eye"></i></button>
                    </div>
                `;
                
                emailList.appendChild(emailItem);
                
                // Add click event to view button
                const viewBtn = emailItem.querySelector('.view-btn');
                if (viewBtn) {
                    viewBtn.addEventListener('click', function() {
                        showToast('Opening email...');
                        // In a real app, this would open the email content
                    });
                }
            });
            
            // Update analytics
            emailData.totalReceived += sampleEmails.length;
            emailData.lastReceived = new Date();
            sampleEmails.forEach(email => {
                emailData.senders[email.sender] = (emailData.senders[email.sender] || 0) + 1;
            });
            emailData.frequency[4] += sampleEmails.length;
            updateAnalytics();
        }
    }
    
    // Refresh button functionality
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            showToast('Refreshing inbox...');
            // Simulate refresh with animation
            const icon = refreshBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-spin');
                setTimeout(() => {
                    icon.classList.remove('fa-spin');
                    // Only check for new emails, don't generate new email address
                    checkForNewEmails();
                }, 1000);
            } else {
                checkForNewEmails();
            }
        });
    }
    
    // Change email button functionality
    if (changeBtn) {
        changeBtn.addEventListener('click', function() {
            showToast('Generating new email address...');
            clearInbox();
            generateNewEmail();
        });
    }
    
    // Delete button functionality
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            clearInbox();
            showToast('Inbox cleared');
        });
    }
    
    // Toast notification function
    function showToast(message) {
        // Create toast element if it doesn't exist
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        // Set message and show toast
        toast.textContent = message;
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Function to update analytics display
    function updateAnalytics() {
        const totalEmailsElement = document.getElementById('totalEmails');
        const lastReceivedElement = document.getElementById('lastReceived');
        const topSenderElement = document.getElementById('topSender');
        const chartBars = document.querySelectorAll('.chart-bar');
        
        if (totalEmailsElement) {
            totalEmailsElement.textContent = emailData.totalReceived;
        }
        
        if (lastReceivedElement) {
            if (emailData.lastReceived) {
                const timeAgo = getTimeAgo(emailData.lastReceived);
                lastReceivedElement.textContent = timeAgo;
            } else {
                lastReceivedElement.textContent = 'Never';
            }
        }
        
        if (topSenderElement) {
            // Find top sender
            let topSender = 'None';
            let maxEmails = 0;
            
            for (const sender in emailData.senders) {
                if (emailData.senders[sender] > maxEmails) {
                    maxEmails = emailData.senders[sender];
                    topSender = sender;
                }
            }
            
            topSenderElement.textContent = topSender;
        }
        
        // Update frequency chart if it exists
        if (chartBars && chartBars.length > 0) {
            const maxFrequency = Math.max(...emailData.frequency, 1);
            
            emailData.frequency.forEach((count, index) => {
                if (index < chartBars.length) {
                    const percentage = (count / maxFrequency) * 100;
                    chartBars[index].style.height = `${percentage}%`;
                }
            });
        }
    }
    
    // Helper function to format time ago
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = Math.floor(seconds / 31536000);
        
        if (interval >= 1) {
            return interval + " year" + (interval === 1 ? "" : "s") + " ago";
        }
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return interval + " month" + (interval === 1 ? "" : "s") + " ago";
        }
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval + " day" + (interval === 1 ? "" : "s") + " ago";
        }
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
        }
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
        }
        
        return Math.floor(seconds) + " second" + (seconds === 1 ? "" : "s") + " ago";
    }
    
    // Initialize the app
    generateNewEmail();
    updateAnalytics();
    
    // Call once on page load to populate inbox
    setTimeout(checkForNewEmails, 2000);
});

