document.addEventListener('DOMContentLoaded', (event) => {
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = `${sender}: ${message}`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendButton.addEventListener('click', () => {
        const message = messageInput.value;
        if (message.trim() !== '') {
            addMessage(message, 'You'); // You send the message
            messageInput.value = '';
            
            // TODO: Send the message to the backend server
        }
    });

    // // Simulate receiving messages from other users
    // setInterval(() => {
    //     addMessage('Hello from another user!', 'Other');
    // }, 5000);

    // TODO: Implement WebSocket or other method to receive messages from the backend server
});