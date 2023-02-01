import bot from './assets/bot.svg'; //./public/bot.svg
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}


function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe (isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
    <div class="chat">
    <div className="profile">
    <img 
    src="${isAi ? bot : user}"
    alt="${isAi ? 'bot' : 'user'}"
    />
    </div>
    <div class="message" id=${uniqueId}>${value}</div>
    </div>
    </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  
  loader(messageDiv);

  
  // fetch data from server -> Bot's responce

  const responce = await fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);

  messageDiv.innerHTML = '';
  

  if(responce.ok) {
    const data = await responce.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
   
    
   /* const speech = new SpeechSynthesisUtterance(parsedData);
    speech.lang = 'en-US'; // automatic speaking
    speechSynthesis.speak(speech); */
   
    
    if (parsedData) {
      // Request permission to show notifications
      Notification.requestPermission().then(function(permission) {
      
        if (permission === "granted") {
          // Show notification
          var notification = new Notification(parsedData);
          // Copy the notification content
          let content = notification.title + (notification.options ? "\n" + notification.options : "");
          copyNotificationContent(content);
        }
        
        

        /* if (permission === "granted") { old working
          // Show notification
          var notification = new Notification(parsedData);
          // Copy the notification content
          copyNotificationContent(notification.title+" "+notification.options );
          //+ ": " + notification.options
        } */
      });
    } 
    
    function copyNotificationContent(content) {
      // Create a new textarea element to copy the notification content to
      var textarea = document.createElement("textarea");
    
      // Set the value of the textarea to the notification content
      textarea.value = content;
      // Add the textarea to the document so it can be selected
      document.body.appendChild(textarea);
      // Select the textarea
      textarea.select();
      // Copy the notification content to the clipboard
      document.execCommand("copy");
      // Remove the textarea from the document
      document.body.removeChild(textarea);
      // Alert the user that the notification content has been copied
     
     // alert("Notification content copied to clipboard!");
     if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
    } else if (Notification.permission === "granted") {
     // var notification = new Notification("Notification content copied to clipboard!");
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          var notification = new Notification("Done!");
        }
      });
    }
    }
     
    
    /*
    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.innerHTML = "Copy";
    copyButton.classList.add("copy-button");
    copyButton.addEventListener('click', function() {
      navigator.clipboard.writeText(parsedData);
      alert("Text Copied: " + parsedData);
    }); */
    if (navigator.clipboard) {
      navigator.clipboard.writeText(parsedData);
    //  alert("Text Copied: " + parsedData);
    } else {
    //  alert("Clipboard API is not supported in this browser");
    } 
    
    
   /* if (parsedData) {
      // Request permission to show notifications
Notification.requestPermission().then(function(permission) {
  if (permission === "granted") {
    // Show notification
    var notification = new Notification("You can proceed now!");
  }
});
    } */
    // Append copy button to the message div
   // messageDiv.appendChild(copyButton);
  }
  
  

/*
  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  
  loader(messageDiv);

  // fetch data from server -> Bot's responce

  const responce = await fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(responce.ok) {
    const data = await responce.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
    
 }*/ else {
    const err = await responce.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})