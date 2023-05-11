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

function view_email(emailID) {
  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(email => {

    // Hide views and show the desired email
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    document.querySelector('#inbox-view').style.display = 'block';

    Object.keys(email).forEach(option => {
      if (option !== "id" && option != "read") {
        document.querySelector(`#${option}`).innerHTML = email[option];
      }
    });

    document.querySelector('#archive').innerHTML = email.archived ? 'Archive' : 'Unarchive'
    document.querySelector('#archive').addEventListener('click', () => archive_email(emailID, email.archived));

    document.querySelector("#reply").addEventListener('click', () => reply_email(email));
  });
}

function archive_email(emailID, archive) {
  fetch(`/emails/${emailID}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: archive
    })
  });
  load_mailbox('inbox'), 3000;
}

function reply_email(email) {
  compose_email();

  document.querySelector('#compose-recipients').value = email.recipients;
  document.querySelector('#compose-subject').value = /^Re:/.test(email.subject) ? email.subject : `Re: ${email.subject}`;

  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: \n`;
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
  document.querySelector('#inbox-view').style.display = 'none';
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
  document.querySelector('#inbox-view').style.display = 'none';
  
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {

    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    emails.forEach(email => {
      const element = document.createElement('div');
      element.className = 'email border border-dark';
      element.classList.add(email.read ? 'bg-light' : 'bg-white')
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