(async () => {
  // insert your code here


let conference, clientConference, mute = false, recording = false;
const BASE_URL = "https://clique-core.caw.me";
const API_KEY  = "f3f2cc36-cfb9-4c64-b770-86308dac9caa";


const fetchData = {
    method:  'POST',
    headers: new Headers({
        'Authorization': 'Bearer ' + API_KEY
    }),
    mode: 'cors'
};

const data    = await fetch(BASE_URL + '/api/v2/users', fetchData);
const userRes = await data.json();
const user    = userRes.user;

const id      = (id) => document.getElementById(id);
let members = {};

const show_members = () => {
    let s = '';
    for (const uuid in members) {
        s += '<li>' + uuid;
    }
    id('member_list').innerHTML = '<ul>' + s + '</ul>';
};

clientConference = new CliqueClient.Conference({
    base_url:      BASE_URL,
    session_token: user.token
});

id('id_profile').textContent = user.uuid;

id('createConference')
    .addEventListener('click', async () => {
        conference = await clientConference.create();
    });

id('hangup')
    .addEventListener('click', async () => {
        await clientConference.leave();
        members = {};
        show_members();
    });

const elMute = id('mute');
elMute.addEventListener('click', (event) => {
    if (!mute) {
        clientConference.localMute();
        elMute.textContent = 'unmute';
        elMute.classList.remove('btn-danger');
        elMute.classList.add('btn-success');
        mute = true;
    } else {
        clientConference.localUnmute();
        elMute.textContent = 'mute'
        elMute.classList.remove('btn-success');
        elMute.classList.add('btn-danger');
        mute = false;
    }
});

clientConference.on('add-member', (event) => {
    members[event.user.uuid] = event.user;
    show_members();
    console.log('add-member', event);
});

clientConference.on('del-member', (event) => {
    console.log('del-member', event);
    delete members[event.uuid];
    show_members();
});

const elRecording = id('recording');
elRecording.addEventListener('click', (event) => {
    if (!recording) {
        clientConference.recordingStart({
            callback_url: 'localost:3000/test', // HTTP POST webhook
            // callback_url is optional, it will be invoked once the recording is completed, uploaded to the server and is available to access
        });
        elRecording.textContent = 'Stop Recording';
        elRecording.classList.remove('btn-danger');
        elRecording.classList.add('btn-success');
        recording = true;
    } else {
        clientConference.recordingStop();
        elRecording.textContent = 'Start Recording';
        elRecording.classList.remove('btn-success');
        elRecording.classList.add('btn-danger');
        recording = false;
    }
});

clientConference.on('start-recording', (event) => {
    console.log('recording id', event.recordingID);
});

clientConference.on('stop-recording', (event) => {
    console.log('recording id', event.recordingID);
});

clientConference.on('recording-completed', (event) => {
    console.log('file ready to download', event.url);
    id('recording_file').textContent = event.url;
});
    
    })();