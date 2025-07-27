
document.addEventListener('DOMContentLoaded', function () {
       const form = document.getElementById('messageForm');
        const input = document.getElementById('userInput');
        const chatbox = document.getElementById('chatbox');
    
        form.addEventListener('submit', function (e) {
            e.preventDefault();
    
            const message = input.value.trim();
            if (message === '') return;
    
            chatbox.innerHTML += `<div class="message user">${message}</div>`;
            input.value = '';
    
            fetch('/diagnose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    chatbox.innerHTML += `<div class="message assistant">Error: ${data.error}</div>`;
                } else {
                    chatbox.innerHTML += `<div class="message assistant">${data.message}</div>`;
                }
            })
            .catch(error => {
                chatbox.innerHTML += `<div class="message assistant">Error: Unable to communicate with the server.</div>`;
                console.error('Error:', error);
            });
        });
    });