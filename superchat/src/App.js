import React, {useRef, useState} from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp ({
  apiKey: 'AIzaSyBI2oUatM7WLW0ba6zGdWJrIRiF-2_Y6uk',
  authDomain: 'reactsuperchat-82517.firebaseapp.com',
  projectId: 'reactsuperchat-82517',
  storageBucket: 'reactsuperchat-82517.appspot.com',
  messagingSenderId: '504372433464',
  appId: '1:504372433464:web:265f1d63e2324797054ccd',
  measurementId: 'G-VWHD2GBX9J',
});

const auth = firebase.auth ();
const firestore = firebase.firestore ();

function App () {
  const [user] = useAuthState (auth);

  return (
    <div className="App">
      <header>
        <h1>React + Firebase = ChatApp</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn () {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider ();
    auth.signInWithPopup (provider);
  };

  return (
    <React.Fragment>
      <button onClick={signInWithGoogle}> Sign in with Google</button>
      <p>Este es una app desarrollada por <span>@artick</span></p>
    </React.Fragment>
  );
}

function SignOut () {
  return (
    auth.currentUser &&
    <button onClick={() => auth.signOut ()}>Cerrar Sesión</button>
  );
}

function ChatRoom () {
  const dummy = useRef ();
  const messagesRef = firestore.collection ('messages');
  const query = messagesRef.orderBy ('createdAt').limit (25);

  const [messages] = useCollectionData (query, {idField: 'id'});

  const [formValue, setFormValue] = useState ('');

  const sendMessage = async e => {
    e.preventDefault ();
    const {uid, photoURL} = auth.currentUser;
    await messagesRef.add ({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp (),
      uid,
      photoURL,
    });
    setFormValue ('');

    dummy.current.scrollIntoView ({behavior: 'smooth'});
  };

  return (
    <React.Fragment>

      <main>
        {messages &&
          messages.map (msg => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy} />
      </main>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          onChange={e => setFormValue (e.target.value)}
        />
        <button type="submit" disabled={!formValue}>➤</button>
      </form>
    </React.Fragment>
  );
}

function ChatMessage (props) {
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img
        src={
          photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'
        }
        alt={`${uid}-avatar`}
      />
      <p>{text}</p>
    </div>
  );
}

export default App;
