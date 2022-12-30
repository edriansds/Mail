document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', event => { 
    event.preventDefault();
    submit_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function reply_email() {

}

function view_email(emailID) {
  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // Hide views and show the desired email
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#email-view').innerHTML = `
      <p class='mb-1'><b>From: </b>${email.sender}</p>
      <p class='mb-1'><b>To: </b>${email.recipients}</p>
      <p class='mb-1'><b>Subject: </b>${email.subject}</p>
      <p class='mb-1'><b>Timestamp: </b>${email.timestamp}</p>
      <button id='reply' class='btn btn-sm btn-outline-primary'>Reply</button>
      <button id='archive' class='btn btn-sm btn-outline-primary'>${email.archived ? 'Unarchive' : 'Archive'}</button>
      <hr>
      <p>${email.body}</p>
    `;

    document.querySelector('#archive').addEventListener('click', () => {
      fetch(`/emails/${emailID}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: (email.archived ? false : true)
        })
      });
      load_mailbox('inbox'), 3000;
    });
  });
}

function submit_email() {

  // Post email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent')
  });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {

    console.log(emails)
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    emails.forEach(email => {
      const element = document.createElement('div');
      element.className = `email border border-dark ${email.read ? 'bg-light' : 'bg-white'}`;
      element.innerHTML = `
      <ul class='px-1 my-2 d-flex'>
        <li class='d-inline mr-3'><b>${email.sender}</b></li>
        <li class='d-inline flex-grow-1'>${email.subject}</li>
        <li class='d-inline'>${email.timestamp}</li>
      </ul>`;
      element.addEventListener('click', () => {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
        view_email(email.id);
      });
      document.querySelector('#emails-view').append(element);
    });
  });
}